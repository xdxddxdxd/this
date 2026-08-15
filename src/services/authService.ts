import { UserError } from '../types';

export const authService = {
  getCurrentUser() {
    return {
      id: 'local-user',
      email: 'ogrenci@yks-hedef.com',
      user_metadata: {
        full_name: 'YKS Adayı',
        avatar_url: ''
      }
    };
  },

  async signInWithEmail(email: string) {
    return { success: true, message: 'Giriş başarılı' };
  },

  async signUpWithEmail(email: string, fullName: string) {
    return { success: true, message: 'Kayıt başarılı' };
  },

  async signOut() {
    return { success: true };
  }
};
