import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Star, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { UserError } from '../types';
import { HighlightedQuestionText } from './HighlightedText';
import { enrichOptionsWithPhrases } from '../services/questionSplitter';

interface QuestionDetailModalProps {
  errorItem: UserError;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<UserError>) => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  errorItem,
  onClose,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWrongWord, setEditedWrongWord] = useState(errorItem.wrong_word);
  const [editedCorrectWord, setEditedCorrectWord] = useState(errorItem.correct_word);
  const [editedExplanation, setEditedExplanation] = useState(errorItem.explanation);
  const [editedCoachNote, setEditedCoachNote] = useState(errorItem.coach_note || '');
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedWrongWord.trim() || !editedCorrectWord.trim()) {
      setEditError('Hatalı kelime ve doğru kelime alanları boş bırakılamaz.');
      return;
    }

    onUpdate(errorItem.id, {
      wrong_word: editedWrongWord.trim(),
      correct_word: editedCorrectWord.trim(),
      explanation: editedExplanation.trim(),
      coach_note: editedCoachNote.trim() || undefined
    });
    setIsEditing(false);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const renderOptionContent = (key: string, optText: string) => {
    const isWrong = errorItem.wrong_option?.toUpperCase() === key.toUpperCase();
    if (!isWrong) return <span>{optText}</span>;

    const wrongWord = errorItem.wrong_word;
    const correctWord = errorItem.correct_word;

    const idx = optText.toLocaleLowerCase('tr-TR').indexOf(wrongWord.toLocaleLowerCase('tr-TR'));
    if (idx === -1) {
      return (
        <span>
          <del className="struck-word">{wrongWord || optText}</del>
          <span className="correction-badge-inline">
            <span className="caret-arrow">^</span>
            <span>{correctWord}</span>
          </span>
        </span>
      );
    }

    const before = optText.substring(0, idx);
    const matched = optText.substring(idx, idx + wrongWord.length);
    const after = optText.substring(idx + wrongWord.length);

    return (
      <span>
        {before}
        <del className="struck-word">{matched}</del>
        <span className="correction-badge-inline">
          <span className="caret-arrow">^</span>
          <span>{correctWord}</span>
        </span>
        {after}
      </span>
    );
  };

  const enrichedOptions = enrichOptionsWithPhrases(errorItem.question_text || '', errorItem.options || {});
  const optionEntries = Object.entries(enrichedOptions).filter(([_, text]) => Boolean(text));

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <ArrowLeft size={18} /> Geri
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onUpdate(errorItem.id, { is_favorite: !errorItem.is_favorite })}
              style={{ background: 'none', border: 'none', color: errorItem.is_favorite ? 'var(--color-red)' : 'var(--text-muted)', cursor: 'pointer' }}
              title="Yıldızla"
            >
              <Star size={18} fill={errorItem.is_favorite ? 'var(--color-red)' : 'none'} />
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              title="Düzenle"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Bu soruyu silmek istediğine emin misin?')) {
                  onDelete(errorItem.id);
                  onClose();
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Question Text Box */}
          <div className="paper-question-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="rule-badge">{errorItem.rule_category}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(errorItem.created_at)}</span>
            </div>

            <div style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: '16px' }}>
              <HighlightedQuestionText
                text={errorItem.question_text}
                wrongWord={errorItem.wrong_word}
                correctWord={errorItem.correct_word}
              />
            </div>

            {/* Render Question Options */}
            {optionEntries.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {optionEntries.map(([key, text]) => {
                  const isWrong = errorItem.wrong_option?.toUpperCase() === key.toUpperCase();
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: isWrong ? 'var(--color-red-light)' : 'transparent',
                        border: isWrong ? '1px solid var(--color-red-border)' : '1px solid transparent',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        display: 'flex',
                        gap: '8px'
                      }}
                    >
                      <span className="option-key" style={{ color: isWrong ? 'var(--color-red)' : 'inherit' }}>
                        {key})
                      </span>
                      <div style={{ flex: 1 }}>{renderOptionContent(key, text || '')}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginTop: '14px', paddingTop: '12px' }}>
                <del className="struck-word" style={{ fontSize: '1rem' }}>
                  {errorItem.wrong_word}
                </del>
                <span className="correction-badge-inline" style={{ fontSize: '1.25rem' }}>
                  <span className="caret-arrow">^</span>
                  <span>{errorItem.correct_word}</span>
                </span>
              </div>
            )}
          </div>

          {/* Edit Form Mode */}
          {isEditing ? (
            <div className="rule-explanation-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 className="rule-card-title">Kaydı Düzenle</h4>
              {editError && (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Hatalı Kelime:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedWrongWord}
                    onChange={(e) => setEditedWrongWord(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>TDK Doğrusu:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedCorrectWord}
                    onChange={(e) => setEditedCorrectWord(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Açıklama / Kural Gerekçesi:</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={editedExplanation}
                    onChange={(e) => setEditedExplanation(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Koç Notu (İsteğe Bağlı):</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editedCoachNote}
                    onChange={(e) => setEditedCoachNote(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                    <Check size={16} /> Kaydet
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                    Vazgeç
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* TDK Rule & Explanation Card */}
              <div className="rule-explanation-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 className="rule-card-title" style={{ margin: 0 }}>TDK Kural Gerekçesi</h4>
                  <span className="rule-badge">{errorItem.rule_category}</span>
                </div>
                <p className="rule-card-text" style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  {errorItem.explanation}
                </p>
              </div>

              {/* Coach Note */}
              {errorItem.coach_note && (
                <div className="coach-note-card">
                  <div className="coach-note-header">KOÇ NOTU</div>
                  <div className="coach-note-content">
                    <span className="coach-handwriting-icon" aria-hidden="true">!</span>
                    <div className="coach-note-text">
                      {errorItem.coach_note}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
