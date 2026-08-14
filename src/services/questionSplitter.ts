// Advanced question normalizer and splitter for messy / glued text

export function normalizeQuestionText(text: string): string {
  if (!text) return '';

  let normalized = text;

  // 1. Separate glued question numbers after sentences, e.g. "bekleniyor.2. Aşağıdaki" -> "bekleniyor.\n\n2. Aşağıdaki"
  normalized = normalized.replace(/([\.?!])\s*(\d{1,2}\s*[\.\)\-]\s+[A-ZÇĞİÖŞÜ])/g, '$1\n\n$2');

  // 2. Separate glued option letters, e.g. "vardır?A) Akşamüstü" or "kilitledi.B) Her" -> "vardır?\nA) Akşamüstü\nB) Her"
  normalized = normalized.replace(/([\.?!;:,a-zçğıöşüA-ZÇĞİÖŞÜ0-9])\s*([A-E]\s*[\)\.\-])\s*/g, '$1\n$2 ');

  // 3. Ensure single clean spacing after option marker "A)  Text" -> "A) Text"
  normalized = normalized.replace(/([A-E]\s*[\)\.\-])\s+/g, '$1 ');

  return normalized.trim();
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
    const questions: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const startIndex = matches[i].index;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
      const chunk = normalized.slice(startIndex, endIndex).trim();
      if (chunk.length > 15) {
        questions.push(chunk);
      }
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