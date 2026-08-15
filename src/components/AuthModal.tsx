import React, { useState } from 'react';
import { X, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

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
          onClose();
        } else {
          setErrorMsg(res.error || 'Kayıt sırasında bir hata oluştu.');
        }
      } else {
        const res = await authService.login(username, password || '123456');
        if (res.user) {
          onSuccess(res.user);
          onClose();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
            {isRegister ? 'Yeni Arkadaş Kaydı' : 'Kullanıcı Girişi'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '8px', fontSize: '0.82rem' }}>
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Adın & Soyadın
              </label>
              <input
                className="form-input"
                placeholder="Örn: Doğukan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
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
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
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

          <button type="submit" className="btn-primary" disabled={isLoading} style={{ marginTop: '8px' }}>
            {isLoading ? 'Lütfen bekleyin...' : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? 'Kayıt Ol ve Başla' : 'Giriş Yap'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
            >
              {isRegister ? 'Zaten hesabın var mı? Giriş Yap' : 'Yeni kullanıcı mısın? Buradan Kaydol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
