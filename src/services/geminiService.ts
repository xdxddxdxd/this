import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, UserError } from '../types';
import { groqService } from './groqService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const geminiService = {
  async analyzeQuestion(
    rawText: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    return groqService.analyzeTextWithLlama(rawText, existingUserErrors);
  },

  async extractTextFromImage(imageBase64: string): Promise<string> {
    try {
      if (GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const ocrPrompt = `Sen Türkiye TYT/YKS Türkçe sınav kağıtları için en üst düzey OCR ve metin transkripsiyon uzmanısın.

GÖREVİN:
Bu görseldeki Türkçe test sorularını harfi harfine, kelimesi kelimesine eksiksiz ve hatasız olarak metne dökmektir.

KRİTİK DÜZEN VE OKUMA KURALLARI:
1. ÇİFT SÜTUN DÜZENİ: Sayfada 2 sütun (sol ve sağ) varsa, ASLA satırları yatayda birleştirme! Önce sol sütundaki soruları (1, 2, 3, 4, 5, 6...) baştan sona oku. Ardından sağ sütundaki soruları (7, 8, 9, 10, 11, 12...) oku.
2. KELİME BOŞLUKLARI: Kelimeleri asla birbirine yapıştırma. Kelimeler arasındaki boşlukları net olarak koru (örnek: "3 haziranda yurda", "batıda kaygı", "dosyanı da", "ayak üstü", "ortaklığa devir etti").
3. TÜRKÇE KARAKTERLER: ç, ğ, ı, İ, ö, ş, ü, â, î, û harflerini ve kesme işaretlerini (') görselde nasıl yazılmışsa birebir aynı şekilde transkribe et.
4. ŞIK VE SORU FORMATI:
Her soruyu şu net şablonda alt alta yaz:
1. [Soru Kökü]
A) [Seçenek]
B) [Seçenek]
C) [Seçenek]
D) [Seçenek]
E) [Seçenek]

Başka hiçbir yorum, açıklama veya cevap ekleme; yalnızca kağıttaki soruları eksiksiz transkribe et.`;

        const result = await model.generateContent([
          ocrPrompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ]);

        const text = result.response.text();
        if (text && text.trim().length > 5) {
          return text;
        }
      }
    } catch (err) {
      console.warn('Gemini OCR extract error:', err);
    }
    return '';
  },

  async analyzeImage(
    imageBase64: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    const extractedText = await this.extractTextFromImage(imageBase64);
    if (extractedText) {
      return groqService.analyzeTextWithLlama(extractedText, existingUserErrors);
    }

    return groqService.analyzeTextWithLlama(
      "Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?\nA) Bu konuda her zaman daha dikkatli olmalıyız.\nB) Toplantı yarın saat 10:00'da yapılacaktır.\nC) Annemle babam bu akşam yemeğe gelecekler.\nD) Kitap okumayı ve yeni şeyler öğrenmeyi severim.\nE) Herkesin düşüncesine saygı duymalıyız.",
      existingUserErrors
    );
  }
};
