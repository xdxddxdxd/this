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
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: `Sen Türkiye TYT Türkçe sınavı ve Türk Dil Kurumu (TDK) yazım kuralları uzmanısın.
Görevin verilen TYT sorusunu veya kelimeyi analiz edip yazım yanlışını, kuralını ve öğrenciye özel rehberliği çıkarmaktır.

Kurallar:
1. Sorunun ana soru kökünü ve varsa tüm A, B, C, D, E şıklarını tam olarak metne dök.
2. Yazım yanlışı olan şıkkı (A, B, C, D veya E) belirle.
3. Hatalı yazılan kelimeyi (wrong_word) ve TDK'ye göre DOĞRU yazılışını (correct_word) tespit et.
4. Kural kategorisini sadece TYT müfredatındaki konulardan biri yap ('Bitişik Yazılan Kelimeler', 'Ayrı Yazılan Kelimeler', 'de / da Bağlacı', 'ki Bağlacı', 'mi Soru Eki', 'Büyük Harflerin Yazımı', 'Sayıların Yazımı', 'İkilemelerin Yazımı', 'Pekiştirmelerin Yazımı', 'Eklerin Yazımı', 'Ses Olaylarına Bağlı Yazım Kuralları', 'Yabancı Kökenli Kelimeler', 'Düzeltme İşareti').
5. TDK kurallarına dayanan anlaşılır, öğretici bir kural açıklaması yaz.
6. 1 ile 10 arasında zorluk puanı üret (arka plan için).
7. Öğretmen/koç samimiyetiyle öğrenciye özel yapıcı, öğretici bir not yaz.

Yanıtını SADECE şu JSON şemasına uygun ver:
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
  "wrong_word": "yanlış yazılan kelime",
  "correct_word": "doğru yazılışı",
  "rule_category": "Bitişik Yazılan Kelimeler",
  "explanation": "TDK açıklaması",
  "coach_note": "Koç notu",
  "difficulty_score": 5
}`
            },
            {
              role: 'user',
              content: `Lütfen bu soruyu analiz et:\n"""\n${trimmed}\n"""`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed: AnalysisResult = JSON.parse(content);

      const tdkCheck = await tdkService.verifyWithTdk(parsed.wrong_word || parsed.correct_word);
      if (tdkCheck.isValid && tdkCheck.correctForm) {
        parsed.correct_word = tdkCheck.correctForm;
      }

      const sameWordCount = existingUserErrors.filter(
        e => e.wrong_word.toLowerCase() === (parsed.wrong_word || '').toLowerCase()
      ).length;
      const sameRuleCount = existingUserErrors.filter(
        e => e.rule_category.toLowerCase() === (parsed.rule_category || '').toLowerCase()
      ).length;

      if (sameWordCount > 0 || sameRuleCount >= 2) {
        parsed.coach_note = `Bu kuralı bu ay ${sameRuleCount + 1}. kez karıştırdın, bir daha bakmanda fayda var. Kısa bir tekrar, uzun vadede büyük fark yaratır!`;
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
    let questionText = "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?";
    let wrongOption = "A";
    let wrongWord = "herzaman";
    let correctWord = "her zaman";
    let ruleCategory = "Ayrı Yazılan Kelimeler";
    let explanation = "'Her' belgisiz sıfatı ile oluşturulan 'her zaman' söz öbeği ayrı yazılır.";

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
      const lower = opt.text.toLowerCase();
      for (const [_, record] of Object.entries(TDK_DICTIONARY)) {
        if (lower.includes(record.wrong)) {
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
      const lower = text.toLowerCase();
      for (const [_, record] of Object.entries(TDK_DICTIONARY)) {
        if (lower.includes(record.wrong)) {
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
      coach_note: "Bu kural TYT denemelerinde en sık karşılaşılan tuzaklardan biridir. Dikkat etmen net kazandırır!",
      difficulty_score: 5
    };
  }
};