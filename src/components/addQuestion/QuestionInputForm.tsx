import React, { useRef } from 'react';
import { Camera, Type, Sparkles, Layers, AlertCircle } from 'lucide-react';
import { compressImage, readFileAsDataUrl } from '../../utils/imageCompression';

interface QuestionInputFormProps {
  mode: 'text' | 'photo';
  onModeChange: (mode: 'text' | 'photo') => void;
  inputText: string;
  onInputChange: (text: string) => void;
  imagePreview: string | null;
  onImageChange: (preview: string | null) => void;
  errorMsg: string | null;
  onError: (message: string | null) => void;
  detectedQuestionsCount: number;
  onAnalyze: () => void;
}

/** Metin/fotoğraf girişi ve analiz başlatma formu. Fotoğraf, OCR'a gönderilmeden önce sıkıştırılır. */
export const QuestionInputForm: React.FC<QuestionInputFormProps> = ({
  mode,
  onModeChange,
  inputText,
  onInputChange,
  imagePreview,
  onImageChange,
  errorMsg,
  onError,
  detectedQuestionsCount,
  onAnalyze
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onError(null);
      const dataUrl = await readFileAsDataUrl(file);
      onImageChange(await compressImage(dataUrl));
    } catch {
      onError('Görsel dosyası işlenemedi. Lütfen geçerli bir JPG veya PNG yükleyin.');
    }
  };

  return (
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
          onClick={() => onModeChange('text')}
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
          onClick={() => onModeChange('photo')}
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
            onChange={(e) => onInputChange(e.target.value)}
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
        onClick={onAnalyze}
        disabled={mode === 'text' ? !inputText.trim() : !imagePreview}
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
  );
};
