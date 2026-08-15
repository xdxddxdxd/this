import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps { isOpen: boolean; onClose: () => void; onSuccess: (user?: any) => void; }

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [register, setRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    setLoading(true);
    try {
      const result = register ? await authService.register(identifier, fullName, password) : await authService.login(identifier, password);
      if (!result.success || !result.user) { setError(result.error || 'İşlem başarısız.'); return; }
      onSuccess(result.user); onClose();
    } catch (e: any) { setError(e?.message || 'İşlem başarısız.'); } finally { setLoading(false); }
  };
  return <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, padding: 24 }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}><h3 style={{margin:0}}>{register ? 'Hesap Oluştur' : 'Giriş Yap'}</h3><button onClick={onClose}><X size={20}/></button></div>
      {error && <div style={{padding:10,marginBottom:12,color:'var(--color-red)'}}><AlertCircle size={15}/> {error}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
        <button type="button" onClick={() => setRegister(false)}><LogIn size={15}/> Giriş</button>
        <button type="button" onClick={() => setRegister(true)}><UserPlus size={15}/> Kayıt</button>
      </div>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>
        {register && <input className="form-input" placeholder="Ad Soyad" value={fullName} onChange={e=>setFullName(e.target.value)} required />}
        <input className="form-input" placeholder="E-posta veya kullanıcı adı" value={identifier} onChange={e=>setIdentifier(e.target.value)} required />
        <input className="form-input" type="password" minLength={6} placeholder="Şifre (en az 6 karakter)" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Bekleyin...' : register ? 'Kayıt Ol' : 'Giriş Yap'}</button>
      </form>
    </div>
  </div>;
};
