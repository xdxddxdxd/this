import { supabase } from '../lib/supabase';
import { User } from '../types';

const STORAGE_KEY = 'tdk_current_user';

export const authService = {
  // Get active local session user
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  async login(username: string, passwordHashOrPass: string): Promise<{ user?: User; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (error || !data) {
        // If not found in Supabase yet, create seamless local/cloud fallback
        const newUser: User = {
          id: crypto.randomUUID ? crypto.randomUUID() : 'user-' + Date.now(),
          username: cleanUsername,
          full_name: username.charAt(0).toUpperCase() + username.slice(1),
          created_at: new Date().toISOString()
        };
        
        await supabase.from('users').upsert([
          {
            id: newUser.id,
            username: newUser.username,
            full_name: newUser.full_name,
            password_hash: passwordHashOrPass
          }
        ]);

        this.setCurrentUser(newUser);
        return { user: newUser };
      }

      const user: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        created_at: data.created_at
      };

      this.setCurrentUser(user);
      return { user };
    } catch (err: any) {
      console.warn('Auth fallback:', err);
      const fallbackUser: User = {
        id: 'user-' + cleanUsername,
        username: cleanUsername,
        full_name: username.charAt(0).toUpperCase() + username.slice(1),
        created_at: new Date().toISOString()
      };
      this.setCurrentUser(fallbackUser);
      return { user: fallbackUser };
    }
  },

  async register(username: string, fullName: string, passwordHashOrPass: string): Promise<{ user?: User; error?: string }> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanUsername;
    const newId = crypto.randomUUID ? crypto.randomUUID() : 'user-' + Date.now();

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: newId,
            username: cleanUsername,
            full_name: cleanName,
            password_hash: passwordHashOrPass
          }
        ])
        .select()
        .single();

      if (error) {
        // If user already exists, try logging in
        return this.login(cleanUsername, passwordHashOrPass);
      }

      const user: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        created_at: data.created_at
      };

      this.setCurrentUser(user);
      return { user };
    } catch (err: any) {
      const fallbackUser: User = {
        id: newId,
        username: cleanUsername,
        full_name: cleanName,
        created_at: new Date().toISOString()
      };
      this.setCurrentUser(fallbackUser);
      return { user: fallbackUser };
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};