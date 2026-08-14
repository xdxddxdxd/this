import React from 'react';
import { Bookmark, PenLine, Type, Camera, ChevronRight, Edit } from 'lucide-react';
import { User, UserError } from '../types';
import { errorService } from '../services/errorService';

interface DashboardProps {
  user: User;
  errors: UserError[];
  onOpenAddModal: (mode: 'text' | 'photo') => void;
  onSelectError: (error: UserError) => void;
  onViewAllErrors: () => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  errors,
  onOpenAddModal,
  onSelectError,
  onViewAllErrors,
  onToggleFavorite
}) => {
  const topRule = errorService.getTopMistakenRule(errors);
  const recentErrors = errors.slice(0, 3);
  const totalCount = errors.length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Helper to render the red pen correction preview inside a card
  const renderCardSnippet = (item: UserError) => {
    const wrongWord = item.wrong_word;
    const correctWord = item.correct_word;

    // Pick first option text or fallback to question text
    let targetText = item.question_text;
    if (item.options && item.wrong_option && item.options[item.wrong_option]) {
      targetText = item.options[item.wrong_option]!;
    } else if (item.options && Object.values(item.options).length > 0) {
      targetText = Object.values(item.options)[0] || item.question_text;
    }

    const lowerTarget = targetText.toLocaleLowerCase('tr-TR');
    const lowerWrong = wrongWord.toLocaleLowerCase('tr-TR');
    const idx = lowerTarget.indexOf(lowerWrong);

    if (idx === -1) {
      return (
        <div className="snippet-text">
          <div style={{ lineHeight: 1.7 }}>
            <del className="struck-word">{wrongWord}</del>
            <span className="correction-badge-inline">
              <span className="caret-arrow">^</span>
              <span>{correctWord}</span>
            </span>{' '}
            <span>{targetText}</span>
          </div>
        </div>
      );
    }

    const before = targetText.substring(0, idx);
    const matched = targetText.substring(idx, idx + wrongWord.length);
    const after = targetText.substring(idx + wrongWord.length);

    return (
      <div className="snippet-text">
        <div style={{ lineHeight: 1.7 }}>
          {before}
          <del className="struck-word">{matched}</del>
          <span className="correction-badge-inline">
            <span className="caret-arrow">^</span>
            <span>{correctWord}</span>
          </span>
          {after}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '30px' }}>
      {/* 1. Header (Greeting + Notebook Counter) */}
      <header className="top-header">
        <div>
          <h1 className="greeting-title">
            Merhaba, {user.full_name || 'Öğrenci'} <span className="red-dot" />
          </h1>
          <p className="greeting-subtitle">Bugün biraz daha iyi yazalım.</p>
        </div>

        {/* Notebook Counter Card */}
        <div className="stat-counter-card">
          <div className="stat-label-top">Toplam Kayıtlı Hata</div>
          <div className="stat-number">{totalCount}</div>
          <div className="stat-label-bottom">kelime</div>
        </div>
      </header>

      {/* 2. Central "Soru Ekle" Box */}
      <section className="add-question-box">
        <div className="add-question-header">
          <div className="add-question-info">
            <div className="pencil-icon-badge">
              <PenLine size={20} />
            </div>
            <h2 className="add-question-title">Soru Ekle</h2>
            <p className="add-question-desc">
              Yaz veya fotoğraf çek.<br />Hataları birlikte bulalım.
            </p>
          </div>

          {/* Big Red Hand-Drawn Circle Button */}
          <button
            className="hand-drawn-circle-btn"
            onClick={() => onOpenAddModal('text')}
            aria-label="Yeni Soru Ekle"
          >
            <svg className="hand-drawn-circle-svg" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--color-red)"
                strokeWidth="2.8"
                strokeDasharray="140 10"
                transform="rotate(-15 30 30)"
              />
            </svg>
            <span className="plus-icon" style={{ fontSize: '2rem', lineHeight: 1 }}>+</span>
          </button>
        </div>

        {/* Two Quick Action Buttons */}
        <div className="add-actions-row">
          <button className="action-sub-btn" onClick={() => onOpenAddModal('text')}>
            <div className="btn-icon-wrapper">
              <Type size={18} />
            </div>
            <div>
              <div className="btn-label-title">Metin Yapıştır</div>
              <div className="btn-label-sub">Yapıştır ve analiz et</div>
            </div>
          </button>

          <button className="action-sub-btn" onClick={() => onOpenAddModal('photo')}>
            <div className="btn-icon-wrapper">
              <Camera size={18} />
            </div>
            <div>
              <div className="btn-label-title">Fotoğraf Çek</div>
              <div className="btn-label-sub">Soruyu tara ve yükle</div>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Monthly Highlight Banner */}
      <div className="monthly-highlight">
        <span>📌</span>
        <span>
          Bu ay en çok karıştırdığın kural: <strong>{topRule}</strong>
        </span>
      </div>

      {/* 4. Section: Son Eklenen Hatalar */}
      <section>
        <div className="section-header">
          <h3 className="section-title">Son Eklenen Hatalar</h3>
          <button
            className="section-link"
            style={{ background: 'none', border: 'none' }}
            onClick={onViewAllErrors}
          >
            <span>Tümünü Gör</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Error Cards List */}
        <div className="error-cards-list">
          {recentErrors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              Henüz kaydedilmiş bir yazım hatası yok. Yukarıdaki <strong>Soru Ekle</strong> butonundan ilk sorunu ekleyebilirsin!
            </div>
          ) : (
            recentErrors.map((item) => (
              <div
                key={item.id}
                className="error-paper-card"
                onClick={() => onSelectError(item)}
              >
                <div className="quote-mark">“</div>
                <div className="card-content-left">
                  {renderCardSnippet(item)}
                </div>

                <div className="card-meta-right">
                  <span className="rule-badge">{item.rule_category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="card-date">{formatDate(item.created_at)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id, !item.is_favorite);
                      }}
                      style={{ background: 'none', border: 'none' }}
                      className={`bookmark-icon ${item.is_favorite ? 'active' : ''}`}
                    >
                      <Bookmark size={16} fill={item.is_favorite ? 'var(--color-red)' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recentErrors.length > 0 && (
          <div className="footer-info-note">
            <Edit size={14} />
            <span>En son eklenen {recentErrors.length} hata gösteriliyor.</span>
          </div>
        )}
      </section>
    </div>
  );
};
