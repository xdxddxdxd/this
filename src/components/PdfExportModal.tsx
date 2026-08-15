import React, { useEffect } from 'react';
import { X, Printer, BookOpen } from 'lucide-react';
import { User, UserError } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  errors: UserError[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  user = { id: 'local-user', email: 'ogrenci@yks-hedef.com', full_name: 'YKS Adayı', created_at: '' },
  errors
}) => {
  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content printable-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '90vh' }}
      >
        {/* Modal Non-Print Header */}
        <div className="no-print" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--color-red)' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Sınav Öncesi Hata Kitapçığı Önizlemesi
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Document Paper */}
        <div className="print-area" style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 130px)' }}>
          {/* Cover / Booklet Header */}
          <div style={{ borderBottom: '2px solid #1C1C1E', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1C1C1E' }}>
                TYT TÜRKÇE YAZIM KURALLARI
              </h1>
              <div style={{ fontSize: '0.85rem', color: '#636366', marginTop: '2px', fontWeight: 600 }}>
                Kişiye Özel Sınav Öncesi Hata Tekrar Kitapçığı
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1C1C1E' }}>{user.full_name}</div>
              <div style={{ fontSize: '0.75rem', color: '#8E8E93' }}>
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Booklet Intro Box */}
          <div style={{ backgroundColor: '#F2F2F7', border: '1px solid #D1D1D6', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.82rem', color: '#3A3A3C', lineHeight: 1.4 }}>
            💡 Bu kitapçık, çalışma sürecinde sistemde en çok hata yaptığın <strong>{errors.length} adet</strong> sorunun analizi ve TDK kural notlarından derlenmiştir. Sınavdan 1 gün önce hızlıca gözden geçirmen önerilir.
          </div>

          {/* Questions Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.map((item, index) => {
              const wrongWord = item.wrong_word;
              const correctWord = item.correct_word;

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #D1D1D6',
                    borderRadius: '10px',
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1C1E',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#D6303F' }}>
                      SORU {index + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', backgroundColor: '#E5E5EA', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {item.rule_category}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.45, marginBottom: '10px' }}>
                    {item.question_text}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    {optionKeys.map((k) => {
                      const optText = (item.options as any)?.[k];
                      if (!optText) return null;
                      const isWrong = item.wrong_option?.toUpperCase() === k;

                      return (
                        <div
                          key={k}
                          style={{
                            fontSize: '0.82rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: isWrong ? '#FFECEE' : 'transparent',
                            color: isWrong ? '#D6303F' : '#3A3A3C',
                            fontWeight: isWrong ? 700 : 'normal'
                          }}
                        >
                          <strong>{k})</strong> {optText}
                        </div>
                      );
                    })}
                  </div>

                  {/* Handwritten Red Pen Correction Box */}
                  <div style={{ backgroundColor: '#FAF9F6', border: '1px dashed #D6303F', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8E8E93', fontWeight: 600 }}>Düzeltme:</span>
                    <del style={{ color: '#D6303F', fontSize: '0.88rem' }}>{wrongWord}</del>
                    <span style={{ color: '#D6303F', fontWeight: 800 }}>➔</span>
                    <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.25rem', color: '#D6303F', fontWeight: 700 }}>
                      ^ {correctWord}
                    </span>
                  </div>

                  {/* TDK Rule Note */}
                  <div style={{ fontSize: '0.8rem', color: '#636366', lineHeight: 1.4, backgroundColor: '#F2F2F7', padding: '8px 10px', borderRadius: '6px' }}>
                    <strong>TDK Kuralı:</strong> {item.explanation}
                  </div>

                  {/* Coach Note */}
                  {item.coach_note && (
                    <div style={{ fontSize: '0.8rem', color: '#1C1C1E', marginTop: '6px', fontStyle: 'italic' }}>
                      ✍️ <strong>Koç Tavsiyesi:</strong> {item.coach_note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Non-Print Actions */}
        <div className="no-print" style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Kapat
          </button>
          <button className="btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={16} /> PDF Olarak Kaydet / Yazdır
          </button>
        </div>
      </div>
    </div>
  );
};
