import React from 'react';
import { User, Moon, Sun, BookOpen, Download, FileText, CheckCircle } from 'lucide-react';
import { UserError } from '../types';

interface ProfileProps {
  errors: UserError[];
  onOpenPdfModal: () => void;
  onOpenAuthModal: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Profile: React.FC<ProfileProps> = ({
  errors,
  onOpenPdfModal,
  theme,
  setTheme
}) => {
  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
          TYT
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>YKS Türkçe Adayı</h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Hedef: 40/40 Türkçe Neti
          </p>
        </div>
      </div>

      {/* Theme Switcher */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700 }}>Uygulama Teması</h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Karanlık veya Aydınlık görünüm</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card-secondary)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setTheme('dark')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'dark' ? 'var(--color-red)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Moon size={14} /> Siyah
          </button>
          <button
            onClick={() => setTheme('light')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: theme === 'light' ? 'var(--bg-card)' : 'transparent',
              color: theme === 'light' ? 'var(--color-red)' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sun size={14} /> Beyaz
          </button>
        </div>
      </div>

      {/* PDF Booklet Export Card */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={20} color="var(--color-red)" />
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>Hata Kitapçığım (PDF / Yazdır)</h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '14px' }}>
          Tüm biriktirdiğin yazım yanlışlarını A4 formatında, TDK kural gerekçeleriyle birlikte PDF olarak indir veya yazdır.
        </p>
        <button
          onClick={onOpenPdfModal}
          className="btn-primary"
          style={{ width: '100%', padding: '11px', justifyContent: 'center' }}
        >
          <Download size={17} /> PDF Kitapçığı Aç ({errors.length} Soru)
        </button>
      </div>
    </div>
  );
};
