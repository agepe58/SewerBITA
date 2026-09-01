import { ManholeAsset, PumpStationAsset, PipeAsset, WtpAsset, WaterAccessoryAsset } from '../types/asset';
import { InspectionRecord } from '../types/inspection';
import { UserProfile } from '../types/rbac';
import { authService } from './authService';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() && !envUrl.includes('api.sewer.kbi.web.id')) {
    return envUrl.trim();
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

const getAuthHeaders = (): Record<string, string> => {
  const session = authService.getCurrentSession();
  const role = session?.role || 'Technician';
  return {
    'Content-Type': 'application/json',
    'x-user-role': role
  };
};

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
  getAssets: async (): Promise<{ manholes: ManholeAsset[]; pumpStations: PumpStationAsset[]; pipes: PipeAsset[]; wtps: WtpAsset[]; waterAccessories: WaterAccessoryAsset[] } | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`);
      if (!res.ok) return null;
      const raw = await res.json();
      if (!raw) return null;

      const manholes: ManholeAsset[] = (raw.manholes || []).map((m: any) => {
        const lat = Number(m.coordinates?.lat ?? m.latitude ?? -6.444);
        const lng = Number(m.coordinates?.lng ?? m.longitude ?? 107.452);
        return {
          ...m,
          type: 'manhole' as const,
          coordinates: { lat, lng },
          latitude: lat,
          longitude: lng,
          depthMeters: Number(m.depthMeters ?? 2.5),
          diameterMm: Number(m.diameterMm ?? 800),
          material: m.material || 'Precast Concrete',
          coverCondition: m.coverCondition || 'Good',
          status: m.status || 'Active',
          condition: m.condition || 'Good',
          photos: Array.isArray(m.photos) ? m.photos : []
        };
      });

      const pumpStations: PumpStationAsset[] = (raw.pumpStations || []).map((ps: any) => {
        const lat = Number(ps.coordinates?.lat ?? ps.latitude ?? -6.444);
        const lng = Number(ps.coordinates?.lng ?? ps.longitude ?? 107.452);
        const pumpCount = Number(ps.pumpCount ?? ps.totalPumps ?? 2);
        const capacityLps = Number(ps.capacityLps ?? ps.flowCapacityLps ?? 50);
        return {
          ...ps,
          type: 'pump_station' as const,
          coordinates: { lat, lng },
          latitude: lat,
          longitude: lng,
          pumpCount,
          activePumps: Number(ps.activePumps ?? pumpCount),
          capacityLps,
          powerSource: ps.powerSource || 'PLN + Genset',
          status: ps.status || 'Active',
          condition: ps.condition || 'Good',
          photos: Array.isArray(ps.photos) ? ps.photos : []
        };
      });

      const pipes: PipeAsset[] = (raw.pipes || []).map((p: any) => {
        return {
          ...p,
          type: 'pipe' as const,
          diameterMm: Number(p.diameterMm ?? 400),
          lengthMeters: Number(p.lengthMeters ?? 50),
          flowDirection: p.flowDirection || 'downstream',
          status: p.status || 'Active',
          condition: p.condition || 'Good',
          photos: Array.isArray(p.photos) ? p.photos : []
        };
      });

      const wtps: WtpAsset[] = (raw.wtps || []).map((w: any) => {
        return {
          ...w,
          type: 'wtp' as const,
          coordinates: { lat: Number(w.latitude ?? -6.444), lng: Number(w.longitude ?? 107.452) },
          productionCapacityLps: Number(w.productionCapacityLps ?? 500),
          rawWaterSource: w.rawWaterSource || 'Sungai Citarum',
          waterQualityStatus: w.waterQualityStatus || 'Safe - Permenkes 2023',
          status: w.status || 'Active',
          condition: w.condition || 'Good',
          photos: Array.isArray(w.photos) ? w.photos : []
        };
      });

      const waterAccessories: WaterAccessoryAsset[] = (raw.waterAccessories || []).map((a: any) => {
        return {
          ...a,
          type: 'water_accessory' as const,
          coordinates: { lat: Number(a.latitude ?? -6.444), lng: Number(a.longitude ?? 107.452) },
          accessoryType: a.accessoryType || 'air_valve',
          diameterMm: Number(a.diameterMm ?? 150),
          pressureBar: Number(a.pressureBar ?? 6.0),
          operatingStatus: a.operatingStatus || 'Normal Open',
          status: a.status || 'Active',
          condition: a.condition || 'Good',
          photos: Array.isArray(a.photos) ? a.photos : []
        };
      });

      return { manholes, pumpStations, pipes, wtps, waterAccessories };
    } catch (e) {
      console.warn('Backend API unavailable, using fallback storage:', e);
      return null;
    }
  },

  // Create Asset
  createAsset: async (type: 'manhole' | 'pumpStation' | 'pipe' | 'wtp' | 'water_accessory', data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
  updateAsset: async (id: string, type: 'manhole' | 'pumpStation' | 'pipe' | 'wtp' | 'water_accessory', data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('API deleteAsset failed:', e);
      return null;
    }
  },

  // Schedule Periodic Manhole Inspection
  scheduleManholeInspection: async (payload: { targetType: 'single' | 'area' | 'all'; targetId?: string; area?: string; nextInspectionDue: string }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/assets/schedule-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('API scheduleManholeInspection failed:', e);
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
        email: (u.email || '').trim().toLowerCase(),
        name: u.name || u.fullName || u.full_name || u.email?.split('@')[0] || 'Pengguna',
        avatar: u.avatar || u.avatarUrl || u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || 'user')}`,
        status: u.status || 'Active'
      }));
    } catch {
      return null;
    }
  },

  createUser: async (data: UserProfile) => {
    try {
      const payload = {
        ...data,
        email: (data.email || '').trim().toLowerCase(),
        status: data.status || 'Active',
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
        email: (data.email || '').trim().toLowerCase(),
        status: data.status || 'Active',
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
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Backup & Restore (Synology NAS WebDAV & PostgreSQL Dumps)
  testNasConnection: async (nasConfig: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/test-nas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nasConfig)
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e: any) {
      return { ok: false, data: { error: e.message || 'Koneksi ke backend gagal.' } };
    }
  },

  executeBackup: async (type: 'FULL' | 'INCREMENTAL', nasConfig: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, nasConfig })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Eksekusi backup gagal di server.' };
      }
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Gagal mengirim permintaan backup.' };
    }
  },

  getBackupHistory: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/history`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch backup history:', e);
      return null;
    }
  },

  restoreBackup: async (filename: string, nasConfig?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/backup/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, nasConfig })
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e: any) {
      return { ok: false, data: { error: e.message || 'Gagal memulihkan backup database.' } };
    }
  },

  getBackupDownloadUrl: (filename: string) => {
    return `${API_BASE_URL}/api/backup/download/${encodeURIComponent(filename)}`;
  }
};
