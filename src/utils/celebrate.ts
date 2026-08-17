import type { Options } from 'canvas-confetti';

const BRAND_COLORS = ['#D6303F', '#3F7D5C', '#FFD166'];

/**
 * Kutlama efekti. canvas-confetti yalnızca çağrı anında dinamik olarak
 * yüklenir, böylece ana bundle'a girmez. Efekt dekoratif olduğundan
 * yüklenemezse veya çalışamazsa hata fırlatılmaz.
 */
export async function fireConfetti(options: Partial<Options> = {}): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors: BRAND_COLORS,
      ...options
    });
  } catch {
    // Dekoratif efekt; sessizce yut.
  }
}
