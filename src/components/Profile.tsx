import React, { lazy, Suspense } from 'react';
import {
  Printer,
  Sliders,
  Moon,
  Sun,
  Smartphone,
  LogOut,
  Database,
  ShieldCheck,
  Award
} from 'lucide-react';
import { User, UserError } from '../types';
// Recharts yalnızca profil sekmesi açıldığında yüklenir.
const AnalyticsPanel = lazy(() => import('./AnalyticsPanel').then((module) => ({ default: module.AnalyticsPanel })));
const PdfExportModal = lazy(() => import('./PdfExportModal').then((module) => ({ default: module.PdfExportModal })));

interface ProfileProps {
  user: User;
  errors: UserError[];
  theme: 'dark' | 'light';
  onSetTheme: (theme: 'dark' | 'light') => void;
  onLogout: () => void | Promise<void>;
  onOpenAuth: () => void | Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  errors,
  theme,
  onSetTheme,
  onLogout,
  onOpenAuth
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);

  // Calculate statistics
  const categoryStats = React.useMemo(() => {
    const map: Record<string, number> = {};
    errors.forEach((e) => {
      if (e.rule_category) {
        map[e.rule_category] = (map[e.rule_category] || 0) + 1;
      }
    });
    return map;
  }, [errors]);

  return (
    <div style={{ padding: '20px 20px 80px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header with User Info */}
      <div className="profile-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="profile-avatar">
            <span style={{ fontSize: '1.25rem' }}>👤</span>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
              {user.full_name || 'Thisdoukan'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              @{user.username || 'thisdoukan'}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          👥 Değiştir
        </button>
      </div>

      {/* 2. Sınav Öncesi Hata Kitapçığım (PDF) */}
      <div
        onClick={() => setIsPdfModalOpen(true)}
        className="rule-explanation-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: '1.5px solid var(--color-border)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            📄
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Sınav Öncesi Hata Kitapçığım (PDF)
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Tüm soruları açıklamalı A4 formatında yazdır / kaydet
            </div>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}
        >
          <Printer size={14} /> Kitapçığı Aç
        </button>
      </div>

      {/* 3. Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="stat-counter-card" style={{ padding: '12px 14px' }}>
          <div className="stat-label-top">Kişisel Hata Havuzu</div>
          <div className="stat-number" style={{ fontSize: '1.85rem' }}>{errors.length}</div>
          <div className="stat-label-bottom">kayıtlı kelime</div>
        </div>

        <div className="stat-counter-card" style={{ padding: '12px 14px' }}>
          <div className="stat-label-top">Çalışılan Kural Grubu</div>
          <div className="stat-number" style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
            {Object.keys(categoryStats).length}
          </div>
          <div className="stat-label-bottom">farklı TYT konusu</div>
        </div>
      </div>

      {/* 4. Settings & Appearance (Kompakt Ayarlar Sekmesi) */}
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Sliders size={16} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
            Ayarlar ve Tercihler
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Theme Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-card-secondary)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {theme === 'dark' ? <Moon size={17} style={{ color: 'var(--color-red)' }} /> : <Sun size={17} style={{ color: 'var(--color-red)' }} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Tema Görünümü</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {theme === 'dark' ? 'Siyah (Karanlık Mod)' : 'Beyaz (Aydınlık Mod)'}
                </div>
              </div>
            </div>

            {/* Compact Switcher */}
            <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: '2px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => onSetTheme('dark')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: theme === 'dark' ? 'var(--color-red)' : 'transparent',
                  color: theme === 'dark' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Moon size={12} /> Siyah
              </button>
              <button
                type="button"
                onClick={() => onSetTheme('light')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: theme === 'light' ? 'var(--color-red)' : 'transparent',
                  color: theme === 'light' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sun size={12} /> Beyaz
              </button>
            </div>
          </div>

          {/* System Device Sync Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 4px' }}>
            <Smartphone size={14} />
            <span>Cihaz temasıyla otomatik senkronize çalışır</span>
          </div>
        </div>
      </div>

      {/* 5. Gelişim Panosu: kategori dağılımı + haftalık trend */}
      <Suspense fallback={<div className="rule-explanation-card" style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Gelişim panosu yükleniyor...</div>}>
        <AnalyticsPanel errors={errors} theme={theme} />
      </Suspense>

      {/* 6. System Status Card */}
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, marginBottom: '10px' }}>
          Sistem ve Motor Durumu
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Database size={15} />
            <span>Supabase bulut veri tabanı devrede</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ShieldCheck size={15} />
            <span>TDK Sözlük & Kural Motoru aktif</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Award size={15} />
            <span>Groq LLaMA 3.3 + Gemini Vision bağlı</span>
          </div>
        </div>
      </div>

      {/* 7. Logout Action */}
      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ color: 'var(--color-red)', borderColor: 'var(--color-red-border)', padding: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <LogOut size={16} /> Oturumu Kapat
      </button>

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <Suspense fallback={null}>
          <PdfExportModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} user={user} errors={errors} />
        </Suspense>
      )}
    </div>
  );
};
