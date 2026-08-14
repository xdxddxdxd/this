import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Star, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserError } from '../types';

interface FlashcardQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: UserError[];
}

export const FlashcardQuizModal: React.FC<FlashcardQuizModalProps> = ({
  isOpen,
  onClose,
  errors
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || errors.length === 0) return null;

  const currentError = errors[currentIndex];
  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;
  const hasOptions = currentError && currentError.options && Object.keys(currentError.options).length > 0;
  const correctOption = currentError?.wrong_option?.toUpperCase() || 'A';

  const handleSelectOption = (optKey: string) => {
    if (isRevealed) return;
    setSelectedOption(optKey);
    setIsRevealed(true);

    const isCorrect = optKey.toUpperCase() === correctOption;
    if (isCorrect) {
      setScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3F7D5C', '#D6303F', '#1C1C1E']
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < errors.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsRevealed(false);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D6303F', '#3F7D5C', '#FFD166']
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setScore(0);
    setIsCompleted(false);
  };

  // Helper to render the red-pen correction inside the revealed option
  const renderRevealedOption = (optKey: string, optText: string) => {
    const isTargetWrong = currentError.wrong_option?.toUpperCase() === optKey.toUpperCase();
    if (!isTargetWrong || !isRevealed) {
      return <span>{optText}</span>;
    }

    const wrongWord = currentError.wrong_word || '';
    const correctWord = currentError.correct_word || '';
    const lowerOpt = optText.toLocaleLowerCase('tr-TR');
    const lowerWrong = wrongWord.toLocaleLowerCase('tr-TR');
    const idx = lowerOpt.indexOf(lowerWrong);

    if (idx === -1) {
      return (
        <span style={{ lineHeight: 1.7 }}>
          <del className="struck-word">{wrongWord}</del>
          <span className="correction-badge-inline">
            <span className="caret-arrow">^</span>
            <span>{correctWord}</span>
          </span>{' '}
          <span>{optText}</span>
        </span>
      );
    }

    const before = optText.substring(0, idx);
    const matched = targetMatch(optText, idx, wrongWord.length);
    const after = optText.substring(idx + wrongWord.length);

    return (
      <span style={{ lineHeight: 1.7 }}>
        {before}
        <del className="struck-word">{matched}</del>
        <span className="correction-badge-inline">
          <span className="caret-arrow">^</span>
          <span>{correctWord}</span>
        </span>
        {after}
      </span>
    );
  };

  function targetMatch(str: string, start: number, len: number) {
    return str.substring(start, start + len);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Hata Tekrar Sınavı
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isCompleted && (
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {currentIndex + 1} / {errors.length}
              </span>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-card-secondary)' }}>
            <div
              style={{
                width: `${((currentIndex + 1) / errors.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--color-red)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}

        {/* Content Body */}
        {!isCompleted ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Question Stem */}
            <div className="exam-paper-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Yazım yanlışı olan seçeneği işaretleyin:
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {currentError.question_text}
              </div>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hasOptions ? (
                optionKeys.map((key) => {
                  const optText = currentError.options[key];
                  if (!optText) return null;

                  const isThisSelected = selectedOption === key;
                  const isThisCorrect = key.toUpperCase() === correctOption;

                  let borderStyle = '1px solid var(--color-border)';
                  let bgStyle = 'var(--bg-card)';
                  let textColor = 'var(--text-primary)';

                  if (isRevealed) {
                    if (isThisCorrect) {
                      borderStyle = '2px solid var(--color-red)';
                      bgStyle = 'var(--color-red-light)';
                    } else if (isThisSelected && !isThisCorrect) {
                      borderStyle = '2px solid var(--text-muted)';
                      bgStyle = 'var(--bg-card-secondary)';
                    }
                  } else if (isThisSelected) {
                    borderStyle = '2px solid var(--text-primary)';
                  }

                  return (
                    <button
                      key={key}
                      disabled={isRevealed}
                      onClick={() => handleSelectOption(key)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: borderStyle,
                        backgroundColor: bgStyle,
                        textAlign: 'left',
                        cursor: isRevealed ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isRevealed && isThisCorrect ? 'var(--color-red)' : 'var(--text-secondary)', minWidth: '20px' }}>
                        {key})
                      </span>
                      <div style={{ flex: 1, fontSize: '0.9rem', color: textColor }}>
                        {renderRevealedOption(key, optText)}
                      </div>
                      {isRevealed && isThisCorrect && (
                        <CheckCircle2 size={18} style={{ color: 'var(--color-red)', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      {isRevealed && isThisSelected && !isThisCorrect && (
                        <XCircle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="exam-paper-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bu kayıt doğrudan kelime kartıdır.</p>
                  <button className="btn-primary" onClick={() => setIsRevealed(true)} style={{ marginTop: '10px' }}>
                    Doğrusunu Göster
                  </button>
                </div>
              )}
            </div>

            {/* Revealed Explanation & Rule Feedback */}
            {isRevealed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.25s ease' }}>
                <div className="rule-explanation-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-serif)' }}>TDK Kuralı</span>
                    <span className="rule-badge">{currentError.rule_category}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {currentError.explanation}
                  </p>
                </div>

                {currentError.coach_note && (
                  <div className="coach-note-card" style={{ padding: '10px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      💡 {currentError.coach_note}
                    </div>
                  </div>
                )}

                <button
                  className="btn-primary"
                  onClick={handleNextQuestion}
                  style={{ padding: '12px', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '6px' }}
                >
                  <span>{currentIndex + 1 < errors.length ? 'Sonraki Soru' : 'Sınavı Tamamla'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

          </div>
        ) : (
          /* Completion Screen */
          <div style={{ padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={32} />
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                Hata Tekrarı Tamamlandı!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto' }}>
                Kaydettiğin {errors.length} sorudan <strong>{score} tanesini</strong> doğru tespit ettin.
              </p>
            </div>

            <div className="stat-counter-card" style={{ padding: '16px 28px', minWidth: '160px' }}>
              <div className="stat-label-top">Doğruluk Oranı</div>
              <div className="stat-number">%{Math.round((score / errors.length) * 100)}</div>
              <div className="stat-label-bottom">{score} / {errors.length} Başarı</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button className="btn-primary" onClick={handleRestart} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '6px' }}>
                <RotateCcw size={17} /> Tekrar Çöz
              </button>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Bitir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
