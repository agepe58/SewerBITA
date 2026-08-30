import { UserProfile, UserRole } from '../types/rbac';

const AUTH_STORAGE_KEY = 'sewerbita_auth_user';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface AuthSession {
  user: UserProfile;
  token: string;
  loginMethod: 'email' | 'google';
}

export const authService = {
  // Get active session from storage
  getCurrentSession: (): UserProfile | null => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse auth session:', e);
      }
    }
    return null;
  },

  // Save session to storage
  saveSession: (user: UserProfile) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  // Clear session
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Login with Email & Password
  loginWithEmail: async (email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (res.ok) {
        const data = await res.json();
        authService.saveSession(data.user);
        return { success: true, user: data.user };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Email atau password salah' };
      }
    } catch {
      // Fallback for offline / demo mode
      if (email.toLowerCase() === 'angga.purbaya@gmail.com') {
        const defaultAdmin: UserProfile = {
          id: 'usr-admin-01',
          name: 'Angga Purbaya',
          email: 'angga.purbaya@gmail.com',
          role: 'Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          department: 'Direksi / System Administrator',
          phone: '+62 812-0000-0000',
          status: 'Active'
        };
        authService.saveSession(defaultAdmin);
        return { success: true, user: defaultAdmin };
      }
      return { success: false, error: 'Gagal terhubung ke server backend API' };
    }
  },

  // Register New User Account
  registerUser: async (
    fullName: string,
    email: string,
    pass: string,
    department: string,
    role: UserRole = 'Technician'
  ): Promise<{ success: boolean; user?: UserProfile; error?: string; pending?: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password: pass, department, role })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          user: data.user,
          pending: true,
          message: data.message || 'Pendaftaran berhasil! Akun Anda membutuhkan persetujuan Admin sebelum login.'
        };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Gagal mendaftarkan akun' };
      }
    } catch {
      // Fallback local registration with Pending Approval
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: fullName,
        email: email,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        department: department || 'Operasional & Pemeliharaan',
        phone: '+62 812-0000-0000',
        status: 'Pending Approval'
      };
      return {
        success: true,
        user: newUser,
        pending: true,
        message: 'Pendaftaran berhasil! Akun Anda membutuhkan persetujuan Administrator sebelum login.'
      };
    }
  },

  // Google OAuth Login Integration
  loginWithGoogle: async (googlePayload: { name: string; email: string; photoUrl: string }): Promise<{ success: boolean; user?: UserProfile; error?: string; pending?: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pending) {
          return {
            success: false,
            pending: true,
            error: data.message || `Akun Google Anda (${googlePayload.email}) membutuhkan persetujuan Administrator.`
          };
        }
        authService.saveSession(data.user);
        return { success: true, user: data.user };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Gagal autentikasi Google' };
      }
    } catch {
      // Fallback Google OAuth login
      const isDefaultAdmin = googlePayload.email.toLowerCase() === 'angga.purbaya@gmail.com';
      if (!isDefaultAdmin) {
        return {
          success: false,
          pending: true,
          error: `Akun Google (${googlePayload.email}) telah terdaftar dan membutuhkan persetujuan Admin sebelum dapat masuk ke sistem.`
        };
      }

      const googleUser: UserProfile = {
        id: 'usr-admin-01',
        name: googlePayload.name,
        email: googlePayload.email,
        role: 'Admin',
        avatar: googlePayload.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googlePayload.name)}`,
        department: 'Direksi / System Administrator',
        phone: '+62 812-0000-0000',
        status: 'Active'
      };
      authService.saveSession(googleUser);
      return { success: true, user: googleUser };
    }
  }
};
