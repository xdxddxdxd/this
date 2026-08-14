import React, { useState } from 'react';
import { LogIn, UserPlus, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface LoginViewProps {
  onSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Lütfen bir kullanıcı adı girin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        const res = await authService.register(username, fullName, password || '123456');
        if (res.user) {
          onSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Kayıt sırasında bir hata oluştu.');
        }
      } else {
        const res = await authService.login(username, password || '123456');
        if (res.user) {
          onSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Giriş yapılamadı.');
        }
      }
    } catch (err: any) {
      setErrorMsg('İşlem başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="login-card-container" style={{ width: '100%', maxWidth: '400px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-red-light)', color: 'var(--color-red)', marginBottom: '12px' }}>
            <BookOpen size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            TDK Projesi <span className="red-dot" />
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            TYT Türkçe Yazım Yanlışları Takip & Analiz Sistemi
          </p>
        </div>

        {/* Auth Card */}
        <div className="exam-paper-card" style={{ padding: '28px 24px' }}>
          {/* Tab Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--bg-card-secondary)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              style={{
                padding: '9px',
                borderRadius: '10px',
                border: 'none',
                background: !isRegister ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: !isRegister ? 'var(--color-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Giriş Yap
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
              }}
              style={{
                padding: '9px',
                borderRadius: '10px',
                border: 'none',
                background: isRegister ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: isRegister ? 'var(--color-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: isRegister ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Kayıt Ol
            </button>
          </div>

          {errorMsg && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px', border: '1px solid rgba(214,48,63,0.2)' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Adınız & Soyadınız
                </label>
                <input
                  className="form-input"
                  placeholder="Örn: Doğukan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isRegister}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Kullanıcı Adı
              </label>
              <input
                className="form-input"
                placeholder="Örn: dogukan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Şifre
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ marginTop: '8px', padding: '12px', fontSize: '0.95rem' }}
            >
              {isLoading ? (
                'İşleniyor...'
              ) : isRegister ? (
                <>
                  <UserPlus size={18} /> Kaydol ve Başla
                </>
              ) : (
                <>
                  <LogIn size={18} /> Hesabıma Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Teacher pen footer note */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: 'var(--color-red)', margin: 0 }}>
              "Hata yapmaktan korkma, tekrar etmekten sakın!"
            </p>
          </div>
        </div>

        {/* Cloud sync indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          <ShieldCheck size={14} color="var(--color-green)" />
          <span>Supabase Bulut Veritabanı & TDK Motoru Aktif</span>
        </div>
      </div>
    </div>
  );
};