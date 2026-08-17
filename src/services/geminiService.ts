import { supabase } from '../lib/supabase';

// OCR modeli çevre değişkeniyle değiştirilebilir; varsayılan hızlı flash modeli.
// Daha güçlü modeller (örn. gemini-3.5-flash) talep yoğunluğu düştüğünde denenebilir.
const OCR_MODEL = import.meta.env.VITE_GEMINI_OCR_MODEL || 'gemini-2.5-flash';

const OCR_PROMPT = `Sen Türkiye TYT/YKS Türkçe sınav formatı ve TDK Yazım Kuralları konusunda uzmanlaşmış yüksek hassasiyetli bir OCR asistanısın.

GÖREVİN:
Görseldeki Türkçe yazım kuralları sorusunu/sorularını tek bir harf veya noktalama işaretini bile atlamadan, en yüksek doğrulukla dijital metne dönüştürmektir.

KRİTİK DİKKAT EDİLECEK NOKTALAR:
1. ŞIKLAR: A), B), C), D), E) seçeneklerini her biri ayrı bir satırda olacak şekilde eksiksiz aktar.
2. PARAGRAF VE METİN: Paragraf içerisindeki altı çizili veya numaralandırılmış sözcükleri (I, II, III, IV, V) orijinal sırasıyla ve tam yazılışlarıyla koru.
3. ALT ÇİZİLİ SÖZCÜK LİSTESİ (ÇOK ÖNEMLİLİ): Paragrafında altı çizili / numaralandırılmış (I, II, III, IV, V) sözcükler bulunan her soru için, ait olduğu sorunun ŞIKLARINDAN VE KAYNAK SATIRINDAN (örn. "(2016-KPSS/Lisans)") SONRA, o soru bloğunun en son satırları olarak şu biçimde bir liste ekle:
   (I) yanısıra
   (II) sahidende
   Listedeki her sözcüğü paragraftan BİREBİR, HARF HARF kopyala: yazım yanlışı varsa bile ASLA DÜZELTME, bitişik yazılmışsa bitişik, ayrı yazılmışsa ayrı koru. Numarayı kelimenin altındaki işaretten doğru sırayla eşleştir (I en soldaki/en üstteki kelimedir). Altı çizili sözcük yoksa liste ekleme.
4. BÜYÜK/KÜÇÜK HARF & KESME İŞARETLERİ: Yazım yanlışı sorularında tek bir harf veya kesme işareti hayati önem taşır; kelimelerin büyük/küçük harf durumunu ve birleşik/ayrı yazılışını birebir aktar.
5. ÇIKTI TEMİZLİĞİ: Sadece ve sadece soru metnini, paragrafları, altı çizili sözcük listelerini ve şıkları yaz. Başına veya sonuna hiçbir selamlama, açıklama veya yorum ekleme.`;

export const geminiService = {
  /**
   * Fotoğraftaki soruyu OCR ile metne çevirir. Birincil yol Supabase
   * `ai-proxy` edge function'ıdır (anahtar sunucuda kalır); function
   * deploy edilmemişse veya erişilemezse yerel .env'deki Gemini anahtarıyla
   * doğrudan çağrıya düşer. Üretimde ai-proxy'nin deploy edilmesi tercih
   * edilir; doğrudan çağrı anahtarı istemciye gördüğü için geliştirme
   * amaçlı bir yedektir.
   */
  async extractTextFromImage(base64Image: string): Promise<string> {
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    try {
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { provider: 'gemini', model: OCR_MODEL, prompt: OCR_PROMPT, image: cleanBase64 }
      });
      if (!error && data?.content) {
        return data.content.trim();
      }
    } catch {
      // Proxy'ye ulaşılamadı; doğrudan yerel anahtarla devam edilir.
    }

    return this.extractWithLocalKey(OCR_PROMPT, cleanBase64);
  },

  async extractWithLocalKey(prompt: string, image: string): Promise<string> {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error('OCR servisi şu anda erişilemiyor: "ai-proxy" fonksiyonu Supabase tarafında bulunamadı (404). Supabase Edge Function\'ı deploy edin veya yerel .env dosyasına VITE_GEMINI_API_KEY tanımlayın.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${OCR_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: 'image/jpeg', data: image } }] }]
        })
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error?.message || 'OCR servisi yanıt vermedi.');
    }
    return (payload.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
  }
};
