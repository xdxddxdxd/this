import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserError } from '../types';
import { quizGeneratorService, DynamicQuizQuestion } from '../services/quizGeneratorService';

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
  const [quizQuestions, setQuizQuestions] = useState<DynamicQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate / Load cached fresh questions when modal opens
  useEffect(() => {
    if (isOpen && errors.length > 0) {
      const generated = quizGeneratorService.getOrGenerateQuizQuestions(errors);
      setQuizQuestions(generated);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsRevealed(false);
      setScore(0);
      setIsCompleted(false);
    }
  }, [isOpen, errors]);

  if (!isOpen || quizQuestions.length === 0) return null;

  const currentQ = quizQuestions[currentIndex];
  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;
  const correctOption = currentQ?.wrong_option?.toUpperCase() || 'A';

  const handleSelectOption = (optKey: string) => {
    if (isRevealed) return;
    setSelectedOption(optKey);
    setIsRevealed(true);

    const isCorrect = optKey.toUpperCase() === correctOption;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#3F7D5C', '#D6303F', '#1C1C1E']
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
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

  const handleRestart = (regenerateFresh = false) => {
    if (regenerateFresh) {
      const fresh = quizGeneratorService.regenerateAll(errors);
      setQuizQuestions(fresh);
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setScore(0);
    setIsCompleted(false);
  };

  // Helper to render the red-pen correction inside the revealed option
  const renderRevealedOption = (optKey: string, optText: string) => {
    const isTargetWrong = currentQ.wrong_option?.toUpperCase() === optKey.toUpperCase();
    if (!isTargetWrong || !isRevealed) {
      return <span>{optText}</span>;
    }

    const wrongWord = currentQ.wrong_word || '';
    const correctWord = currentQ.correct_word || '';
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
    const matched = optText.substring(idx, idx + wrongWord.length);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                Dinamik Hata Tekrar Sınavı
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Hatalarından türetilmiş yepyeni cümleler
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!isCompleted && (
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {currentIndex + 1} / {quizQuestions.length}
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
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--color-red)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}

        {/* Content Body */}
        {!isCompleted && currentQ ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Question Stem */}
            <div className="exam-paper-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Yazım yanlışı olan seçeneği bulunuz:
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {currentQ.question_text}
              </div>
            </div>

            {/* 5 Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {optionKeys.map((key) => {
                const optText = currentQ.options[key];
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
                      padding: '11px 14px',
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
                    <div style={{ flex: 1, fontSize: '0.88rem', color: textColor, lineHeight: 1.5 }}>
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
              })}
            </div>

            {/* Revealed Explanation & Rule Feedback */}
            {isRevealed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.25s ease' }}>
                <div className="rule-explanation-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-serif)' }}>TDK Kuralı</span>
                    <span className="rule-badge">{currentQ.rule_category}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {currentQ.explanation}
                  </p>
                </div>

                {currentQ.coach_note && (
                  <div className="coach-note-card" style={{ padding: '10px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {currentQ.coach_note}
                    </div>
                  </div>
                )}

                <button
                  className="btn-primary"
                  onClick={handleNextQuestion}
                  style={{ padding: '12px', marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '6px' }}
                >
                  <span>{currentIndex + 1 < quizQuestions.length ? 'Sonraki Soru' : 'Sınavı Tamamla'}</span>
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
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
                Kaydettiğin {quizQuestions.length} farklı kuraldan türetilen yeni sorulardan <strong>{score} tanesini</strong> doğru tespit ettin.
              </p>
            </div>

            <div className="stat-counter-card" style={{ padding: '16px 28px', minWidth: '160px' }}>
              <div className="stat-label-top">Doğruluk Oranı</div>
              <div className="stat-number">%{Math.round((score / quizQuestions.length) * 100)}</div>
              <div className="stat-label-bottom">{score} / {quizQuestions.length} Başarı</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button
                className="btn-primary"
                onClick={() => handleRestart(true)}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '6px', padding: '12px' }}
              >
                <RefreshCw size={17} /> Farklı Yeni Cümlelerle Tekrar Çöz
              </button>

              <button className="btn-secondary" onClick={onClose} style={{ width: '100%', padding: '10px' }}>
                Kapat ve Ana Sayfaya Dön
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
