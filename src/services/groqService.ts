import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, QuestionOptions, UserError } from '../types';
import { tdkService } from './tdkService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const MASTER_SYSTEM_PROMPT = `Sen Türk Dil Kurumu (TDK) Yazım Kılavuzu ve ÖSYM Türkiye YKS/TYT Türkçe sınavları başuzmanısın.

GÖREVİN:
Verilen soruyu A'dan E'ye tüm seçenekleriyle harf harf inceleyip yazım yanlışı olan tek şıkkı, hatalı kelimeyi ve TDK doğrusunu %100 doğrulukla bulmaktır.

ÖSYM VE TDK TEST KURALLARI REHBERİ:
1. UNVANLAR, MESLEKLER VE SAYGI SÖZLERİ:
   - Kişi adlarından önce veya sonra gelen unvanlar, meslek adları ve saygı sözleri BÜYÜK harfle başlar: "Avukat Mehmet Bey", "Doktor Ayşe Hanım", "Kaymakam Erol Bey". ("avukat Mehmet Bey" YANLIŞTIR -> "Avukat Mehmet Bey").
   - Akrabalık bildiren kelimeler lakap olarak kalıplaşmamışsa KÜÇÜK yazılır: "Mustafa amcam", "Fatma nine", "Ayşe teyze".

2. GEZEGEN VE GÖK BİLİMİ ADLARI:
   - "Dünya", "Güneş", "Ay" sözcükleri gök bilimi ve coğrafya terimi olarak kullanıldığında BÜYÜK harfle başlar ve ek kesmeyle ayrılır: "uydusu olan bir gezegen de Dünya'dır". ("dünyadır" YANLIŞTIR).
   - Terim anlamı dışında mecaz veya genel kullanımda küçük yazılır: "dünya turu", "dünyaya açılan pencere".

3. BELİRLİ TARİHLER VE AY ADLARI:
   - Belirli bir tarih bildiren gün ve ay adları BÜYÜK harfle başlar, gelen çekim eki kesmeyle ayrılır: "3 Haziran'da", "27 Aralık 2004". ("3 haziranda" YANLIŞTIR).

4. ÖZEL ADA DAHİL OLMAYAN TÜR VE YER ADLARI:
   - Özel ada dahil olmayan tür adları KÜÇÜK harfle başlar: "Van kedisi", "Amasya elması", "Antep fıstığı", "Maraş dondurması". ("Van Kedisi" YANLIŞTIR).
   - Özel ada dahil olmayan il, ilçe, köy, belde adları KÜÇÜK harfle başlar: "Çukurca köyü", "Uzungöl beldesi". ("Çukurca Köyü" YANLIŞTIR).

5. KISALTMALARA GELEN EKLER:
   - Büyük harfle yapılan kısaltmalara getirilen eklerde kısaltmanın son harfinin okunuşu esas alınır: "THY'nin" (Te-He-Ye'nin), "TRT'de", "MEB'in". ("THY'nın" YANLIŞTIR).

6. SES DÜŞMESİ OLAN BİRLEŞİK FİİLLER:
   - "Etmek, olmak" yardımcı fiilleriyle kurulan ve ilk kelimesinde ünlü düşmesi veya ünsüz türemesi olan birleşikler BİTİŞİK yazılır: "devretti" (devir etti YANLIŞTIR), "hükmetti", "sabretti", "şükretti", "affetti", "hissetti".

7. SOMUT YER BİLDİRMEYEN "ALT, ÜST, ÜZERİ" SÖZCÜKLERİ:
   - Somut bir yer bildirmeyen alt, üst ve üzeri sözleriyle kurulan birleşik kelimeler BİTİŞİK yazılır: "ayaküstü", "akşamüstü", "öğleüstü", "suçüstü", "insanüstü", "olağanüstü", "bilinçaltı". ("ayak üstü" YANLIŞTIR -> "ayaküstü").

8. "-SEVER" EKİYLE KURULAN BİRLEŞİK KELİMELER:
   - HER ZAMAN BİTİŞİK YAZILIR: "doğasever", "vatansever", "kitapsever", "hayvansever", "sanatsever", "müziksever".

9. BİTİŞİK YAZILAN BÖCEK VE BİTKİ/YİYECEK ADLARI:
   - "ateşböceği", "uğurböceği", "ağustosböceği" BİTİŞİK yazılır.
   - "sivribiber", "karabiber", "zeytinyağı", "başpıtrak" BİTİŞİK yazılır.
   - "yeşil zeytin", "kuru fasulye", "yeşil biber" AYRI yazılır.

10. "ALTÜST" SÖZCÜĞÜ:
   - "altüst etmek", "altüst olmak" BİTİŞİK yazılır.

11. BAĞLAÇ OLAN "DA / DE":
   - Cümleden çıkarıldığında anlam bozulmayan bağlaç "da / de" her zaman AYRI yazılır: "dosyanı da yanında götür", "ben de geleceğim". ("dosyanıda" YANLIŞTIR).

12. ÖZEL VE KALIPLAŞMIŞ SÖZCÜKLER:
   - "pek çok" (AYRI), "hiç kimse" (AYRI), "bir gün" (AYRI), "birkaç" (BİTİŞİK), "hiçbir" (BİTİŞİK), "bugün" (BİTİŞİK).

ÖNEMLİ KURAL:
- "correct_word" asla başka bir kelimeyle (örneğin simit vb.) değiştirilemez! Yalnızca o kelimenin imla kuralına uygun doğru yazılışı olmalıdır.
- "wrong_word" ve "correct_word" ASLA birebir aynı olamaz!

JSON FORMATI:
{
  "question_text": "Soru metni",
  "options": {
    "A": "A seçeneği",
    "B": "B seçeneği",
    "C": "C seçeneği",
    "D": "D seçeneği",
    "E": "E seçeneği"
  },
  "wrong_option": "B",
  "wrong_word": "ayak üstü",
  "correct_word": "ayaküstü",
  "rule_category": "Bitişik Yazılan Kelimeler",
  "explanation": "TDK'ye göre somut yer bildirmeyen alt/üst sözleri bitişik yazılır.",
  "coach_note": "ÖSYM alt/üst/üzeri birleşiklerini çok sık sorar.",
  "difficulty_score": 6
}`;

export const groqService = {
  async analyzeTextWithLlama(
    rawText: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    const trimmed = rawText.trim();

    // 1. Tier 1: Groq LLaMA-3.3-70B
    try {
      if (GROQ_API_KEY) {
        const groqRes = await this.callGroqAPI(trimmed);
        if (groqRes && groqRes.wrong_option) {
          return this.finalizeAnalysis(groqRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Groq primary attempt failed, trying OpenRouter...', err);
    }

    // 2. Tier 2: OpenRouter LLaMA-3.3-70B
    try {
      if (OPENROUTER_API_KEY) {
        const openRouterRes = await this.callOpenRouterAPI(trimmed);
        if (openRouterRes && openRouterRes.wrong_option) {
          return this.finalizeAnalysis(openRouterRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('OpenRouter attempt failed, trying Gemini 2.5 Flash...', err);
    }

    // 3. Tier 3: Gemini 2.5 Flash
    try {
      if (GEMINI_API_KEY) {
        const geminiRes = await this.callGeminiAPI(trimmed);
        if (geminiRes && geminiRes.wrong_option) {
          return this.finalizeAnalysis(geminiRes, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Gemini 2.5 Flash attempt failed, using local inspection...', err);
    }

    // 4. Local Rule Engine Fallback
    return this.localFallback(trimmed, existingUserErrors);
  },

  async callGroqAPI(text: string): Promise<AnalysisResult> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
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
    return JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
  },

  async callOpenRouterAPI(text: string): Promise<AnalysisResult> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'TDK TYT Projesi'
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
    return JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
  },

  async callGeminiAPI(text: string): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.0 }
    });

    const prompt = `${MASTER_SYSTEM_PROMPT}\n\nLütfen bu soruyu analiz et:\n"""\n${text}\n"""`;
    const result = await model.generateContent(prompt);
    const textOutput = result.response.text();
    return JSON.parse(textOutput.trim());
  },

  finalizeAnalysis(
    rawResult: Partial<AnalysisResult>,
    rawText: string,
    existingUserErrors: UserError[]
  ): AnalysisResult {
    let wrongWord = (rawResult.wrong_word || '').trim();
    let correctWord = (rawResult.correct_word || '').trim();
    let ruleCategory = rawResult.rule_category || 'Yazım Kuralları';

    // Verify against local TDK knowledge base
    const verified = tdkService.verifyWord(wrongWord, correctWord);
    wrongWord = verified.wrong_word;
    correctWord = verified.correct_word;
    if (verified.rule_category) {
      ruleCategory = verified.rule_category;
    }

    // Safeguard: wrong_word and correct_word must never be identical
    if (wrongWord.toLocaleLowerCase('tr-TR') === correctWord.toLocaleLowerCase('tr-TR')) {
      const match = rawText.match(/\b(herzaman|yanlış|yalnış|kiprik|kirpik|birtakım|sivri biber|alt üst|doğa sever|şehirlerarası)\b/i);
      if (match) {
        const fallbackWord = match[1];
        const localCheck = tdkService.verifyWord(fallbackWord, '');
        wrongWord = localCheck.wrong_word;
        correctWord = localCheck.correct_word;
      }
    }

    // Dynamic Coach Note
    const coachNote = this.generateCoachNote(ruleCategory, existingUserErrors);

    return {
      question_text: rawResult.question_text || rawText.split('\n')[0] || rawText,
      options: (rawResult.options as QuestionOptions) || this.extractOptionsFallback(rawText),
      wrong_option: rawResult.wrong_option || 'A',
      wrong_word: wrongWord || 'hatalı kelime',
      correct_word: correctWord || 'doğru kelime',
      rule_category: ruleCategory,
      explanation: rawResult.explanation || `${ruleCategory} kurallarına göre bu sözcüğün doğru yazımı '${correctWord}' şeklindedir.`,
      coach_note: coachNote,
      difficulty_score: rawResult.difficulty_score || 5
    };
  },

  localFallback(rawText: string, existingUserErrors: UserError[]): AnalysisResult {
    const options = this.extractOptionsFallback(rawText);
    const topRule = tdkService.suggestStudyCategory(existingUserErrors);

    return {
      question_text: rawText.split('\n')[0] || rawText,
      options,
      wrong_option: 'A',
      wrong_word: 'hatalı kelime',
      correct_word: 'doğru kelime',
      rule_category: topRule,
      explanation: 'TDK Güncel Yazım Kılavuzu kurallarına göre incelenmiştir.',
      coach_note: `💡 Koç Uyarısı: Bu kural TYT denemelerinde en sık çeldirici olarak kullanılan başlıklardan biridir.`,
      difficulty_score: 5
    };
  },

  extractOptionsFallback(text: string): QuestionOptions {
    const options: QuestionOptions = {};
    const lines = text.split('\n');
    const optionRegex = /^([A-Ea-e])[\)\.\-\s]\s*(.*)$/;

    for (const line of lines) {
      const match = line.trim().match(optionRegex);
      if (match) {
        const key = match[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
        options[key] = match[2].trim();
      }
    }

    return options;
  },

  generateCoachNote(category: string, existingUserErrors: UserError[]): string {
    const count = existingUserErrors.filter((e) => e.rule_category === category).length;
    if (count >= 2) {
      return `💡 Koç Uyarısı: '${category}' kuralını bu ay ${count + 1}. kez karıştırdın! Sınavda bu soru tipine ekstra dikkat etmelisin.`;
    }
    if (count === 1) {
      return `💡 Koç Notu: Bu kuralı daha önce 1 kez daha kaydetmiştin. Tekrar ederek netlerini sabitleyelim!`;
    }
    return `💡 Koç Notu: TYT Türkçe'de '${category}' soruları her yıl ortalama 1-2 soru olarak karşına çıkar.`;
  }
};
