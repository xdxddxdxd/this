import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Sparkles, Star, CheckSquare, Square, Trash2, CheckCircle2 } from 'lucide-react';
import { UserError } from '../types';
import { CANONICAL_TYT_CATEGORIES } from '../services/groqService';

interface MyErrorsProps {
  errors: UserError[];
  onOpenAddModal: () => void;
  onOpenQuizModal: () => void;
  onSelectError: (error: UserError) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onToggleMultipleFavorites?: (ids: string[], isFav: boolean) => void;
}

export const MyErrors: React.FC<MyErrorsProps> = ({
  errors,
  onOpenAddModal,
  onOpenQuizModal,
  onSelectError,
  onDeleteMultiple,
  onToggleMultipleFavorites
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Bulk Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredErrors = useMemo(() => {
    return errors.filter((err) => {
      const matchSearch =
        err.wrong_word.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
        err.correct_word.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
        (err.question_text || '').toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'));

      const matchCategory =
        selectedCategory === 'Tümü' || err.rule_category === selectedCategory;

      const matchFav = !onlyFavorites || err.is_favorite;

      return matchSearch && matchCategory && matchFav;
    });
  }, [errors, searchTerm, selectedCategory, onlyFavorites]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredErrors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredErrors.map((e) => e.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Seçilen ${selectedIds.length} soruyu silmek istediğinize emin misiniz?`)) {
      onDeleteMultiple?.(selectedIds);
      setSelectedIds([]);
      setIsSelectionMode(false);
    }
  };

  const handleBulkFavorite = (isFav: boolean) => {
    if (selectedIds.length === 0) return;
    onToggleMultipleFavorites?.(selectedIds, isFav);
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-serif)', margin: 0 }}>
            Hata Havuzum ({errors.length})
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Denemelerde kaçırdığın tüm yazım kuralları
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds([]);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: isSelectionMode ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: isSelectionMode ? 'var(--color-red-light)' : 'var(--bg-card)',
              color: isSelectionMode ? 'var(--color-red)' : 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckSquare size={16} /> {isSelectionMode ? 'İptal' : 'Toplu İşlem'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Soru veya hatalı kelime ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['Tümü', ...CANONICAL_TYT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: selectedCategory === cat ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                backgroundColor: selectedCategory === cat ? 'var(--color-red)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Mode Action Bar */}
      {isSelectionMode && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card-secondary)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <button
            onClick={handleSelectAll}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {selectedIds.length === filteredErrors.length ? <CheckSquare size={16} color="var(--color-red)" /> : <Square size={16} />}
            Tümünü Seç ({selectedIds.length}/{filteredErrors.length})
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => handleBulkFavorite(true)}
              disabled={selectedIds.length === 0}
              style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              ★ Yıldızla
            </button>
            <button
              onClick={() => handleBulkFavorite(false)}
              disabled={selectedIds.length === 0}
              style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Yıldızı Kaldır
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '0.78rem', fontWeight: 700, cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Sil ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Error Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredErrors.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--color-border)', borderRadius: '14px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Arama kriterlerine uygun soru bulunamadı.
            </p>
          </div>
        ) : (
          filteredErrors.map((err) => {
            const isSelected = selectedIds.includes(err.id);
            return (
              <div
                key={err.id}
                onClick={() => isSelectionMode ? handleToggleSelect(err.id, { stopPropagation: () => {} } as any) : onSelectError(err)}
                style={{
                  padding: '14px',
                  backgroundColor: isSelected ? 'var(--color-red-light)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                {isSelectionMode && (
                  <div onClick={(e) => handleToggleSelect(err.id, e)}>
                    {isSelected ? <CheckSquare size={20} color="var(--color-red)" /> : <Square size={20} color="var(--text-muted)" />}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <del className="struck-word">{err.wrong_word}</del>
                      <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>➔</span>
                      <span className="correction-badge-inline">^ {err.correct_word}</span>
                    </div>
                    {err.is_favorite && <Star size={16} fill="var(--color-red)" color="var(--color-red)" />}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="rule-badge">{err.rule_category}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {new Date(err.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
