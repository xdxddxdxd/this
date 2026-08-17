import React from 'react';
import { TytRule } from '../../types';

interface AnalysisWaitingViewProps {
  progressText: string;
  currentRule: TytRule;
  ruleAnimClass: string;
  flashcardKey: number;
  onCancel: () => void;
}

/** Analiz sürerken gösterilen spinner + dönen TYT kuralı flashcard'ı. */
export const AnalysisWaitingView: React.FC<AnalysisWaitingViewProps> = ({
  progressText,
  currentRule,
  ruleAnimClass,
  flashcardKey,
  onCancel
}) => (
  <div className="waiting-container" style={{ padding: '24px 16px', textAlign: 'center' }}>
    <div className="waiting-spinner-ring" />
    <h4 className="waiting-title" style={{ marginTop: '16px', fontSize: '1.05rem', fontWeight: 700 }}>
      {progressText}
    </h4>
    <p className="waiting-subtitle" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
      TDK sözlük kuralları taranıyor ve soru çözümleniyor.
    </p>

    <div className="waiting-rule-flashcard-wrapper">
      <div key={flashcardKey} className="flashcard-progress-bar" />
      <div className={`waiting-rule-flashcard ${ruleAnimClass}`}>
        <div style={{ marginBottom: '6px' }}>
          <span className="flashcard-badge">{currentRule.category}</span>
        </div>
        <h5 className="flashcard-title">{currentRule.title}</h5>
        <p className="flashcard-body">{currentRule.description}</p>

        {/* Examples preview if available */}
        {currentRule.examples && currentRule.examples.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {currentRule.examples.slice(0, 2).map((ex, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.74rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-card-secondary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <del style={{ color: 'var(--color-red)', marginRight: '6px' }}>{ex.wrong}</del>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>{ex.correct}</span>
              </span>
            ))}
          </div>
        )}

        {currentRule.tip && (
          <p className="flashcard-tip">💡 <strong>İpucu:</strong> {currentRule.tip}</p>
        )}
      </div>
    </div>

    <button
      type="button"
      onClick={onCancel}
      style={{
        marginTop: '18px',
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        padding: '8px 16px',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        cursor: 'pointer'
      }}
    >
      Analizi İptal Et
    </button>
  </div>
);
