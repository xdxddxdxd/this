import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles } from 'lucide-react';
import { AnalysisResult, UserError } from '../types';
import { GET_RANDOM_RULE } from '../data/rulesData';
import { splitQuestions } from '../services/questionSplitter';
import { useQuestionAnalysis } from '../hooks/useQuestionAnalysis';
import { useRuleFlashcard } from '../hooks/useRuleFlashcard';
import { fireConfetti } from '../utils/celebrate';
import { AnalysisWaitingView } from './addQuestion/AnalysisWaitingView';
import { QuestionInputForm } from './addQuestion/QuestionInputForm';
import { AnalysisResultView } from './addQuestion/AnalysisResultView';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: AnalysisResult) => Promise<void>;
  existingErrors: UserError[];
  initialMode?: 'text' | 'photo';
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingErrors,
  initialMode = 'text'
}) => {
  const [mode, setMode] = useState<'text' | 'photo'>(initialMode);
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const analysis = useQuestionAnalysis();
  const {
    isLoading,
    loadingProgressText,
    errorMsg,
    setErrorMsg,
    analyzedResults,
    activeResultIndex,
    setActiveResultIndex,
    startAnalysis,
    cancelAnalysis,
    resetResults,
    removeResultAt,
    invalidate
  } = analysis;

  const { currentRule, ruleAnimClass, flashcardKey } = useRuleFlashcard(isLoading);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Esc key listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        handleCloseModal();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isSaving]);

  const detectedQuestionsCount = useMemo(() => {
    if (mode !== 'text' || !inputText.trim()) return 0;
    return Math.min(10, splitQuestions(inputText).length);
  }, [mode, inputText]);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    startAnalysis({ mode, inputText, imagePreview, existingErrors });
  };

  const handleSaveAll = async () => {
    if (isSaving || analyzedResults.length === 0) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      for (const res of analyzedResults) {
        await onSave(res);
      }
      fireConfetti({
        particleCount: 70,
        origin: { y: 0.8 },
        colors: ['#D6303F', '#3F7D5C', '#1C1C1E']
      });
      handleCloseModal();
    } catch (err: any) {
      console.error('Save all error:', err);
      setErrorMsg('Kayıt sırasında bir hata oluştu: ' + (err?.message || 'Lütfen tekrar deneyin.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCurrentOnly = async () => {
    if (isSaving) return;
    const current = analyzedResults[activeResultIndex];
    if (!current) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await onSave(current);

      if (analyzedResults.length > 1) {
        removeResultAt(activeResultIndex);
      } else {
        fireConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#D6303F', '#3F7D5C', '#1C1C1E']
        });
        handleCloseModal();
      }
    } catch (err: any) {
      console.error('Save current error:', err);
      setErrorMsg('Kayıt sırasında bir hata oluştu: ' + (err?.message || 'Lütfen tekrar deneyin.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    invalidate();
    setInputText('');
    setImagePreview(null);
    resetResults();
    setIsSaving(false);
    setErrorMsg(null);
    onClose();
  };

  const currentResult = analyzedResults[activeResultIndex];

  return (
    <div className="modal-overlay" onClick={handleCloseModal} role="dialog" aria-modal="true">
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--color-red)" />
            {analyzedResults.length > 0
              ? `Analiz Sonucu (${activeResultIndex + 1}/${analyzedResults.length})`
              : 'Yeni Soru Analiz Et'}
          </h3>
          <button
            onClick={handleCloseModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            disabled={isSaving}
          >
            <X size={22} />
          </button>
        </div>

        {/* 1. LOADING & WAITING EXPERIENCE */}
        {isLoading && (
          <AnalysisWaitingView
            progressText={loadingProgressText}
            currentRule={currentRule}
            ruleAnimClass={ruleAnimClass}
            flashcardKey={flashcardKey}
            onCancel={cancelAnalysis}
          />
        )}

        {/* 2. INPUT FORM */}
        {!isLoading && analyzedResults.length === 0 && (
          <QuestionInputForm
            mode={mode}
            onModeChange={setMode}
            inputText={inputText}
            onInputChange={setInputText}
            imagePreview={imagePreview}
            onImageChange={setImagePreview}
            errorMsg={errorMsg}
            onError={setErrorMsg}
            detectedQuestionsCount={detectedQuestionsCount}
            onAnalyze={handleStartAnalysis}
          />
        )}

        {/* 3. MULTI-QUESTION / SINGLE QUESTION RESULTS VIEW */}
        {!isLoading && analyzedResults.length > 0 && currentResult && (
          <AnalysisResultView
            currentResult={currentResult}
            errorMsg={errorMsg}
            isSaving={isSaving}
            totalCount={analyzedResults.length}
            activeResultIndex={activeResultIndex}
            onPrevIndex={() => setActiveResultIndex((prev) => Math.max(0, prev - 1))}
            onNextIndex={() => setActiveResultIndex((prev) => Math.min(analyzedResults.length - 1, prev + 1))}
            onSaveAll={handleSaveAll}
            onSaveCurrentOnly={handleSaveCurrentOnly}
            onRetry={resetResults}
          />
        )}
      </div>
    </div>
  );
};
