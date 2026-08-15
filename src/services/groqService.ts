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

STANDART TYT KURAL KATEGORİLERİ (rule_category alanı sadece bu standart başlıklardan biri olmalıdır):
- "Büyük Harflerin Yazımı" (Ülke, devlet, kişi, kurum, gezegen, özel adlar ve unvanlar için)
- "Bitişik Yazılan Birleşik Kelimeler" (-sever, altüst, ateşböceği, sivribiber vb.)
- "Ayrı Yazılan Kelimeler" (şehirler arası, yeşil biber, ikilemeler, pek çok vb.)
- "Bağlaç Olan Da / De'nin Yazımı"
- "Bağlaç Olan Ki'nin Yazımı"
- "Kısaltmaların Yazımı" (THY'nin, MEB'in vb.)
- "Tarih ve Sayıların Yazımı" (3 Haziran'da vb.)
- "Ses Olayları ve Yardımcı Fiiller" (devretti, şükretti vb.)
- "Düzeltme İşareti (Şapka ^)" (tezgâh, dükkân vb.)
- "Yazımı Karıştırılan Sözcükler"

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
  "wrong_option": "C",
  "wrong_word": "güney Afrika Cumhuriyeti",
  "correct_word": "Güney Afrika Cumhuriyeti",
  "rule_category": "Büyük Harflerin Yazımı",
  "explanation": "TDK kurallarına göre devlet ve ülke adlarını oluşturan tüm sözcükler büyük harfle başlar.",
  "coach_note": "Ülke ve devlet adlarının yazımı TYT'de sıkça sorulur.",
  "difficulty_score": 6
}
`;

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
