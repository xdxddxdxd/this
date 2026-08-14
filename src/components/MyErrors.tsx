import React, { useState, useMemo } from 'react';
import { Search, Bookmark, Plus, Award, Sliders } from 'lucide-react';
import { UserError } from '../types';

interface MyErrorsProps {
  errors: UserError[];
  onSelectError: (error: UserError) => void;
  onOpenAddModal: () => void;
  onOpenQuiz: () => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onDeleteError: (id: string) => void;
}

export const MyErrors: React.FC<MyErrorsProps> = ({
  errors,
  onSelectError,
  onOpenAddModal,
  onOpenQuiz,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    (errors || []).forEach((e) => {
      if (e && e.rule_category) set.add(e.rule_category);
    });
    return ['Tümü', ...Array.from(set)];
  }, [errors]);

  // Filter errors
  const filteredErrors = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLocaleLowerCase('tr-TR');
    return (errors || []).filter((item) => {
      const matchesSearch =
        !cleanSearch ||
        (item.wrong_word && item.wrong_word.toLocaleLowerCase('tr-TR').includes(cleanSearch)) ||
        (item.correct_word && item.correct_word.toLocaleLowerCase('tr-TR').includes(cleanSearch)) ||
        (item.question_text && item.question_text.toLocaleLowerCase('tr-TR').includes(cleanSearch)) ||
        (item.explanation && item.explanation.toLocaleLowerCase('tr-TR').includes(cleanSearch));

      const matchesCategory = selectedCategory === 'Tümü' || item.rule_category === selectedCategory;
      const matchesFav = !onlyFavorites || item.is_favorite;

      return matchesSearch && matchesCategory && matchesFav;
    });
  }, [errors, searchTerm, selectedCategory, onlyFavorites]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ padding: '20px 20px 80px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700 }}>Hatalarım</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Toplam <strong>{errors?.length || 0}</strong> kayıtlı yazım yanlışı
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={onOpenAddModal}
        >
          <Plus size={16} /> Soru Ekle
        </button>
      </div>

      {/* 🎯 "Kişiselleştirilmiş Sınav Oluştur" (Zorluk, Süre, Konu ve Soru Sayısı Ayarlı) */}
      {(errors && errors.length > 0) && (
        <div
          onClick={onOpenQuiz}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
          className="quiz-banner-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Özel Hata Tekrar Sınavı Oluştur
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Zorluk, süre, konu ve soru sayısını sen belirle
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuiz();
            }}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          >
            <Sliders size={14} /> Yapılandır
          </button>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Kelime, kural veya soru ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '20px',
            border: onlyFavorites ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
            background: onlyFavorites ? 'var(--color-red-light)' : 'var(--bg-card)',
            color: onlyFavorites ? 'var(--color-red)' : 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Bookmark size={13} fill={onlyFavorites ? 'var(--color-red)' : 'none'} /> Yıldızlılar
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid var(--color-green-border)' : '1px solid var(--color-border)',
              background: selectedCategory === cat ? 'var(--color-green-light)' : 'var(--bg-card)',
              color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredErrors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            Aradığınız kriterlere uygun yazım hatası bulunamadı.
          </div>
        ) : (
          filteredErrors.map((item) => (
            <div
              key={item.id}
              className="error-paper-card"
              onClick={() => onSelectError(item)}
            >
              <div className="quote-mark">“</div>
              <div className="card-content-left">
                <div className="snippet-text">
                  <div style={{ lineHeight: 1.7 }}>
                    <del className="struck-word">{item.wrong_word}</del>
                    <span className="correction-badge-inline">
                      <span className="caret-arrow">^</span>
                      <span>{item.correct_word}</span>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                      — {item.question_text.slice(0, 45)}...
                    </span>
                  </div>
                </div>
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
    </div>
  );
};
