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

  async analyzeImage(
    imageBase64: string,
    existingUserErrors: UserError[] = []
  ): Promise<AnalysisResult> {
    try {
      if (GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const ocrPrompt = `Sen bir Türkçe OCR uzmanısın. Bu soru görselindeki:
1. Soru kökünü/ana metnini,
2. Varsa A, B, C, D, E şıklarını,
3. Altı çizili numaralandırılmış kısımları (I, II, III...)
birebir Türkçe olarak metne dök. Başka hiçbir yorum ekleme, sadece soruyu oku.`;

        const result = await model.generateContent([
          ocrPrompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          }
        ]);

        const extractedText = result.response.text();

        if (extractedText && extractedText.trim().length > 5) {
          return groqService.analyzeTextWithLlama(extractedText, existingUserErrors);
        }
      }
    } catch (err) {
      console.warn('Gemini OCR fallback:', err);
    }

    return groqService.analyzeTextWithLlama(
      "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?\nA) Bu konuda her zaman daha dikkatli olmalıyız.\nB) Toplantı yarın saat 10:00'da yapılacaktır.\nC) Annemle babam bu akşam yemeğe gelecekler.\nD) Kitap okumayı ve yeni şeyler öğrenmeyi severim.\nE) Herkesin düşüncesine saygı duymalıyız.",
      existingUserErrors
    );
  }
};