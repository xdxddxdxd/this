import { UserError, QuestionOptions } from '../types';

export interface DynamicQuizQuestion {
  id: string;
  originalErrorId: string;
  question_text: string;
  options: QuestionOptions;
  wrong_option: 'A' | 'B' | 'C' | 'D' | 'E';
  wrong_word: string;
  correct_word: string;
  rule_category: string;
  explanation: string;
  coach_note?: string;
  difficulty_score?: number;
}

// Rich bank of 100% grammatically flawless, authentic TYT distractors
const FLAWLESS_TYT_SENTENCES = [
  'Dedesinden kalan antika saati büyük bir titizlikle tamir ettirdi.',
  'Şehrin kuzeydoğusundaki vadi, göçmen kuşların en önemli uğrak noktası haline geldi.',
  'Her zaman olduğu gibi bu denemede de zamanı çok iyi yönetmeyi başardı.',
  'Müzenin tarihi salonunda sergilenen tablolar tüm ziyaretçileri büyüledi.',
  'Geniş yapraklı çınar ağaçlarının gölgesinde kısa bir mola verip soluklandılar.',
  'Yurt dışından gelen heyet, üniversitenin yeni araştırma merkezini hayranlıkla inceledi.',
  'Sanatçı, son sergisinde geleneksel motiflerle çağdaş çizgileri ustalıkla harmanlamış.',
  'Gözlemevinden yapılan açıklamaya göre bu gece gökyüzünde meteor yağmuru izlenebilecek.',
  'Hafta sonu düzenlenecek uluslararası sempozyuma pek çok saygın bilim insanı katılacak.',
  'Kütüphanenin sessiz ortamında saatlerce çalışıp kaynak notlarını tek tek gözden geçirdi.',
  'Tarihî taş köprünün restorasyon çalışmaları uzmanlar tarafından özenle yürütülüyor.',
  'Akşamüstü başlayan ılık rüzgâr, kavurucu yaz sıcağını bir nebze olsun hafifletti.',
  'Genç yazar, romanında karakterlerin psikolojik derinliğini başarıyla yansıtmış.',
  'Köy meydanındaki asırlık çeşmeden akan kaynak suyu çevre köylerden de ilgi görüyordu.',
  'Doğaseverler, hafta sonu Karadeniz yaylalarında keyifli bir doğa yürüyüşü gerçekleştirdi.'
];

// Natural sentence templates to embed the typo realistically
const TYPO_SENTENCE_TEMPLATES = [
  (w: string) => `Yazar, son denemesinde ${w} konusuna dikkat çekici bir bakış açısıyla değinmiş.`,
  (w: string) => `Dün akşam toplantıda ${w} ile ilgili alınan yeni kararlar tüm üyelere duyuruldu.`,
  (w: string) => `Bu zorlu hazırlık sürecinde ${w} gibi ayrıntılara takılmadan hedefe odaklanmalıyız.`,
  (w: string) => `Günün ilk ışıklarıyla birlikte ${w} için planlanan tüm hazırlıklar tamamlandı.`,
  (w: string) => `Yetkililerin tüm uyarılarına rağmen ${w} durumunu göz ardı etmek büyük hata olur.`,
  (w: string) => `Öğrenciler dersin ardından kütüphanede ${w} hakkında kapsamlı bir araştırma yaptı.`,
  (w: string) => `Rehberimiz, gezi boyunca bölgenin ${w} özelliklerini ayrıntılarıyla bize aktardı.`
];

const CACHE_KEY = 'tdk_dynamic_quiz_questions_v2';

export const quizGeneratorService = {
  // Load cached questions or generate fresh ones immediately
  getOrGenerateQuizQuestions(errors: UserError[]): DynamicQuizQuestion[] {
    if (!errors || errors.length === 0) return [];

    let cachedMap: Record<string, DynamicQuizQuestion[]> = {};
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        cachedMap = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read dynamic quiz cache:', e);
    }

    const quizQuestions: DynamicQuizQuestion[] = [];

    errors.forEach((err, idx) => {
      const existingList = cachedMap[err.id] || [];
      // If we already have generated variations for this error, pick one or create a new variation
      if (existingList.length > 0) {
        const picked = existingList[idx % existingList.length];
        quizQuestions.push(picked);
      } else {
        const generated = this.createSyntheticQuestion(err, idx);
        quizQuestions.push(generated);
        cachedMap[err.id] = [generated];
      }
    });

    // Save updated cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedMap));
    } catch (e) {
      console.warn('Could not save quiz cache:', e);
    }

    return quizQuestions;
  },

  // Generates a brand new 5-option question where only 1 option contains the user's typo
  createSyntheticQuestion(err: UserError, seedOffset = 0): DynamicQuizQuestion {
    const wrongWord = err.wrong_word || 'hatalı kelime';
    const correctWord = err.correct_word || 'doğru kelime';

    // Pick random typo sentence template
    const templateFn = TYPO_SENTENCE_TEMPLATES[(seedOffset + Math.floor(Math.random() * 5)) % TYPO_SENTENCE_TEMPLATES.length];
    const wrongSentence = templateFn(wrongWord);

    // Pick 4 distinct flawless distractors
    const shuffledDistractors = [...FLAWLESS_TYT_SENTENCES].sort(() => 0.5 - Math.random());
    const pickedDistractors = shuffledDistractors.slice(0, 4);

    // Randomly assign wrong sentence to A, B, C, D, or E
    const optionKeys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    const wrongOption = optionKeys[Math.floor(Math.random() * optionKeys.length)];

    const options: QuestionOptions = {};
    let distractorIdx = 0;

    optionKeys.forEach((key) => {
      if (key === wrongOption) {
        options[key] = wrongSentence;
      } else {
        options[key] = pickedDistractors[distractorIdx] || 'Bu konuda herkesin gereken hassasiyeti göstermesi beklenmektedir.';
        distractorIdx++;
      }
    });

    return {
      id: `dyn_${err.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalErrorId: err.id,
      question_text: 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?',
      options,
      wrong_option: wrongOption,
      wrong_word: wrongWord,
      correct_word: correctWord,
      rule_category: err.rule_category || 'Yazım Kuralları',
      explanation: err.explanation || `TDK kurallarına göre bu sözcüğün doğru yazımı '${correctWord}' şeklindedir.`,
      coach_note: err.coach_note || `💡 Koç Uyarısı: Bu kuralı daha önce karıştırdın. Yeni cümlede de doğru tespit edebildin mi?`,
      difficulty_score: err.difficulty_score || 5
    };
  },

  // Regenerate all variations with fresh sentences
  regenerateAll(errors: UserError[]): DynamicQuizQuestion[] {
    const cachedMap: Record<string, DynamicQuizQuestion[]> = {};
    const quizQuestions: DynamicQuizQuestion[] = [];

    errors.forEach((err, idx) => {
      const generated = this.createSyntheticQuestion(err, idx + Date.now());
      quizQuestions.push(generated);
      cachedMap[err.id] = [generated];
    });

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedMap));
    } catch (e) {
      console.warn('Could not save fresh quiz cache:', e);
    }

    return quizQuestions;
  }
};
