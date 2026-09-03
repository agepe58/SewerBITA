import React, { useState, useMemo, useEffect, useCallback, Suspense, lazy } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Lazy-loaded heavy modules for optimized bundle size & fast initial page load
const LandingPage = lazy(() => import('./components/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const NetworkMap = lazy(() => import('./components/map/NetworkMap').then(m => ({ default: m.NetworkMap })));
const TopologyView = lazy(() => import('./components/topology/TopologyView').then(m => ({ default: m.TopologyView })));
const AssetRegistry = lazy(() => import('./components/assets/AssetRegistry').then(m => ({ default: m.AssetRegistry })));
const InspectionView = lazy(() => import('./components/inspections/InspectionView').then(m => ({ default: m.InspectionView })));
const ImportExportView = lazy(() => import('./components/data/ImportExportView').then(m => ({ default: m.ImportExportView })));
const ProfileView = lazy(() => import('./components/common/ProfileView').then(m => ({ default: m.ProfileView })));
const UserManagementView = lazy(() => import('./components/rbac/UserManagementView').then(m => ({ default: m.UserManagementView })));
const AreaManagementView = lazy(() => import('./components/areas/AreaManagementView').then(m => ({ default: m.AreaManagementView })));
const BackupRestoreView = lazy(() => import('./components/admin/BackupRestoreView').then(m => ({ default: m.BackupRestoreView })));

import { EditUserModal } from './components/rbac/EditUserModal';
import { AddUserModal } from './components/rbac/AddUserModal';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { EditAssetModal } from './components/assets/EditAssetModal';
import { NewInspectionModal } from './components/inspections/NewInspectionModal';
import { EditInspectionModal } from './components/inspections/EditInspectionModal';
import { ManholeScheduleModal } from './components/inspections/ManholeScheduleModal';
import { QrCodeModal } from './components/qr/QrCodeModal';
import { QrScannerModal } from './components/qr/QrScannerModal';

import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset, WtpAsset, WaterAccessoryAsset, GreaseTrapAsset } from './types/asset';
import { InspectionRecord } from './types/inspection';
import { UserProfile, UserRole, isTabAllowed } from './types/rbac';
import { NetworkGraphEngine } from './services/graphEngine';
import { NetworkTraceResult } from './types/topology';
import { apiClient } from './services/api';
import { authService } from './services/authService';
import { AuthModal } from './components/auth/AuthModal';
import { ShieldAlert, Loader2 } from 'lucide-react';

const AccessDeniedView: React.FC<{ role: string; tab: string; onGoHome: () => void; isDarkMode: boolean }> = ({
  role,
  tab,
  onGoHome,
  isDarkMode
}) => (
  <div className="p-8 max-w-lg mx-auto my-16 text-center space-y-5">
    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20 shadow-lg">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <div className="space-y-2">
      <h3 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Akses Dibatasi (RBAC)</h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Peran akun Anda saat ini sebagai <span className="font-bold text-blue-400">{role}</span> tidak memiliki hak akses untuk membuka halaman <span className="font-bold text-slate-200 uppercase">{tab}</span>.
      </p>
    </div>
    <button
      onClick={onGoHome}
      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
    >
      Kembali ke Dashboard
    </button>
  </div>
);

export const App: React.FC = () => {
  // App view & Theme state
  const [isLandingPage, setIsLandingPage] = useState<boolean>(() => {
    const activeSession = authService.getCurrentSession();
    return !activeSession; // Stay on dashboard if session exists!
  });
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const validTabs: NavTab[] = [
      'dashboard', 'map', 'topology', 'assets', 'areas', 'inspections',
      'qr_scanner', 'data', 'users', 'backup', 'profile'
    ];
    const hash = window.location.hash.replace('#', '') as NavTab;
    if (hash && validTabs.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('sewerbita_active_tab') as NavTab;
    if (saved && validTabs.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  });

  // Persist activeTab to LocalStorage and URL hash
  useEffect(() => {
    localStorage.setItem('sewerbita_active_tab', activeTab);
    if (window.location.hash !== `#${activeTab}`) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sewerbita_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sewerbita_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sewerbita_theme', 'light');
    }
  }, [isDarkMode]);

  // Clean legacy local storage cache keys once to ensure PC & HP fetch 100% identical data from PostgreSQL
  useEffect(() => {
    localStorage.removeItem('sewerbita_manholes');
    localStorage.removeItem('sewerbita_pump_stations');
    localStorage.removeItem('sewerbita_pipes');
    localStorage.removeItem('sewerbita_wtps');
    localStorage.removeItem('sewerbita_water_accessories');
    localStorage.removeItem('sewerbita_grease_traps');
    localStorage.removeItem('sewerbita_areas');
  }, []);

  // Master Data States (Full Production Mode - Central PostgreSQL Server is 100% Single Source of Truth)
  const [manholes, setManholes] = useState<ManholeAsset[]>([]);
  const [pumpStations, setPumpStations] = useState<PumpStationAsset[]>([]);
  const [pipes, setPipes] = useState<PipeAsset[]>([]);
  const [wtps, setWtps] = useState<WtpAsset[]>([]);
  const [waterAccessories, setWaterAccessories] = useState<WaterAccessoryAsset[]>([]);
  const [greaseTraps, setGreaseTraps] = useState<GreaseTrapAsset[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('sewerbita_inspections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load inspections', e); }
    }
    return [];
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sewerbita_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load users', e); }
    }
    return [];
  });

  useEffect(() => { localStorage.setItem('sewerbita_inspections', JSON.stringify(inspections)); }, [inspections]);

  // Reload Assets Directly from Backend PostgreSQL Database Server (Full Production Mode Sync)
  const reloadAssetsList = useCallback(async () => {
    const assetData = await apiClient.getAssets();
    if (assetData) {
      setManholes(assetData.manholes || []);
      setPumpStations(assetData.pumpStations || []);
      setPipes(assetData.pipes || []);
      setWtps(assetData.wtps || []);
      setWaterAccessories(assetData.waterAccessories || []);
      setGreaseTraps(assetData.greaseTraps || []);
    }
  }, []);

  // Reload Areas Directly from Backend PostgreSQL Database Server (Full Production Mode Sync)
  const reloadAreasList = useCallback(async () => {
    const serverAreas = await apiClient.getAreas();
    if (serverAreas && Array.isArray(serverAreas)) {
      setAreas(serverAreas);
    }
  }, []);

  // Reload Inspections from Backend API
  const reloadInspectionsList = useCallback(async () => {
    const inspectionData = await apiClient.getInspections();
    if (inspectionData && Array.isArray(inspectionData)) {
      setInspections(inspectionData);
    }
  }, []);

  // Dynamic User List Synchronization Function
  const reloadUsersList = useCallback(async () => {
    const serverUsers = await apiClient.getUsers();
    if (serverUsers && Array.isArray(serverUsers)) {
      setUsers(serverUsers);
    }
  }, []);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle Registered Callback
  const handleUserRegistered = useCallback(async (newUser: UserProfile) => {
    const normalizedEmail = (newUser.email || '').trim().toLowerCase();
    const updatedUser = { ...newUser, email: normalizedEmail };
    await apiClient.createUser(updatedUser);
    await reloadUsersList();
    addToast('success', 'Registrasi Berhasil', 'Akun Anda sedang menunggu persetujuan Administrator.');
  }, [reloadUsersList, addToast]);

  // Load Real Data from Backend PostgreSQL API on App Startup
  useEffect(() => {
    const loadRealDatabaseData = async () => {
      await reloadAssetsList();
      await reloadAreasList();
      await reloadInspectionsList();
      await reloadUsersList();
    };
    loadRealDatabaseData();
  }, [reloadAssetsList, reloadAreasList, reloadInspectionsList, reloadUsersList]);

  // Smart Live Polling Efficiency (10 seconds + Window Visibility Listener)
  // Note: Polling is PAUSED when user is on 'map' tab to allow peaceful observation without flickering
  useEffect(() => {
    let interval: any = null;
    const isMapTab = (activeTab as string) === 'map';

    const startPolling = () => {
      if (!interval && !isMapTab) {
        interval = setInterval(() => {
          if (document.visibilityState === 'visible' && (activeTab as string) !== 'map') {
            reloadAssetsList();
            reloadAreasList();
            reloadInspectionsList();
            reloadUsersList();
          }
        }, 10000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (activeTab as string) !== 'map') {
        reloadAssetsList();
        reloadAreasList();
        reloadInspectionsList();
        reloadUsersList();
        startPolling();
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    if (isMapTab) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    } else {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      startPolling();
    }

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, reloadAssetsList, reloadAreasList, reloadInspectionsList, reloadUsersList]);

  // Active User & Role Session Initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return authService.getCurrentSession() || {
      id: 'usr-session',
      name: 'Pengguna Operasional',
      email: '',
      role: 'Technician',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Operator',
      department: 'Divisi Air Limbah',
      status: 'Active'
    };
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Modals state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  const [isManholeScheduleModalOpen, setIsManholeScheduleModalOpen] = useState(false);
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false);
  const [activeQrAssetId, setActiveQrAssetId] = useState<string | null>(null);
  const [selectedAssetIdForMap, setSelectedAssetIdForMap] = useState<string | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<SewerAsset | null>(null);
  const [inspectionToEdit, setInspectionToEdit] = useState<InspectionRecord | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Flow Tracing State
  const [activeTraceResult, setActiveTraceResult] = useState<NetworkTraceResult | null>(null);

  // Graph Engine Instance
  const graphEngine = useMemo(() => {
    return new NetworkGraphEngine(manholes, pumpStations, pipes);
  }, [manholes, pumpStations, pipes]);

  const handleTraceDownstreamFromMap = (assetId: string) => {
    const res = graphEngine.traceDownstream(assetId);
    setActiveTraceResult(res);
  };

  const handleTraceUpstreamFromMap = (assetId: string) => {
    const res = graphEngine.traceUpstream(assetId);
    setActiveTraceResult(res);
  };

  // Asset Handlers (Full Production Mode - PostgreSQL Server Single Source of Truth)
  const handleAddManhole = async (newMh: Omit<ManholeAsset, 'id'>) => {
    const createdMh: ManholeAsset = {
      ...newMh,
      id: `mh-${Date.now()}`
    };
    const res = await apiClient.createAsset('manhole', createdMh);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `Manhole ${createdMh.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleAddPumpStation = async (newPs: Omit<PumpStationAsset, 'id'>) => {
    const createdPs: PumpStationAsset = {
      ...newPs,
      id: `ps-${Date.now()}`
    };
    const res = await apiClient.createAsset('pump_station', createdPs);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `Stasiun Pompa ${createdPs.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleAddPipe = async (newPipe: Omit<PipeAsset, 'id'>) => {
    const createdPipe: PipeAsset = {
      ...newPipe,
      id: `p-${Date.now()}`
    };
    const res = await apiClient.createAsset('pipe', createdPipe);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `Pipa ${createdPipe.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleAddWtp = async (newWtp: Omit<WtpAsset, 'id'>) => {
    const createdWtp: WtpAsset = {
      ...newWtp,
      id: `wtp-${Date.now()}`
    };
    const res = await apiClient.createAsset('wtp', createdWtp);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `WTP ${createdWtp.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleAddWaterAccessory = async (newAcc: Omit<WaterAccessoryAsset, 'id'>) => {
    const createdAcc: WaterAccessoryAsset = {
      ...newAcc,
      id: `acc-${Date.now()}`
    };
    const res = await apiClient.createAsset('water_accessory', createdAcc);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `Aksesori ${createdAcc.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleAddGreaseTrap = async (newGt: Omit<GreaseTrapAsset, 'id'>) => {
    const createdGt: GreaseTrapAsset = {
      ...newGt,
      id: `gt-${Date.now()}`
    };
    const res = await apiClient.createAsset('grease_trap', createdGt);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Disimpan', `Grease Trap ${createdGt.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setIsAddAssetModalOpen(false);
  };

  const handleEditGenericAsset = async (updatedAsset: SewerAsset) => {
    const res = await apiClient.updateAsset(updatedAsset.id, updatedAsset.type as any, updatedAsset);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error && (res.id || res.assetCode || res.type)) {
      addToast('success', 'Aset Berhasil Diperbarui', `Aset ${updatedAsset.name} tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Aset', res?.error || 'Terjadi kesalahan saat menyimpan ke database PostgreSQL server.');
    }
    setAssetToEdit(null);
  };

  const handleEditManhole = async (updatedMh: ManholeAsset) => {
    await handleEditGenericAsset(updatedMh);
  };

  const handleEditPumpStation = async (updatedPs: PumpStationAsset) => {
    await handleEditGenericAsset(updatedPs);
  };

  const handleEditPipe = async (updatedPipe: PipeAsset) => {
    await handleEditGenericAsset(updatedPipe);
  };

  const handleDeleteAsset = async (id: string, _type: 'manhole' | 'pumpStation' | 'pipe') => {
    const res: any = await apiClient.deleteAsset(id);
    await reloadAssetsList();
    await reloadAreasList();
    if (res && !res.error) {
      addToast('success', 'Aset Berhasil Dihapus', 'Data aset telah dihapus dari PostgreSQL server.');
    } else {
      addToast('error', 'Gagal Menghapus Aset', res?.error || 'Terjadi kesalahan saat menghapus dari database.');
    }
  };

  const handleAddInspection = async (newInsp: Omit<InspectionRecord, 'id'>) => {
    const createdInsp: InspectionRecord = {
      ...newInsp,
      id: `insp-${Date.now()}`
    };
    await apiClient.createInspection(createdInsp);
    await reloadInspectionsList();
    setIsNewInspectionModalOpen(false);
  };

  const handleSaveEditedInspection = async (updatedInsp: InspectionRecord) => {
    await apiClient.updateInspection(updatedInsp.id, updatedInsp);
    await reloadInspectionsList();
    setInspectionToEdit(null);
  };

  const handleDeleteInspection = async (id: string) => {
    await apiClient.deleteInspection(id);
    await reloadInspectionsList();
  };

  const handleAddUser = async (newUser: Omit<UserProfile, 'id'>) => {
    const createdUser: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`
    };
    await apiClient.createUser(createdUser);
    await reloadUsersList();
    setIsAddUserModalOpen(false);
  };

  const handleSaveEditedUser = async (updatedUser: UserProfile) => {
    await apiClient.updateUser(updatedUser.id, updatedUser);
    await reloadUsersList();
    setUserToEdit(null);
  };

  const handleDeleteUser = async (id: string) => {
    await apiClient.deleteUser(id);
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      localStorage.setItem('sewerbita_users', JSON.stringify(updated));
      return updated;
    });
    await reloadUsersList();
  };

  const handleRoleChange = (newRole: UserRole) => {
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    authService.saveSession(updated);
  };

  const handleAddArea = async (newArea: string) => {
    const cleanName = newArea.trim();
    if (!cleanName) return;
    setAreas(prev => Array.from(new Set([...prev, cleanName])));
    const saved = await apiClient.createArea(cleanName);
    await reloadAreasList();
    if (saved) {
      addToast('success', 'Area Berhasil Disimpan', `Wilayah "${cleanName}" tersimpan di PostgreSQL server.`);
    } else {
      addToast('error', 'Gagal Menyimpan Area', 'Terjadi kesalahan saat menyimpan wilayah ke database PostgreSQL.');
    }
  };

  const handleEditArea = (oldArea: string, newArea: string) => {
    setAreas(prev => prev.map(a => a === oldArea ? newArea : a));
    setManholes(prev => prev.map(m => m.area === oldArea ? { ...m, area: newArea } : m));
    setPumpStations(prev => prev.map(ps => ps.area === oldArea ? { ...ps, area: newArea } : ps));
    setPipes(prev => prev.map(p => p.area === oldArea ? { ...p, area: newArea } : p));
  };

  const handleDeleteArea = async (areaToDelete: string) => {
    await apiClient.deleteArea(areaToDelete);
    await reloadAreasList();
    addToast('info', 'Area Dihapus', `Wilayah "${areaToDelete}" dihapus dari database PostgreSQL.`);
  };

  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes, ...wtps, ...waterAccessories];
  const qrTargetAsset = activeQrAssetId ? allAssets.find(a => a.id === activeQrAssetId) || null : null;

  // If in Landing Page mode, show landing page portal
  if (isLandingPage) {
    return (
      <>
        <LandingPage
          onEnterDashboard={() => setIsLandingPage(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenAuthModal={() => { setAuthModalMode('login'); setIsAuthModalOpen(true); }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            authService.saveSession(user);
            setIsLandingPage(false);
          }}
          onUserRegistered={handleUserRegistered}
          initialMode={authModalMode}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0F17] text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Enterprise Full-Width Dashboard Container */}
      <div className="w-full flex flex-1 overflow-hidden min-h-screen">
        
        {/* Left Navigation Sidebar matching Kota Bukit Indah layout */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUserRole={currentUser.role}
          onLogout={() => {
            authService.logout();
            setIsLandingPage(true);
          }}
          isDarkMode={isDarkMode}
        />

        {/* Right Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden ${
          isDarkMode ? 'bg-[#0B0F17]' : 'bg-[#F8FAFC]'
        }`}>
          {/* Top Header Controls (Live Sync 3s, Refresh, Download App, User Avatar AP) */}
          <Header
            activeTab={activeTab}
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onRefresh={() => {
              reloadAssetsList();
              reloadInspectionsList();
              reloadUsersList();
            }}
            onOpenDownloadApp={() => window.open('https://sewer.kbi.web.id/sewerbita-release.apk', '_blank')}
            onLogout={() => {
              authService.logout();
              setIsLandingPage(true);
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenEditProfile={() => setActiveTab('profile')}
          />

          {/* Main View Router */}
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={
              <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs font-semibold">Memuat Modul BITA GIS...</p>
              </div>
            }>
              {!isTabAllowed(activeTab, currentUser.role) ? (
                <AccessDeniedView
                  role={currentUser.role}
                  tab={activeTab}
                  onGoHome={() => setActiveTab('dashboard')}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      manholes={manholes}
                      pumpStations={pumpStations}
                      pipes={pipes}
                      inspections={inspections}
                      onNavigate={setActiveTab}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {activeTab === 'map' && (
                    <div className="h-[calc(100vh-5rem)] p-4">
                      <div className="h-full rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                        <NetworkMap
                          manholes={manholes}
                          pumpStations={pumpStations}
                          pipes={pipes}
                          wtps={wtps}
                          waterAccessories={waterAccessories}
                          greaseTraps={greaseTraps}
                          inspections={inspections}
                          activeTraceResult={activeTraceResult}
                          onTraceDownstream={handleTraceDownstreamFromMap}
                          onTraceUpstream={handleTraceUpstreamFromMap}
                          onClearTrace={() => setActiveTraceResult(null)}
                          onOpenQrModal={(id) => setActiveQrAssetId(id)}
                          onOpenNewInspection={(id) => {
                            setSelectedAssetIdForMap(id);
                            setIsNewInspectionModalOpen(true);
                          }}
                          selectedAssetIdFromParent={selectedAssetIdForMap}
                          onRefreshOnZoom={reloadAssetsList}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'topology' && (
                    <TopologyView
                      manholes={manholes}
                      pumpStations={pumpStations}
                      pipes={pipes}
                      graphEngine={graphEngine}
                      onApplyTraceResult={(trace) => {
                        setActiveTraceResult(trace);
                        setActiveTab('map');
                      }}
                      onNavigateToMap={() => setActiveTab('map')}
                    />
                  )}

                  {activeTab === 'assets' && (
                    <AssetRegistry
                      manholes={manholes}
                      pumpStations={pumpStations}
                      pipes={pipes}
                      currentUserRole={currentUser.role}
                      onOpenAddModal={() => setIsAddAssetModalOpen(true)}
                      onOpenQrModal={(id) => setActiveQrAssetId(id)}
                      onNavigateToMapWithAsset={(id) => {
                        setSelectedAssetIdForMap(id);
                        setActiveTab('map');
                      }}
                      onEditAsset={(asset) => setAssetToEdit(asset)}
                      onDeleteAsset={(id: string) => {
                        if (manholes.some(m => m.id === id)) {
                          handleDeleteAsset(id, 'manhole');
                        } else if (pumpStations.some(ps => ps.id === id)) {
                          handleDeleteAsset(id, 'pumpStation');
                        } else {
                          handleDeleteAsset(id, 'pipe');
                        }
                      }}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {activeTab === 'areas' && (
                    <AreaManagementView
                      areas={areas}
                      allAssets={allAssets}
                      currentUserRole={currentUser.role}
                      onAddArea={handleAddArea}
                      onEditArea={handleEditArea}
                      onDeleteArea={handleDeleteArea}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {activeTab === 'inspections' && (
                    <InspectionView
                      inspections={inspections}
                      currentUserRole={currentUser.role}
                      onOpenNewModal={() => setIsNewInspectionModalOpen(true)}
                      onOpenScheduleModal={() => setIsManholeScheduleModalOpen(true)}
                      onEditInspection={(insp) => setInspectionToEdit(insp)}
                      onDeleteInspection={handleDeleteInspection}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {activeTab === 'qr_scanner' && (
                    <div className="p-6">
                      <div className="p-8 rounded-2xl border max-w-lg mx-auto text-center space-y-4 bg-[#111827] border-slate-800">
                        <h3 className="text-base font-extrabold text-white">Pemindai QR Code Lapangan</h3>
                        <p className="text-xs text-slate-400">Pindai kode QR fisik yang terpasang pada tutup manhole atau stasiun pompa</p>
                        <button
                          onClick={() => setIsQrScannerModalOpen(true)}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                        >
                          Buka Kamera Scanner
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'data' && (
                    <ImportExportView
                      manholes={manholes}
                      pumpStations={pumpStations}
                      pipes={pipes}
                      inspections={inspections}
                      currentUserRole={currentUser.role}
                      onBatchImportManholes={(newMhs) => setManholes(prev => [...newMhs, ...prev])}
                    />
                  )}

                  {activeTab === 'users' && (
                    <UserManagementView
                      users={users}
                      currentUser={currentUser}
                      onRoleChange={handleRoleChange}
                      onEditUser={(usr) => setUserToEdit(usr)}
                      onDeleteUser={handleDeleteUser}
                      onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
                      onRefreshUsers={reloadUsersList}
                    />
                  )}

                  {activeTab === 'backup' && (
                    <BackupRestoreView
                      currentUserRole={currentUser.role}
                      onRestoreDataToSystem={async () => {
                        await reloadAssetsList();
                        await reloadInspectionsList();
                        await reloadUsersList();
                      }}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileView
                      currentUser={currentUser}
                      onUpdateProfile={(updated) => {
                        setCurrentUser(updated);
                        authService.saveSession(updated);
                        apiClient.updateUser(updated.id, updated);
                        reloadUsersList();
                      }}
                      isDarkMode={isDarkMode}
                    />
                  )}
                </>
              )}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Asset & Inspection Modals */}
      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onAddManhole={handleAddManhole}
        onAddPipe={handleAddPipe}
        onAddPumpStation={handleAddPumpStation}
        onAddWtp={handleAddWtp}
        onAddWaterAccessory={handleAddWaterAccessory}
        onAddGreaseTrap={handleAddGreaseTrap}
        existingManholes={manholes}
        existingPumpStations={pumpStations}
        existingWtps={wtps}
        existingWaterAccessories={waterAccessories}
        existingGreaseTraps={greaseTraps}
        areas={areas}
        onAddArea={handleAddArea}
      />

      <NewInspectionModal
        isOpen={isNewInspectionModalOpen}
        onClose={() => setIsNewInspectionModalOpen(false)}
        onAddInspection={handleAddInspection}
        allAssets={allAssets}
        currentUser={currentUser}
        preselectedAssetId={selectedAssetIdForMap}
      />

      <ManholeScheduleModal
        isOpen={isManholeScheduleModalOpen}
        onClose={() => setIsManholeScheduleModalOpen(false)}
        manholes={manholes}
        areas={areas}
        onScheduleSaved={async () => {
          const assetData = await apiClient.getAssets();
          if (assetData) {
            setManholes(assetData.manholes || []);
          }
        }}
      />

      <QrCodeModal
        asset={qrTargetAsset}
        onClose={() => setActiveQrAssetId(null)}
      />

      <QrScannerModal
        isOpen={isQrScannerModalOpen}
        onClose={() => setIsQrScannerModalOpen(false)}
        allAssets={allAssets}
        onSelectAsset={(id) => {
          setSelectedAssetIdForMap(id);
          setActiveTab('map');
        }}
      />

      <EditAssetModal
        asset={assetToEdit}
        onClose={() => setAssetToEdit(null)}
        onSaveManhole={handleEditManhole}
        onSavePipe={handleEditPipe}
        onSavePumpStation={handleEditPumpStation}
        onSaveAsset={handleEditGenericAsset}
        areas={areas}
        allAssets={allAssets}
      />

      <EditInspectionModal
        inspection={inspectionToEdit}
        onClose={() => setInspectionToEdit(null)}
        onSaveInspection={handleSaveEditedInspection}
      />

      <EditUserModal
        user={userToEdit}
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onSaveUser={handleSaveEditedUser}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          authService.saveSession(user);
          setIsLandingPage(false);
        }}
        onUserRegistered={handleUserRegistered}
        initialMode={authModalMode}
      />
      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
