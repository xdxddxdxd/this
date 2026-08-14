import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Type, Sparkles, Check, ArrowRight, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult, UserError } from '../types';
import { geminiService } from '../services/geminiService';
import { groqService } from '../services/groqService';
import { splitQuestions } from '../services/questionSplitter';
import { GET_RANDOM_RULE } from '../data/rulesData';

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
  const [loadingProgressText, setLoadingProgressText] = useState('Soru Analiz Ediliyor...');
  const [analyzedResults, setAnalyzedResults] = useState<AnalysisResult[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [currentRule, setCurrentRule] = useState(GET_RANDOM_RULE());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Rotate random TYT rules every 4 seconds during waiting experience
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentRule(GET_RANDOM_RULE());
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const detectedQuestionsCount = mode === 'text' && inputText.trim() ? splitQuestions(inputText).length : 0;

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
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'photo' && !imagePreview) return;

    setIsLoading(true);
    setCurrentRule(GET_RANDOM_RULE());

    try {
      if (mode === 'photo' && imagePreview) {
        setLoadingProgressText('Fotoğraftaki soru ve şıklar okunuyor...');
        const singleResult = await geminiService.analyzeImage(imagePreview, existingErrors);
        setAnalyzedResults([singleResult]);
        setActiveResultIndex(0);
      } else {
        // Multi-question batch splitting
        const questions = splitQuestions(inputText);
        if (questions.length === 1) {
          setLoadingProgressText('Soru analiz ediliyor...');
          const res = await groqService.analyzeTextWithLlama(questions[0], existingErrors);
          setAnalyzedResults([res]);
          setActiveResultIndex(0);
        } else {
          // Batch analyze each question sequentially
          const batchResults: AnalysisResult[] = [];
          for (let i = 0; i < questions.length; i++) {
            setLoadingProgressText(`Soru ${i + 1} / ${questions.length} analiz ediliyor...`);
            const res = await groqService.analyzeTextWithLlama(questions[i], existingErrors);
            batchResults.push(res);
          }
          setAnalyzedResults(batchResults);
          setActiveResultIndex(0);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (analyzedResults.length === 0) return;
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
  };

  const handleSaveCurrentOnly = async () => {
    const current = analyzedResults[activeResultIndex];
    if (!current) return;
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
  };

  const handleCloseModal = () => {
    setInputText('');
    setImagePreview(null);
    setAnalyzedResults([]);
    setActiveResultIndex(0);
    setIsLoading(false);
    onClose();
  };

  const currentResult = analyzedResults[activeResultIndex];

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
            {analyzedResults.length > 0
              ? analyzedResults.length > 1
                ? `Analiz Sonuçları (${activeResultIndex + 1}/${analyzedResults.length})`
                : 'Analiz Sonucu'
              : 'Yeni Soru / Kelime Ekle'}
          </h3>
          <button
            onClick={handleCloseModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* 1. LOADING & WAITING EXPERIENCE */}
        {isLoading && (
          <div className="waiting-container">
            <div className="waiting-spinner-ring" />
            <h4 className="waiting-title">{loadingProgressText}</h4>
            <p className="waiting-subtitle">TDK sözlük kuralları taranıyor ve soru çözümleniyor.</p>

            <div className="waiting-rule-flashcard">
              <span className="flashcard-badge">{currentRule.category}</span>
              <h5 className="flashcard-title">{currentRule.title}</h5>
              <p className="flashcard-body">{currentRule.description}</p>
              {currentRule.tip && (
                <p className="flashcard-tip">💡 İpucu: {currentRule.tip}</p>
              )}
            </div>
          </div>
        )}

        {/* 2. INPUT FORM */}
        {!isLoading && analyzedResults.length === 0 && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: mode === 'text' ? '#FFFFFF' : 'transparent',
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
                  background: mode === 'photo' ? '#FFFFFF' : 'transparent',
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
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Soruları yapıştırın (Tek veya çoklu soru desteklenir):
                  </label>
                  {detectedQuestionsCount > 1 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-green)', background: 'var(--color-green-light)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--color-green-border)' }}>
                      <Layers size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                      {detectedQuestionsCount} Soru Algılandı
                    </span>
                  )}
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Örnek:&#10;1. Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?&#10;A) Art arda yaşadığımız sıkıntılar...&#10;B) ...&#10;&#10;2. Aşağıdaki cümlelerin hangisinde..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ minHeight: '160px', fontSize: '0.88rem' }}
                />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img
                      src={imagePreview}
                      alt="Yüklenen Soru"
                      style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--color-border-dashed)',
                      borderRadius: '14px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#FCFBF7'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-red-light)', color: 'var(--color-red)', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      Fotoğraf Çek veya Galeriden Seç
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Soru fotoğrafı net ve okunabilir olmalıdır
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleStartAnalysis}
              disabled={mode === 'text' ? !inputText.trim() : !imagePreview}
              style={{
                opacity: (mode === 'text' ? !inputText.trim() : !imagePreview) ? 0.6 : 1,
                cursor: (mode === 'text' ? !inputText.trim() : !imagePreview) ? 'not-allowed' : 'pointer'
              }}
            >
              <Sparkles size={18} />
              {detectedQuestionsCount > 1 ? `${detectedQuestionsCount} Soruyu Analiz Et` : 'Analiz Et ve Doğrula'}
            </button>
          </div>
        )}

        {/* 3. RESULT PREVIEW & CONFIRMATION */}
        {!isLoading && currentResult && (
          <div style={{ padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Multiple Questions Pagination Tabs */}
            {analyzedResults.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {analyzedResults.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveResultIndex(idx)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: activeResultIndex === idx ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                      background: activeResultIndex === idx ? 'var(--color-red-light)' : '#FFFFFF',
                      color: activeResultIndex === idx ? 'var(--color-red)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Soru {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Question Box */}
            <div className="exam-paper-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
                {currentResult.question_text}
              </div>

              {/* Options */}
              {Object.keys(currentResult.options || {}).map((k) => {
                const isWrongOpt = currentResult.wrong_option === k;
                const optText = (currentResult.options && currentResult.options[k]) || '';
                const wrongWord = currentResult.wrong_word || '';
                const hasWrongWord = wrongWord && optText.toLocaleLowerCase('tr-TR').includes(wrongWord.toLocaleLowerCase('tr-TR'));
                const wrongIdx = hasWrongWord ? optText.toLocaleLowerCase('tr-TR').indexOf(wrongWord.toLocaleLowerCase('tr-TR')) : -1;

                return (
                  <div
                    key={k}
                    style={{
                      fontSize: '0.88rem',
                      margin: '6px 0',
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
              <div className="coach-note-card" style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>
                  Koç Uyarısı
                </div>
                <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.18rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {currentResult.coach_note}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analyzedResults.length > 1 ? (
                <>
                  <button className="btn-primary" onClick={handleSaveAll} style={{ padding: '12px' }}>
                    <Check size={18} /> Tümünü Havuzuma Kaydet ({analyzedResults.length} Soru)
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1 }}
                      disabled={activeResultIndex === 0}
                      onClick={() => setActiveResultIndex(prev => Math.max(0, prev - 1))}
                    >
                      <ArrowLeft size={16} /> Önceki Soru
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1 }}
                      disabled={activeResultIndex === analyzedResults.length - 1}
                      onClick={() => setActiveResultIndex(prev => Math.min(analyzedResults.length - 1, prev + 1))}
                    >
                      Sonraki Soru <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveCurrentOnly}>
                    <Check size={18} /> Onayla ve Kaydet
                  </button>
                  <button className="btn-secondary" onClick={() => setAnalyzedResults([])}>
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