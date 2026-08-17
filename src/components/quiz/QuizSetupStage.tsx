import React from 'react';
import { X, Play, Sliders } from 'lucide-react';

export type QuizDifficulty = 'kolay' | 'orta' | 'zor';

interface QuizSetupStageProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  difficulty: QuizDifficulty;
  onDifficultyChange: (difficulty: QuizDifficulty) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  categories: string[];
  availableQuestionCounts: number[];
  isGenerating: boolean;
  onStart: () => void;
  onClose: () => void;
}

const difficultyOptions: { key: QuizDifficulty; label: string; desc: string }[] = [
  { key: 'kolay', label: '🟢 Kolay', desc: 'Temel Kurallar' },
  { key: 'orta', label: '🟡 Orta', desc: 'TYT Seviyesi' },
  { key: 'zor', label: '🔴 Zor', desc: 'ÖSYM Çeldirici' }
];

const durationOptions = [
  { mins: 0, label: 'Süresiz' },
  { mins: 5, label: '5 Dakika' },
  { mins: 10, label: '10 Dakika' },
  { mins: 15, label: '15 Dakika' }
];

export const QuizSetupStage: React.FC<QuizSetupStageProps> = ({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  selectedCategory,
  onCategoryChange,
  durationMinutes,
  onDurationChange,
  categories,
  availableQuestionCounts,
  isGenerating,
  onStart,
  onClose
}) => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sliders size={22} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
          Kişisel Sınav Oluşturucu
        </h3>
      </div>

      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
        <X size={20} />
      </button>
    </div>

    {/* 1. Soru Sayısı Seçimi */}
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Soru Sayısı:
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableQuestionCounts.length}, 1fr)`, gap: '8px' }}>
        {availableQuestionCounts.map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onQuestionCountChange(count)}
            style={{
              padding: '9px',
              borderRadius: '10px',
              border: questionCount === count ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: questionCount === count ? 'var(--color-red-light)' : 'var(--bg-card)',
              color: questionCount === count ? 'var(--color-red)' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {count} Soru
          </button>
        ))}
      </div>
    </div>

    {/* 2. Zorluk Derecesi */}
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Zorluk Seviyesi:
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {difficultyOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onDifficultyChange(opt.key)}
            style={{
              padding: '10px 8px',
              borderRadius: '10px',
              border: difficulty === opt.key ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: difficulty === opt.key ? 'var(--color-red-light)' : 'var(--bg-card)',
              color: difficulty === opt.key ? 'var(--color-red)' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{opt.label}</span>
            <span style={{ fontSize: '0.68rem', color: difficulty === opt.key ? 'var(--color-red)' : 'var(--text-muted)' }}>
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* 3. Kategori Seçimi */}
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Kural Kategorisi:
      </label>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: selectedCategory === cat ? 'var(--color-red-light)' : 'var(--bg-card)',
              color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
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

    {/* 4. Sınav Süresi */}
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Sınav Süresi:
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {durationOptions.map((t) => (
          <button
            key={t.mins}
            type="button"
            onClick={() => onDurationChange(t.mins)}
            style={{
              padding: '9px 4px',
              borderRadius: '10px',
              border: durationMinutes === t.mins ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: durationMinutes === t.mins ? 'var(--color-red-light)' : 'var(--bg-card)',
              color: durationMinutes === t.mins ? 'var(--color-red)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>

    {/* Action Button */}
    <button
      className="btn-primary"
      onClick={onStart}
      disabled={isGenerating}
      style={{ padding: '14px', fontSize: '1rem', marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '8px' }}
    >
      <Play size={18} fill="currentColor" />
      {isGenerating ? 'Sınav Hazırlanıyor...' : `Sınavı Başlat (${questionCount} Soru)`}
    </button>
  </div>
);
