import React from 'react';
import { Plus, BookOpen, AlertTriangle, Sparkles, Star, ChevronRight } from 'lucide-react';
import { UserError } from '../types';
import { GET_RANDOM_RULE } from '../data/rulesData';

interface DashboardProps {
  errors: UserError[];
  onOpenAddModal: () => void;
  onOpenQuizModal: () => void;
  onSelectError: (error: UserError) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  errors,
  onOpenAddModal,
  onOpenQuizModal,
  onSelectError
}) => {
  const dailyRule = React.useMemo(() => GET_RANDOM_RULE(), []);
  const recentErrors = errors.slice(0, 4);
  const favoriteErrors = errors.filter(e => e.is_favorite);

  return (
    <div className="dashboard-container" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Welcome Banner */}
      <div className="hero-banner" style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-secondary) 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-red)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              TDK & ÖSYM TYT HAZIRLIK
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginTop: '4px', marginBottom: '8px' }}>
              Hatalarından Güç Doğar
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.45 }}>
              Denemelerde yanlış yaptığın kelimeleri biriktir, kişiselleştirilmiş TYT testleriyle pekiştir.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <Plus size={18} /> Soru / Metin Ekle
          </button>
          <button
            onClick={onOpenQuizModal}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <Sparkles size={18} color="var(--color-red)" /> Sınav Oluştur
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-red)' }}>{errors.length}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Kayıtlı Hata</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{favoriteErrors.length}</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Yıldızlılar</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>%100</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TDK Uyum</div>
        </div>
      </div>

      {/* Daily Rule Flashcard */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        padding: '16px',
        borderLeft: '4px solid var(--color-red)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span className="flashcard-badge" style={{ margin: 0 }}>GÜNÜN TDK KURALI</span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{dailyRule.category}</span>
        </div>
        <h4 style={{ fontSize: '0.98rem', fontWeight: 700, fontFamily: 'var(--font-serif)', margin: '4px 0 6px 0' }}>
          {dailyRule.title}
        </h4>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
          {dailyRule.description}
        </p>
        {dailyRule.tip && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            💡 {dailyRule.tip}
          </div>
        )}
      </div>

      {/* Recent Errors Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-serif)' }}>
            Son Eklenen Hatalar
          </h3>
        </div>

        {recentErrors.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              Henüz soru eklemedin. Çözdüğün denemelerden soru ekleyerek havuzunu oluştur!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentErrors.map((err) => (
              <div
                key={err.id}
                onClick={() => onSelectError(err)}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <del className="struck-word" style={{ fontSize: '0.88rem' }}>{err.wrong_word}</del>
                    <span style={{ color: 'var(--color-red)', fontWeight: 700, fontSize: '0.84rem' }}>➔</span>
                    <span className="correction-badge-inline" style={{ fontSize: '0.88rem' }}>^ {err.correct_word}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{err.rule_category}</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
