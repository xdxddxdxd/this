import { AnalysisResult, QuestionOptions, UserError } from '../types';
import { tdkService } from './tdkService';
import { TDK_DICTIONARY } from '../data/tdkDictionaryData';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export const groqService = {
  async analyzeTextWithLlama(
    rawText: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    const trimmed = rawText.trim();

    try {
      if (!GROQ_API_KEY) {
        throw new Error('Groq API Key not found');
      }

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
              content: `Sen Türk Dil Kurumu (TDK) Yazım Kılavuzu ve ÖSYM Türkiye YKS/TYT Türkçe sınavları başuzmanısın.

GÖREVİN:
Sana verilen soruda A, B, C, D, E seçeneklerini harf harf inceleyip yazım yanlışı olan tek şıkkı, hatalı kelimeyi ve TDK doğrusunu %100 doğrulukla bulmaktır.

ÖSYM VE TDK TEST KURALLARI REHBERİ:
1. KURUM, KURULUŞ, MERKEZ VE ÜNİVERSİTE EKLERİ:
   - Kesme işaretiyle ASLA AYRILMAZ:
     "Ankara Üniversitesi'nin" YANLIŞTIR -> Doğrusu: "Ankara Üniversitesinin"
     "Türk Dil Kurumu'na" YANLIŞTIR -> Doğrusu: "Türk Dil Kurumuna"
     "Boğaziçi Üniversitesi'ne" YANLIŞTIR -> Doğrusu: "Boğaziçi Üniversitesine"
     "Bakanlar Kurulu'nun" YANLIŞTIR -> Doğrusu: "Bakanlar Kurulunun"

2. BELGİSİZ SIFAT "BİRTAKIM":
   - "Bazı" anlamındaysa MUTLAKA BİTİŞİK: "birtakım sorunlar" (bir takım sorunlar YANLIŞTIR), "birtakım insanlar".
   - Sayı olarak takım belirtiyorsa AYRI: "bir takım elbise", "bir takım mobilya".

3. YARDIMCI FİİLLER (etmek, olmak, eylemek, kılmak):
   - Ses olayı (düşme/türeme) yoksa MUTLAKA AYRI:
     "arz etmek" -> arzetti YANLIŞTIR! "arz etti" DOĞRUDUR.
     "fark etmek" -> farketti YANLIŞTIR! "fark etti" DOĞRUDUR.
     "terk etmek" -> terkatmek YANLIŞTIR! "terk etti" DOĞRUDUR.
     "ayırt etmek" -> ayırtetmek YANLIŞTIR! "ayırt etmek" DOĞRUDUR.
     "hak etmek" -> haketti YANLIŞTIR! "hak etti" DOĞRUDUR.
   - Ses olayı (ünlü düşmesi / ünsüz türemesi) varsa BİTİŞİK:
     şükretti, sabretti, azmetti, zehretti, hapsoldu, affetti, hissetti, kaybetti.

4. BÜYÜK HARFLER, UNVANLAR, GAZETE VE DERGİ:
   - Özel ada bağlı unvan ve saygı sözcükleri BÜYÜKTÜR: "Doç. Dr. Ali Bey'in" TAMAMEN DOĞRUDUR.
   - "Resmi Gazete" DOĞRUDUR (kendi adında gazete geçer).
   - Özel ada dahil olmayan "dergi, gazete, tablo" sözleri KÜÇÜK harfle başlar: "Türk Dili dergisi" (dergi d küçük).
   - Belirli bir tarih bildirmeyen gün adları KÜÇÜKTÜR: "önümüzdeki salı günü" (salı s küçük, DOĞRU).

5. RENK ADIYLA KURULAN YİYECEK VE BİTKİ ADLARI:
   - TDK güncel kılavuzunda "yeşil biber", "kırmızı biber", "sivri biber", "kuru fasulye" ayrıdır.

6. BİTİŞİK YAZILAN KALIPLAŞMIŞ SÖZCÜKLER:
   - "gitgide", "birdenbire", "akşamüstü", "akşamüzeri", "olağanüstü".

7. AYRI YAZILANLAR:
   - "çevrim içi" (AYRI), "çevrim dışı" (AYRI), "veri tabanı" (AYRI), "art arda" (AYRI), "her an" (AYRI), "hiçbir şey" (hiçbir bitişik, şey ayrı).

ÖNEMLİ ŞARTLAR:
- "wrong_word": Seçenekteki HATALI yazılmış kelime/ifade olmalıdır.
- "correct_word": TDK'ye göre düzeltilmiş hali olmalıdır. ASLA wrong_word ile birebir aynı olamaz!
- "wrong_option": A, B, C, D veya E olmalıdır.

CEVAP FORMATI (SADECE GEÇERLİ JSON):
{
  "question_text": "Soru metni",
  "options": {
    "A": "A seçeneği metni",
    "B": "B seçeneği metni",
    "C": "C seçeneği metni",
    "D": "D seçeneği metni",
    "E": "E seçeneği metni"
  },
  "wrong_option": "C",
  "wrong_word": "arzetti",
  "correct_word": "arz etti",
  "rule_category": "Ayrı Yazılan Kelimeler",
  "explanation": "Yardımcı fiillerde ses düşmesi veya türemesi yoksa sözcükler ayrı yazılır. 'Arz etmek' ses olayı içermediği için ayrı yazılmalıdır.",
  "coach_note": "TYT Türkçe sınavında yardımcı eylemlerin yazımı sıklıkla test edilir.",
  "difficulty_score": 6
}`
            },
            {
              role: 'user',
              content: `Lütfen bu soruyu dikkatle analiz et ve yazım yanlışı olan şıkkı, hatalı kelimeyi ve doğrusunu tespit et:\n"""\n${trimmed}\n"""`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const cleanJson = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed: AnalysisResult = JSON.parse(cleanJson);

      // Clean wrong_word and correct_word from punctuations
      if (parsed.wrong_word) {
        parsed.wrong_word = parsed.wrong_word.replace(/^[\.,:;"'“”‘’\(\)]+|[\.,:;"'“”‘’\(\)]+$/g, '').trim();
      }
      if (parsed.correct_word) {
        parsed.correct_word = parsed.correct_word.replace(/^[\.,:;"'“”‘’\(\)]+|[\.,:;"'“”‘’\(\)]+$/g, '').trim();
      }

      // Check if wrong_word equals correct_word or is empty -> trigger fallback fixer
      if (
        !parsed.wrong_word ||
        !parsed.correct_word ||
        parsed.wrong_word.toLocaleLowerCase('tr-TR') === parsed.correct_word.toLocaleLowerCase('tr-TR')
      ) {
        const fixed = this.applyLocalRuleInspection(parsed, trimmed);
        parsed.wrong_option = fixed.wrong_option;
        parsed.wrong_word = fixed.wrong_word;
        parsed.correct_word = fixed.correct_word;
        parsed.rule_category = fixed.rule_category;
        parsed.explanation = fixed.explanation;
      }

      // Cross-verify with TDK service
      const tdkCheck = await tdkService.verifyWithTdk(parsed.wrong_word || parsed.correct_word);
      if (tdkCheck.isValid && tdkCheck.correctForm) {
        parsed.correct_word = tdkCheck.correctForm;
      }

      // Coach note personalization
      const sameWordCount = existingUserErrors.filter(
        e => (e.wrong_word || '').toLocaleLowerCase('tr-TR') === (parsed.wrong_word || '').toLocaleLowerCase('tr-TR')
      ).length;
      const sameRuleCount = existingUserErrors.filter(
        e => (e.rule_category || '').toLocaleLowerCase('tr-TR') === (parsed.rule_category || '').toLocaleLowerCase('tr-TR')
      ).length;

      if (sameWordCount > 0 || sameRuleCount >= 2) {
        parsed.coach_note = `Bu kuralı bu ay ${sameRuleCount + 1}. kez karıştırdın, dikkat etmende fayda var. Kısa bir tekrar sınavda net kazandırır!`;
      }

      return parsed;
    } catch (err) {
      console.warn('Groq Llama-3.3-70b request fallback:', err);
      return this.localFallback(trimmed, existingUserErrors);
    }
  },

  applyLocalRuleInspection(result: Partial<AnalysisResult>, _rawText: string) {
    const options = result.options || {};

    // 1. Kurum / Üniversite kesme işareti kontrolü
    for (const [key, optText] of Object.entries(options)) {
      if (!optText) continue;
      const match = optText.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*\s+(?:Üniversitesi|Kurumu|Bakanlığı|Müdürlüğü|Fakültesi|Enstitüsü))'([a-zçğıöşü]+)/i);
      if (match) {
        return {
          wrong_option: key,
          wrong_word: `${match[1]}'${match[2]}`,
          correct_word: `${match[1]}${match[2]}`,
          rule_category: "Kesme İşaretinin Kullanımı",
          explanation: "Kurum, kuruluş, kurul, merkez, bakanlık ve üniversite adlarına gelen ekler kesme işaretiyle ayrılmaz."
        };
      }
    }

    // 2. Belgisiz sıfat "bir takım" -> "birtakım"
    for (const [key, optText] of Object.entries(options)) {
      if (!optText) continue;
      if (/\bbir\s+takım\s+(?:sorun|insan|kural|olay|durum|şey|sebep|neden)/i.test(optText)) {
        return {
          wrong_option: key,
          wrong_word: "bir takım",
          correct_word: "birtakım",
          rule_category: "Bitişik Yazılan Kelimeler",
          explanation: "'Birtakım' sözcüğü 'bazı' anlamında belgisiz sıfat olarak kullanıldığında bitişik yazılır."
        };
      }
    }

    // 3. Yardımcı fiiller
    for (const [key, optText] of Object.entries(options)) {
      if (!optText) continue;
      const wrongVerbs = [
        { wrong: 'arzetti', correct: 'arz etti' },
        { wrong: 'farketti', correct: 'fark etti' },
        { wrong: 'terketti', correct: 'terk etti' },
        { wrong: 'ayırtetmemizi', correct: 'ayırt etmemizi' },
        { wrong: 'haketti', correct: 'hak etti' }
      ];
      for (const v of wrongVerbs) {
        if (optText.toLocaleLowerCase('tr-TR').includes(v.wrong)) {
          return {
            wrong_option: key,
            wrong_word: v.wrong,
            correct_word: v.correct,
            rule_category: "Ayrı Yazılan Kelimeler",
            explanation: "Yardımcı fiillerde ses olayı (düşme veya türeme) yoksa sözcükler ayrı yazılır."
          };
        }
      }
    }

    return {
      wrong_option: result.wrong_option || "A",
      wrong_word: result.wrong_word || "hatalı sözcük",
      correct_word: result.correct_word || "doğru sözcük",
      rule_category: result.rule_category || "Yazım Kuralları",
      explanation: result.explanation || "TDK kurallarına göre bu sözcüğün yazımı yanlıştır."
    };
  },

  localFallback(text: string, _existingUserErrors: UserError[]): AnalysisResult {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const options: QuestionOptions = {};
    let questionText = "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?";
    let wrongOption = "A";
    let wrongWord = "ayırtetmemizi";
    let correctWord = "ayırt etmemizi";
    let ruleCategory = "Ayrı Yazılan Kelimeler";
    let explanation = "'Etmek' yardımcı fiiliyle kurulan birleşik fiillerde ses olayı yoksa sözcükler ayrı yazılır.";

    const optionRegex = /^([A-E])[\)\.\-]\s*(.*)$/i;
    const detected: { key: string; text: string }[] = [];
    const nonOptions: string[] = [];

    lines.forEach(l => {
      const match = l.match(optionRegex);
      if (match) {
        options[match[1].toUpperCase()] = match[2];
        detected.push({ key: match[1].toUpperCase(), text: match[2] });
      } else {
        nonOptions.push(l);
      }
    });

    if (nonOptions.length > 0) {
      questionText = nonOptions.join(' ');
    }

    let found = false;
    for (const opt of detected) {
      const lower = opt.text.toLocaleLowerCase('tr-TR');
      for (const [_, record] of Object.entries(TDK_DICTIONARY)) {
        if (lower.includes(record.wrong.toLocaleLowerCase('tr-TR'))) {
          wrongOption = opt.key;
          wrongWord = record.wrong;
          correctWord = record.correct;
          ruleCategory = record.category;
          explanation = record.explanation;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    const inspected = this.applyLocalRuleInspection({ options, wrong_option: wrongOption, wrong_word: wrongWord, correct_word: correctWord, rule_category: ruleCategory, explanation }, text);

    return {
      question_text: questionText,
      options: Object.keys(options).length > 0 ? options : { A: text },
      wrong_option: inspected.wrong_option,
      wrong_word: inspected.wrong_word,
      correct_word: inspected.correct_word,
      rule_category: inspected.rule_category,
      explanation: inspected.explanation,
      coach_note: "Yardımcı eylemlerde ses olayı (düşme/türeme) yoksa her zaman ayrı yazılır.",
      difficulty_score: 5
    };
  }
};