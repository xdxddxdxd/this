import { useEffect, useRef, useState } from 'react';

interface UseQuizTimerOptions {
  /** Sayaç yalnızca true iken işler. */
  isActive: boolean;
  /** Dakika cinsinden süre; 0 = süresiz sınav. */
  durationMinutes: number;
  /** Süre dolduğunda çağrılır (yalnızca zamanlı sınavlarda). */
  onExpire: () => void;
}

/**
 * Sınav sırasında geçen süreyi ve geri sayımı yönetir.
 * Zamanlayıcı etkisi callback bağımlılığı yüzünden yeniden kurulum yapmasın
 * diye onExpire bir ref üzerinden çağrılır.
 */
export function useQuizTimer({ isActive, durationMinutes, onExpire }: UseQuizTimerOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
      if (durationMinutes > 0) {
        setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, durationMinutes]);

  // Süre bittiğinde sınavı bitir (zamanlayıcı güncelleyicisinden izole).
  useEffect(() => {
    if (isActive && durationMinutes > 0 && remainingSeconds === 0 && timeSpentSeconds > 0) {
      expireRef.current();
    }
  }, [isActive, durationMinutes, remainingSeconds, timeSpentSeconds]);

  /** Yeni bir sınav için sayaçları kurar ve geri sayımı başlatır. */
  const start = (minutes: number) => {
    setTimeSpentSeconds(0);
    setRemainingSeconds(minutes * 60);
  };

  const reset = () => {
    setRemainingSeconds(0);
    setTimeSpentSeconds(0);
  };

  return { remainingSeconds, timeSpentSeconds, start, reset };
}

/** Saniyeyi MM:SS biçimine çevirir. */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
