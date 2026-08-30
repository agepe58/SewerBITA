import { ManholeAsset, PumpStationAsset, PipeAsset } from '../types/asset';
import { InspectionRecord } from '../types/inspection';
import { UserProfile } from '../types/rbac';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('sewer.kbi.web.id')) {
    return 'https://api.sewer.kbi.web.id';
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = {
  // Check Health Endpoint
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch All Assets
  getAssets: async (): Promise<{ manholes: ManholeAsset[]; pumpStations: PumpStationAsset[]; pipes: PipeAsset[] } | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using fallback storage:', e);
      return null;
    }
  },

  // Create Asset
  createAsset: async (type: 'manhole' | 'pumpStation' | 'pipe', data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('API createAsset failed:', e);
      return null;
    }
  },

  // Update Asset
  updateAsset: async (id: string, type: 'manhole' | 'pumpStation' | 'pipe', data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('API updateAsset failed:', e);
      return null;
    }
  },

  // Delete Asset
  deleteAsset: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('API deleteAsset failed:', e);
      return null;
    }
  },

  // Inspections
  getInspections: async (): Promise<InspectionRecord[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inspections`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createInspection: async (data: InspectionRecord) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateInspection: async (id: string, data: InspectionRecord) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  deleteInspection: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inspections/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Users
  getUsers: async (): Promise<UserProfile[] | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;
      return data.map((u: any) => ({
        ...u,
        name: u.name || u.fullName || u.full_name || u.email?.split('@')[0] || 'Pengguna',
        avatar: u.avatar || u.avatarUrl || u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || 'user')}`,
        status: u.status ? u.status : 'Pending Approval'
      }));
    } catch {
      return null;
    }
  },

  createUser: async (data: UserProfile) => {
    try {
      const payload = {
        ...data,
        fullName: data.name,
        avatarUrl: data.avatar
      };
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const u = await res.json();
      return {
        ...u,
        name: u.name || u.fullName || u.full_name || 'Pengguna',
        avatar: u.avatar || u.avatarUrl || u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      };
    } catch {
      return null;
    }
  },

  updateUser: async (id: string, data: UserProfile) => {
    try {
      const payload = {
        ...data,
        fullName: data.name,
        avatarUrl: data.avatar
      };
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      const u = await res.json();
      return {
        ...u,
        name: u.name || u.fullName || u.full_name || 'Pengguna',
        avatar: u.avatar || u.avatarUrl || u.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      };
    } catch {
      return null;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};
