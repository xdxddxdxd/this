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
          temperature: 0.05,
          messages: [
            {
              role: 'system',
              content: `Sen Türkiye TYT/ÖSYM Türkçe sınavları ve Türk Dil Kurumu (TDK) Yazım Kılavuzu konusunda en üst düzey uzmansın.
Görevin sana verilen soruyu/metni A'dan E'ye tüm şıklarıyla harf harf inceleyip yazım yanlışı olan şıkkı, hatalı kelimeyi ve TDK doğrusunu %100 doğrulukla bulmaktır.

ÖNEMLİ TDK KURALLARI REHBERİ:
1. YARDIMCI FİİLLER (etmek, olmak, eylemek, kılmak):
   - Ses düşmesi (ünlü düşmesi) veya ses türemesi VARSA BİTİŞİK yazılır:
     şükür+etti = şükretti (DOĞRU)
     sabır+etti = sabretti (DOĞRU)
     azim+etti = azmetti (DOĞRU)
     zehir+etti = zehretti (DOĞRU)
     hapis+oldu = hapsoldu (DOĞRU)
     af+etti = affetti (DOĞRU)
     his+etti = hissetti (DOĞRU)
     kayıp+etti = kaybetti (DOĞRU)
   - Ses olayı (düşme veya türeme) YOKSA MUTLAKA AYRI yazılır:
     ayırt etmek -> ayırtetmek YANLIŞTIR! "ayırt etmek" DOĞRUDUR.
     fark etmek -> farketmek YANLIŞTIR! "fark etmek" DOĞRUDUR.
     terk etmek -> terketmek YANLIŞTIR! "terk etmek" DOĞRUDUR.
     arz etmek -> arzetmek YANLIŞTIR! "arz etmek" DOĞRUDUR.
     sağ olmak -> sağolmak YANLIŞTIR! "sağ olmak" DOĞRUDUR.

2. BAĞLAÇ OLAN "DE / DA" vs BULUNMA HALİ EKİ "-DE / -DA":
   - Cümleden çıkarıldığında cümlenin yapısı bozulmuyorsa bağlaçtır ve AYRI yazılır.
     "yarında size geliriz" YANLIŞTIR! Doğrusu: "yarın da size geliriz".
     "Nasıl oldu da" DOĞRUDUR.

3. BAĞLAÇ OLAN "Kİ" vs SIFAT/İLGİ EKİ "-Kİ":
   - Fiillerden sonra gelen ki bağlaçtır ve ayrı yazılır ("fark etmedi ki").
   - Zaman veya yer bildiren sıfat yapan -ki bitişik yazılır ("yarınki", "evdeki", "akşamki").

4. ÜNLÜ DARALMASI KURALLARI:
   - Sadece şimdiki zaman eki "-yor" (ve demek/yemek fiillerinde bazı ekler) daralma yapar.
   - "-yor" eki olmadan geniş zaman veya -me/-ma olumsuzluk ekinde gereksiz daralma yazım yanlışıdır:
     "kanıtlıyamadı" YANLIŞTIR! Doğrusu: "kanıtlayamadı".
     "anlamıyan" YANLIŞTIR! Doğrusu: "anlamayan".

5. ÜNSÜZ BENZEŞMESİ (SERTLEŞME):
   - Sert ünsüzlerden (f, s, t, k, ç, ş, h, p) sonra gelen ekler sertleşir:
     "değişgenlik" YANLIŞTIR! Doğrusu: "değişkenlik".
     "1923'de" YANLIŞTIR! Doğrusu: "1923'te".

6. YABANCI KÖKENLİ SÖZCÜKLERİN YAZIMI:
   - "Antırenör" YANLIŞTIR! Doğrusu: "Antrenör".
   - "Kirpik" DOĞRUDUR ("kiprik" yanlıştır), "Kibrit" DOĞRUDUR.
   - "Laboratuvar" DOĞRUDUR ("laboratuar" yanlıştır), "Orijinal" DOĞRUDUR ("orjinal" yanlıştır).

ANALİZ ADIMLARI:
- Verilen metinden soru kökünü ve A, B, C, D, E şıklarını çıkar.
- Her şıkkı yukarıdaki TDK kurallarına göre tek tek kontrol et.
- Sadece gerçekten yazım kuralı ihlali olan şıkkı "wrong_option" olarak seç.
- Hatalı kelimeyi "wrong_word" (sorudaki yazılışı) ve "correct_word" (TDK doğrusu) olarak belirle.
- "rule_category" alanını TYT kural gruplarından biri yap: 'Ayrı Yazılan Kelimeler', 'Bitişik Yazılan Kelimeler', 'de / da Bağlacı', 'ki Bağlacı', 'mi Soru Eki', 'Büyük Harflerin Yazımı', 'Sayıların Yazımı', 'İkilemelerin Yazımı', 'Ses Olaylarına Bağlı Yazım Kuralları', 'Yabancı Kökenli Kelimeler'.
- "explanation": TDK kuralını ve hatanın nedenini net, kesin bir dille açıkla.
- "coach_note": Öğrenciye rehberlik eden samimi, öğretici koç uyarısı yaz.

SADECE ŞU JSON FORMATINDA CEVAP VER:
{
  "question_text": "Soru metni",
  "options": {
    "A": "A seçeneği metni",
    "B": "B seçeneği metni",
    "C": "C seçeneği metni",
    "D": "D seçeneği metni",
    "E": "E seçeneği metni"
  },
  "wrong_option": "A",
  "wrong_word": "ayırtetmemizi",
  "correct_word": "ayırt etmemizi",
  "rule_category": "Ayrı Yazılan Kelimeler",
  "explanation": "'Etmek' yardımcı fiiliyle kurulan birleşik fiillerde ses düşmesi veya türemesi yoksa fiil ayrı yazılır. 'Ayırt etmek' sözcüğünde ses olayı olmadığı için ayrı yazılmalıdır.",
  "coach_note": "Yardımcı eylemlerde ses olayı (düşme/türeme) yoksa her zaman ayrı yazılır. Bu kural TYT'de çok sık sorulur!",
  "difficulty_score": 6
}`
            },
            {
              role: 'user',
              content: `Lütfen bu soruyu dikkatle analiz et:\n"""\n${trimmed}\n"""`
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

      // Cross-verify with TDK service
      const tdkCheck = await tdkService.verifyWithTdk(parsed.wrong_word || parsed.correct_word);
      if (tdkCheck.isValid && tdkCheck.correctForm) {
        parsed.correct_word = tdkCheck.correctForm;
      }

      // Check recurring error patterns for this user
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

  localFallback(text: string, existingUserErrors: UserError[]): AnalysisResult {
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

    if (!found && detected.length === 0) {
      const lower = text.toLocaleLowerCase('tr-TR');
      for (const [_, record] of Object.entries(TDK_DICTIONARY)) {
        if (lower.includes(record.wrong.toLocaleLowerCase('tr-TR'))) {
          wrongWord = record.wrong;
          correctWord = record.correct;
          ruleCategory = record.category;
          explanation = record.explanation;
          break;
        }
      }
      options['A'] = text;
      wrongOption = 'A';
    }

    return {
      question_text: questionText,
      options: Object.keys(options).length > 0 ? options : { A: text },
      wrong_option: wrongOption,
      wrong_word: wrongWord,
      correct_word: correctWord,
      rule_category: ruleCategory,
      explanation,
      coach_note: "Yardımcı eylemlerde ses olayı (düşme/türeme) yoksa her zaman ayrı yazılır.",
      difficulty_score: 5
    };
  }
};