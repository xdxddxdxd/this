import { useEffect, useState } from 'react';
import { GET_RANDOM_RULE } from '../data/rulesData';

/**
 * Analiz bekleme ekranında 8 saniyede bir dönen rastgele TYT kuralı
 * flashcard'ını ve kaydırma animasyonu durumunu yönetir.
 */
export function useRuleFlashcard(isActive: boolean) {
  const [currentRule, setCurrentRule] = useState(GET_RANDOM_RULE);
  const [ruleAnimClass, setRuleAnimClass] = useState('flashcard-slide-idle');
  const [flashcardKey, setFlashcardKey] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRuleAnimClass('flashcard-slide-out');
      setTimeout(() => {
        setCurrentRule(GET_RANDOM_RULE());
        setFlashcardKey((k) => k + 1);
        setRuleAnimClass('flashcard-slide-in');
        setTimeout(() => setRuleAnimClass('flashcard-slide-idle'), 50);
      }, 320);
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive]);

  return { currentRule, ruleAnimClass, flashcardKey };
}
