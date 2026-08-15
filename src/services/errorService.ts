import { UserError } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'tdk_user_errors_backup';

export const errorService = {
  async getErrors(userId: string): Promise<UserError[]> {
    const local = this.getLocalErrors();
    if (!isSupabaseConfigured || !userId || userId === 'local-user') {
      return local;
    }

    try {
      const { data, error } = await supabase
        .from('user_errors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data as UserError[];
      }
      return local;
    } catch (err) {
      console.warn('Supabase fetch failed, using local storage cache:', err);
      return local;
    }
  },

  async saveError(errorItem: Omit<UserError, 'id' | 'created_at'>): Promise<UserError> {
    const newId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const fullItem: UserError = {
      ...errorItem,
      id: newId,
      created_at: createdAt
    };

    const local = this.getLocalErrors();
    const updated = [fullItem, ...local];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && errorItem.user_id && errorItem.user_id !== 'local-user') {
      try {
        await supabase.from('user_errors').insert([fullItem]);
      } catch (err) {
        console.warn('Supabase insert failed, persisted in local cache:', err);
      }
    }

    return fullItem;
  },

  async updateError(id: string, updates: Partial<UserError>, userId?: string): Promise<void> {
    const local = this.getLocalErrors();
    const updated = local.map(item => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && userId && userId !== 'local-user') {
      try {
        await supabase.from('user_errors').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }
  },

  async deleteError(id: string, userId?: string): Promise<void> {
    const local = this.getLocalErrors();
    const updated = local.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && userId && userId !== 'local-user') {
      try {
        await supabase.from('user_errors').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }
  },

  async deleteMultipleErrors(ids: string[], userId?: string): Promise<void> {
    const local = this.getLocalErrors();
    const updated = local.filter(item => !ids.includes(item.id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && userId && userId !== 'local-user') {
      try {
        await supabase.from('user_errors').delete().in('id', ids);
      } catch (err) {
        console.warn('Supabase bulk delete failed:', err);
      }
    }
  },

  async toggleMultipleFavorites(ids: string[], isFavorite: boolean, userId?: string): Promise<void> {
    const local = this.getLocalErrors();
    const updated = local.map(item => ids.includes(item.id) ? { ...item, is_favorite: isFavorite } : item);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && userId && userId !== 'local-user') {
      try {
        await supabase.from('user_errors').update({ is_favorite: isFavorite }).in('id', ids);
      } catch (err) {
        console.warn('Supabase bulk favorite failed:', err);
      }
    }
  },

  async getUserErrors(userId: string): Promise<UserError[]> {
    return this.getErrors(userId);
  },

  async addError(errorItem: Omit<UserError, 'id' | 'created_at'>): Promise<UserError> {
    return this.saveError(errorItem);
  },

  getTopMistakenRule(errors: UserError[]): string {
    if (!errors || errors.length === 0) return 'Büyük Harflerin Yazımı';
    const counts: Record<string, number> = {};
    errors.forEach(e => {
      counts[e.rule_category] = (counts[e.rule_category] || 0) + 1;
    });
    let topRule = 'Büyük Harflerin Yazımı';
    let maxCount = 0;
    Object.entries(counts).forEach(([rule, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRule = rule;
      }
    });
    return topRule;
  },

  getLocalErrors(): UserError[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
};
