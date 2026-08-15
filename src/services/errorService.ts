import { UserError } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'tdk_user_errors_backup';

function scopedKey(userId: string) { return `${LOCAL_STORAGE_KEY}:${userId}`; }

export const errorService = {
  async getErrors(userId: string): Promise<UserError[]> {
    if (!userId) return [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('user_errors').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) {
        localStorage.setItem(scopedKey(userId), JSON.stringify(data));
        return data as UserError[];
      }
    }
    return this.getLocalErrors(userId);
  },

  async saveError(errorItem: Omit<UserError, 'id' | 'created_at'>): Promise<UserError> {
    const fullItem: UserError = { ...errorItem, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const userId = errorItem.user_id;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('user_errors').insert(fullItem).select().single();
      if (!error && data) {
        const local = this.getLocalErrors(userId).filter(x => x.id !== fullItem.id);
        localStorage.setItem(scopedKey(userId), JSON.stringify([data, ...local]));
        return data as UserError;
      }
      throw new Error(error?.message || 'Supabase kayıt işlemi başarısız.');
    }
    const updated = [fullItem, ...this.getLocalErrors(userId)];
    localStorage.setItem(scopedKey(userId), JSON.stringify(updated));
    return fullItem;
  },

  async updateError(id: string, updates: Partial<UserError>, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('user_errors').update(updates).eq('id', id).eq('user_id', userId);
      if (error) throw new Error(error.message);
    }
    const updated = this.getLocalErrors(userId).map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item);
    localStorage.setItem(scopedKey(userId), JSON.stringify(updated));
  },

  async deleteError(id: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('user_errors').delete().eq('id', id).eq('user_id', userId);
      if (error) throw new Error(error.message);
    }
    localStorage.setItem(scopedKey(userId), JSON.stringify(this.getLocalErrors(userId).filter(item => item.id !== id)));
  },

  async deleteMultipleErrors(ids: string[], userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase && ids.length) {
      const { error } = await supabase.from('user_errors').delete().in('id', ids).eq('user_id', userId);
      if (error) throw new Error(error.message);
    }
    localStorage.setItem(scopedKey(userId), JSON.stringify(this.getLocalErrors(userId).filter(item => !ids.includes(item.id))));
  },

  async toggleMultipleFavorites(ids: string[], isFavorite: boolean, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase && ids.length) {
      const { error } = await supabase.from('user_errors').update({ is_favorite: isFavorite }).in('id', ids).eq('user_id', userId);
      if (error) throw new Error(error.message);
    }
    localStorage.setItem(scopedKey(userId), JSON.stringify(this.getLocalErrors(userId).map(x => ids.includes(x.id) ? { ...x, is_favorite: isFavorite } : x)));
  },

  getUserErrors(userId: string) { return this.getErrors(userId); },
  addError(errorItem: Omit<UserError, 'id' | 'created_at'>) { return this.saveError(errorItem); },
  getTopMistakenRule(errors: UserError[]): string {
    if (!errors.length) return 'Büyük Harflerin Yazımı';
    const counts: Record<string, number> = {};
    errors.forEach(e => counts[e.rule_category] = (counts[e.rule_category] || 0) + 1);
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'Büyük Harflerin Yazımı';
  },
  getLocalErrors(userId: string): UserError[] {
    try { const value = localStorage.getItem(scopedKey(userId)); return value ? JSON.parse(value) : []; } catch { return []; }
  }
};
