import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function toAppUser(user: SupabaseUser): User {
  const fullName = typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : user.email?.split('@')[0] || 'Öğrenci';
  return { id: user.id, username: user.email?.split('@')[0], email: user.email, full_name: fullName, created_at: user.created_at };
}

const configurationError = 'Supabase yapılandırması bulunamadı. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini ayarlayın.';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.auth.getUser();
    return error || !data.user ? null : toAppUser(data.user);
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: User | null; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, user: null, error: configurationError };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error || !data.user ? { success: false, user: null, error: error?.message || 'Giriş yapılamadı.' } : { success: true, user: toAppUser(data.user), error: null };
  },

  async register(email: string, fullName: string, password: string): Promise<{ success: boolean; user: User | null; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, user: null, error: configurationError };
    if (password.length < 8) return { success: false, user: null, error: 'Şifre en az 8 karakter olmalıdır.' };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } });
    if (error) return { success: false, user: null, error: error.message };
    return { success: true, user: data.user ? toAppUser(data.user) : null, error: data.session ? null : 'Kayıt tamamlandı. Lütfen e-posta doğrulama bağlantısını açın.' };
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => undefined };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ? toAppUser(session.user) : null));
    return data.subscription;
  }
};
