import React, { useState } from 'react';
import { X, UserPlus, Users, Sparkles, Check, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Lütfen bir isim veya kullanıcı adı girin.');
      return;
    }
    localStorage.setItem('tdk_user_name', newName.trim());
    const user = {
      id: 'local-user',
      username: newName.trim().toLowerCase().replace(/\s+/g, ''),
      email: `${newName.trim().toLowerCase().replace(/\s+/g, '')}@yks-hedef.com`,
      full_name: newName.trim(),
      avatar_url: '',
      created_at: new Date().toISOString()
    };
    onSuccess(user);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--color-red)" />
            Profil & Kullanıcı
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Öğrenci / Profil Adı:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Örn: Mehmet Ali"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}
          >
            <Check size={18} /> Kaydet ve Devam Et
          </button>
        </form>
      </div>
    </div>
  );
};
