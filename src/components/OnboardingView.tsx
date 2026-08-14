import React, { useState } from 'react';
import { Camera, BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, UserPlus, LogIn, Award, TrendingUp } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface OnboardingViewProps {
  onSuccess: (user: User) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onSuccess }) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
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
    <div style={{ minHeight: '100vh', padding: '24px 16px 60px 16px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ textAlign: 'center', paddingTop: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '30px', background: 'var(--color-red-light)', color: 'var(--color-red)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '14px', border: '1px solid var(--color-red-border)' }}>
          <Sparkles size={15} /> TYT Türkçe Yazım Yanlışı Rehberi
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
          TDK Projesi <span className="red-dot" />
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 auto', maxWidth: '420px' }}>
          Denemelerde sürekli yaptığın yazım yanlışlarını biriktir, TDK kurallarıyla doğrula ve netlerini garantiye al.
        </p>
      </div>

      {/* 2. INTERACTIVE DEMO CARD ("Kırmızı Kalem Düzeltmesi" Mockup Önizlemesi) */}
      <div className="exam-paper-card" style={{ padding: '20px', position: 'relative' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Canlı Örnek Düzeltme</span>
          <span className="rule-badge" style={{ fontSize: '0.7rem' }}>Ayrı Yazılan Kelimeler</span>
        </div>

        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '12px' }}>
          "Bu konuda <span className="struck-word">herzaman</span>{' '}
          <span className="handwritten-correction" style={{ fontSize: '1.35rem' }}>^ her zaman</span> dikkatli olmalıyız."
        </div>

        <div className="coach-note-card" style={{ padding: '10px 14px', margin: 0 }}>
          <div style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            💡 Koç Notu: 'Her' belgisiz sıfatıyla kurulan söz öbekleri istisnalar hariç ayrı yazılır!
          </div>
        </div>
      </div>

      {/* 3. HOW IT WORKS (3 ADIMDA ÇALIŞMA PRENSİBİ) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
          Nasıl Çalışır?
        </h3>

        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '14px', background: '#FFFFFF', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Camera size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              1. Fotoğraf Çek veya Metin Yapıştır
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Gemini 2.5 Flash sorunun fotoğrafını okur ve şıklarıyla birlikte dijitalleştirir.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '14px', background: '#FFFFFF', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-green-light)', color: 'var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              2. TDK & Kural Çözümlemesi
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Groq Llama-3.3-70B hatalı kelimeyi ve resmi TDK kural gerekçesini belirler.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: '14px', background: '#FFFFFF', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'center' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F4F0E8', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              3. Zayıf Noktaları Kapat
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              En çok karıştırdığın kurallar analiz edilir, kişisel koç notlarıyla tekrar pekiştirilir.
            </div>
          </div>
        </div>
      </div>

      {/* 4. AUTHENTICATION SECTION (DIRECT OR TOGGLE) */}
      {!showAuthForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <button
            className="btn-primary"
            style={{ padding: '14px', fontSize: '1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              setIsRegister(false);
              setShowAuthForm(true);
            }}
          >
            <LogIn size={20} /> Giriş Yap / Hesabımı Aç
          </button>

          <button
            className="btn-secondary"
            style={{ padding: '12px', fontSize: '0.92rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              setIsRegister(true);
              setShowAuthForm(true);
            }}
          >
            <UserPlus size={18} /> Yeni Arkadaş Kaydı Oluştur
          </button>
        </div>
      ) : (
        <div className="exam-paper-card" style={{ padding: '24px 20px', marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {isRegister ? 'Yeni Kullanıcı Kaydı' : 'Kullanıcı Girişi'}
            </h3>
            <button
              onClick={() => setShowAuthForm(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Kapat ✕
            </button>
          </div>

          {/* Form Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--bg-card-secondary)', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: !isRegister ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: !isRegister ? 'var(--color-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: !isRegister ? 'var(--shadow-sm)' : 'none'
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
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: isRegister ? '#FFFFFF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: isRegister ? 'var(--color-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: isRegister ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Kayıt Ol
            </button>
          </div>

          {errorMsg && (
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Adın & Soyadın
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Şifre (İsteğe bağlı)
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
              style={{ marginTop: '6px', padding: '12px' }}
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
        </div>
      )}

      {/* 5. FOOTER BADGES */}
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '10px', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={14} color="var(--color-green)" />
        <span>Supabase Bulut Senkronizasyonu & 120+ TYT Kural Havuzu Aktif</span>
      </div>

    </div>
  );
};