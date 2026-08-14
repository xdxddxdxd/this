export function splitQuestions(rawText: string): string[] {
  const text = rawText.trim();
  if (!text) return [];

  // Pattern 1: Numbered questions like "1.", "1)", "1-", "Soru 1:", "1. Soru"
  const numberedQuestionRegex = /(?:^|\n\s*)(?:(?:\d{1,2}\s*[\.\)\-]\s*)|(?:Soru\s*\d{1,2}\s*[:\.\-]?\s*))/gim;
  
  const matches: { index: number; text: string }[] = [];
  let match;
  while ((match = numberedQuestionRegex.exec(text)) !== null) {
    matches.push({ index: match.index, text: match[0] });
  }

  if (matches.length > 1) {
    const questions: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const startIndex = matches[i].index;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const chunk = text.slice(startIndex, endIndex).trim();
      if (chunk.length > 10) {
        questions.push(chunk);
      }
    }
    if (questions.length > 1) {
      return questions;
    }
  }

  // Pattern 2: Multiple blocks containing choices A-E separated by blank lines
  const optionBlocks = text.split(/\n\s*\n+/);
  if (optionBlocks.length > 1) {
    const validQuestions: string[] = [];
    let currentBlock = '';

    for (const block of optionBlocks) {
      const hasOptions = /[A-E]\s*[\)\.\-]/i.test(block);
      if (hasOptions) {
        if (currentBlock) {
          validQuestions.push((currentBlock + '\n' + block).trim());
          currentBlock = '';
        } else {
          validQuestions.push(block.trim());
        }
      } else {
        currentBlock = currentBlock ? currentBlock + '\n' + block : block;
      }
    }

    if (validQuestions.length > 1) {
      return validQuestions;
    }
  }

  // Single question fallback
  return [text];
}