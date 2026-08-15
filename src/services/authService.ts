import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

function normalizeEmail(value: string): string {
  const v = value.trim().toLowerCase();
  return v.includes('@') ? v : `${v.replace(/[^a-z0-9._-]/g, '')}@yks-hedef.com`;
}

function mapUser(user: any): User {
  return {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || '',
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    created_at: user.created_at
  };
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return mapUser(user);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ? mapUser(session.user) : null));
    return data;
  },

  async login(usernameOrEmail: string, password: string) {
    if (!isSupabaseConfigured || !supabase) return { success: false, user: null, error: 'Supabase kimlik doğrulaması yapılandırılmamış.' };
    if (!password || password.length < 6) return { success: false, user: null, error: 'Şifre en az 6 karakter olmalı.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(usernameOrEmail), password });
    return { success: !error && !!data.user, user: data.user ? mapUser(data.user) : null, error: error?.message || null };
  },

  async register(usernameOrEmail: string, fullName: string, password: string) {
    if (!isSupabaseConfigured || !supabase) return { success: false, user: null, error: 'Supabase kimlik doğrulaması yapılandırılmamış.' };
    if (!password || password.length < 6) return { success: false, user: null, error: 'Şifre en az 6 karakter olmalı.' };
    const { data, error } = await supabase.auth.signUp({ email: normalizeEmail(usernameOrEmail), password, options: { data: { full_name: fullName.trim(), username: usernameOrEmail.trim() } } });
    return { success: !error && !!data.user, user: data.user ? mapUser(data.user) : null, error: error?.message || null };
  },

  async logout() {
    if (!supabase) return { success: false, error: 'Supabase yapılandırılmamış.' };
    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message || null };
  },
  signInWithEmail: async (email: string, password: string) => authService.login(email, password),
  signUpWithEmail: async (email: string, fullName: string, password: string) => authService.register(email, fullName, password),
  signOut: async () => authService.logout()
};
