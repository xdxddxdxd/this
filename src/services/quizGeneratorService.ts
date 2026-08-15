import { TytRule, UserError } from '../types';
import { TYT_RULES } from '../data/rulesData';

export interface QuizConfig {
  questionCount: number;
  difficulty: 'kolay' | 'orta' | 'zor';
  category?: string;
  selectedCategory?: string;
  durationMinutes?: number;
}

export interface DynamicQuizQuestion {
  id: string;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  wrong_option: 'A' | 'B' | 'C' | 'D' | 'E';
  wrong_word: string;
  correct_word: string;
  rule_category: string;
  explanation: string;
  coach_note?: string;
  difficulty: 'kolay' | 'orta' | 'zor';
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateBalancedOptionSequence(totalCount: number): ('A' | 'B' | 'C' | 'D' | 'E')[] {
  const letters: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  if (totalCount <= 0) return [];
  if (totalCount === 1) return [letters[Math.floor(Math.random() * letters.length)]];

  const maxCap = Math.max(2, Math.floor(totalCount / 5) + 1);

  for (let attempt = 0; attempt < 100; attempt++) {
    const result: ('A' | 'B' | 'C' | 'D' | 'E')[] = [];
    const counts: Record<'A' | 'B' | 'C' | 'D' | 'E', number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    let success = true;
    for (let i = 0; i < totalCount; i++) {
      const candidates = letters.filter(letter => {
        if (counts[letter] >= maxCap) return false;
        if (i >= 2 && result[i - 1] === letter && result[i - 2] === letter) return false;
        return true;
      });

      if (candidates.length === 0) {
        success = false;
        break;
      }

      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      result.push(chosen);
      counts[chosen]++;
    }

    if (success && totalCount >= 5) {
      const usedLetters = Object.values(counts).filter(c => c > 0).length;
      if (usedLetters < Math.min(letters.length, totalCount)) {
        success = false;
      }
    }

    if (success) {
      return result;
    }
  }

  const base: ('A' | 'B' | 'C' | 'D' | 'E')[] = [];
  for (let i = 0; i < totalCount; i++) {
    base.push(letters[i % letters.length]);
  }
  return shuffleArray(base);
}

function distributeOptionsFairly(questions: DynamicQuizQuestion[]): DynamicQuizQuestion[] {
  if (!questions || questions.length === 0) return [];

  const balancedKeys = generateBalancedOptionSequence(questions.length);

  return questions.map((q, idx) => {
    const desiredWrongKey = balancedKeys[idx] || q.wrong_option;
    if (desiredWrongKey === q.wrong_option) return q;

    const currentWrongText = q.options[q.wrong_option];
    const targetKeyText = q.options[desiredWrongKey];

    const newOptions = {
      ...q.options,
      [desiredWrongKey]: currentWrongText,
      [q.wrong_option]: targetKeyText
    };

    return {
      ...q,
      options: newOptions,
      wrong_option: desiredWrongKey
    };
  });
}

export const quizGeneratorService = {
  generateExamQuestions(
    config: QuizConfig,
    userErrors: UserError[] = []
  ): DynamicQuizQuestion[] {
    const count = Math.min(Math.max(config.questionCount || 10, 1), 30);
    const category = (config.selectedCategory || config.category) && (config.selectedCategory || config.category) !== 'Tümü'
      ? (config.selectedCategory || config.category)
      : undefined;

    let availableRules = [...TYT_RULES];
    if (category) {
      availableRules = availableRules.filter(r => r.category === category);
      if (availableRules.length === 0) {
        availableRules = [...TYT_RULES];
      }
    }

    const shuffledRules = shuffleArray(availableRules);
    const questions: DynamicQuizQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const rule = shuffledRules[i % shuffledRules.length];
      const otherRules = shuffleArray(TYT_RULES.filter(r => r.id !== rule.id)).slice(0, 4);

      const wrongOptionKey: 'A' | 'B' | 'C' | 'D' | 'E' = ['A', 'B', 'C', 'D', 'E'][i % 5] as any;
      const example = rule.examples[Math.floor(Math.random() * rule.examples.length)] || {
        wrong: 'yanlış',
        correct: 'doğru'
      };

      const options: any = {};
      const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

      let otherIdx = 0;
      keys.forEach(k => {
        if (k === wrongOptionKey) {
          options[k] = `Bu konuda ${example.wrong} sözcüğü tercih edildi.`;
        } else {
          const otherRule = otherRules[otherIdx++] || rule;
          const otherEx = otherRule.examples[0] || { correct: 'örnek sözcük' };
          options[k] = `Cümle içerisinde ${otherEx.correct} kuralına uygun yazıldı.`;
        }
      });

      questions.push({
        id: `quiz-q-${i + 1}-${Date.now()}`,
        question_text: 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?',
        options,
        wrong_option: wrongOptionKey,
        wrong_word: example.wrong,
        correct_word: example.correct,
        rule_category: rule.category,
        explanation: rule.description,
        coach_note: rule.tip,
        difficulty: config.difficulty
      });
    }

    return distributeOptionsFairly(questions);
  },

  async generateCustomQuiz(
    userErrors: UserError[],
    config: QuizConfig
  ): Promise<DynamicQuizQuestion[]> {
    return this.generateExamQuestions(config, userErrors);
  },

  getOrGenerateQuizQuestions(arg1: any, arg2?: any): DynamicQuizQuestion[] {
    if (Array.isArray(arg1)) {
      return this.generateExamQuestions({ questionCount: 10, difficulty: 'orta' }, arg1);
    }
    return this.generateExamQuestions(arg1 || { questionCount: 10, difficulty: 'orta' }, arg2 || []);
  },

  regenerateAll(arg1: any, arg2?: any): DynamicQuizQuestion[] {
    if (Array.isArray(arg1)) {
      return this.generateExamQuestions({ questionCount: 10, difficulty: 'orta' }, arg1);
    }
    return this.generateExamQuestions(arg1 || { questionCount: 10, difficulty: 'orta' }, arg2 || []);
  }
};
