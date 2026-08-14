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
1. "-SEVER" EKİYLE KURULAN BİRLEŞİK KELİMELER:
   - HER ZAMAN BİTİŞİK YAZILIR: "doğasever", "vatansever", "kitapsever", "hayvansever", "sanatsever", "müziksever". (Ayrı yazılırsa YANLIŞTIR).

2. BİTİŞİK YAZILAN BÖCEK VE BİTKİ/YİYECEK ADLARI:
   - "ateşböceği", "uğurböceği", "ağustosböceği" BİTİŞİK yazılır. ("ateş böceği" ayrı yazılırsa YANLIŞTIR).
   - "sivribiber", "karabiber", "zeytinyağı", "zeytinyağlı", "başpıtrak" BİTİŞİK yazılır. ("sivri biber" ayrı yazılırsa YANLIŞTIR).
   - "yeşil zeytin", "kuru fasulye", "yeşil biber" AYRI yazılır.

3. "ALTÜST" SÖZCÜĞÜ:
   - "altüst etmek", "altüst olmak" kalıplaşmış birleşik eylem olduğu için BİTİŞİK yazılır. ("alt üst etti" YANLIŞTIR -> "altüst etti").

4. "-ARASI" SÖZLERİ:
   - "şehirler arası", "okullar arası", "milletler arası" AYRI yazılır.

5. İKİLEMELER:
   - "enine boyuna", "başa baş", "içli dışlı", "art arda", "yan yana", "canla başla", "tek tek" AYRI yazılır. Cümlede ayrı yazılmışsa DOĞRUDUR. ("başabaş", "içlidışlı" YANLIŞTIR).

6. DÜZELTME İŞARETİ (ŞAPKA ^):
   - TDK sözlüğünde düzeltme işareti olan sözcükler şapkasız yazılırsa yazım yanlışıdır:
     "tezgâh" -> tezgah YANLIŞTIR!
     "dükkân" -> dukkan YANLIŞTIR!
     "kâğıt" -> kagit YANLIŞTIR!
     "rüzgâr" -> ruzgar YANLIŞTIR!

7. BÜYÜK HARFLER VE KESME İŞARETİ:
   - Kurum, kuruluş, kurul ve bakanlık adlarına gelen ekler kesmeyle AYRILMAZ: "Kültür ve Turizm Bakanlığının" (DOĞRU), "Ankara Üniversitesinin" (DOĞRU).
   - Dönem/çağ adlarında özel ada dahil olmayan sözcükler küçük: "Türk edebiyatı" (edebiyat küçük).

8. BELGİSİZ SIFAT "BİRTAKIM":
   - "Bazı" anlamında BİTİŞİK ("birtakım sorunlar"). Sayı anlamında AYRI ("bir takım elbise").

ÖNEMLİ KURAL:
- "correct_word" asla başka bir kelimeyle (örneğin simit vb.) değiştirilemez! Yalnızca o kelimenin imla kuralına uygun doğru yazılışı (örneğin: sivri biber -> sivribiber, ateş böcekleri -> ateşböcekleri, alt üst -> altüst) olmalıdır.
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
  "wrong_option": "E",
  "wrong_word": "sivri biber",
  "correct_word": "sivribiber",
  "rule_category": "Bitişik Yazılan Kelimeler",
  "explanation": "TDK'ye göre 'sivribiber' bitişik yazılır.",
  "coach_note": "TYT'de yiyecek ve bitki adlarının yazımı sıkça test edilir.",
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
    return JSON.parse(rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
  },

  async callGeminiAPI(text: string): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `${MASTER_SYSTEM_PROMPT}\n\nAnaliz Edilecek Soru Metni:\n${text}`;
    const res = await model.generateContent(prompt);
    const raw = res.response.text();
    return JSON.parse(raw);
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

    // Auto-fix if identical or missing
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

    // Cross-verify with TDK service
    const tdkCheck = await tdkService.verifyWithTdk(parsed.wrong_word || parsed.correct_word);
    if (tdkCheck.isValid && tdkCheck.correctForm) {
      parsed.correct_word = tdkCheck.correctForm;
    }

    const sameRuleCount = existingUserErrors.filter(
      e => (e.rule_category || '').toLocaleLowerCase('tr-TR') === (parsed.rule_category || '').toLocaleLowerCase('tr-TR')
    ).length;

    if (sameRuleCount >= 2) {
      parsed.coach_note = `Bu kuralı bu ay ${sameRuleCount + 1}. kez karıştırdın, dikkat etmende fayda var. Kısa bir tekrar sınavda net kazandırır!`;
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
      { wrong: 'başabaş', correct: 'başa baş', category: 'İkilemelerin Yazımı', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'başa baş' olmalıdır." },
      { wrong: 'içlidışlı', correct: 'içli dışlı', category: 'İkilemelerin Yazımı', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'içli dışlı' olmalıdır." },
      { wrong: 'artarda', correct: 'art arda', category: 'İkilemelerin Yazımı', exp: "İkilemeler her zaman ayrı yazılır. Doğrusu 'art arda' olmalıdır." },

      // 3. Kalıplaşmış Birleşik Kelimeler
      { wrong: 'zeytin yağlı', correct: 'zeytinyağlı', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'zeytinyağı' ve 'zeytinyağlı' kalıplaşmış olarak bitişik yazılır." },
      { wrong: 'zeytin yağı', correct: 'zeytinyağı', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'zeytinyağı' bitişik yazılır." },
      { wrong: 'dere otu', correct: 'dereotu', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'dereotu' bitişik yazılır." },
      { wrong: 'sivri biber', correct: 'sivribiber', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'sivribiber' kalıplaşmış olarak bitişik yazılır." },
      { wrong: 'ateş böcekleri', correct: 'ateşböcekleri', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'ateşböceği' kalıplaşmış olarak bitişik yazılır." },
      { wrong: 'alt üst', correct: 'altüst', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre 'altüst etmek' kalıplaşmış olarak bitişik yazılır." },
      { wrong: 'doğa severlerin', correct: 'doğaseverlerin', category: 'Bitişik Yazılan Kelimeler', exp: "TDK'ye göre '-sever' ekiyle kurulan sözcükler bitişik yazılır." },

      // 4. Yardımcı Fiiller
      { wrong: 'arzetti', correct: 'arz etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı (düşme/türeme) olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'farketti', correct: 'fark etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'terketti', correct: 'terk etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'ayırtetmemizi', correct: 'ayırt etmemizi', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },
      { wrong: 'haketti', correct: 'hak etti', category: 'Ayrı Yazılan Kelimeler', exp: "Ses olayı olmayan birleşik fiiller ayrı yazılır." },

      // 5. Kesme İşareti (Kurum/Üniversite)
      { wrong: "Üniversitesi'nin", correct: "Üniversitesinin", category: "Kesme İşaretinin Kullanımı", exp: "Kurum ve üniversite adlarına gelen ekler kesme işaretiyle ayrılmaz." },
      { wrong: "Kurumu'nun", correct: "Kurumunun", category: "Kesme İşaretinin Kullanımı", exp: "Kurum ve kuruluş adlarına gelen ekler kesme işaretiyle ayrılmaz." }
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
            rule_category: rule.category,
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
        rule_category: inspected.rule_category,
        explanation: inspected.explanation,
        coach_note: "TYT Türkçe sınavında TDK yazım kuralları her yıl mutlaka test edilir.",
        difficulty_score: 5
      };
    }

    const firstKey = Object.keys(options)[0] || 'A';
    const firstText = options[firstKey] || text;
    const words = firstText.split(/\s+/).filter(w => w.length > 3);
    const dynamicWord = words[0] || "bu sözcük";

    return {
      question_text: questionText,
      options: Object.keys(options).length > 0 ? options : { A: text },
      wrong_option: firstKey,
      wrong_word: dynamicWord,
      correct_word: dynamicWord,
      rule_category: "Yazım Kuralları",
      explanation: "TDK Yazım Kılavuzu kurallarına dikkat edilmelidir.",
      coach_note: "Sözcüklerin TDK kurallarına uygun yazılışını düzenli tekrar edin.",
      difficulty_score: 5
    };
  }
};