import React from 'react';
import { X, Printer, Download, BookOpen, Check } from 'lucide-react';
import { User, UserError } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  errors: UserError[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  user,
  errors
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;

  return (
    <div className="modal-overlay" onClick={onClose}>
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

        {/* Modal Non-Print Action Bar */}
        <div className="no-print" style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Toplam <strong>{errors.length} soru</strong> yazdırılabilir A4 formatında hazırlandı.
          </div>
          <button className="btn-primary" onClick={handlePrint} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Printer size={16} /> Yazdır / PDF İndir
          </button>
        </div>

        {/* Printable Document Area */}
        <div className="printable-booklet-body" style={{ padding: '24px', overflowY: 'auto' }}>
          
          {/* Booklet Header */}
          <div className="booklet-cover-header" style={{ textAlign: 'center', paddingBottom: '18px', marginBottom: '20px', borderBottom: '2px solid var(--text-primary)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-red)', marginBottom: '4px' }}>
              ÖSYM & TDK HAZIRLIK REHBERİ
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              KİŞİSEL TYT TÜRKÇE YAZIM KURALLARI HATA KİTAPÇIĞI
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <span><strong>Öğrenci:</strong> {user.full_name || user.username} (@{user.username})</span>
              <span>•</span>
              <span><strong>Toplam Soru:</strong> {errors.length} Soru</span>
              <span>•</span>
              <span><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {/* List of Full Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.map((item, index) => {
              const hasOptions = item.options && Object.keys(item.options).length > 0;
              const wrongWord = item.wrong_word || '';
              const correctWord = item.correct_word || '';

              return (
                <div
                  key={item.id}
                  className="booklet-question-item"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Question Stem */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {index + 1}.
                    </span>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {item.question_text}
                    </div>
                  </div>

                  {/* Options */}
                  {hasOptions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '16px', marginBottom: '12px' }}>
                      {optionKeys.map((k) => {
                        const optText = item.options[k];
                        if (!optText) return null;
                        const isWrongOpt = item.wrong_option?.toUpperCase() === k;

                        const lowerOpt = optText.toLocaleLowerCase('tr-TR');
                        const lowerWrong = wrongWord.toLocaleLowerCase('tr-TR');
                        const idx = lowerOpt.indexOf(lowerWrong);

                        return (
                          <div
                            key={k}
                            style={{
                              fontSize: '0.9rem',
                              lineHeight: 1.6,
                              color: 'var(--text-primary)',
                              fontWeight: isWrongOpt ? 600 : 'normal'
                            }}
                          >
                            <strong>{k})</strong>{' '}
                            {isWrongOpt && idx !== -1 ? (
                              <span>
                                {optText.substring(0, idx)}
                                <del className="struck-word">{optText.substring(idx, idx + wrongWord.length)}</del>
                                <span className="correction-badge-inline">
                                  <span className="caret-arrow">^</span>
                                  <span>{correctWord}</span>
                                </span>
                                {optText.substring(idx + wrongWord.length)}
                              </span>
                            ) : isWrongOpt ? (
                              <span>
                                <del className="struck-word">{wrongWord}</del>
                                <span className="correction-badge-inline">
                                  <span className="caret-arrow">^</span>
                                  <span>{correctWord}</span>
                                </span>{' '}
                                {optText}
                              </span>
                            ) : (
                              optText
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Solution & TDK Rule Explanation Box */}
                  <div
                    style={{
                      borderTop: '1px dashed var(--color-border)',
                      paddingTop: '10px',
                      marginTop: '10px',
                      backgroundColor: 'var(--bg-card-secondary)',
                      borderRadius: '8px',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-red)' }}>
                        ✓ Cevap ve TDK Gerekçesi ({item.wrong_option || 'Hata'} Seçeneği)
                      </span>
                      <span className="rule-badge" style={{ fontSize: '0.7rem' }}>{item.rule_category}</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 6px 0' }}>
                      {item.explanation}
                    </p>

                    {item.coach_note && (
                      <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.08rem', color: 'var(--text-primary)', borderTop: '1px dotted var(--color-border)', paddingTop: '4px' }}>
                        💡 Koç Notu: {item.coach_note}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Booklet Footer */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            TDK Projesi • Kişisel Sınav Hazırlık Bülteni
          </div>
        </div>

      </div>
    </div>
  );
};
