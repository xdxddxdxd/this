export const authService = {
  getCurrentUser() {
    const savedName = localStorage.getItem('tdk_user_name') || 'Thisdoukan';
    return {
      id: 'local-user',
      username: savedName.toLowerCase().replace(/\s+/g, ''),
      email: `${savedName.toLowerCase().replace(/\s+/g, '')}@yks-hedef.com`,
      full_name: savedName,
      avatar_url: '',
      created_at: new Date().toISOString(),
      user_metadata: {
        full_name: savedName,
        avatar_url: ''
      }
    };
  },

  async logout() {
    return { success: true };
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
