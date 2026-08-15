import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DynamicQuizQuestion } from './quizGeneratorService';
import { generateBalancedOptionSequence } from './quizGeneratorService';

export interface SentenceRecord {
  id: string;
  sentence_text: string;
  has_error: boolean;
  wrong_word?: string;
  correct_word?: string;
  rule_category: string;
  explanation?: string;
  coach_note?: string;
}

const LOCAL_POOL_KEY = 'tdk_local_sentence_pool_v1';
const LOCAL_HISTORY_KEY = 'tdk_local_sentence_history_v1';

export const sentencePoolService = {
  /**
   * Ingests newly generated AI questions into the sentence pool (both clean distractors and error sentences)
   */
  async ingestQuestions(questions: DynamicQuizQuestion[], userId?: string): Promise<void> {
    if (!questions || questions.length === 0 || !userId) return;

    const rowsToInsert: {
      sentence_text: string;
      has_error: boolean;
      wrong_word?: string;
      correct_word?: string;
      rule_category: string;
      explanation?: string;
      coach_note?: string;
      owner_id: string;
    }[] = [];

    questions.forEach((q) => {
      const wrongKey = q.wrong_option || 'A';
      const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

      keys.forEach((k) => {
        const sentenceText = (q.options[k] || '').trim();
        if (!sentenceText) return;

        if (k === wrongKey) {
          // Erroneous sentence
          rowsToInsert.push({
            owner_id: userId,
            sentence_text: sentenceText,
            has_error: true,
            wrong_word: q.wrong_word,
            correct_word: q.correct_word,
            rule_category: q.rule_category,
            explanation: q.explanation,
            coach_note: q.coach_note
          });
        } else {
          // Clean distractor sentence
          rowsToInsert.push({
            owner_id: userId,
            sentence_text: sentenceText,
            has_error: false,
            rule_category: q.rule_category
          });
        }
      });
    });

    // 1. Supabase Persistence
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('sentence_pool').upsert(rowsToInsert, { onConflict: 'owner_id,sentence_text', ignoreDuplicates: true });
        if (error) throw error;
      } catch (err) {
        console.warn('Sentence pool Supabase ingest skipped:', err);
      }
    }

    // 2. Local Cache Persistence
    try {
      const raw = localStorage.getItem(LOCAL_POOL_KEY);
      const localPool: any[] = raw ? JSON.parse(raw) : [];
      rowsToInsert.forEach((r) => {
        const exists = localPool.some((p) => p.sentence_text === r.sentence_text);
        if (!exists) {
          localPool.push({ id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...r, created_at: new Date().toISOString() });
        }
      });
      // Keep up to 500 items in local storage
      localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(localPool.slice(-500)));
    } catch {
      // Ignore local storage quota limits
    }
  },

  /**
   * Retrieves clean sentences and error sentences that this user has NOT seen in the last 30 days,
   * and dynamically synthesizes unique 5-option questions.
   */
  async getFreshSynthesizedQuestions(
    count: number,
    userId?: string,
    targetCategory?: string
  ): Promise<DynamicQuizQuestion[]> {
    if (count <= 0) return [];

    const effectiveUserId = userId || 'anonymous_guest';
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysIso = thirtyDaysAgo.toISOString();

    let cleanCandidates: SentenceRecord[] = [];
    let errorCandidates: SentenceRecord[] = [];

    // 1. Fetch from Supabase if configured
    if (isSupabaseConfigured) {
      try {
        // Fetch sentence IDs seen by this user in the last 30 days
        const { data: seenData } = await supabase
          .from('user_sentence_history')
          .select('sentence_id')
          .eq('user_id', effectiveUserId)
          .gte('seen_at', thirtyDaysIso);

        const seenIds = new Set<string>((seenData || []).map((s: any) => s.sentence_id).filter(Boolean));

        // Fetch error sentences
        let errorQuery = supabase
          .from('sentence_pool')
          .select('*')
          .eq('has_error', true)
          .eq('owner_id', effectiveUserId)
          .limit(50);

        if (targetCategory && targetCategory !== 'Tümü') {
          errorQuery = errorQuery.eq('rule_category', targetCategory);
        }

        const { data: errorRows } = await errorQuery;
        if (errorRows) {
          errorCandidates = errorRows.filter((r: any) => !seenIds.has(r.id));
        }

        // Fetch clean distractor sentences
        const { data: cleanRows } = await supabase
          .from('sentence_pool')
          .select('*')
          .eq('has_error', false)
          .eq('owner_id', effectiveUserId)
          .limit(100);

        if (cleanRows) {
          cleanCandidates = cleanRows.filter((r: any) => !seenIds.has(r.id));
        }
      } catch (err) {
        console.warn('Supabase sentence pool fetch error:', err);
      }
    }

    // 2. Fallback to Local Storage if Supabase candidates are insufficient
    if (errorCandidates.length < count || cleanCandidates.length < count * 4) {
      try {
        const rawPool = localStorage.getItem(LOCAL_POOL_KEY);
        const rawHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
        const localPool: any[] = rawPool ? JSON.parse(rawPool) : [];
        const localHistory: { sentence_id: string; seen_at: string }[] = rawHistory ? JSON.parse(rawHistory) : [];

        const localSeenIds = new Set(
          localHistory
            .filter((h) => new Date(h.seen_at) >= thirtyDaysAgo)
            .map((h) => h.sentence_id)
        );

        localPool.forEach((p) => {
          if (localSeenIds.has(p.id)) return;
          if (p.has_error) {
            if (!targetCategory || targetCategory === 'Tümü' || p.rule_category === targetCategory) {
              if (!errorCandidates.some((e) => e.sentence_text === p.sentence_text)) {
                errorCandidates.push(p);
              }
            }
          } else {
            if (!cleanCandidates.some((c) => c.sentence_text === p.sentence_text)) {
              cleanCandidates.push(p);
            }
          }
        });
      } catch {
        // Ignore local read errors
      }
    }

    // Check if we have enough items to construct at least 1 question
    const maxSynthesizable = Math.min(count, errorCandidates.length, Math.floor(cleanCandidates.length / 4));
    if (maxSynthesizable <= 0) return [];

    const synthesized: DynamicQuizQuestion[] = [];
    const usedSentenceIds: string[] = [];
    const balancedKeys = generateBalancedOptionSequence(maxSynthesizable);

    for (let i = 0; i < maxSynthesizable; i++) {
      const errSentence = errorCandidates[i];
      const distractors = cleanCandidates.slice(i * 4, i * 4 + 4);
      const wrongKey = balancedKeys[i] || 'A';

      const options: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
        A: '',
        B: '',
        C: '',
        D: '',
        E: ''
      };

      const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
      let distIdx = 0;

      keys.forEach((k) => {
        if (k === wrongKey) {
          options[k] = errSentence.sentence_text;
        } else {
          options[k] = distractors[distIdx]?.sentence_text || 'Sanatçı bu eserinde farklı bir üslup denemiş.';
          distIdx++;
        }
      });

      synthesized.push({
        id: `synth-q-${i + 1}-${Date.now()}`,
        question_text: 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?',
        options,
        wrong_option: wrongKey,
        wrong_word: errSentence.wrong_word || 'yanlış',
        correct_word: errSentence.correct_word || 'doğru',
        rule_category: errSentence.rule_category || 'Ayrı Yazılan Kelimeler',
        explanation: errSentence.explanation || 'TDK yazım kurallarına uygunluk kontrol edildi.',
        coach_note: errSentence.coach_note,
        difficulty: 'orta'
      });

      usedSentenceIds.push(errSentence.id, ...distractors.map((d) => d.id));
    }

    // Record used sentences into user history for 30-day cooldown
    this.recordUserSeenSentences(usedSentenceIds, effectiveUserId).catch((e) =>
      console.warn('Cooldown recording error:', e)
    );

    return synthesized;
  },

  /**
   * Records seen sentences into user history for 30-day rotation tracking
   */
  async recordUserSeenSentences(sentenceIds: string[], userId: string): Promise<void> {
    if (!sentenceIds || sentenceIds.length === 0) return;

    const nowIso = new Date().toISOString();

    // 1. Supabase Record
    if (isSupabaseConfigured) {
      try {
        const rows = sentenceIds.filter((id) => !id.startsWith('local-')).map((id) => ({
          user_id: userId,
          sentence_id: id,
          seen_at: nowIso
        }));
        if (rows.length > 0) {
          const { error } = await supabase.from('user_sentence_history').upsert(rows, { onConflict: 'user_id,sentence_id' });
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Supabase sentence history insert skipped:', err);
      }
    }

    // 2. Local Storage Record
    try {
      const rawHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
      const history: { sentence_id: string; seen_at: string }[] = rawHistory ? JSON.parse(rawHistory) : [];
      sentenceIds.forEach((id) => history.push({ sentence_id: id, seen_at: nowIso }));
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history.slice(-1000)));
    } catch {
      // Ignore local storage error
    }
  }
};
