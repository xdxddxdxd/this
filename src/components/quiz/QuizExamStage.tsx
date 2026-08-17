import React from 'react';
import { Clock, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { DynamicQuizQuestion } from '../../services/quizGeneratorService';
import { HighlightedQuestionText } from '../HighlightedText';
import { formatTime } from '../../hooks/useQuizTimer';

interface QuizExamStageProps {
  currentQ: DynamicQuizQuestion;
  currentIdx: number;
  totalQuestions: number;
  durationMinutes: number;
  remainingSeconds: number;
  userAnswer?: string;
  onAnswer: (optionKey: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;

export const QuizExamStage: React.FC<QuizExamStageProps> = ({
  currentQ,
  currentIdx,
  totalQuestions,
  durationMinutes,
  remainingSeconds,
  userAnswer,
  onAnswer,
  onPrev,
  onNext,
  onFinish
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    {/* Exam Header */}
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-red)' }}>
          Soru {currentIdx + 1}/{totalQuestions}
        </span>
        <span className="rule-badge">
          {currentQ.rule_category || 'Yazım Kuralı'}
        </span>
      </div>

      {durationMinutes > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card-secondary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, color: remainingSeconds < 60 ? 'var(--color-red)' : 'var(--text-primary)' }}>
          <Clock size={15} />
          <span>{formatTime(remainingSeconds)}</span>
        </div>
      )}
    </div>

    {/* Exam Body */}
    <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
      <div style={{ fontSize: '0.96rem', fontWeight: 600, lineHeight: 1.55, marginBottom: '20px' }}>
        <HighlightedQuestionText text={currentQ.question_text} />
      </div>

      {/* Options Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {OPTION_KEYS.map((k) => {
          const optText = (currentQ.options as Record<string, string | undefined>)?.[k];
          if (!optText) return null;
          const isSelected = userAnswer === k;

          return (
            <div
              key={k}
              onClick={() => onAnswer(k)}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-red-light)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-red)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.78rem'
                }}
              >
                {k}
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {optText}
              </span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Exam Footer Navigation */}
    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button className="btn-secondary" disabled={currentIdx === 0} onClick={onPrev}>
        <ArrowLeft size={16} /> Önceki
      </button>

      <button
        type="button"
        onClick={onFinish}
        style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
      >
        Sınavı Bitir
      </button>

      {currentIdx === totalQuestions - 1 ? (
        <button className="btn-primary" onClick={onFinish}>
          <Check size={16} /> Bitir ve Sonuçlar
        </button>
      ) : (
        <button className="btn-primary" onClick={onNext}>
          Sonraki <ArrowRight size={16} />
        </button>
      )}
    </div>
  </div>
);
