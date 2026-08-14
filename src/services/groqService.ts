import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, QuestionOptions, UserError } from '../types';
import { tdkService } from './tdkService';
import { TDK_DICTIONARY } from '../data/tdkDictionaryData';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const groqService = {
  async analyzeTextWithLlama(
    rawText: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    const trimmed = rawText.trim();

    // 1. Try Groq LLaMA-3.3-70B
    try {
      if (GROQ_API_KEY) {
        const groqResult = await this.callGroqAPI(trimmed);
        if (groqResult && groqResult.wrong_option) {
          return this.finalizeAnalysis(groqResult, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Groq Llama failed, falling back to Gemini 2.5 Flash:', err);
    }

    // 2. Fallback to Gemini 2.5 Flash
    try {
      if (GEMINI_API_KEY) {
        const geminiResult = await this.callGeminiAPI(trimmed);
        if (geminiResult && geminiResult.wrong_option) {
          return this.finalizeAnalysis(geminiResult, trimmed, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Gemini 2.5 Flash fallback failed, running local rule engine:', err);
    }

    // 3. Fallback to Local Rule & Dictionary Engine
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
          {
            role: 'system',
            content: `Sen Türk Dil Kurumu (TDK) Yazım Kılavuzu ve ÖSYM Türkiye YKS/TYT Türkçe sınavları uzmanısın.

GÖREVİN:
Verilen soruyu A'dan E'ye tüm seçenekleriyle incele ve kural ihlali olan seçeneği (%100 kesinlikle) tespit et.

ÖNEMLİ TDK KURALLARI VE DİKKAT EDİLECEK NOKTALAR:
1. İKİLEMELER:
   - İkilemeler HER ZAMAN AYRI yazılır: "başa baş" (başabaş YANLIŞTIR), "içli dışlı" (içlidışlı YANLIŞTIR), "art arda", "yan yana", "tek tek", "el ele".

2. DÜZELTME İŞARETİ (ŞAPKA ^):
   - TDK sözlüğünde düzeltme işareti olan sözcükler şapkasız yazılırsa yazım yanlışıdır:
     "tezgâh" -> tezgah YANLIŞTIR!
     "dükkân" -> dukkan YANLIŞTIR!
     "kâğıt" -> kagit YANLIŞTIR!
     "rüzgâr" -> ruzgar YANLIŞTIR!
     "hâlâ" -> hala YANLIŞTIR!

3. BİTİŞİK YAZILAN BİRLEŞİK SÖZCÜKLER:
   - "zeytinyağı", "zeytinyağlı" BİTİŞİK yazılır (zeytin yağlı YANLIŞTIR).
   - "gökyüzü", "yerküre", "seferber", "akşamüstü", "birdenbire", "gitgide" BİTİŞİK yazılır.
   - "birtakım" 'bazı' anlamındaysa BİTİŞİK ("birtakım sorunlar").

4. AYRI YAZILANLAR:
   - "şehir dışı", "sıra dışı", "hafta sonu", "gök mavisi", "ana yemek", "her bir", "göz ardı", "köpek yavrusu", "çevrim içi", "veri tabanı", "her an", "akşam yemeği".
   - Yardımcı fiillerde ses olayı yoksa AYRI: "arz etti" (arzetti YANLIŞTIR), "fark etti", "terk etti", "hak etti".

5. KESME İŞARETİ KURALI:
   - Kurum, kuruluş ve üniversite adlarına gelen ekler kesmeyle AYRILMAZ: "Ankara Üniversitesinin" (Ankara Üniversitesi'nin YANLIŞTIR).

ŞARTLAR:
- "wrong_word": Seçenekteki hatalı yazılan kelime/ifade.
- "correct_word": TDK'ye göre düzeltilmiş hali. ASLA wrong_word ile aynı olamaz!

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
  "wrong_option": "A",
  "wrong_word": "başabaş",
  "correct_word": "başa baş",
  "rule_category": "İkilemelerin Yazımı",
  "explanation": "İkilemeler her zaman ayrı yazılır. Bu nedenle 'başabaş' değil 'başa baş' olmalıdır.",
  "coach_note": "TYT'de ikilemelerin yazımı sık sık test edilir."
}`
          },
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const cleanJson = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanJson);
  },

  async callGeminiAPI(text: string): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `Sen Türk Dil Kurumu (TDK) Yazım Kılavuzu ve ÖSYM YKS/TYT Türkçe sınavları uzmanısın.
Soru metnini incele, A-E şıklarını analiz et ve yazım yanlışı olan şıkkı, hatalı kelimeyi ve TDK doğrusunu bul.

TDK KURALLARI:
- İkilemeler ayrı yazılır ("başa baş", "içli dışlı"). "başabaş" yanlıştır.
- Düzeltme işareti: "tezgâh", "dükkân". "tezgah" yanlıştır.
- Bitişik: "zeytinyağlı", "gökyüzü", "akşamüstü", "birdenbire", "birtakım" (bazı anlamında). "zeytin yağlı" yanlıştır.
- Ayrı: "şehir dışı", "sıra dışı", "hafta sonu", "gök mavisi", "ana yemek", "her bir", "göz ardı", "köpek yavrusu", "her an".
- Kurum/üniversite adlarında kesme işareti KULLANILMAZ ("Ankara Üniversitesinin").
- "wrong_word" ve "correct_word" ASLA aynı olamaz!

JSON Şeması:
{
  "question_text": "Soru metni",
  "options": { "A": "...", "B": "...", "C": "...", "D": "...", "E": "..." },
  "wrong_option": "A",
  "wrong_word": "başabaş",
  "correct_word": "başa baş",
  "rule_category": "İkilemelerin Yazımı",
  "explanation": "İkilemeler ayrı yazılır.",
  "coach_note": "İkilemelerin ayrı yazımına dikkat edin."
}

Metin:
${text}`;

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

    // Dynamic first option extraction
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