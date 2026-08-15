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

  async login(usernameOrEmail: string, _password?: string): Promise<{ success: boolean; user: any; error: string | null }> {
    return {
      success: true,
      user: {
        id: 'local-user',
        username: usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@yks-hedef.com`,
        full_name: usernameOrEmail,
        created_at: new Date().toISOString()
      },
      error: null
    };
  },

  async register(usernameOrEmail: string, fullName?: string, _password?: string): Promise<{ success: boolean; user: any; error: string | null }> {
    return {
      success: true,
      user: {
        id: 'local-user',
        username: usernameOrEmail,
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@yks-hedef.com`,
        full_name: fullName || usernameOrEmail,
        created_at: new Date().toISOString()
      },
      error: null
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
