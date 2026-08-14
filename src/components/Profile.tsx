import React, { useState } from 'react';
import { User as UserIcon, LogOut, ShieldCheck, Database, Award, Users, Moon, Sun, Sliders, Smartphone, Printer, FileText } from 'lucide-react';
import { User, UserError } from '../types';
import { PdfExportModal } from './PdfExportModal';

interface ProfileProps {
  user: User;
  errors: UserError[];
  theme: 'dark' | 'light';
  onSetTheme: (theme: 'dark' | 'light') => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  errors,
  theme,
  onSetTheme,
  onLogout,
  onOpenAuth
}) => {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Category distribution
  const categoryStats = errors.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.rule_category || 'Diğer';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px 20px 80px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 1. Profile Header Card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--bg-card)', padding: '16px 18px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserIcon size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2 }}>
            {user.full_name || user.username}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>@{user.username}</p>
        </div>
        <button
          onClick={onOpenAuth}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Users size={14} /> Değiştir
        </button>
      </div>

      {/* 2. Sınav Öncesi Hata Kitapçığı (PDF / Yazdırma Çıktısı Kartı) */}
      <div
        onClick={() => setIsPdfModalOpen(true)}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease'
        }}
        className="pdf-export-card"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--bg-card-secondary)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Sınav Öncesi Hata Kitapçığım (PDF)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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

      {/* 5. Category Breakdown */}
      <div className="rule-explanation-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px' }}>
          Zayıf Noktalar & Kural Dağılımı
        </h3>
        {Object.keys(categoryStats).length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Henüz yeterli hata verisi toplanmadı.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(categoryStats).map(([cat, count]) => {
              const pct = Math.round((count / errors.length) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} kez ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-card-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
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
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        user={user}
        errors={errors}
      />
    </div>
  );
};
