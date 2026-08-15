import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface OnboardingViewProps { onSuccess: (user: User) => void; theme?: 'dark'|'light'; onToggleTheme?: () => void; }
export const OnboardingView: React.FC<OnboardingViewProps> = ({ onSuccess, theme='dark', onToggleTheme }) => {
  const [register, setRegister] = useState(false), [identifier,setIdentifier]=useState(''), [fullName,setFullName]=useState(''), [password,setPassword]=useState(''), [error,setError]=useState(''), [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(password.length<6){setError('Şifre en az 6 karakter olmalı.');return;}setLoading(true);try{const r=register?await authService.register(identifier,fullName,password):await authService.login(identifier,password);if(r.success&&r.user)onSuccess(r.user);else setError(r.error||'İşlem başarısız.');}catch(e:any){setError(e?.message||'İşlem başarısız.');}finally{setLoading(false);}};
  return <div style={{minHeight:'100vh',maxWidth:520,margin:'0 auto',padding:'28px 18px',display:'flex',flexDirection:'column',justifyContent:'center',gap:20}}>
    <header style={{display:'flex',justifyContent:'space-between'}}><strong>TDK <span className="red-dot"/></strong>{onToggleTheme&&<button onClick={onToggleTheme}>{theme==='dark'?'Aydınlık':'Karanlık'}</button>}</header>
    <section className="exam-paper-card" style={{padding:24}}><h1 style={{marginTop:0}}>Kişisel Türkçe Hata Havuzu</h1><p>Hatalarını güvenli biçimde kaydet, TDK odaklı analiz et ve kişisel tekrar testleri oluştur.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,margin:'18px 0'}}><button onClick={()=>{setRegister(false);setError('')}}><LogIn size={15}/> Giriş Yap</button><button onClick={()=>{setRegister(true);setError('')}}><UserPlus size={15}/> Kayıt Ol</button></div>
      {error&&<div style={{color:'var(--color-red)',marginBottom:12}}>{error}</div>}
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>{register&&<input className="form-input" placeholder="Ad Soyad" value={fullName} onChange={e=>setFullName(e.target.value)} required/>}<input className="form-input" placeholder="E-posta veya kullanıcı adı" value={identifier} onChange={e=>setIdentifier(e.target.value)} required/><input className="form-input" type="password" minLength={6} placeholder="Şifre (en az 6 karakter)" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="btn-primary" disabled={loading}>{loading?'Bekleyin...':register?'Hesap Oluştur':'Giriş Yap'}</button></form>
    </section>
  </div>;
};
