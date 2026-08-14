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

        const ocrPrompt = `Sen bir Türkçe OCR ve soru tespit uzmanısın.
Bu görseldeki tüm Türkçe soruları:
1. Soru numaralarını (1., 2., 3...)
2. Soru kökünü/ana metnini
3. Varsa A, B, C, D, E şıklarını
4. Altı çizili veya numaralandırılmış kelimeleri
birebir eksiksiz metne dök. Başka hiçbir yorum ekleme, sadece soruyu oku.`;

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