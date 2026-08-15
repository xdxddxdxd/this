import React, { useState } from 'react';
import { Camera, BookOpen, UserPlus, LogIn, Target, Moon, Sun, Flame, Check, Sparkles, HelpCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface OnboardingViewProps {
  onSuccess: (user: User) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

const TICKER_WORDS = [
  { wrong: 'herşey', correct: 'her şey' },
  { wrong: 'yanlız', correct: 'yalnız' },
  { wrong: 'orjinal', correct: 'orijinal' },
  { wrong: 'farketti', correct: 'fark etti' },
  { wrong: 'bir çok', correct: 'birçok' },
  { wrong: 'artarda', correct: 'art arda' },
  { wrong: 'dinazor', correct: 'dinozor' },
  { wrong: 'ünvan', correct: 'unvan' },
  { wrong: 'haftaiçi', correct: 'hafta içi' },
  { wrong: 'terketti', correct: 'terk etti' },
  { wrong: 'yanyana', correct: 'yan yana' },
  { wrong: 'şöför', correct: 'şoför' },
  { wrong: 'öğretmen evi', correct: 'öğretmenevi' },
  { wrong: 'kıravat', correct: 'kravat' },
  { wrong: 'kiprik', correct: 'kirpik' }
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onSuccess,
  theme = 'dark',
  onToggleTheme
}) => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        const res = await authService.register(email, fullName, password);
        if (res.user) {
          onSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Kayıt sırasında bir hata oluştu.');
        }
      } else {
        const res = await authService.login(email, password);
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

  const handleOpenAuth = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setShowAuthForm(true);
    setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '18px 16px 60px 16px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 0. TOP BAR (Logo on Left, Theme Toggle & Top-Right Giriş Yap / Kayıt Ol Buttons on Right) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            TDK <span className="red-dot" />
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="theme-toggle-btn"
              style={{ padding: '6px 9px', borderRadius: '18px', border: '1px solid var(--color-border)' }}
              title={theme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}
            >
              {theme === 'dark' ? <Sun size={14} style={{ color: '#FFD166' }} /> : <Moon size={14} />}
            </button>
          )}

          <button
            onClick={() => handleOpenAuth(false)}
            style={{
              padding: '6px 13px',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={13} /> Giriş Yap
          </button>

          <button
            onClick={() => handleOpenAuth(true)}
            style={{
              padding: '6px 13px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: 'var(--color-red)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={13} /> Kayıt Ol
          </button>
        </div>
      </header>

      {/* AUTHENTICATION MODAL POPUP WINDOW */}
      {showAuthForm && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setShowAuthForm(false)}
        >
          <div
            className="exam-paper-card"
            style={{
              padding: '24px 20px',
              maxWidth: '440px',
              width: '100%',
              position: 'relative',
              border: '1.5px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isRegister ? 'Yeni Hesap Oluştur' : 'Giriş Yap'}
              </h3>
              <button
                onClick={() => setShowAuthForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', fontWeight: 700, padding: '4px 8px' }}
                title="Kapat"
              >
                ✕
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
                  background: !isRegister ? 'var(--bg-card)' : 'transparent',
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
                  background: isRegister ? 'var(--bg-card)' : 'transparent',
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
                  E-posta Adresi
                </label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="ornek@eposta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Şifre
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
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
        </div>
      )}

      {/* 1. HERO SECTION */}
      <div style={{ textAlign: 'center', paddingTop: '2px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
          TDK Projesi <span className="red-dot" />
        </h1>

        <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 auto', maxWidth: '440px' }}>
          TYT Türkçe denemelerinde yaptığın yazım yanlışlarını biriktirip kurallarını öğrenmen ve aynı hatayı sınavda tekrar yapmaman için tasarlandı.
        </p>
      </div>

      {/* 2. 🎞️ SIK KARIŞTIRILAN KELİMELER KAYAN ŞERİDİ (LIVE TICKER) */}
      <div className="ticker-section">
        <div className="ticker-header-label">
          <Flame size={14} color="var(--color-red)" />
          <span>Sık Karıştırılan Kelimeler Canlı Akışı</span>
        </div>
        
        <div className="ticker-marquee-wrapper">
          <div className="ticker-track">
            {[...TICKER_WORDS, ...TICKER_WORDS].map((item, idx) => (
              <div key={idx} className="ticker-item">
                <del className="ticker-wrong">{item.wrong}</del>
                <span className="ticker-arrow">➔</span>
                <span className="ticker-correct">{item.correct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 🎯 DETAYLI GERÇEKÇİ CANLI ÖRNEK KARTI (TYT ŞIKLI + TDK GEREKÇESİ + ZENGİN KOÇ NOTU) */}
      <div className="exam-paper-card" style={{ padding: '20px', position: 'relative' }}>
        {/* Header Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sistemde Nasıl Görünür?
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="rule-badge" style={{ fontSize: '0.72rem' }}>Ayrı Yazılan Kelimeler</span>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-card-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, border: '1px solid var(--color-border)' }}>
              TYT Seviyesi
            </span>
          </div>
        </div>

        {/* Soru Kökü */}
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '14px' }}>
          Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?
        </div>

        {/* 5 Seçenekli Canlı Simülasyon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
            <strong>A)</strong> Sanatçı, son romanında geleneksel anlatım kalıplarının dışına çıkmayı başarmış.
          </div>

          <div
            style={{
              fontSize: '0.84rem',
              padding: '8px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid var(--color-red-border)',
              color: 'var(--text-primary)',
              lineHeight: 1.6
            }}
          >
            <strong style={{ color: 'var(--color-red)' }}>B)</strong> Bu konuda{' '}
            <del className="struck-word">herzaman</del>{' '}
            <span className="correction-badge-inline">
              <span className="caret-arrow">^</span>
              <span>her zaman</span>
            </span>{' '}
            dikkatli ve titiz davranmamız gerekir.
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
            <strong>C)</strong> Toplantı salonundaki herkes pürdikkat kesilmiş, konuşmacıyı dinliyordu.
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
            <strong>D)</strong> Günümüz gençleri dijital kaynakları eskisinden çok daha verimli kullanıyor.
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '4px 8px' }}>
            <strong>E)</strong> Sabahın ilk ışıklarıyla birlikte yola çıkıp akşamüzeri hedefe ulaştılar.
          </div>
        </div>

        {/* TDK Kural Gerekçesi */}
        <div className="rule-explanation-card" style={{ padding: '12px 14px', marginBottom: '12px' }}>
          <div className="rule-explanation-header" style={{ fontSize: '0.75rem' }}>
            📖 TDK KURAL GEREKÇESİ
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            "Her" belgisiz sıfatı ile kurulan <em>"her zaman", "her an", "her gün"</em> gibi tamlamalar Türk Dil Kurumu kılavuzuna göre her zaman ayrı yazılır.
          </div>
        </div>

        {/* Detaylı Pedagojik Koç Yorumu & Hafıza Taktiği */}
        <div className="coach-note-card" style={{ padding: '14px 16px', margin: 0 }}>
          <div className="coach-note-header" style={{ fontSize: '0.75rem' }}>KOÇ YORUMU & HAFIZA TAKTİĞİ</div>
          <div className="coach-note-content" style={{ marginTop: '4px' }}>
            <span className="coach-handwriting-icon" aria-hidden="true">!</span>
            <div className="coach-note-text">
              "Bu kuralı son denemelerde 2. kez karıştırdın! Aklında tutman için kolay şifre: <strong>SOMBAHÇEMİ</strong> ve <strong>'herkes, herhangi, herhalde'</strong> hariç, gördüğün tüm <strong>'her'</strong> öbekleri (her şey, her zaman, her an, her gün) daima AYRI yazılır. Sınavda bu tuzağa düşme!"
            </div>
          </div>
        </div>
      </div>

      {/* 4. HOW IT WORKS (3 ADIMDA NETLERİNİ ARTIR) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
          3 Adımda Netlerini Artır
        </h3>

        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'flex-start' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
            <Camera size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              1. Sorunun Fotoğrafını Çek veya Yaz
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
              Denemede karşılaştığın soruyu doğrudan kamerayla çek veya metin olarak yapıştır. Soru kökü ve tüm şıklar anında ayrıştırılır.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'flex-start' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-green-light)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              2. Doğrusunu ve TDK Kuralını Gör
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
              Sözcüğün Türk Dil Kurumu'ndaki güncel yazımı, kural kategorisi ve neden yanlış yazıldığı kırmızı kalem düzeltmesiyle gösterilir.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', alignItems: 'flex-start' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--bg-card-secondary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              3. Zayıf Olduğun Konuları Tekrar Et
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
              En çok hangi kuralda (ayrı/bitişik, de/da, büyük harf vb.) hata yaptığın izlenir ve kişiselleştirilmiş koç uyarılarıyla açıkların kapatılır.
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM QUICK AUTH CTA */}
      {!showAuthForm && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px 0', borderTop: '1px dashed var(--color-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Hemen başlamak için:</span>
          <button
            onClick={() => handleOpenAuth(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Giriş Yap
          </button>
          <span>veya</span>
          <button
            onClick={() => handleOpenAuth(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
          >
            Kayıt Ol
          </button>
        </div>
      )}

    </div>
  );
};
