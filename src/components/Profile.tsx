import React from 'react';
import { User as UserIcon, LogOut, ShieldCheck, Database, Award, Users, Moon, Sun } from 'lucide-react';
import { User, UserError } from '../types';

interface ProfileProps {
  user: User;
  errors: UserError[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  errors,
  theme = 'dark',
  onToggleTheme,
  onLogout,
  onOpenAuth
}) => {
  // Category distribution
  const categoryStats = errors.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.rule_category || 'Diğer';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px 20px 80px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserIcon size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700 }}>
            {user.full_name || user.username}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>@{user.username}</p>
        </div>
        <button
          onClick={onOpenAuth}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Users size={15} /> Değiştir
        </button>
      </div>

      {/* Theme Selection Card */}
      <div className="rule-explanation-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
          Görünüm ve Tema
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              border: theme === 'dark' ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: theme === 'dark' ? 'var(--bg-card-secondary)' : 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Moon size={16} style={{ color: theme === 'dark' ? 'var(--color-red)' : 'var(--text-muted)' }} />
            <span>Karanlık Tema</span>
          </button>

          <button
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              border: theme === 'light' ? '2px solid var(--color-red)' : '1px solid var(--color-border)',
              backgroundColor: theme === 'light' ? 'var(--bg-card-secondary)' : 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Sun size={16} style={{ color: theme === 'light' ? 'var(--color-red)' : 'var(--text-muted)' }} />
            <span>Aydınlık Tema</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="stat-counter-card" style={{ padding: '16px' }}>
          <div className="stat-label-top">Kişisel Hata Havuzu</div>
          <div className="stat-number" style={{ fontSize: '2.2rem' }}>{errors.length}</div>
          <div className="stat-label-bottom">kayıtlı kelime</div>
        </div>

        <div className="stat-counter-card" style={{ padding: '16px' }}>
          <div className="stat-label-top">Çalışılan Kural Grubu</div>
          <div className="stat-number" style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
            {Object.keys(categoryStats).length}
          </div>
          <div className="stat-label-bottom">farklı TYT konusu</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rule-explanation-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
          Zayıf Noktalar & Kural Dağılımı
        </h3>
        {Object.keys(categoryStats).length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Henüz yeterli hata verisi toplanmadı.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(categoryStats).map(([cat, count]) => {
              const pct = Math.round((count / errors.length) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} kez ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: pct > 30 ? 'var(--color-red)' : 'var(--text-primary)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* System Status Card */}
      <div className="rule-explanation-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>
          Sistem ve Motor Durumu
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Database size={16} />
            <span>Supabase bulut veri tabanı bağlı</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ShieldCheck size={16} />
            <span>TDK Sözlük & Kural Motoru devrede</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Award size={16} />
            <span>Groq LLaMA 3.3 + Gemini Vision aktif</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: 'var(--color-red)', borderColor: 'var(--color-red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <LogOut size={18} /> Oturumu Kapat
      </button>
    </div>
  );
};
