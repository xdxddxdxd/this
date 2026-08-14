import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Type, Upload, Sparkles, Check, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult, UserError } from '../types';
import { geminiService } from '../services/geminiService';
import { TYT_RULES, GET_RANDOM_RULE } from '../data/rulesData';

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
  const [analyzedResult, setAnalyzedResult] = useState<AnalysisResult | null>(null);
  const [currentRule, setCurrentRule] = useState(GET_RANDOM_RULE());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
      let result: AnalysisResult;
      if (mode === 'photo' && imagePreview) {
        result = await geminiService.analyzeImage(imagePreview, existingErrors);
      } else {
        result = await geminiService.analyzeQuestion(inputText, existingErrors);
      }
      setAnalyzedResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!analyzedResult) return;
    await onSave(analyzedResult);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D6303F', '#3F7D5C', '#1C1C1E']
    });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setInputText('');
    setImagePreview(null);
    setAnalyzedResult(null);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '18px 20px 14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
            {analyzedResult ? 'Analiz Sonucu' : 'Yeni Soru / Kelime Ekle'}
          </h3>
          <button
            onClick={handleCloseModal}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {isLoading && (
          <div className="waiting-container">
            <div className="waiting-spinner-ring" />
            <h4 className="waiting-title">Soru Analiz Ediliyor...</h4>
            <p className="waiting-subtitle">TDK sözlük kuralları taranıyor ve hatalar çözümleniyor.</p>

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

        {!isLoading && !analyzedResult && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                  Sorunun tam metnini (şıklarla birlikte) veya tek bir kelimeyi yapıştırın:
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Örnek:&#10;Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?&#10;A) Bu konuda herzaman dikkatliyiz.&#10;B) Her şey yolunda..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ minHeight: '140px' }}
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
              <Sparkles size={18} /> Analiz Et ve Doğrula
            </button>
          </div>
        )}

        {!isLoading && analyzedResult && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="exam-paper-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '10px' }}>
                {analyzedResult.question_text}
              </div>

              {Object.keys(analyzedResult.options || {}).map((k) => (
                <div key={k} style={{ fontSize: '0.88rem', margin: '4px 0', color: analyzedResult.wrong_option === k ? 'var(--color-red)' : 'inherit' }}>
                  <strong>{k})</strong> {analyzedResult.options[k]}
                </div>
              ))}

              <div style={{ marginTop: '12px', borderTop: '1px dashed var(--color-border)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tespit Edilen Düzeltme: </span>
                <span className="struck-word" style={{ marginRight: '6px' }}>{analyzedResult.wrong_word}</span>
                <span className="handwritten-correction" style={{ fontSize: '1.35rem' }}>
                  ^ {analyzedResult.correct_word}
                </span>
              </div>
            </div>

            <div className="rule-explanation-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-serif)' }}>Yazım Kuralı</span>
                <span className="rule-badge">{analyzedResult.rule_category}</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {analyzedResult.explanation}
              </div>
            </div>

            {analyzedResult.coach_note && (
              <div className="coach-note-card" style={{ padding: '14px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>
                  Sana Özel Not
                </div>
                <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {analyzedResult.coach_note}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmSave}>
                <Check size={18} /> Onayla ve Kaydet
              </button>
              <button className="btn-secondary" onClick={() => setAnalyzedResult(null)}>
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};