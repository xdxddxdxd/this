import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Star, Check, X } from 'lucide-react';
import { UserError } from '../types';

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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleSaveEdit = () => {
    onUpdate(errorItem.id, {
      wrong_word: editedWrongWord,
      correct_word: editedCorrectWord,
      explanation: editedExplanation,
      coach_note: editedCoachNote
    });
    setIsEditing(false);
  };

  const renderOptionContent = (optKey: string, optText: string) => {
    const isWrong = errorItem.wrong_option?.toUpperCase() === optKey.toUpperCase();
    
    if (!isWrong) {
      return <span>{optText}</span>;
    }

    const wrongWord = errorItem.wrong_word;
    const correctWord = errorItem.correct_word;

    const idx = optText.toLowerCase().indexOf(wrongWord.toLowerCase());
    if (idx === -1) {
      return (
        <span className="wrong-choice-container">
          <span className="option-annotation-above">
            {correctWord} <span className="correction-caret">^</span>
          </span>
          <span className="struck-word">{optText}</span>
        </span>
      );
    }

    const before = optText.substring(0, idx);
    const matched = optText.substring(idx, idx + wrongWord.length);
    const after = optText.substring(idx + wrongWord.length);

    return (
      <span>
        {before}
        <span className="wrong-choice-container" style={{ display: 'inline-block', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) rotate(-2deg)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-handwriting)',
              color: 'var(--color-red)',
              fontSize: '1.35rem',
              fontWeight: 700,
              lineHeight: 1
            }}
          >
            {correctWord} <span style={{ display: 'block', fontSize: '0.85rem', textAlign: 'center', lineHeight: 0.6 }}>^</span>
          </span>
          <span className="struck-word" style={{ textDecoration: 'line-through', textDecorationColor: 'var(--color-red)', textDecorationThickness: '2px' }}>
            {matched}
          </span>
        </span>
        {after}
      </span>
    );
  };

  const optionKeys = ['A', 'B', 'C', 'D', 'E'] as const;
  const hasOptions = Object.keys(errorItem.options || {}).length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <button className="back-btn" onClick={onClose} aria-label="Geri Dön">
            <ArrowLeft size={22} />
          </button>
          <span className="detail-date">{formatDate(errorItem.created_at)}</span>
        </div>

        <div className="detail-body">
          <div className="exam-paper-card">
            <div className="card-watermark-quote">“</div>
            <div className="question-stem">{errorItem.question_text}</div>

            {hasOptions ? (
              <div className="options-list" style={{ marginTop: '16px' }}>
                {optionKeys.map((key) => {
                  const text = errorItem.options[key];
                  if (!text) return null;
                  const isWrong = errorItem.wrong_option?.toUpperCase() === key;

                  return (
                    <div
                      key={key}
                      className={`option-row ${isWrong ? 'wrong-option' : ''}`}
                      style={{
                        paddingTop: isWrong ? '18px' : '4px',
                        paddingBottom: '4px'
                      }}
                    >
                      <span className="option-key" style={{ color: isWrong ? 'var(--color-red)' : 'inherit' }}>
                        {key})
                      </span>
                      <div style={{ flex: 1 }}>{renderOptionContent(key, text)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginTop: '14px', paddingTop: '16px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-handwriting)',
                      color: 'var(--color-red)',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      marginBottom: '2px'
                    }}
                  >
                    {errorItem.correct_word} <span className="correction-caret">^</span>
                  </span>
                  <span className="struck-word" style={{ fontSize: '1.1rem' }}>
                    {errorItem.wrong_word}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="rule-explanation-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 className="rule-card-title">Kaydı Düzenle</h4>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Yanlış Kelime:</label>
                <input
                  className="form-input"
                  value={editedWrongWord}
                  onChange={(e) => setEditedWrongWord(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Doğru Yazımı:</label>
                <input
                  className="form-input"
                  value={editedCorrectWord}
                  onChange={(e) => setEditedCorrectWord(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TDK Açıklaması:</label>
                <textarea
                  className="form-textarea"
                  value={editedExplanation}
                  onChange={(e) => setEditedExplanation(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sana Özel Not:</label>
                <textarea
                  className="form-textarea"
                  value={editedCoachNote}
                  onChange={(e) => setEditedCoachNote(e.target.value)}
                  style={{ minHeight: '70px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit}>
                  <Check size={18} /> Kaydet
                </button>
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                  <X size={18} /> İptal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="rule-explanation-card">
                <div className="rule-card-title">Yazım Kuralı</div>
                <div className="rule-badge">{errorItem.rule_category}</div>
                <div className="rule-explanation-text">{errorItem.explanation}</div>
              </div>

              {errorItem.coach_note && (
                <div className="coach-note-card">
                  <div className="coach-note-header">Sana Özel Not</div>
                  <div className="coach-note-content">
                    <Star size={24} className="coach-star-icon" fill="none" strokeWidth={2.2} />
                    <div className="coach-note-text">{errorItem.coach_note}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="detail-bottom-actions">
          <button className="detail-action-btn" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 size={18} />
            <span>Düzenle</span>
          </button>
          <button
            className="detail-action-btn delete-btn"
            onClick={() => {
              if (window.confirm('Bu hata kaydını silmek istediğinden emin misin?')) {
                onDelete(errorItem.id);
                onClose();
              }
            }}
          >
            <Trash2 size={18} />
            <span>Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};