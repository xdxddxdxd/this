import { supabase } from '../lib/supabase';
import { UserError } from '../types';

export const errorService = {
  // 1. Fetch all errors for a specific user
  async getUserErrors(userId: string): Promise<UserError[]> {
    try {
      const { data, error } = await supabase
        .from('user_errors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching user errors:', error);
        return this.getLocalErrors(userId);
      }

      const errors: UserError[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        question_text: row.question_text,
        options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || {}),
        wrong_option: row.wrong_option,
        wrong_word: row.wrong_word,
        correct_word: row.correct_word,
        rule_category: row.rule_category,
        explanation: row.explanation,
        coach_note: row.coach_note,
        difficulty_score: row.difficulty_score || 5,
        is_favorite: row.is_favorite || false,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      // Cache locally for offline availability
      localStorage.setItem(`user_errors_${userId}`, JSON.stringify(errors));
      return errors;
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local storage:', err);
      return this.getLocalErrors(userId);
    }
  },

  // 2. Add a new error record
  async addError(errorData: Omit<UserError, 'id' | 'created_at' | 'updated_at'>): Promise<UserError> {
    const newId = crypto.randomUUID ? crypto.randomUUID() : 'err-' + Date.now();
    const now = new Date().toISOString();

    const newRecord: UserError = {
      id: newId,
      ...errorData,
      created_at: now,
      updated_at: now
    };

    try {
      const { data, error } = await supabase
        .from('user_errors')
        .insert([
          {
            id: newRecord.id,
            user_id: newRecord.user_id,
            question_text: newRecord.question_text,
            options: newRecord.options,
            wrong_option: newRecord.wrong_option,
            wrong_word: newRecord.wrong_word,
            correct_word: newRecord.correct_word,
            rule_category: newRecord.rule_category,
            explanation: newRecord.explanation,
            coach_note: newRecord.coach_note,
            difficulty_score: newRecord.difficulty_score || 5,
            is_favorite: newRecord.is_favorite || false,
            created_at: now,
            updated_at: now
          }
        ])
        .select()
        .single();

      if (!error && data) {
        newRecord.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase insert fallback:', err);
    }

    // Update local cache
    const current = this.getLocalErrors(newRecord.user_id);
    const updated = [newRecord, ...current.filter(e => e.id !== newRecord.id)];
    localStorage.setItem(`user_errors_${newRecord.user_id}`, JSON.stringify(updated));

    return newRecord;
  },

  // 3. Update an existing error record
  async updateError(id: string, updates: Partial<UserError>, userId: string): Promise<boolean> {
    const now = new Date().toISOString();
    try {
      await supabase
        .from('user_errors')
        .update({
          ...updates,
          updated_at: now
        })
        .eq('id', id)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase update fallback:', err);
    }

    const current = this.getLocalErrors(userId);
    const updated = current.map(e => (e.id === id ? { ...e, ...updates, updated_at: now } : e));
    localStorage.setItem(`user_errors_${userId}`, JSON.stringify(updated));
    return true;
  },

  // 4. Delete an error record
  async deleteError(id: string, userId: string): Promise<boolean> {
    try {
      await supabase
        .from('user_errors')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase delete fallback:', err);
    }

    const current = this.getLocalErrors(userId);
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(`user_errors_${userId}`, JSON.stringify(updated));
    return true;
  },

  // Local storage fallback helper
  getLocalErrors(userId: string): UserError[] {
    const data = localStorage.getItem(`user_errors_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    // Provide initial demo items matching the mockups if list is fresh!
    const initialDemo: UserError[] = [
      {
        id: 'demo-1',
        user_id: userId,
        question_text: "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
        options: {
          A: "Bu konuda her zaman daha dikkatli olmalıyız.",
          B: "Toplantı yarın saat 10:00'da yapılacaktır.",
          C: "Annemle babam bu akşam yemeğe gelecekler.",
          D: "Kitap okumayı ve yeni şeyler öğrenmeyi severim.",
          E: "Herkesin düşüncesine saygı duymalıyız."
        },
        wrong_option: "C",
        wrong_word: "gelecek ler",
        correct_word: "gelecekler",
        rule_category: "Eklerin Yazımı",
        explanation: "Fiillere gelen kişi ve zaman ekleri kelimeye bitişik yazılır. 'Gelecek ler' şeklinde ayrı yazım yanlıştır.",
        coach_note: "Bu kuralı bu ay 3. kez karıştırdın, bir daha bakmanda fayda var. Kısa bir tekrar, uzun vadede büyük fark yaratır!",
        difficulty_score: 4,
        created_at: new Date('2025-05-14T09:41:00Z').toISOString(),
        updated_at: new Date('2025-05-14T09:41:00Z').toISOString()
      },
      {
        id: 'demo-2',
        user_id: userId,
        question_text: "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?",
        options: {
          A: "Bu konuda herzaman daha dikkatli olurum.",
          B: "Tüm detayları özenle inceledim.",
          C: "Sınav saatinde salonda hazır bulundu.",
          D: "Öğrencilerin sorularını tek tek yanıtladı.",
          E: "Sonuçlar kısa süre sonra açıklanacak."
        },
        wrong_option: "A",
        wrong_word: "herzaman",
        correct_word: "her zaman",
        rule_category: "Ayrı Yazılan Kelimeler",
        explanation: "'Her' belgisiz sıfatı ile oluşturulan 'her zaman', 'her an', 'her gün' gibi söz öbekleri ayrı yazılır.",
        coach_note: "'Her şey' ve 'her zaman' gibi kalıplar her zaman ayrı yazılır, sakın unutma!",
        difficulty_score: 3,
        created_at: new Date('2025-05-14T09:20:00Z').toISOString(),
        updated_at: new Date('2025-05-14T09:20:00Z').toISOString()
      },
      {
        id: 'demo-3',
        user_id: userId,
        question_text: "Aşağıdaki cümlelerin hangisinde birleşik sözcüklerin yazımıyla ilgili bir yanlışlık vardır?",
        options: {
          A: "Pekçok konuda arkadaşlarıyla fikir birliğine vardı.",
          B: "Akşamüzeri arkadaşlarıyla buluştu.",
          C: "Günün yorgunluğunu yürüyüşle attı.",
          D: "Dershane çıkışında kütüphaneye uğradı.",
          E: "Herkes kendi hedeflerine odaklanmalı."
        },
        wrong_option: "A",
        wrong_word: "Pekçok",
        correct_word: "Pek çok",
        rule_category: "Ayrı Yazılan Kelimeler",
        explanation: "'Pek çok' ve 'pek az' sözleri TDK kurallarına göre ayrı yazılır.",
        coach_note: "Bitişik ve ayrı yazılan sözcükler kuralında pratik yapmaya devam!",
        difficulty_score: 5,
        created_at: new Date('2025-05-13T14:15:00Z').toISOString(),
        updated_at: new Date('2025-05-13T14:15:00Z').toISOString()
      },
      {
        id: 'demo-4',
        user_id: userId,
        question_text: "Aşağıdaki cümlelerin hangisinde eylemlerin yazımında hata yapılmıştır?",
        options: {
          A: "Toplantı yarın saat 10:00'da yapılcaktır.",
          B: "Gerekli evraklar hazırlandı.",
          C: "Proje planı onaylandı.",
          D: "Katılımcılara bilgi verildi.",
          E: "Sunum başarıyla tamamlandı."
        },
        wrong_option: "A",
        wrong_word: "yapılcaktır",
        correct_word: "yapılacaktır",
        rule_category: "Eklerin Yazımı",
        explanation: "Gelecek zaman kipi '-ecek / -acak' ses düşmesine uğratılmadan yazılmalıdır: 'yapılacaktır'.",
        coach_note: "Gelecek zaman eklerinde ses düşmesi yazı dilinde kabul edilmez, harika gidiyorsun!",
        difficulty_score: 4,
        created_at: new Date('2025-05-12T11:05:00Z').toISOString(),
        updated_at: new Date('2025-05-12T11:05:00Z').toISOString()
      }
    ];

    localStorage.setItem(`user_errors_${userId}`, JSON.stringify(initialDemo));
    return initialDemo;
  },

  // Calculate top mistaken rule of the month
  getTopMistakenRule(errors: UserError[]): string {
    if (!errors.length) return "Bitişik Yazılan Kelimeler";
    const counts: Record<string, number> = {};
    errors.forEach(e => {
      const cat = e.rule_category || "Yazım Kuralı";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    let topRule = "Bitişik Yazılan Kelimeler";
    let maxCount = 0;
    for (const [cat, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        topRule = cat;
      }
    }
    return topRule;
  }
};
