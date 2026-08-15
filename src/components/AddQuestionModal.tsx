import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Camera, Type, Sparkles, Check, ArrowRight, ArrowLeft, Layers, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult, UserError } from '../types';
import { geminiService } from '../services/geminiService';
import { groqService } from '../services/groqService';
import { splitQuestions, enrichOptionsWithPhrases } from '../services/questionSplitter';
import { GET_RANDOM_RULE } from '../data/rulesData';
import { HighlightedQuestionText } from './HighlightedText';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProgressText, setLoadingProgressText] = useState('Soru Analiz Ediliyor...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<AnalysisResult[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [currentRule, setCurrentRule] = useState(GET_RANDOM_RULE());
  const [ruleAnimClass, setRuleAnimClass] = useState<string>('flashcard-slide-idle');
  const [flashcardKey, setFlashcardKey] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelTokenRef = useRef<number>(0);

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
  }, [isOpen, isSaving]);

  // Rotate random TYT rules every 8 seconds during waiting experience with smooth slide-out / slide-in animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setRuleAnimClass('flashcard-slide-out');
        setTimeout(() => {
          setCurrentRule(GET_RANDOM_RULE());
          setFlashcardKey((k) => k + 1);
          setRuleAnimClass('flashcard-slide-in');
          setTimeout(() => {
            setRuleAnimClass('flashcard-slide-idle');
          }, 50);
        }, 320);
      }, 8000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const detectedQuestionsCount = useMemo(() => {
    if (mode !== 'text' || !inputText.trim()) return 0;
    return Math.min(10, splitQuestions(inputText).length);
  }, [mode, inputText]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setImagePreview(compressed);
          } else {
            setImagePreview(event.target?.result as string);
          }
        };
        img.onerror = () => {
          setErrorMsg('Görsel dosyası işlenemedi. Lütfen geçerli bir JPG veya PNG yükleyin.');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelAnalysis = () => {
    cancelTokenRef.current++;
    setIsLoading(false);
    setLoadingProgressText('İptal Edildi');
  };

  const handleStartAnalysis = async () => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'photo' && !imagePreview) return;

    setErrorMsg(null);
    setIsLoading(true);
    setCurrentRule(GET_RANDOM_RULE());
    const token = ++cancelTokenRef.current;

    try {
      let questions: string[] = [];

      if (mode === 'photo' && imagePreview) {
        setLoadingProgressText('Fotoğraftaki soru ve şıklar taranıyor...');
        const ocrText = await geminiService.extractTextFromImage(imagePreview);
        if (cancelTokenRef.current !== token) return;

        if (!ocrText || ocrText.trim().length < 10) {
          setErrorMsg('Fotoğraftaki soru metni net okunamadı. Lütfen fotoğrafın daha net ve aydınlık olduğundan emin olun veya soruyu metin olarak yapıştırın.');
          setIsLoading(false);
          return;
        }
        questions = splitQuestions(ocrText).slice(0, 10);
      } else {
        questions = splitQuestions(inputText).slice(0, 10);
      }

      if (cancelTokenRef.current !== token) return;

      if (questions.length === 0) {
        setErrorMsg('Analiz edilecek geçerli bir soru bulunamadı.');
        setIsLoading(false);
        return;
      }

      if (questions.length === 1) {
        setLoadingProgressText('Soru analiz ediliyor...');
        const res = await groqService.analyzeTextWithLlama(questions[0], existingErrors);
        if (cancelTokenRef.current !== token) return;
        res.options = enrichOptionsWithPhrases(res.question_text, res.options || {});
        setAnalyzedResults([res]);
        setActiveResultIndex(0);
      } else if (questions.length > 1) {
        const batchResults: AnalysisResult[] = [];
        for (let i = 0; i < questions.length; i++) {
          if (cancelTokenRef.current !== token) return;
          setLoadingProgressText(`Soru ${i + 1} / ${questions.length} analiz ediliyor...`);
          const res = await groqService.analyzeTextWithLlama(questions[i], existingErrors);
          if (cancelTokenRef.current !== token) return;
          res.options = enrichOptionsWithPhrases(res.question_text, res.options || {});
          batchResults.push(res);
          if (i + 1 < questions.length) {
            await new Promise(r => setTimeout(r, 350));
          }
        }
        if (cancelTokenRef.current !== token) return;
        setAnalyzedResults(batchResults);
        setActiveResultIndex(0);
      }
    } catch (err: any) {
      if (cancelTokenRef.current === token) {
        console.error('Analysis error:', err);
        setErrorMsg(err?.message || 'Analiz sırasında beklenmeyen bir hata oluştu.');
      }
    } finally {
      if (cancelTokenRef.current === token) {
        setIsLoading(false);
      }
    }
  };

  const handleSaveAll = async () => {
    if (isSaving || analyzedResults.length === 0) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      for (const res of analyzedResults) {
        await onSave(res);
      }
      confetti({
        particleCount: 70,
        spread: 70,
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
        const remaining = analyzedResults.filter((_, idx) => idx !== activeResultIndex);
        setAnalyzedResults(remaining);
        setActiveResultIndex(Math.min(activeResultIndex, remaining.length - 1));
      } else {
        confetti({
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
    cancelTokenRef.current++;
    setInputText('');
    setImagePreview(null);
    setAnalyzedResults([]);
    setActiveResultIndex(0);
    setIsLoading(false);
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
          <div className="waiting-container" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div className="waiting-spinner-ring" />
            <h4 className="waiting-title" style={{ marginTop: '16px', fontSize: '1.05rem', fontWeight: 700 }}>
              {loadingProgressText}
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
              onClick={handleCancelAnalysis}
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
        )}

        {/* 2. INPUT FORM */}
        {!isLoading && analyzedResults.length === 0 && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Error Banner */}
            {errorMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', border: '1px solid var(--color-red-border)', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--bg-card-secondary)', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => setMode('text')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'text' ? 'var(--bg-card)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: mode === 'text' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: mode === 'text' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Type size={17} /> Metin / Soru
              </button>

              <button
                type="button"
                onClick={() => setMode('photo')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: mode === 'photo' ? 'var(--bg-card)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: mode === 'photo' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  boxShadow: mode === 'photo' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <Camera size={17} /> Fotoğraf Çek
              </button>
            </div>

            {mode === 'text' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="question-input-textarea" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Soru Metni ve Şıklar:
                  </label>
                  {detectedQuestionsCount > 1 && (
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-green-light)', color: 'var(--color-green-border)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={13} /> {detectedQuestionsCount} Soru Tespit Edildi
                    </span>
                  )}
                </div>

                <textarea
                  id="question-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Örn: Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?&#10;A) Bu konuda her zaman dikkatliyiz.&#10;B) Toplantı saat 10:00'da..."
                  rows={7}
                  maxLength={5000}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--bg-card-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img
                      src={imagePreview}
                      alt="Soru Önizleme"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', display: 'block', backgroundColor: 'var(--bg-card-secondary)' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--text-primary)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Fotoğrafı Değiştir
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: '12px',
                      padding: '30px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-card-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={24} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Test Kitabının Fotoğrafını Çek
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Doğrudan kamera ile çekebilir veya galeriden seçebilirsiniz.
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={handleStartAnalysis}
              disabled={isLoading || (mode === 'text' ? !inputText.trim() : !imagePreview)}
              style={{
                padding: '12px',
                fontSize: '0.95rem',
                opacity: (mode === 'text' ? !inputText.trim() : !imagePreview) ? 0.6 : 1
              }}
            >
              <Sparkles size={18} />
              {detectedQuestionsCount > 1
                ? `${detectedQuestionsCount} Soruyu Toplu Analiz Et`
                : 'Yapay Zekâ ile Analiz Et'}
            </button>
          </div>
        )}

        {/* 3. MULTI-QUESTION / SINGLE QUESTION RESULTS VIEW */}
        {!isLoading && analyzedResults.length > 0 && currentResult && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', border: '1px solid var(--color-red-border)', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Carousel Navigation Header (If multiple questions detected) */}
            {analyzedResults.length > 1 && (
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
                  onClick={() => setActiveResultIndex((prev) => Math.max(0, prev - 1))}
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
                  Soru {activeResultIndex + 1} / {analyzedResults.length}
                </span>

                <button
                  type="button"
                  disabled={activeResultIndex === analyzedResults.length - 1}
                  onClick={() => setActiveResultIndex((prev) => Math.min(analyzedResults.length - 1, prev + 1))}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: activeResultIndex === analyzedResults.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: activeResultIndex === analyzedResults.length - 1 ? 'not-allowed' : 'pointer',
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
                const optText = (enrichedOpts as any)?.[k] || (currentResult.options as any)?.[k];
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
              <div style={{ marginTop: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Kırmızı Kalem Düzeltmesi:</span>
                <del className="struck-word" style={{ fontSize: '0.9rem' }}>{currentResult.wrong_word}</del>
                <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>➔</span>
                <span className="handwritten-correction" style={{ fontSize: '1.25rem' }}>
                  ^ {currentResult.correct_word}
                </span>
              </div>
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
              {analyzedResults.length > 1 ? (
                <>
                  <button
                    className="btn-primary"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    style={{ padding: '12px' }}
                  >
                    <Check size={18} />
                    {isSaving ? 'Tüm Sorular Kaydediliyor...' : `Tümünü Havuzuma Kaydet (${analyzedResults.length} Soru)`}
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1 }}
                      disabled={activeResultIndex === 0 || isSaving}
                      onClick={() => setActiveResultIndex(prev => Math.max(0, prev - 1))}
                    >
                      <ArrowLeft size={16} /> Önceki Soru
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1 }}
                      disabled={activeResultIndex === analyzedResults.length - 1 || isSaving}
                      onClick={() => setActiveResultIndex(prev => Math.min(analyzedResults.length - 1, prev + 1))}
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
                    onClick={handleSaveCurrentOnly}
                    disabled={isSaving}
                  >
                    <Check size={18} /> {isSaving ? 'Kaydediliyor...' : 'Onayla ve Kaydet'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setAnalyzedResults([])}
                    disabled={isSaving}
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
