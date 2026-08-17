export function normalizeQuestionText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function splitQuestions(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const normalized = normalizeQuestionText(rawText);

  // Split by Question markers at start of lines or after punctuation
  // Matches "1. ", "2. ", "1) ", "2) ", "Soru 1: ", etc.
  const questionHeaderRegex = /(?:^|\n\s*)(?:(?:\d{1,2}\s*[\.\)\-]\s+)|(?:Soru\s*\d{1,2}\s*[:\.\-]?\s+))/gim;
  
  const matches: { index: number; text: string }[] = [];
  let match;
  while ((match = questionHeaderRegex.exec(normalized)) !== null) {
    matches.push({ index: match.index, text: match[0] });
  }

  if (matches.length > 1) {
    const rawChunks: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const startIndex = matches[i].index;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
      const chunk = normalized.slice(startIndex, endIndex).trim();
      if (chunk.length > 15) {
        rawChunks.push(chunk);
      }
    }

    // Attach leading introductory text before question 1 if present
    if (matches[0].index > 0) {
      const leadingText = normalized.slice(0, matches[0].index).trim();
      if (leadingText.length > 15 && rawChunks.length > 0) {
        rawChunks[0] = leadingText + '\n\n' + rawChunks[0];
      }
    }

    // Smart trailing paragraph reattachment:
    // If a chunk ends with an orphan paragraph after its options (e.g. after option E),
    // and the next chunk starts with "Bu parçadaki..." or similar, move the paragraph to the next chunk!
    // EXCEPTION: "(I) kelime" biçimindeki kısa satırlar altı çizili sözcük listesidir ve
    // ait olduğu sorunun kendisinde kalır; yalnızca listeden sonraki metin taşınır.
    const isUnderlineListLine = (line: string) =>
      /^\s*\((?:I{1,3}|IV|V|VI{0,3}|IX|X)\.?\)\s*\S.{0,45}$/.test(line);

    const questions: string[] = [];
    for (let i = 0; i < rawChunks.length; i++) {
      let current = rawChunks[i];
      if (i < rawChunks.length - 1) {
        // Find last option in current chunk
        const lastOptMatches = [...current.matchAll(/\n\s*([A-E]\s*[\)\.\-]\s*[^\n]+)/gi)];
        const lastOptMatch = lastOptMatches.pop();
        if (lastOptMatch && lastOptMatch.index !== undefined) {
          const afterLastOptIdx = lastOptMatch.index + lastOptMatch[0].length;
          const trailingText = current.slice(afterLastOptIdx).trim();
          if (trailingText.length > 25) {
            const lines = trailingText.split('\n');
            let cursor = 0;
            const skipBlanks = () => {
              while (cursor < lines.length && lines[cursor].trim() === '') cursor++;
            };
            skipBlanks();
            // Kaynak satırını atla: "(2016-KPSS/Lisans)" vb.
            if (cursor < lines.length && /^\s*\(\s*\d{4}/.test(lines[cursor])) cursor++;
            skipBlanks();
            // Ardışık kısa "(I) kelime" satırları = altı çizili sözcük listesi
            let listLineCount = 0;
            while (cursor < lines.length && isUnderlineListLine(lines[cursor])) {
              cursor++;
              listLineCount++;
            }
            if (listLineCount >= 2) {
              // Liste bu soruya aittir; yalnız listeden sonraki metin (bir
              // sonraki sorunun paragrafı) sonraki parçaya taşınır.
              const keep = lines.slice(0, cursor).join('\n').trim();
              const rest = lines.slice(cursor).join('\n').trim();
              current = (current.slice(0, afterLastOptIdx).trim() + '\n' + keep).trim();
              if (rest.length > 25) {
                rawChunks[i + 1] = rest + '\n\n' + rawChunks[i + 1];
              }
            } else {
              // Klasik davranış: artık metnin tamamı sonraki sorunun paragrafıdır.
              current = current.slice(0, afterLastOptIdx).trim();
              rawChunks[i + 1] = trailingText + '\n\n' + rawChunks[i + 1];
            }
          }
        }
      }
      questions.push(current);
    }

    if (questions.length > 1) {
      return questions;
    }
  }

  // Fallback split by option blocks if multiple A-E series exist
  const parts = normalized.split(/\n\s*\n+/);
  if (parts.length > 1) {
    const questions: string[] = [];
    let current = '';
    for (const part of parts) {
      const hasOptions = /[A-E]\s*[\)\.\-]/i.test(part);
      if (hasOptions) {
        if (current) {
          questions.push((current + '\n' + part).trim());
          current = '';
        } else {
          questions.push(part.trim());
        }
      } else {
        current = current ? current + '\n' + part : part;
      }
    }
    if (questions.length > 1) {
      return questions;
    }
  }

  return [normalized];
}

/**
 * Extracts words/phrases associated with Roman numerals (I, II, III, IV, V) in text
 */
export function extractRomanNumeralPhrases(text: string): Record<string, string> {
  const phrases: Record<string, string> = {};
  if (!text) return phrases;

  // Regex captures: (I) target_phrase or (I.) target_phrase
  const regex = /\((I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\)\s*([^()\n]{1,60}?)(?=\s*\([I|V|X]|\s*[,.!?]|\s*$|\s*[0-9]+\.|\s*[A-E]\))/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const numeral = match[1].toUpperCase();
    const rawPhrase = match[2].trim().replace(/[.,;:!?]+$/, '').trim();
    if (rawPhrase) {
      phrases[numeral] = rawPhrase;
    }
  }

  // Fallback pattern if first pass didn't catch 2+
  if (Object.keys(phrases).length < 2) {
    const simpleRegex = /\((I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\)\s*([^\s()]+\s*[^\s()]*\s*[^\s()]*)/gi;
    let m2;
    while ((m2 = simpleRegex.exec(text)) !== null) {
      const numeral = m2[1].toUpperCase();
      if (!phrases[numeral]) {
        phrases[numeral] = m2[2].trim().replace(/[.,;!?]+$/, '');
      }
    }
  }

  return phrases;
}

/**
 * Enriches options that only have Roman numerals (e.g. A: "I", B: "II")
 * with the corresponding words from the question text:
 * e.g. A: "I. (Oldum olası)", B: "II. (çekidüzen)"
 */
export function enrichOptionsWithPhrases(
  questionText: string,
  options: Record<string, string | undefined>
): Record<string, string> {
  const phrases = extractRomanNumeralPhrases(questionText);
  const enriched: Record<string, string> = {};

  ['A', 'B', 'C', 'D', 'E'].forEach((k) => {
    const raw = (options[k] || '').trim();
    // Check if raw option is just a Roman numeral like "I", "I.", "II", "II."
    const romanMatch = raw.match(/^(?:([I|V|X]+)|(\d{1,2}))[\.\)]?$/i);
    if (romanMatch) {
      const key = (romanMatch[1] || romanMatch[2]).toUpperCase();
      const phrase = phrases[key];
      if (phrase) {
        enriched[k] = `${key}. (${phrase})`;
      } else {
        enriched[k] = raw;
      }
    } else {
      enriched[k] = raw;
    }
  });

  return enriched;
}
