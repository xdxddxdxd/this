import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const geminiService = {
  async extractTextFromImage(base64Image: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API anahtarı bulunamadı.');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Sen Türkiye TYT/YKS Türkçe sınavı ve TDK yazım kuralları uzmanısın.
Görseldeki Türkçe yazım yanlışı sorusunu/sorularını harfiyen oku ve metne dök.
Tüm soru köklerini, paragrafları ve A, B, C, D, E seçeneklerini eksiksiz aktar.
Sadece soru metnini yaz, ek açıklama ekleme.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      }
    ]);

    return result.response.text();
  }
};
