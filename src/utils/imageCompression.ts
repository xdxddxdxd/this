export interface CompressionOptions {
  /** En uzun kenar için üst sınır (piksel). Daha büyük görseller orantılı küçültülür. */
  maxDimension?: number;
  /** JPEG kalitesi (0-1). */
  quality?: number;
}

const DEFAULTS: Required<CompressionOptions> = {
  maxDimension: 1600,
  quality: 0.85
};

/** Dosyayı base64 data URL'e çevirir. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Görseli tarayıcı içinde yeniden boyutlandırıp JPEG'e sıkıştırır.
 * OCR'a gönderilmeden önce kullanılır; hem yükleme boyutunu hem de
 * Gemini maliyetini düşürür. Sıkıştırma başarısız olursa orijinal veri
 * döner; çağıran taraf yine de işleyebilir.
 */
export async function compressImage(
  dataUrl: string,
  { maxDimension = DEFAULTS.maxDimension, quality = DEFAULTS.quality }: CompressionOptions = {}
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
