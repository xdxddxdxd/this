import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, QuestionOptions, UserError } from '../types';
import { tdkService } from './tdkService';
import { supabase } from '../lib/supabase';

const GROQ_API_KEY = '';
const OPENROUTER_API_KEY = '';
const GEMINI_API_KEY = '';

export const CANONICAL_TYT_CATEGORIES = [
  'Büyük Harflerin Yazımı',
  'Bitişik Yazılan Birleşik Kelimeler',
  'Ayrı Yazılan Kelimeler',
  "Bağlaç Olan Da / De'nin Yazımı",
  "Bağlaç Olan Ki'nin Yazımı",
  "Soru Eki Mı / Mi'nin Yazımı",
  'Kısaltmaların Yazımı',
  'Tarih ve Sayıların Yazımı',
  'Ses Olayları ve Yardımcı Fiiller',
  'Düzeltme İşareti (Şapka ^)'
] as const;

export type CanonicalCategory = typeof CANONICAL_TYT_CATEGORIES[number];

/**
 * Normalizes any category variant to one of the 10 canonical TYT categories
 */
export function normalizeCategory(rawCategory: string | undefined): CanonicalCategory {
  if (!rawCategory) return 'Ayrı Yazılan Kelimeler';
  const lower = rawCategory.trim().toLocaleLowerCase('tr-TR');

  if (lower.includes('büyük') || lower.includes('unvan') || lower.includes('kurum') || lower.includes('özel ad') || lower.includes('isimlerin')) {
    return 'Büyük Harflerin Yazımı';
  }
  if (lower.includes('bitişik') || lower.includes('birleşik')) {
    return 'Bitişik Yazılan Birleşik Kelimeler';
  }
  if (lower.includes('ayrı') || lower.includes('ikileme') || lower.includes('arası')) {
    return 'Ayrı Yazılan Kelimeler';
  }
  if (lower.includes('da / de') || lower.includes('de bağlacı') || lower.includes('da bağlacı') || lower.includes('de / da')) {
    return "Bağlaç Olan Da / De'nin Yazımı";
  }
  if (lower.includes('ki bağlacı') || lower.includes("ki'nin") || lower.includes('ki nin')) {
    return "Bağlaç Olan Ki'nin Yazımı";
  }
  if (lower.includes('soru eki') || lower.includes('mı / mi') || lower.includes('mi soru')) {
    return "Soru Eki Mı / Mi'nin Yazımı";
  }
  if (lower.includes('kısaltma')) {
    return 'Kısaltmaların Yazımı';
  }
  if (lower.includes('tarih') || lower.includes('sayı') || lower.includes('sıra')) {
    return 'Tarih ve Sayıların Yazımı';
  }
  if (lower.includes('şapka') || lower.includes('düzeltme')) {
    return 'Düzeltme İşareti (Şapka ^)';
  }
  if (lower.includes('ses') || lower.includes('fiil') || lower.includes('yumuşama') || lower.includes('düşme') || lower.includes('ek')) {
    return 'Ses Olayları ve Yardımcı Fiiller';
  }

  return 'Ayrı Yazılan Kelimeler';
}

function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
  const s2 = b.toLocaleLowerCase('tr-TR').replace(/\s+/g, '');
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }
  return dp[m][n];
}

const MASTER_SYSTEM_PROMPT = `Sen Türk Dil Kurumu (TDK) Güncel Yazım Kılavuzu ve ÖSYM Türkiye YKS / TYT / KPSS Türkçe Sınavları Kıdemli Başuzmanısın.

GÖREVİN:
Verilen çoktan seçmeli sorudaki 5 seçeneği (A, B, C, D, E) son derece titizlikle inceleyip, YAZIM YANLIŞI OLAN TEK SEÇENEĞİ bulmak, hatalı kelimeyi ve TDK kurallarına göre doğru yazılışını tespit etmektir.

KRİTİK ANALİZ VE DİL BİLGİSİ İLKELERİ:

1. BİRLEŞİK FİİLLERDE SES OLAYI KURALI (HAYATİ DERECE ÖNEMLİ):
   a) Ünlü Düşmesi veya Ünsüz Türemesi Olanlar BİTİŞİK YAZILIR (KESİNLİKLE DOĞRUDUR, ASLA HATA SAYMA!):
      - 'zehretti' (zehir + etti -> ünlü düşmesi var, BİTİŞİK DOĞRUDUR. ASLA "zehir etti olmalıydı" diyerek hata sayma!)
      - 'şükretti' (şükür + etti -> ünlü düşmesi var, BİTİŞİK DOĞRUDUR)
      - 'sabretti' (sabır + etti -> ünlü düşmesi var, BİTİŞİK DOĞRUDUR)
      - 'azmetti' (azim + etti -> ünlü düşmesi var, BİTİŞİK DOĞRUDUR)
      - 'devretti', 'emretti', 'kayboldu', 'kaybetti', 'hapsetti', 'kahretti', 'keşfetti', 'lütfetti', 'nakletti', 'hükmetti', 'zannetti', 'hissetti', 'reddetti', 'affetti', 'halletti' BİTİŞİK YAZILIR VE %100 DOĞRUDUR.
   b) Ses Olayı OLMAYANLAR DAİMA AYRI YAZILIR (Bitişik Yazılırsa KESİNLİKLE YAZIM YANLIŞIDIR!):
      - 'ayırtetmemizi' / 'ayırtetmek' ➔ YAZIM YANLIŞIDIR! Doğrusu 'ayırt etmemizi' / 'ayırt etmek' olmalıdır.
      - 'farketti' / 'farketmek' ➔ YAZIM YANLIŞIDIR! Doğrusu 'fark etti' / 'fark etmek' olmalıdır.
      - 'terketti' / 'terketmek' ➔ YAZIM YANLIŞIDIR! Doğrusu 'terk etti' / 'terk etmek' olmalıdır.
      - 'arzetti' / 'arzetmek' ➔ YAZIM YANLIŞIDIR! Doğrusu 'arz etti' / 'arz etmek' olmalıdır.
      - 'haketti' / 'haketmek' ➔ YAZIM YANLIŞIDIR! Doğrusu 'hak etti' / 'hak etmek' olmalıdır.
      - 'sağol' ➔ YAZIM YANLIŞIDIR! Doğrusu 'sağ ol' olmalıdır.

2. ÜNSÜZ BENZEŞMESİ (SERTLEŞMESİ) & FISTIKÇI ŞAHAP:
   - Türkçe sert ünsüzler: f, s, t, k, ç, ş, h, p (FıSTıKÇı ŞaHaP).
   - 'ş' HARFİ SERT BİR ÜNSÜZDÜR! 'değiş-' fiili sert ünsüz 'ş' ile bittiği için '-gen' eki sertleşerek '-ken' (değişkenlik) olur: 'değişgenlik' YAZIM YANLIŞIDIR, 'değişkenlik' DOĞRUDUR.
   - Açıklamalarında ve koç notlarında 'ş' harfinin sert ünsüz olduğunu daima doğru ve bilimsel açıkla.

3. GEREKSİZ ÜNLÜ DARALMASI:
   - Sadece şimdiki zaman eki '-yor' daralma yapar. '-ama/-eme', '-acak/-ecek' gibi eklerde daralma YAPILMAZ!
   - 'kanıtlıyamadı' ➔ YAZIM YANLIŞIDIR! Doğrusu 'kanıtlayamadı' olmalıdır.
   - 'oyalıyacak' ➔ YAZIM YANLIŞIDIR! Doğrusu 'oyalayacak' olmalıdır.
   - 'başlıyacak' ➔ YAZIM YANLIŞIDIR! Doğrusu 'başlayacak' olmalıdır.

4. BATILI SÖZCÜKLERDE İKİ ÜNSÜZ ARASI:
   - Başta veya ortada çift ünsüz arasına sesli girmez:
   - 'antırenör' ➔ YAZIM YANLIŞIDIR! Doğrusu 'antrenör' olmalıdır.
   - 'sitüdyo' ➔ YAZIM YANLIŞIDIR! Doğrusu 'stüdyo' olmalıdır.
   - 'kıral' ➔ YAZIM YANLIŞIDIR! Doğrusu 'kral' olmalıdır.

5. BAĞLAÇ OLAN 'da / de':
   - Cümleden çıkarılınca anlam bozulmaz, daima AYRI yazılır: 'yarında' ➔ YAZIM YANLIŞIDIR! Doğrusu 'yarın da' olmalıdır.

6. CÜMLE BAŞI VE ÖZEL ADLAR:
   - Cümle başındaki kelime daima büyük başlar. Asla cümle başındaki kelimeyi "küçük yazılmalıydı" diyerek hata sayma!
   - Asla anlatım bozukluğu veya kelime tercihi gibi konulara girme; SADECE YAZIM KURALI HATASINI BUL!

7. PEDAGOJİK KOÇ NOTU (coach_note) ÜRETİM REHBERİ:
   - Koç notunu bir özel ders öğretmeninin öğrenciye fısıldadığı akılda kalıcı bir taktik veya hafıza kodu (Mnemonic) gibi yaz.
   - Önemli anahtar kelimeleri tek tırnak içine al (örn: 'fark etmek', 'SOMBAHÇEMİ', 'FıSTıKÇı ŞaHaP').
   - Asla genel-geçer ve sıkıcı "Bu kurala dikkat edin" gibi cümleler kurma!

STANDART 10 TYT KURAL KATEGORİSİ (rule_category YALNIZCA bu 10 başlıktan biri olmalıdır):
1. "Büyük Harflerin Yazımı"
2. "Bitişik Yazılan Birleşik Kelimeler"
3. "Ayrı Yazılan Kelimeler"
4. "Bağlaç Olan Da / De'nin Yazımı"
5. "Bağlaç Olan Ki'nin Yazımı"
6. "Soru Eki Mı / Mi'nin Yazımı"
7. "Kısaltmaların Yazımı"
8. "Tarih ve Sayıların Yazımı"
9. "Ses Olayları ve Yardımcı Fiiller"
10. "Düzeltme İşareti (Şapka ^)"

JSON FORMATI (Eksiksiz JSON döndür):
{
  "question_text": "Soru metni",
  "options": {
    "A": "A seçeneği",
    "B": "B seçeneği",
    "C": "C seçeneği",
    "D": "D seçeneği",
    "E": "E seçeneği"
  },
  "wrong_option": "A",
  "wrong_word": "ayırtetmemizi",
  "correct_word": "ayırt etmemizi",
  "rule_category": "Ayrı Yazılan Kelimeler",
  "explanation": "TDK kuralına göre ses düşmesi veya türemesi olmayan birleşik fiiller daima ayrı yazılır.",
  "coach_note": "Taktik: 'etmek' ve 'olmak' fiillerinde ses düşmesi (sabretmek) veya türemesi (hissetmek) yoksa daima AYRI yazılır: 'ayırt etmek', 'fark etmek', 'terk etmek'!",
  "difficulty_score": 6
}`;

export const groqService = {
  async analyzeTextWithLlama(
    rawText: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    const trimmed = rawText.trim();

    // 1. Tier 1: Groq LLaMA-3.3-70B (Fast, accurate, high rate-limit, zero Gemini quota consumption)
    try {
      if (true) {
        const groqRes = await this.callGroqAPI(trimmed);
        if (groqRes && groqRes.wrong_option && groqRes.wrong_word) {
          return this.finalizeAnalysis(groqRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Groq primary attempt failed, trying OpenRouter fallback...', err);
    }

    // 2. Tier 2: OpenRouter LLaMA-3.3-70B
    try {
      if (true) {
        const openRouterRes = await this.callOpenRouterAPI(trimmed);
        if (openRouterRes && openRouterRes.wrong_option && openRouterRes.wrong_word) {
          return this.finalizeAnalysis(openRouterRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('OpenRouter attempt failed, trying Gemini fallback...', err);
    }

    // 3. Tier 3: Gemini 2.5 Flash (Fallback only if Groq/OpenRouter are unavailable)
    try {
      if (true) {
        const geminiRes = await this.callGeminiAPI(trimmed);
        if (geminiRes && geminiRes.wrong_option && geminiRes.wrong_word) {
          return this.finalizeAnalysis(geminiRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Gemini fallback attempt failed, using local inspection...', err);
    }

    // 4. Local Rule Engine Fallback
    return this.localFallback(trimmed, existingUserErrors);
  },

  async callGroqAPI(text: string): Promise<AnalysisResult> {
    const proxyContent = await this.invokeAi('groq', 'llama-3.3-70b-versatile', MASTER_SYSTEM_PROMPT, `Lütfen bu soruyu analiz et:\n"""\n${text}\n"""`);
    const proxyParsed = JSON.parse(proxyContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
    return this.sanitizeResult(proxyParsed, text);
    /* istanbul ignore next */
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.0,
        messages: [
          { role: 'system', content: MASTER_SYSTEM_PROMPT },
          { role: 'user', content: `Lütfen bu soruyu analiz et:\n"""\n${text}\n"""` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
    return this.sanitizeResult(parsed, text);
  },

  async callOpenRouterAPI(text: string): Promise<AnalysisResult> {
    const proxyContent = await this.invokeAi('openrouter', 'meta-llama/llama-3.3-70b-instruct', MASTER_SYSTEM_PROMPT, `Lütfen bu soruyu analiz et:\n"""\n${text}\n"""`);
    const proxyParsed = JSON.parse(proxyContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
    return this.sanitizeResult(proxyParsed, text);
    /* istanbul ignore next */
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'TDK TYT Master',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        response_format: { type: 'json_object' },
        temperature: 0.0,
        messages: [
          { role: 'system', content: MASTER_SYSTEM_PROMPT },
          { role: 'user', content: `Lütfen bu soruyu analiz et:\n"""\n${text}\n"""` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
    return this.sanitizeResult(parsed, text);
  },

  async callGeminiAPI(text: string): Promise<AnalysisResult> {
    const proxyRaw = await this.invokeAi('gemini', 'gemini-2.5-flash', '', `${MASTER_SYSTEM_PROMPT}\n\nAnaliz Edilecek Soru Metni:\n${text}`);
    return this.sanitizeResult(JSON.parse(proxyRaw), text);
    /* istanbul ignore next */
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `${MASTER_SYSTEM_PROMPT}\n\nAnaliz Edilecek Soru Metni:\n${text}`;
    const res = await model.generateContent(prompt);
    const raw = res.response.text();
    const parsed = JSON.parse(raw);
    return this.sanitizeResult(parsed, text);
  },

  async invokeAi(provider: 'groq' | 'openrouter' | 'gemini', model: string, systemPrompt: string, prompt: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-proxy', { body: { provider, model, systemPrompt, prompt } });
    if (error || !data?.content) throw new Error(error?.message || data?.error || 'AI servisi yanıt vermedi.');
    return data.content;
  },

  sanitizeResult(raw: any, fallbackText: string): AnalysisResult {
    const rawOptions = raw?.options;
    const options: Record<string, string> = {};

    if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      ['A', 'B', 'C', 'D', 'E'].forEach((k) => {
        if (rawOptions[k] && typeof rawOptions[k] === 'string') {
          options[k] = rawOptions[k].trim();
        }
      });
    }

    // Fallback options if missing or corrupt
    if (Object.keys(options).length === 0) {
      const lines = fallbackText.split('\n').map((l) => l.trim()).filter(Boolean);
      lines.forEach((line) => {
        const m = line.match(/^([A-Ea-e])[\)\.\-]\s*(.*)$/);
        if (m) {
          options[m[1].toUpperCase()] = m[2].trim();
        }
      });
    }

    return {
      question_text: typeof raw?.question_text === 'string' && raw.question_text.trim()
        ? raw.question_text.trim()
        : fallbackText.slice(0, 300),
      options,
      wrong_option: typeof raw?.wrong_option === 'string' ? raw.wrong_option.toUpperCase().trim() : undefined,
      wrong_word: typeof raw?.wrong_word === 'string' ? raw.wrong_word.trim() : '',
      correct_word: typeof raw?.correct_word === 'string' ? raw.correct_word.trim() : '',
      rule_category: typeof raw?.rule_category === 'string' ? normalizeCategory(raw.rule_category) : 'Ayrı Yazılan Kelimeler',
      explanation: typeof raw?.explanation === 'string' ? raw.explanation.trim() : 'Yazım kuralı kontrolü yapıldı.',
      coach_note: typeof raw?.coach_note === 'string' ? raw.coach_note.trim() : undefined,
      difficulty_score: typeof raw?.difficulty_score === 'number' ? Math.min(10, Math.max(1, raw.difficulty_score)) : 5
    };
  },

  async finalizeAnalysis(
    parsed: AnalysisResult,
    rawText: string,
    existingUserErrors: UserError[]
  ): Promise<AnalysisResult> {
    if (parsed.wrong_word) {
      parsed.wrong_word = parsed.wrong_word.replace(/^[\.,:;"'“”‘’\(\)]+|[\.,:;"'“”‘’\(\)]+$/g, '').trim();
    }
    if (parsed.correct_word) {
      parsed.correct_word = parsed.correct_word.replace(/^[\.,:;"'“”‘’\(\)]+|[\.,:;"'“”‘’\(\)]+$/g, '').trim();
    }

    // 1. TDK Verified Deterministic Engine Pre-Check across Options
    const verifiedMatch = tdkService.findErrorInOptions(parsed.options || {});
    if (verifiedMatch) {
      // If LLM picked an incorrect option OR hallucinated on a valid word (like zehretti)
      const isLLMHallucination = parsed.wrong_word && tdkService.isKnownCorrectWord(parsed.wrong_word);
      if (isLLMHallucination || parsed.wrong_option !== verifiedMatch.wrongOption) {
        parsed.wrong_option = verifiedMatch.wrongOption;
        parsed.wrong_word = verifiedMatch.wrongWord;
        parsed.correct_word = verifiedMatch.correctWord;
        parsed.rule_category = verifiedMatch.category;
        parsed.explanation = verifiedMatch.explanation;
        parsed.coach_note = verifiedMatch.coachNote;
      }
    } else if (parsed.wrong_word && tdkService.isKnownCorrectWord(parsed.wrong_word)) {
      // LLM picked a known correct word as an error (False Positive)
      console.warn('Blocked false positive on correct TDK word:', parsed.wrong_word);
      const fixed = this.inspectOptionsLocally(parsed.options || {}, rawText);
      if (fixed) {
        parsed.wrong_option = fixed.wrong_option;
        parsed.wrong_word = fixed.wrong_word;
        parsed.correct_word = fixed.correct_word;
        parsed.rule_category = fixed.rule_category;
        parsed.explanation = fixed.explanation;
      }
    }

    // 2. Check for hallucination / extreme word mismatch (e.g. "başpıtrak" -> "simit")
    if (parsed.wrong_word && parsed.correct_word) {
      const dist = levenshteinDistance(parsed.wrong_word, parsed.correct_word);
      const maxLen = Math.max(parsed.wrong_word.length, parsed.correct_word.length);
      if (maxLen > 4 && dist > maxLen * 0.6 && !parsed.wrong_word.includes(' ') && !parsed.correct_word.includes(' ')) {
        console.warn('Possible hallucination detected:', parsed.wrong_word, '->', parsed.correct_word);
        const fixed = this.inspectOptionsLocally(parsed.options || {}, rawText);
        if (fixed) {
          parsed.wrong_option = fixed.wrong_option;
          parsed.wrong_word = fixed.wrong_word;
          parsed.correct_word = fixed.correct_word;
          parsed.rule_category = fixed.rule_category;
          parsed.explanation = fixed.explanation;
        }
      }
    }

    // 3. Prevent identical wrong_word and correct_word
    if (
      !parsed.wrong_word ||
      !parsed.correct_word ||
      parsed.wrong_word.toLocaleLowerCase('tr-TR') === parsed.correct_word.toLocaleLowerCase('tr-TR')
    ) {
      const fixed = this.inspectOptionsLocally(parsed.options || {}, rawText);
      if (fixed) {
        parsed.wrong_option = fixed.wrong_option;
        parsed.wrong_word = fixed.wrong_word;
        parsed.correct_word = fixed.correct_word;
        parsed.rule_category = fixed.rule_category;
        parsed.explanation = fixed.explanation;
      }
    }

    // 4. Strictly Normalize Category to Canonical 10 TYT Categories
    parsed.rule_category = normalizeCategory(parsed.rule_category);

    // 5. Sanitize Coach Note for Linguistic & Phonetic Accuracy
    parsed.coach_note = tdkService.sanitizeCoachNote(
      parsed.coach_note,
      parsed.wrong_word,
      parsed.correct_word,
      parsed.rule_category
    );

    // 6. Compute coach note from historical weak spots if applicable
    const sameRuleCount = existingUserErrors.filter(
      e => (e.rule_category || '').toLocaleLowerCase('tr-TR') === (parsed.rule_category || '').toLocaleLowerCase('tr-TR')
    ).length;

    if (sameRuleCount >= 2 && !parsed.coach_note.includes('bu ay')) {
      parsed.coach_note = `${parsed.coach_note} (Bu kuralı bu ay ${sameRuleCount + 1}. kez karıştırdın!)`;
    }

    return parsed;
  },

  inspectOptionsLocally(options: QuestionOptions, _rawText: string) {
    const rules = [
      // 1. Düzeltme İşareti (Şapka)
      { wrong: 'tezgahtaki', correct: 'tezgâhtaki', category: 'Düzeltme İşareti (Şapka ^)', exp: "TDK'ye göre 'tezgâh' sözcüğü düzeltme işaretiyle (şapka) yazılır." },
      { wrong: 'tezgah', correct: 'tezgâh', category: 'Düzeltme İşareti (Şapka ^)', exp: "TDK'ye göre 'tezgâh' sözcüğü düzeltme işaretiyle (şapka) yazılır." },
      { wrong: 'dukkan', correct: 'dükkân', category: 'Düzeltme İşareti (Şapka ^)', exp: "TDK'ye göre 'dükkân' sözcüğü düzeltme işaretiyle (şapka) yazılır." },
      { wrong: 'kagit', correct: 'kâğıt', category: 'Düzeltme İşareti (Şapka ^)', exp: "TDK'ye göre 'kâğıt' sözcüğü düzeltme işaretiyle (şapka) yazılır." },

      // 2. İkilemeler
      { wrong: 'başabaş', correct: 'başa baş', category: 'Ayrı Yazılan Kelimeler', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'başa baş' olmalıdır." },
      { wrong: 'içlidışlı', correct: 'içli dışlı', category: 'Ayrı Yazılan Kelimeler', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'içli dışlı' olmalıdır." },
      { wrong: 'artarda', correct: 'art arda', category: 'Ayrı Yazılan Kelimeler', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'art arda' olmalıdır." },
      { wrong: 'yanyana', correct: 'yan yana', category: 'Ayrı Yazılan Kelimeler', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'yan yana' olmalıdır." },
      { wrong: 'enineboyuna', correct: 'enine boyuna', category: 'Ayrı Yazılan Kelimeler', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'enine boyuna' olmalıdır." },

      // 3. Kalıplaşmış Birleşik Kelimeler
      { wrong: 'zeytin yağlı', correct: 'zeytinyağlı', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'zeytinyağı' ve 'zeytinyağlı' kalıplaşmış olarak bitişik yazılır." },
      { wrong: 'zeytin yağı', correct: 'zeytinyağı', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'zeytinyağı' bitişik yazılır." },
      { wrong: 'dere otu', correct: 'dereotu', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'dereotu' bitişik yazılır." },
      { wrong: 'baş pıtrak', correct: 'başpıtrak', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'başpıtrak' bitişik yazılır." },
      { wrong: 'doğa sever', correct: 'doğasever', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre -sever ile kurulanlar bitişik yazılır." },
      { wrong: 'alt üst', correct: 'altüst', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'altüst etmek' bitişik yazılır." },
      { wrong: 'akşam üzeri', correct: 'akşamüzeri', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre somut yer bildirmeyen üzeri sözleri bitişik yazılır." },
      { wrong: 'ayak üstü', correct: 'ayaküstü', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'ayaküstü' bitişik yazılır." },
      { wrong: 'bilinç altı', correct: 'bilinçaltı', category: 'Bitişik Yazılan Birleşik Kelimeler', exp: "TDK'ye göre 'bilinçaltı' bitişik yazılır." },

      // 4. Yardımcı Fiiller
      { wrong: 'arzetti', correct: 'arz etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı (düşme/türeme) olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'farketti', correct: 'fark etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'terketti', correct: 'terk etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'ayırtetmemizi', correct: 'ayırt etmemizi', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'haketti', correct: 'hak etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },

      // 5. Büyük Harfler ve Kesme İşareti
      { wrong: "Üniversitesi'nin", correct: "Üniversitesinin", category: 'Büyük Harflerin Yazımı', exp: "Kurum ve üniversite adlarına gelen ekler kesme işaretiyle ayrılmaz." },
      { wrong: "Kurumu'nun", correct: "Kurumunun", category: 'Büyük Harflerin Yazımı', exp: "Kurum ve kuruluş adlarına gelen ekler kesme işaretiyle ayrılmaz." },
      { wrong: "Van Kedisi", correct: "Van kedisi", category: 'Büyük Harflerin Yazımı', exp: "Özel ada dahil olmayan tür isimleri küçük harfle başlar." }
    ];

    for (const [key, optText] of Object.entries(options)) {
      if (!optText) continue;
      const lower = optText.toLocaleLowerCase('tr-TR');

      for (const rule of rules) {
        if (lower.includes(rule.wrong.toLocaleLowerCase('tr-TR'))) {
          return {
            wrong_option: key,
            wrong_word: rule.wrong,
            correct_word: rule.correct,
            rule_category: normalizeCategory(rule.category),
            explanation: rule.exp
          };
        }
      }
    }

    return null;
  },

  localFallback(text: string, _existingUserErrors: UserError[]): AnalysisResult {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const options: QuestionOptions = {};
    let questionText = "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?";

    const optionRegex = /^([A-E])[\)\.\-]\s*(.*)$/i;
    const nonOptions: string[] = [];

    lines.forEach(l => {
      const match = l.match(optionRegex);
      if (match) {
        options[match[1].toUpperCase()] = match[2];
      } else {
        nonOptions.push(l);
      }
    });

    if (nonOptions.length > 0) {
      questionText = nonOptions.join(' ');
    }

    const inspected = this.inspectOptionsLocally(options, text);
    if (inspected) {
      return {
        question_text: questionText,
        options: Object.keys(options).length > 0 ? options : { A: text },
        wrong_option: inspected.wrong_option,
        wrong_word: inspected.wrong_word,
        correct_word: inspected.correct_word,
        rule_category: normalizeCategory(inspected.rule_category),
        explanation: inspected.explanation,
        coach_note: "TYT Türkçe sınavında TDK yazım kuralları her yıl mutlaka test edilir.",
        difficulty_score: 5
      };
    }

    // Honest fallback without generating equal/fake wrong_word == correct_word
    const firstKey = Object.keys(options)[0] || 'A';
    return {
      question_text: questionText,
      options: Object.keys(options).length > 0 ? options : { A: text },
      wrong_option: firstKey,
      wrong_word: 'Tespit Edilemedi',
      correct_word: 'Lütfen Elle Düzenleyin',
      rule_category: 'Ayrı Yazılan Kelimeler',
      explanation: 'Soru otomatik kurallarla tam çözümlenemedi. Lütfen soruyu detay ekranından inceleyip hatalı kelimeyi elle düzenleyin.',
      coach_note: '💡 Otomatik analiz yapılamadı; kaydı onayladıktan sonra düzenle butonunu kullanarak kuralı belirtebilirsin.',
      difficulty_score: 5
    };
  },

  /**
   * Generates authentic, dynamic, 100% unique 5-option TYT questions using Groq / OpenRouter LLaMA 3.3 70B
   * Uses parallel micro-batches (3-4 questions per chunk) to eliminate timeouts and speed up generation
   */
  async generateAIQuestionsBatch(
    targets: { wrong_word: string; correct_word: string; category: string }[],
    difficulty: 'kolay' | 'orta' | 'zor',
    inspirationSnippets: string[] = []
  ): Promise<any[]> {
    if (!targets || targets.length === 0) return [];

    // Split targets into micro-chunks of 3 questions to run in parallel
    const CHUNK_SIZE = 3;
    const chunks: { wrong_word: string; correct_word: string; category: string }[][] = [];
    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      chunks.push(targets.slice(i, i + CHUNK_SIZE));
    }

    const inspirationBlock = inspirationSnippets.length > 0
      ? `\nÖĞRENCİNİN KENDİ SORU HAVUZUNDAN ESİNLENME VE BAĞLAM REFERANSLARI:
${inspirationSnippets.slice(0, 6).map((s, i) => `${i + 1}. "${s}"`).join('\n')}
TALİMAT: Yukarıdaki referans cümlelerin edebi üslubundan, kelime zenginliğinden ve temalarından esinlenerek yepyeni, özgün cümleler kur.\n`
      : '';

    const systemPrompt = `Sen Türkiye'nin en seçkin TYT/YKS Türkçe Soru Yazarı ve TDK Yazım Kılavuzu Başuzmanısın.

GÖREVİN:
Verilen hedefler için ÖSYM / MEB standartlarında, 5 seçenekli (A, B, C, D, E) ÖZGÜN, YEPYENİ, EDEBİ ve AKADEMİK Türkçe yazım kuralları soruları üretmektir.
${inspirationBlock}
KRİTİK SORU ÜRETİM KURALLARI:
1. TEK HATA KURALI: Her soruda KESİNLİKLE sadece ve sadece 1 adet yazım yanlışı bulunmalıdır. O yanlış da belirtilen hedef kelimedir.
2. DİĞER 4 ŞIKTA HİÇBİR YAZIM YANLIŞI OLMAMALIDIR (KUSURSUZ ÇELDİRİCİLER):
   - Diğer 4 seçenek kesinlikle ve şüphesizce %100 YAZIM YANLIŞSIZ, noktalama ve imla açısından kusursuz, doğal, edebi veya bilimsel Türkçe cümleler olmalıdır.
   - 5 seçeneğin tamamı birbirinden tamamen farklı cümleler olmalıdır; kesinlikle aynı cümleyi şıklara kopyalama!
3. RASTGELE ŞIK DAĞILIMI: Hatalı şıkkın harfi (A, B, C, D veya E) her soruda rastgele dağıtılmalıdır.
4. ZORLUK SEVİYESİ: ${difficulty.toUpperCase()} (kolay: günlük akıcı dil; orta: TYT deneme sınavı standartı; zor: ÖSYM çeldiricili edebi/akademik metin).
5. CÜMLE BAŞI BÜYÜK HARF KURALI (HAYATİ ÖNEMDE):
   - Türkçede her cümle kural gereği BÜYÜK HARFLE başlar.
   - Eğer hedef kelimenin yanlışı "küçük harfle yazılması gereken bir unvan, meslek, akrabalık adı veya yön adının büyük yazılması" ise (örn: "Kaymakam" -> "kaymakam", "Doktor" -> "doktor", "Teyze" -> "teyze", "Batı" -> "batı"):
     BU KELİMEYİ KESİNLİKLE CÜMLE BAŞINA KOYMA! Cümlenin ortasına veya sonuna yerleştir (Örn: "Dün kasabaya gelen Kaymakam beyi herkes karşıladı." ➔ 'Kaymakam' ortada olduğu için yazım yanlışıdır).
6. BİRLEŞİK FİİLLERDE SES OLAYI DOĞRULUĞU:
   - 'zehretti', 'sabretti', 'şükretti', 'azmetti', 'kayboldu' sözcüklerinde ünlü düşmesi olduğu için bitişik yazılır ve %100 DOĞRUDUR. Bu kelimeleri asla yanlış şık olarak üretme!
   - Ses olayı olmayan 'ayırt etmek', 'fark etmek', 'terk etmek', 'arz etmek', 'hak etmek' fiillerinin bitişik yazılması ('ayırtetmek', 'farketti') ise yazım yanlışıdır.
7. DERİNLEMESİNE VE ÖZGÜN KOÇ NOTU (coach_note):
   - Asla "Bu kurala dikkat edin" gibi genel-geçer ve jenerik cümleler YAZMA!
   - Her soru için doğrudan o kelimeye ve kurala özel bir ÖĞRETMEN TAKTİĞİ, ÖSYM TUZAĞI ÇÖZÜMÜ ve HAFIZA KODLAMASI (Mnemonic) yaz.
   - Anahtar kavramları tek tırnak içine al (örn: 'fark etmek', 'SOMBAHÇEMİ', 'FıSTıKÇı ŞaHaP').

ÇIKTI FORMATI:
Sadece şu JSON nesnesini döndür:
{
  "questions": [
    {
      "question_text": "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?",
      "options": {
        "A": "Cümle metni...",
        "B": "Cümle metni...",
        "C": "Cümle metni...",
        "D": "Cümle metni...",
        "E": "Cümle metni..."
      },
      "wrong_option": "C",
      "wrong_word": "ayırtetmemizi",
      "correct_word": "ayırt etmemizi",
      "rule_category": "Ayrı Yazılan Kelimeler",
      "explanation": "TDK kuralına göre ses düşmesi veya türemesi olmayan birleşik fiiller daima ayrı yazılır.",
      "coach_note": "Taktik: 'etmek' yardımcı fiilinde ses olayı yoksa ayrı yazılır: 'ayırt etmek', 'fark etmek', 'terk etmek'!"
    }
  ]
}`;

    const makeSingleChunkCall = async (chunk: typeof targets): Promise<any[]> => {
      const promptItems = chunk.map((t, idx) => 
        `Soru ${idx + 1}: Yanlış yazılan kelime: "${t.wrong_word}", Doğru yazılışı: "${t.correct_word}", Kural kategorisi: "${t.category}"`
      ).join('\n');

      const executeCall = async (endpoint: string, key: string, model: string, extraHeaders = {}) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: AbortSignal.timeout(25000),
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            ...extraHeaders
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            temperature: 0.7,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Lütfen şu ${chunk.length} adet soru için TYT sınav sorularını üret:\n${promptItems}` }
            ]
          })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
        return Array.isArray(parsed?.questions) ? parsed.questions : [];
      };

      // 1. Tier 1: Groq LLaMA-3.3-70B
      if (GROQ_API_KEY) {
        try {
          const res = await executeCall('https://api.groq.com/openai/v1/chat/completions', GROQ_API_KEY, 'llama-3.3-70b-versatile');
          if (res.length > 0) return res;
        } catch (err) {
          console.warn('Groq chunk failed, trying OpenRouter fallback...', err);
        }
      }

      // 2. Tier 2: OpenRouter LLaMA-3.3-70B
      if (OPENROUTER_API_KEY) {
        try {
          const res = await executeCall('https://openrouter.ai/api/v1/chat/completions', OPENROUTER_API_KEY, 'meta-llama/llama-3.3-70b-instruct', {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'TDK TYT Master'
          });
          if (res.length > 0) return res;
        } catch (err) {
          console.warn('OpenRouter chunk failed:', err);
        }
      }

      return [];
    };

    // Run all chunks in parallel for maximum speed (e.g. 15 questions take ~3-4s total)
    const chunkPromises = chunks.map(chunk => makeSingleChunkCall(chunk));
    const results = await Promise.allSettled(chunkPromises);

    const allQuestions: any[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allQuestions.push(...res.value);
      }
    });

    return allQuestions;
  }
};
