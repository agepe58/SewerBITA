import { UserProfile, UserRole } from '../types/rbac';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('sewer.kbi.web.id')) {
    return 'https://api.sewer.kbi.web.id';
  }
  return '';
};

const AUTH_STORAGE_KEY = 'sewerbita_auth_user';
const API_BASE_URL = getApiBaseUrl();

export interface AuthSession {
  user: UserProfile;
  token: string;
  loginMethod: 'email' | 'google';
}

// Helper to cache pending user locally so UserManagementView reflects pending registrations immediately
const cachePendingUserLocally = (user: UserProfile) => {
  try {
    const saved = localStorage.getItem('sewerbita_users');
    let usersList: UserProfile[] = saved ? JSON.parse(saved) : [];
    if (!usersList.some(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase())) {
      usersList = [user, ...usersList];
      localStorage.setItem('sewerbita_users', JSON.stringify(usersList));
    }
  } catch (e) {
    console.error('Failed to cache pending user', e);
  }
};

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

  // Clear session alias
  clearSession: (): void => {
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

      const data = await res.json();
      if (res.ok) {
        authService.saveSession(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login gagal' };
      }
    } catch {
      // Local fallback for offline / mock mode
      const savedUsersStr = localStorage.getItem('sewerbita_users');
      const users: UserProfile[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        if (user.status === 'Pending Approval' || user.status === 'Pending') {
          return { success: false, error: 'Akun Anda sedang menunggu persetujuan dari Administrator (Pending Approval). Harap hubungi Admin untuk pengaktifan.' };
        }
        if (user.status === 'Inactive') {
          return { success: false, error: 'Akun Anda dalam status tidak aktif (Inactive). Silakan hubungi Admin.' };
        }
        authService.saveSession(user);
        return { success: true, user };
      }
      return { success: false, error: 'Email atau password tidak terdaftar.' };
    }
  },

  // Alias for loginUser
  loginUser: async (email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    return authService.loginWithEmail(email, pass);
  },

  // Register New User via REST API Backend
  registerUser: async (
    fullName: string,
    email: string,
    pass: string,
    department?: string,
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
        if (data.user) {
          cachePendingUserLocally(data.user);
        }
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
      // Fallback local registration
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
      cachePendingUserLocally(newUser);
      return {
        success: true,
        user: newUser,
        pending: true,
        message: 'Pendaftaran berhasil! Akun Anda telah terdaftar dan membutuhkan persetujuan Administrator.'
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

      const data = await res.json();
      if (res.ok) {
        authService.saveSession(data.user);
        return { success: true, user: data.user };
      } else {
        if (data.user) cachePendingUserLocally(data.user);
        return {
          success: false,
          user: data.user,
          pending: true,
          error: data.error || 'Login Google OAuth gagal. Akun belum disetujui Admin.'
        };
      }
    } catch {
      // Local fallback
      const savedUsersStr = localStorage.getItem('sewerbita_users');
      const users: UserProfile[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
      let user = users.find(u => u.email.toLowerCase() === googlePayload.email.toLowerCase());

      if (!user) {
        // Create new pending user
        user = {
          id: `usr-g-${Date.now()}`,
          name: googlePayload.name,
          email: googlePayload.email,
          role: 'Engineer',
          avatar: googlePayload.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googlePayload.name)}`,
          department: 'Direksi / Internal Team',
          status: 'Pending Approval'
        };
        cachePendingUserLocally(user);
        return {
          success: false,
          pending: true,
          error: `Pendaftaran via Google SSO berhasil! Akun Google Anda (${googlePayload.email}) telah terdaftar dan menunggu persetujuan Administrator.`
        };
      }

      if (user.status === 'Pending Approval' || user.status === 'Pending') {
        return {
          success: false,
          pending: true,
          error: `Akun Google Anda (${googlePayload.email}) sedang menunggu persetujuan Administrator (Pending Approval).`
        };
      }

      if (user.status === 'Inactive') {
        return {
          success: false,
          error: `Akun Google Anda (${googlePayload.email}) dalam status tidak aktif.`
        };
      }

      authService.saveSession(user);
      return { success: true, user };
    }
  }
};
