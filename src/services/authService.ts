import { UserProfile, UserRole } from '../types/rbac';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('api.sewer.kbi.web.id')) {
    return envUrl.trim();
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
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    const existingIndex = usersList.findIndex(
      u => u.id === user.id || (u.email && u.email.trim().toLowerCase() === normalizedEmail)
    );

    const userWithDefaults: UserProfile = {
      ...user,
      email: normalizedEmail,
      status: user.status || 'Pending Approval'
    };

    if (existingIndex >= 0) {
      usersList[existingIndex] = {
        ...usersList[existingIndex],
        ...userWithDefaults
      };
    } else {
      usersList = [userWithDefaults, ...usersList];
    }

    localStorage.setItem('sewerbita_users', JSON.stringify(usersList));

    // Dispatch custom browser event to notify all components/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sewerbita_users_updated', { detail: userWithDefaults }));
    }
  } catch (e) {
    console.error('Failed to cache pending user locally:', e);
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
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check local storage for existing user status
    const savedUsersStr = localStorage.getItem('sewerbita_users');
    const localUsers: UserProfile[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    const localMatchedUser = localUsers.find(u => u.email && u.email.trim().toLowerCase() === normalizedEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: pass })
      });

      const data = await res.json();
      if (res.ok) {
        authService.saveSession(data.user);
        return { success: true, user: data.user };
      } else {
        // If server returns pending approval but admin has already approved locally
        if (localMatchedUser && (localMatchedUser.status === 'Active' || !localMatchedUser.status)) {
          authService.saveSession(localMatchedUser);
          return { success: true, user: localMatchedUser };
        }
        return { success: false, error: data.error || 'Login gagal' };
      }
    } catch {
      // Local fallback for offline / mock mode
      if (localMatchedUser) {
        if (localMatchedUser.status === 'Pending Approval' || localMatchedUser.status === 'Pending') {
          return { success: false, error: 'Akun Anda sedang menunggu persetujuan dari Administrator (Pending Approval). Harap hubungi Admin untuk pengaktifan.' };
        }
        if (localMatchedUser.status === 'Inactive') {
          return { success: false, error: 'Akun Anda dalam status tidak aktif (Inactive). Silakan hubungi Admin.' };
        }
        authService.saveSession(localMatchedUser);
        return { success: true, user: localMatchedUser };
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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: fullName.trim(),
      email: normalizedEmail,
      role: role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
      department: department || 'Operasional & Pemeliharaan',
      phone: '+62 812-0000-0000',
      password: pass,
      status: 'Pending Approval'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: normalizedEmail, password: pass, department, role })
      });

      if (res.ok) {
        const data = await res.json();
        const userToCache = data.user || newUser;
        cachePendingUserLocally(userToCache);
        return {
          success: true,
          user: userToCache,
          pending: true,
          message: data.message || 'Pendaftaran berhasil! Akun Anda membutuhkan persetujuan Admin sebelum login.'
        };
      } else {
        const err = await res.json();
        cachePendingUserLocally(newUser);
        return { success: false, user: newUser, error: err.error || 'Gagal mendaftarkan akun' };
      }
    } catch {
      // Fallback local registration
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
  loginWithGoogle: async (googlePayload: { name: string; email: string; photoUrl: string; credential?: string }): Promise<{ success: boolean; user?: UserProfile; error?: string; pending?: boolean; message?: string }> => {
    const normalizedEmail = (googlePayload.email || '').trim().toLowerCase();
    
    // Check local storage
    const savedUsersStr = localStorage.getItem('sewerbita_users');
    const localUsers: UserProfile[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    let localMatchedUser = localUsers.find(u => u.email && u.email.trim().toLowerCase() === normalizedEmail);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...googlePayload, email: normalizedEmail })
      });

      const data = await res.json();
      if (res.ok) {
        authService.saveSession(data.user);
        cachePendingUserLocally(data.user);
        return { success: true, user: data.user };
      } else {
        const returnedUser = data.user || {
          id: `usr-g-${Date.now()}`,
          name: googlePayload.name,
          email: normalizedEmail,
          role: 'Engineer',
          avatar: googlePayload.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googlePayload.name)}`,
          department: 'Direksi / Internal Team',
          status: 'Pending Approval'
        };

        // If local user was already activated by Admin, allow login!
        if (localMatchedUser && (localMatchedUser.status === 'Active' || !localMatchedUser.status)) {
          authService.saveSession(localMatchedUser);
          return { success: true, user: localMatchedUser };
        }

        cachePendingUserLocally(returnedUser);
        return {
          success: false,
          user: returnedUser,
          pending: true,
          error: data.error || `Akun Google Anda (${normalizedEmail}) sedang menunggu persetujuan dari Administrator (Pending Approval).`
        };
      }
    } catch {
      // Local fallback
      if (!localMatchedUser) {
        const isDefaultAdmin = normalizedEmail === 'angga.purbaya@gmail.com';
        localMatchedUser = {
          id: `usr-g-${Date.now()}`,
          name: googlePayload.name,
          email: normalizedEmail,
          role: isDefaultAdmin ? 'Admin' : 'Engineer',
          avatar: googlePayload.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googlePayload.name)}`,
          department: 'Direksi / Internal Team',
          status: isDefaultAdmin ? 'Active' : 'Pending Approval'
        };
        cachePendingUserLocally(localMatchedUser);

        if (!isDefaultAdmin) {
          return {
            success: false,
            user: localMatchedUser,
            pending: true,
            error: `Pendaftaran via Google SSO berhasil! Akun Google Anda (${normalizedEmail}) telah terdaftar dan menunggu persetujuan Administrator.`
          };
        }
      }

      if (localMatchedUser.status === 'Pending Approval' || localMatchedUser.status === 'Pending') {
        return {
          success: false,
          user: localMatchedUser,
          pending: true,
          error: `Akun Google Anda (${normalizedEmail}) sedang menunggu persetujuan Administrator (Pending Approval).`
        };
      }

      if (localMatchedUser.status === 'Inactive') {
        return {
          success: false,
          user: localMatchedUser,
          error: `Akun Google Anda (${normalizedEmail}) dalam status tidak aktif.`
        };
      }

      authService.saveSession(localMatchedUser);
      return { success: true, user: localMatchedUser };
    }
  }
};
