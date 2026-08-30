import { ManholeAsset, PumpStationAsset, PipeAsset } from '../types/asset';
import { InspectionRecord } from '../types/inspection';
import { UserProfile } from '../types/rbac';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
      return await res.json();
    } catch {
      return null;
    }
  },

  createUser: async (data: UserProfile) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
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

  updateUser: async (id: string, data: UserProfile) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
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
