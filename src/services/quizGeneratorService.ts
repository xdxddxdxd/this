import { TytRule, UserError } from '../types';
import { TYT_RULES } from '../data/rulesData';
import { groqService } from './groqService';
import { tdkService, VERIFIED_RULES_DB } from './tdkService';
import { sentencePoolService } from './sentencePoolService';
import { authService } from './authService';

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

const DIVERSE_DISTRACTORS = [
  "Sanatçı, son romanında geleneksel anlatım kalıplarının dışına çıkmayı başarmış.",
  "Günün ilk ışıklarıyla birlikte yola çıkıp akşam saatlerinde hedefe vardılar.",
  "Toplantı salonundaki herkes pürdikkat kesilmiş, konuşmacıyı dinliyordu.",
  "Günümüz gençleri dijital kaynakları eskisinden çok daha verimli kullanıyor.",
  "Yapılan son arkeolojik kazılarda önemli tarihi bulgulara rastlandı.",
  "Yazar, eserinde çocukluk anılarını büyük bir ustalıkla kaleme almış.",
  "Şehir merkezindeki tarihi yapılar koruma altına alınarak restore ediliyor.",
  "Bu yılki mezuniyet törenine bütün öğrenci ve veliler davet edildi.",
  "Yönetmen, filminde insan ilişkilerinin karmaşıklığını ustalıkla işlemiş.",
  "Kütüphanedeki eski el yazması eserler dijital ortama aktarılıyor.",
  "Gelişen teknoloji yaşam alışkanlıklarımızı kökten değiştirdi.",
  "Bilim insanları uzay araştırmalarında çığır açan yeni bir keşif yaptı.",
  "Geleneksel el sanatları usta ellerde yeniden hayat buluyor.",
  "Sonbaharın gelmesiyle birlikte ağaçlar sarı ve kızıl yapraklarını dökmeye başladı.",
  "Müzedeki sergi, sanatseverlerin yoğun ilgisiyle karşılaştı.",
  "Doğanın sunduğu zenginlikleri korumak hepimizin ortak sorumluluğudur.",
  "Yıllar önce yaşanan bu olay kasaba halkının hafızasında derin izler bıraktı.",
  "Tarihi köprünün restorasyonu uzman ekiplerce titizlikle yürütülüyor."
];

function cleanDistractorSentence(sentence: string): string {
  if (!sentence) return sentence;
  let cleaned = sentence;
  for (const rule of VERIFIED_RULES_DB) {
    cleaned = cleaned.replace(rule.wrongRegex, rule.correctDisplay);
  }
  return cleaned;
}

function ensureUniqueOptions(
  options: { A: string; B: string; C: string; D: string; E: string },
  wrongKey: 'A' | 'B' | 'C' | 'D' | 'E',
  wrongWord: string
): { A: string; B: string; C: string; D: string; E: string } {
  const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const result = { ...options };
  const seenSentences = new Set<string>();

  // Keep wrong option sentence as primary
  const wrongSentence = (result[wrongKey] || `Bu konuda ${wrongWord} tercihi dikkat çekti.`).trim();
  result[wrongKey] = wrongSentence;
  seenSentences.add(wrongSentence.toLocaleLowerCase('tr-TR'));

  let poolIdx = Math.floor(Math.random() * DIVERSE_DISTRACTORS.length);

  for (const k of keys) {
    if (k === wrongKey) continue;
    // Clean any accidental spelling errors from distractors (e.g. 'heran' -> 'her an')
    let current = cleanDistractorSentence((result[k] || '').trim());
    const lower = current.toLocaleLowerCase('tr-TR');

    // If option is empty, duplicate of another option, or identical to wrongSentence without wrong word
    const isDuplicate = !current || seenSentences.has(lower) || (
      lower.replace(/\s+/g, '') === wrongSentence.toLocaleLowerCase('tr-TR').replace(/\s+/g, '')
    );

    if (isDuplicate) {
      // Pick a fresh diverse sentence from pool
      let fresh = DIVERSE_DISTRACTORS[poolIdx % DIVERSE_DISTRACTORS.length];
      poolIdx++;
      while (seenSentences.has(fresh.toLocaleLowerCase('tr-TR'))) {
        fresh = DIVERSE_DISTRACTORS[poolIdx % DIVERSE_DISTRACTORS.length];
        poolIdx++;
      }
      result[k] = cleanDistractorSentence(fresh);
      seenSentences.add(result[k].toLocaleLowerCase('tr-TR'));
    } else {
      result[k] = current;
      seenSentences.add(lower);
    }
  }

  return result;
}

export const quizGeneratorService = {
  /**
   * Generates dynamic questions based on student's mistakes & TYT rules using AI with local fallback.
   * Intersperses student's personal errors throughout the exam so they are not clumped at the beginning.
   */
  async generateCustomQuiz(
    userErrors: UserError[] = [],
    config: QuizConfig
  ): Promise<DynamicQuizQuestion[]> {
    const count = Math.min(Math.max(config.questionCount || 10, 1), 30);
    const category = (config.selectedCategory || config.category) && (config.selectedCategory || config.category) !== 'Tümü'
      ? (config.selectedCategory || config.category)
      : undefined;

    // 1. Filter student errors and available curriculum rules
    let filteredErrors = [...userErrors];
    if (category) {
      filteredErrors = filteredErrors.filter(e => e.rule_category === category);
    }

    let availableRules = [...TYT_RULES];
    if (category) {
      availableRules = availableRules.filter(r => r.category === category);
      if (availableRules.length === 0) availableRules = [...TYT_RULES];
    }

    const userTargets: { wrong_word: string; correct_word: string; category: string }[] = [];
    const inspirationSnippets: string[] = [];
    const seenWords = new Set<string>();

    // 2. Gather user's personal mistake targets (Unique words)
    const shuffledErrors = shuffleArray(filteredErrors);
    for (const err of shuffledErrors) {
      if (userTargets.length >= count) break;
      const cleanWrong = (err.wrong_word || '').trim();
      const cleanCorrect = (err.correct_word || '').trim();
      if (cleanWrong && cleanCorrect && !seenWords.has(cleanWrong.toLocaleLowerCase('tr-TR'))) {
        userTargets.push({
          wrong_word: cleanWrong,
          correct_word: cleanCorrect,
          category: err.rule_category || 'Ayrı Yazılan Kelimeler'
        });
        seenWords.add(cleanWrong.toLocaleLowerCase('tr-TR'));
        if (err.question_text) {
          inspirationSnippets.push(err.question_text);
        }
      }
    }

    // 3. Gather general TYT curriculum rules for remaining slots
    const curriculumTargets: { wrong_word: string; correct_word: string; category: string }[] = [];
    const shuffledRules = shuffleArray(availableRules);
    for (const rule of shuffledRules) {
      if (userTargets.length + curriculumTargets.length >= count) break;
      const example = rule.examples[Math.floor(Math.random() * rule.examples.length)];
      if (example && !seenWords.has(example.wrong.toLocaleLowerCase('tr-TR'))) {
        curriculumTargets.push({
          wrong_word: example.wrong,
          correct_word: example.correct,
          category: rule.category
        });
        seenWords.add(example.wrong.toLocaleLowerCase('tr-TR'));
      }
    }

    // 4. For 15-question exams: Synthesize up to 3 questions from 30-day fresh sentence pool to accelerate speed
    const currentUser = await authService.getCurrentUser();
    const userId = currentUser?.id || 'local-user';

    let synthesizedQuestions: DynamicQuizQuestion[] = [];
    let neededAiCount = count;

    if (count === 15) {
      try {
        synthesizedQuestions = await sentencePoolService.getFreshSynthesizedQuestions(3, userId, category);
        neededAiCount = Math.max(1, count - synthesizedQuestions.length);
      } catch (err) {
        console.warn('Sentence pool synthesis skipped:', err);
      }
    }

    const aiTargets = shuffleArray([...userTargets, ...curriculumTargets]).slice(0, neededAiCount);

    // 5. Attempt High-Speed Parallel AI Generation via Groq / OpenRouter LLaMA-3.3 70B
    try {
      if (aiTargets.length > 0) {
        const aiGenerated = await groqService.generateAIQuestionsBatch(aiTargets, config.difficulty, inspirationSnippets);
        if (Array.isArray(aiGenerated) && aiGenerated.length > 0) {
          const validatedQuestions: DynamicQuizQuestion[] = aiGenerated.map((q, idx) => {
            const wrongOpt: 'A' | 'B' | 'C' | 'D' | 'E' = (['A', 'B', 'C', 'D', 'E'].includes(q.wrong_option?.toUpperCase())
              ? q.wrong_option.toUpperCase()
              : 'A') as any;

            const wrongW = q.wrong_word || aiTargets[idx]?.wrong_word || 'yanlış';
            const rawOpts = {
              A: q.options?.A || 'Sanatçı bu eserinde farklı bir üslup denemiş.',
              B: q.options?.B || 'Günün ilk saatlerinde sokaklarda kimsecikler yoktu.',
              C: q.options?.C || 'Gelişen teknoloji yaşam alışkanlıklarımızı değiştirdi.',
              D: q.options?.D || 'Toplantıdaki herkes öneriyi dikkatle değerlendirdi.',
              E: q.options?.E || 'Geçmişte yaşanan deneyimler geleceğe ışık tutar.'
            };

            const uniqueOpts = ensureUniqueOptions(rawOpts, wrongOpt, wrongW);

            return {
              id: `ai-quiz-${idx + 1}-${Date.now()}`,
              question_text: q.question_text || 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?',
              options: uniqueOpts,
              wrong_option: wrongOpt,
              wrong_word: wrongW,
              correct_word: q.correct_word || aiTargets[idx]?.correct_word || 'doğru',
              rule_category: q.rule_category || aiTargets[idx]?.category || 'Ayrı Yazılan Kelimeler',
              explanation: q.explanation || 'TDK yazım kurallarına uygunluk kontrol edildi.',
              coach_note: tdkService.sanitizeCoachNote(q.coach_note, wrongW, q.correct_word, q.rule_category),
              difficulty: config.difficulty
            };
          });

          // Ingest newly generated questions into sentence pool for future rotation
          sentencePoolService.ingestQuestions(validatedQuestions, userId).catch((e) =>
            console.warn('Sentence pool ingestion error:', e)
          );

          const combinedQuestions = shuffleArray([...synthesizedQuestions, ...validatedQuestions]);

          // If combined is less than count (e.g. API rate limit), complete remaining with rich curriculum engine
          if (combinedQuestions.length > 0) {
            if (combinedQuestions.length < count) {
              const missingCount = count - combinedQuestions.length;
              const backupQuestions = this.generateExamQuestions(
                { ...config, questionCount: missingCount },
                userErrors
              );
              combinedQuestions.push(...backupQuestions);
            }
            return distributeOptionsFairly(combinedQuestions.slice(0, count));
          }
        }
      }
    } catch (err) {
      console.warn('AI Quiz batch generation fallback to local engine:', err);
    }

    // 6. Robust Offline Fallback Engine (with rich diverse sentences)
    const fallbackList = [...synthesizedQuestions];
    if (fallbackList.length < count) {
      const needed = count - fallbackList.length;
      fallbackList.push(...this.generateExamQuestions({ ...config, questionCount: needed }, userErrors));
    }
    return distributeOptionsFairly(fallbackList.slice(0, count));
  },

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

    const naturalContexts = [
      (word: string) => `Yazarın son kitabında '${word}' ifadesini kullanması eleştirmenlerin dikkatinden kaçmadı.`,
      (word: string) => `Dünkü konferansta konuşmacı '${word}' biçimindeki kullanımı özellikle vurguladı.`,
      (word: string) => `Gazetedeki köşe yazısında geçen '${word}' yapısı okurların ilgisini çekti.`,
      (word: string) => `Edebi metinlerde '${word}' sözünün yer alması dil tartışmalarına yol açtı.`,
      (word: string) => `Tiyatro oyununun afişinde '${word}' yazılması izleyiciler arasında konuşuldu.`,
      (word: string) => `Sınav hazırlık metinlerinde '${word}' örneği sıkça karşımıza çıkmaktadır.`
    ];

    for (let i = 0; i < count; i++) {
      const rule = shuffledRules[i % shuffledRules.length];
      const wrongOptionKey: 'A' | 'B' | 'C' | 'D' | 'E' = ['A', 'B', 'C', 'D', 'E'][i % 5] as any;
      const example = rule.examples[Math.floor(Math.random() * rule.examples.length)] || {
        wrong: 'yanlış',
        correct: 'doğru'
      };

      const rawOptions: any = {};
      const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

      const contextFn = naturalContexts[i % naturalContexts.length];
      rawOptions[wrongOptionKey] = contextFn(example.wrong);

      let distIdx = (i * 4) % DIVERSE_DISTRACTORS.length;
      keys.forEach(k => {
        if (k !== wrongOptionKey) {
          rawOptions[k] = DIVERSE_DISTRACTORS[distIdx % DIVERSE_DISTRACTORS.length];
          distIdx++;
        }
      });

      const uniqueOpts = ensureUniqueOptions(rawOptions, wrongOptionKey, example.wrong);

      questions.push({
        id: `quiz-q-${i + 1}-${Date.now()}`,
        question_text: 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?',
        options: uniqueOpts,
        wrong_option: wrongOptionKey,
        wrong_word: example.wrong,
        correct_word: example.correct,
        rule_category: rule.category,
        explanation: rule.description,
        coach_note: tdkService.sanitizeCoachNote(rule.tip, example.wrong, example.correct, rule.category),
        difficulty: config.difficulty
      });
    }

    return distributeOptionsFairly(questions);
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
