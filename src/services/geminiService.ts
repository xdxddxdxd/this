import { supabase } from '../lib/supabase';

export const geminiService = {
  async extractTextFromImage(base64Image: string): Promise<string> {
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `Sen Türkiye TYT/YKS Türkçe sınav formatı ve TDK Yazım Kuralları konusunda uzmanlaşmış yüksek hassasiyetli bir OCR asistanısın.

GÖREVİN:
Görseldeki Türkçe yazım kuralları sorusunu/sorularını tek bir harf veya noktalama işaretini bile atlamadan, en yüksek doğrulukla dijital metne dönüştürmektir.

KRİTİK DİKKAT EDİLECEK NOKTALAR:
1. ŞIKLAR: A), B), C), D), E) seçeneklerini her biri ayrı bir satırda olacak şekilde eksiksiz aktar.
2. PARAGRAF VE METİN: Paragraf içerisindeki altı çizili veya numaralandırılmış sözcükleri (I, II, III, IV, V) orijinal sırasıyla ve tam yazılışlarıyla koru.
3. BÜYÜK/KÜÇÜK HARF & KESME İŞARETLERİ: Yazım yanlışı sorularında tek bir harf veya kesme işareti hayati önem taşır; kelimelerin büyük/küçük harf durumunu ve birleşik/ayrı yazılışını birebir aktar.
4. ÇIKTI TEMİZLİĞİ: Sadece ve sadece soru metnini ve şıkları yaz. Başına veya sonuna hiçbir selamlama, açıklama veya yorum ekleme.`;

    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: { provider: 'gemini', model: 'gemini-2.5-flash', prompt, image: cleanBase64 }
    });
    if (error || !data?.content) throw new Error(error?.message || data?.error || 'OCR servisi yanıt vermedi.');
    return data.content.trim();
  }
};
