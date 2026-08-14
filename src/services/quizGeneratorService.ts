import { UserError, QuestionOptions } from '../types';

export interface QuizConfig {
  questionCount: number;
  difficulty: 'kolay' | 'orta' | 'zor';
  selectedCategory: string; // 'Tümü' or specific category
  durationMinutes: number; // 0 = untimed, or 5, 10, 15, 20
}

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
  difficulty_score: number;
}

const POOL_STORAGE_KEY = 'tdk_persistent_generated_quiz_pool_v3';

// High-caliber authentic TYT sentences with zero spelling errors
const FLAWLESS_DISTRACTORS_BANK: Record<'kolay' | 'orta' | 'zor', string[]> = {
  kolay: [
    'Her sabah erkenden kalkıp yürüyüş yapmayı bir alışkanlık haline getirdi.',
    'Kütüphanedeki sessizlik, ders çalışmak isteyenler için mükemmel bir ortam sunuyordu.',
    'Sanatçı, yeni albümünde dinleyicilerine sürpriz parçalar hazırlamış.',
    'Şehrin tarihi sokaklarında dolaşırken çocukluk anılarını yeniden hatırladı.',
    'Bahçedeki elma ağaçları bu yıl her zamankinden daha fazla meyve verdi.',
    'Öğretmenimiz, derste okuduğumuz şiirin ana duygusunu açıklamamızı istedi.',
    'Hafta sonu arkadaşlarıyla birlikte sinemaya gitmek için sözleştiler.'
  ],
  orta: [
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
    'Tarihî taş köprünün restorasyon çalışmaları uzmanlar tarafından özenle yürütülüyor.'
  ],
  zor: [
    'Eleştirmen, yazarın üslubundaki edebi yetkinliği ve anlatımındaki duruluğu övgüyle değerlendirdi.',
    'Bilim insanları, atmosferin üst katmanlarındaki manyetik dalgalanmaları hassas cihazlarla inceledi.',
    'Antik kentin akropolünde sürdürülen arkeolojik kazılar, bölgenin karanlık dönemine ışık tutuyor.',
    'Akademik heyet, Osmanlı bürokrasisinin Tanzimat sonrası yapısal dönüşümünü kapsamlı biçimde tartıştı.',
    'Modern mimarinin yalın hatlarıyla geleneksel taş işçiliği arasındaki estetik uyum dikkat çekiyordu.',
    'Romandaki başkahramanın iç dünyasındaki çatışmalar, dönemin toplumsal buhranını ustaca yansıtmış.',
    'Sanat tarihi araştırmacıları, eserin üslup özelliklerinden yola çıkarak yapılış tarihini saptamaya çalıştı.'
  ]
};

// Context templates to embed the user's mistaken word realistically
const CONTEXT_TEMPLATES: Record<'kolay' | 'orta' | 'zor', ((w: string) => string)[]> = {
  kolay: [
    (w) => `Dün akşam televizyonda ${w} ile ilgili yapılan haberleri ilgiyle izledik.`,
    (w) => `Öğretmenimiz derste ${w} konusuna özel olarak değindi.`,
    (w) => `Piknik hazırlıkları sırasında ${w} almayı unuttuklarını fark ettiler.`,
    (w) => `Günün ilk saatlerinde ${w} için gereken tüm hazırlıklar tamamlandı.`
  ],
  orta: [
    (w) => `Yazar, son deneme kitabında ${w} konusuna dikkat çekici bir bakış açısıyla yaklaşmış.`,
    (w) => `Şirket yönetiminin aldığı son kararla birlikte ${w} süreçleri yeniden düzenlendi.`,
    (w) => `Bu zorlu hazırlık döneminde ${w} gibi ayrıntılara takılmadan hedefe odaklanmalıyız.`,
    (w) => `Rehberimiz, gezi boyunca bölgenin ${w} özelliklerini ayrıntılarıyla bize aktardı.`,
    (w) => `Tüm uyarılara rağmen ${w} konusunu göz ardı etmek büyük bir hata olur.`
  ],
  zor: [
    (w) => `Edebiyat kuramcıları, metinler arasılık bağlamında ${w} meselesinin kavramsal sınırlarını yeniden ele almaktadır.`,
    (w) => `Sempozyumda sunulan bildiride ${w} durumunun sosyolojik ve kültürel etkileri derinlemesine irdelendi.`,
    (w) => `Felsefi metinlerin çözümlenmesinde ${w} gibi unsurların dönemsel bağlamından koparılmaması gerekir.`,
    (w) => `Yazarın poetikasını oluşturan temel dinamiklerden biri de ${w} olgusunu estetik bir düzlemde işlemesidir.`
  ]
};

export const quizGeneratorService = {
  // Load full persistent question pool
  loadPool(): DynamicQuizQuestion[] {
    try {
      const data = localStorage.getItem(POOL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save questions into pool
  saveToPool(newQuestions: DynamicQuizQuestion[]): void {
    try {
      const current = this.loadPool();
      const map = new Map<string, DynamicQuizQuestion>();
      current.forEach((q) => map.set(q.id, q));
      newQuestions.forEach((q) => map.set(q.id, q));
      localStorage.setItem(POOL_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
    } catch (err) {
      console.warn('Error saving to question pool:', err);
    }
  },

  // Builds a custom quiz based on user settings
  async generateCustomQuiz(
    userErrors: UserError[],
    config: QuizConfig
  ): Promise<DynamicQuizQuestion[]> {
    if (!userErrors || userErrors.length === 0) return [];

    // 1. Filter by category
    let targetErrors = userErrors;
    if (config.selectedCategory && config.selectedCategory !== 'Tümü') {
      targetErrors = userErrors.filter((e) => e.rule_category === config.selectedCategory);
      if (targetErrors.length === 0) targetErrors = userErrors;
    }

    // 2. Determine target count
    const count = Math.min(config.questionCount, Math.max(targetErrors.length, 5));
    const selectedErrors: UserError[] = [];

    // Shuffle and pick errors
    const shuffled = [...targetErrors].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      selectedErrors.push(shuffled[i % shuffled.length]);
    }

    // 3. Generate fresh, unique question for each picked error
    const questions: DynamicQuizQuestion[] = [];

    for (let i = 0; i < selectedErrors.length; i++) {
      const err = selectedErrors[i];
      const q = this.buildSingleSyntheticQuestion(err, config.difficulty, i);
      questions.push(q);
    }

    // 4. Save to persistent pool
    this.saveToPool(questions);

    return questions;
  },

  getOrGenerateQuizQuestions(errors: UserError[]): DynamicQuizQuestion[] {
    return errors.map((err, i) => this.buildSingleSyntheticQuestion(err, 'orta', i));
  },

  regenerateAll(errors: UserError[]): DynamicQuizQuestion[] {
    return errors.map((err, i) => this.buildSingleSyntheticQuestion(err, 'orta', i + Date.now()));
  },

  // Builds a single synthetic question
  buildSingleSyntheticQuestion(
    err: UserError,
    difficulty: 'kolay' | 'orta' | 'zor',
    index: number
  ): DynamicQuizQuestion {
    const wrongWord = err.wrong_word || 'hatalı kelime';
    const correctWord = err.correct_word || 'doğru kelime';

    // Pick context template according to difficulty
    const templates = CONTEXT_TEMPLATES[difficulty] || CONTEXT_TEMPLATES['orta'];
    const templateFn = templates[(index + Math.floor(Math.random() * 5)) % templates.length];
    const wrongSentence = templateFn(wrongWord);

    // Pick 4 distractors according to difficulty
    const distractorsBank = FLAWLESS_DISTRACTORS_BANK[difficulty] || FLAWLESS_DISTRACTORS_BANK['orta'];
    const shuffled = [...distractorsBank].sort(() => 0.5 - Math.random());
    const pickedDistractors = shuffled.slice(0, 4);

    // Randomize wrong option position
    const optionKeys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
    const wrongOption = optionKeys[Math.floor(Math.random() * optionKeys.length)];

    const options: QuestionOptions = {};
    let distractorIdx = 0;

    optionKeys.forEach((key) => {
      if (key === wrongOption) {
        options[key] = wrongSentence;
      } else {
        options[key] = pickedDistractors[distractorIdx] || 'Bu konuda herkesin gereken hassasiyeti göstermesi gerekmektedir.';
        distractorIdx++;
      }
    });

    const diffScore = difficulty === 'kolay' ? 3 : difficulty === 'orta' ? 6 : 9;

    return {
      id: `quiz_${err.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalErrorId: err.id,
      question_text: 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?',
      options,
      wrong_option: wrongOption,
      wrong_word: wrongWord,
      correct_word: correctWord,
      rule_category: err.rule_category || 'Yazım Kuralları',
      explanation: err.explanation || `TDK kurallarına göre bu sözcüğün doğru yazımı '${correctWord}' biçimindedir.`,
      coach_note: err.coach_note || `💡 Koç Uyarısı: Bu kuralı daha önce karıştırdın. Yeni kurulan ${difficulty} seviye cümlede de hatayı yakalayabildin mi?`,
      difficulty_score: diffScore
    };
  }
};
