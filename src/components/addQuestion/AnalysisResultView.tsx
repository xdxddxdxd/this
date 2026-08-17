import React from 'react';
import { Check, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { enrichOptionsWithPhrases } from '../../services/questionSplitter';
import { HighlightedQuestionText } from '../HighlightedText';

interface AnalysisResultViewProps {
  currentResult: AnalysisResult;
  errorMsg: string | null;
  isSaving: boolean;
  totalCount: number;
  activeResultIndex: number;
  onPrevIndex: () => void;
  onNextIndex: () => void;
  onSaveAll: () => void;
  onSaveCurrentOnly: () => void;
  onRetry: () => void;
}

/** Analiz tamamlanan soru(lar)ın kırmızı kalem düzeltmeli kartı ve kaydetme aksiyonları. */
export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  currentResult,
  errorMsg,
  isSaving,
  totalCount,
  activeResultIndex,
  onPrevIndex,
  onNextIndex,
  onSaveAll,
  onSaveCurrentOnly,
  onRetry
}) => (
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {errorMsg && (
      <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', border: '1px solid var(--color-red-border)', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>{errorMsg}</span>
      </div>
    )}

    {/* Carousel Navigation Header (If multiple questions detected) */}
    {totalCount > 1 && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card-secondary)',
          padding: '8px 12px',
          borderRadius: '10px'
        }}
      >
        <button
          type="button"
          disabled={activeResultIndex === 0}
          onClick={onPrevIndex}
          style={{
            border: 'none',
            background: 'none',
            color: activeResultIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: activeResultIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Önceki
        </button>

        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-red)' }}>
          Soru {activeResultIndex + 1} / {totalCount}
        </span>

        <button
          type="button"
          disabled={activeResultIndex === totalCount - 1}
          onClick={onNextIndex}
          style={{
            border: 'none',
            background: 'none',
            color: activeResultIndex === totalCount - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: activeResultIndex === totalCount - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          Sonraki <ArrowRight size={16} />
        </button>
      </div>
    )}

    {/* Question Card Display */}
    <div
      className="paper-question-container"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px'
      }}
    >
      <div style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '12px' }}>
        <HighlightedQuestionText
          text={currentResult.question_text}
          wrongWord={currentResult.wrong_word}
          correctWord={currentResult.correct_word}
        />
      </div>

      {/* Render Options */}
      {['A', 'B', 'C', 'D', 'E'].map((k) => {
        const enrichedOpts = enrichOptionsWithPhrases(currentResult.question_text, currentResult.options || {});
        const optText = (enrichedOpts as Record<string, string | undefined>)?.[k] || currentResult.options?.[k];
        if (!optText) return null;
        const isWrongOpt = currentResult.wrong_option?.toUpperCase() === k;
        const wrongWord = currentResult.wrong_word;
        const hasWrongWord = wrongWord && optText.includes(wrongWord);
        const wrongIdx = hasWrongWord ? optText.indexOf(wrongWord) : -1;

        return (
          <div
            key={k}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              marginBottom: '6px',
              backgroundColor: isWrongOpt ? 'var(--color-red-light)' : 'transparent',
              border: isWrongOpt ? '1px solid var(--color-red-border)' : '1px solid transparent',
              fontSize: '0.88rem',
              lineHeight: 1.45,
              color: isWrongOpt ? 'var(--color-red)' : 'inherit',
              fontWeight: isWrongOpt ? 600 : 'normal'
            }}
          >
            <strong>{k})</strong>{' '}
            {isWrongOpt && hasWrongWord && wrongIdx !== -1 ? (
              <span>
                {optText.substring(0, wrongIdx)}
                <del className="struck-word">{wrongWord}</del>
                <span className="correction-badge-inline">
                  <span className="caret-arrow">^</span>
                  <span>{currentResult.correct_word}</span>
                </span>
                {optText.substring(wrongIdx + wrongWord.length)}
              </span>
            ) : (
              optText
            )}
          </div>
        );
      })}

      {/* Red Correction Summary Banner */}
      {currentResult.wrong_word ? (
        <div style={{ marginTop: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Kırmızı Kalem Düzeltmesi:</span>
          <del className="struck-word" style={{ fontSize: '0.9rem' }}>{currentResult.wrong_word}</del>
          <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>➔</span>
          <span className="handwritten-correction" style={{ fontSize: '1.25rem' }}>
            ^ {currentResult.correct_word}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Doğru Cevap:</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e' }}>
            {currentResult.wrong_option} şıkkı — bu seçenekte yazım yanlışı yok
          </span>
        </div>
      )}
    </div>

    {/* Rule & Explanation */}
    <div className="rule-explanation-card" style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-serif)' }}>TDK Kuralı</span>
        <span className="rule-badge">{currentResult.rule_category}</span>
      </div>
      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
        {currentResult.explanation}
      </div>
    </div>

    {/* Coach Note */}
    {currentResult.coach_note && (
      <div className="coach-note-card">
        <div className="coach-note-header">KOÇ NOTU</div>
        <div className="coach-note-content">
          <span className="coach-handwriting-icon" aria-hidden="true">!</span>
          <div className="coach-note-text">
            {currentResult.coach_note}
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {totalCount > 1 ? (
        <>
          <button
            className="btn-primary"
            onClick={onSaveAll}
            disabled={isSaving}
            style={{ padding: '12px' }}
          >
            <Check size={18} />
            {isSaving ? 'Tüm Sorular Kaydediliyor...' : `Tümünü Havuzuma Kaydet (${totalCount} Soru)`}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              disabled={activeResultIndex === 0 || isSaving}
              onClick={onPrevIndex}
            >
              <ArrowLeft size={16} /> Önceki Soru
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1 }}
              disabled={activeResultIndex === totalCount - 1 || isSaving}
              onClick={onNextIndex}
            >
              Sonraki Soru <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={onSaveCurrentOnly}
            disabled={isSaving}
          >
            <Check size={18} /> {isSaving ? 'Kaydediliyor...' : 'Onayla ve Kaydet'}
          </button>
          <button
            className="btn-secondary"
            onClick={onRetry}
            disabled={isSaving}
          >
            Tekrar Dene
          </button>
        </div>
      )}
    </div>
  </div>
);
