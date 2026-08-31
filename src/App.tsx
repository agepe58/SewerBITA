import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { NetworkMap } from './components/map/NetworkMap';
import { TopologyView } from './components/topology/TopologyView';
import { AssetRegistry } from './components/assets/AssetRegistry';
import { InspectionView } from './components/inspections/InspectionView';
import { ImportExportView } from './components/data/ImportExportView';
import { WorkOrderView } from './components/workorder/WorkOrderView';
import { CreateWorkOrderModal } from './components/workorder/CreateWorkOrderModal';
import { ProjectsView } from './components/common/ProjectsView';
import { DailyReportsView } from './components/common/DailyReportsView';
import { ActivityLogsView } from './components/common/ActivityLogsView';
import { AppAndroidView } from './components/common/AppAndroidView';
import { FlowchartView } from './components/common/FlowchartView';
import { MasterDataView } from './components/common/MasterDataView';
import { AiSettingsView } from './components/common/AiSettingsView';
import { ProfileView } from './components/common/ProfileView';
import { UserManagementView } from './components/rbac/UserManagementView';
import { EditUserModal } from './components/rbac/EditUserModal';
import { AddUserModal } from './components/rbac/AddUserModal';
import { AreaManagementView } from './components/areas/AreaManagementView';
import { BackupRestoreView } from './components/admin/BackupRestoreView';

import { AddAssetModal } from './components/assets/AddAssetModal';
import { EditAssetModal } from './components/assets/EditAssetModal';
import { NewInspectionModal } from './components/inspections/NewInspectionModal';
import { EditInspectionModal } from './components/inspections/EditInspectionModal';
import { ManholeScheduleModal } from './components/inspections/ManholeScheduleModal';
import { QrCodeModal } from './components/qr/QrCodeModal';
import { QrScannerModal } from './components/qr/QrScannerModal';

import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from './types/asset';
import { InspectionRecord } from './types/inspection';
import { UserRole, UserProfile } from './types/rbac';
import { WorkOrder, MaintenanceProject, DailyReport, ActivityLog } from './types/workOrder';
import { NetworkGraphEngine } from './services/graphEngine';
import { NetworkTraceResult } from './types/topology';
import { apiClient } from './services/api';
import { authService } from './services/authService';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  // App view & Theme state
  const [isLandingPage, setIsLandingPage] = useState<boolean>(() => {
    const activeSession = authService.getCurrentSession();
    return !activeSession; // Stay on dashboard if session exists!
  });
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
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

  // Master Data States with LocalStorage Persistence
  const [manholes, setManholes] = useState<ManholeAsset[]>(() => {
    const saved = localStorage.getItem('sewerbita_manholes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load manholes', e); }
    }
    return [];
  });

  const [pumpStations, setPumpStations] = useState<PumpStationAsset[]>(() => {
    const saved = localStorage.getItem('sewerbita_pump_stations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load pumpStations', e); }
    }
    return [];
  });

  const [pipes, setPipes] = useState<PipeAsset[]>(() => {
    const saved = localStorage.getItem('sewerbita_pipes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load pipes', e); }
    }
    return [];
  });

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

  // Work Orders & Maintenance Projects State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('sewerbita_work_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load work orders', e); }
    }
    return [];
  });

  const [projects, setProjects] = useState<MaintenanceProject[]>(() => {
    const saved = localStorage.getItem('sewerbita_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load projects', e); }
    }
    return [
      {
        id: 'proj-01',
        title: 'Pintu air Balance Tank',
        status: 'Direncanakan',
        totalTasks: 0,
        completedTasks: 0
      }
    ];
  });

  const [dailyReports] = useState<DailyReport[]>([]);
  const [activityLogs] = useState<ActivityLog[]>([]);

  // Areas state with LocalStorage persistence
  const [areas, setAreas] = useState<string[]>(() => {
    const saved = localStorage.getItem('sewerbita_areas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load areas', e); }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sewerbita_areas', JSON.stringify(areas));
  }, [areas]);

  // Reload Assets from Backend PostgreSQL API
  const reloadAssetsList = useCallback(async () => {
    const assetData = await apiClient.getAssets();
    if (assetData) {
      const m = assetData.manholes || [];
      const ps = assetData.pumpStations || [];
      const p = assetData.pipes || [];
      setManholes(m);
      setPumpStations(ps);
      setPipes(p);

      // Dynamically derive unique areas present in database assets
      const realDbAreas = Array.from(new Set([...m, ...ps, ...p].map((a: any) => a.area).filter(Boolean)));
      setAreas(prev => Array.from(new Set([...prev, ...realDbAreas])));
    }
  }, []);

  // Reload Inspections from Backend API
  const reloadInspectionsList = useCallback(async () => {
    const inspectionData = await apiClient.getInspections();
    if (inspectionData && Array.isArray(inspectionData)) {
      setInspections(inspectionData);
    }
  }, []);

  // Reload Work Orders from Backend API
  const reloadWorkOrders = useCallback(async () => {
    const serverWos = await apiClient.getWorkOrders();
    if (serverWos && Array.isArray(serverWos)) {
      setWorkOrders(serverWos);
    }
  }, []);

  // Reload Projects from Backend API
  const reloadProjects = useCallback(async () => {
    const serverProjs = await apiClient.getProjects();
    if (serverProjs && Array.isArray(serverProjs) && serverProjs.length > 0) {
      setProjects(serverProjs);
    }
  }, []);

  // Dynamic User List Synchronization Function
  const reloadUsersList = useCallback(async () => {
    const serverUsers = await apiClient.getUsers();
    if (serverUsers && Array.isArray(serverUsers)) {
      setUsers(serverUsers);
    }
  }, []);

  // Handle Registered Callback
  const handleUserRegistered = useCallback(async (newUser: UserProfile) => {
    const normalizedEmail = (newUser.email || '').trim().toLowerCase();
    const updatedUser = { ...newUser, email: normalizedEmail };
    await apiClient.createUser(updatedUser);
    await reloadUsersList();
  }, [reloadUsersList]);

  // One-time Purge of Legacy Demo Cache
  useEffect(() => {
    const isPurged = localStorage.getItem('sewerbita_demo_purged_v5');
    if (!isPurged) {
      localStorage.removeItem('sewerbita_areas');
      localStorage.removeItem('sewerbita_manholes');
      localStorage.removeItem('sewerbita_pump_stations');
      localStorage.removeItem('sewerbita_pipes');
      localStorage.removeItem('sewerbita_inspections');
      localStorage.removeItem('sewerbita_work_orders');
      localStorage.removeItem('sewerbita_projects');
      localStorage.removeItem('sewerbita_users');
      localStorage.setItem('sewerbita_demo_purged_v5', 'true');
    }
  }, []);

  // Load Real Data from Backend PostgreSQL API on App Startup
  useEffect(() => {
    const loadRealDatabaseData = async () => {
      await reloadAssetsList();
      await reloadInspectionsList();
      await reloadWorkOrders();
      await reloadProjects();
      await reloadUsersList();
    };
    loadRealDatabaseData();
  }, [reloadAssetsList, reloadInspectionsList, reloadWorkOrders, reloadProjects, reloadUsersList]);

  // Realtime Polling (Every 3 seconds Live Sync for ALL connected devices PC & Mobile)
  useEffect(() => {
    const interval = setInterval(() => {
      reloadAssetsList();
      reloadInspectionsList();
      reloadWorkOrders();
      reloadProjects();
      reloadUsersList();
    }, 3000);
    return () => clearInterval(interval);
  }, [reloadAssetsList, reloadInspectionsList, reloadWorkOrders, reloadProjects, reloadUsersList]);

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
  const [isCreateWorkOrderModalOpen, setIsCreateWorkOrderModalOpen] = useState(false);
  const [workOrderToEdit, setWorkOrderToEdit] = useState<WorkOrder | null>(null);

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

  // Work Order Handlers
  const handleSaveWorkOrder = async (wo: WorkOrder) => {
    await apiClient.createWorkOrder(wo);
    await reloadWorkOrders();
  };

  const handleDeleteWorkOrder = async (id: string) => {
    await apiClient.deleteWorkOrder(id);
    setWorkOrders(prev => prev.filter(w => w.id !== id));
  };

  const handleCreateProject = async (proj: MaintenanceProject) => {
    await apiClient.createProject(proj);
    await reloadProjects();
  };

  // Asset Handlers
  const handleAddManhole = async (newMh: Omit<ManholeAsset, 'id'>) => {
    const createdMh: ManholeAsset = {
      ...newMh,
      id: `mh-${Date.now()}`
    };
    await apiClient.createAsset('manhole', createdMh);
    await reloadAssetsList();
    setIsAddAssetModalOpen(false);
  };

  const handleAddPumpStation = async (newPs: Omit<PumpStationAsset, 'id'>) => {
    const createdPs: PumpStationAsset = {
      ...newPs,
      id: `ps-${Date.now()}`
    };
    await apiClient.createAsset('pumpStation', createdPs);
    await reloadAssetsList();
    setIsAddAssetModalOpen(false);
  };

  const handleAddPipe = async (newPipe: Omit<PipeAsset, 'id'>) => {
    const createdPipe: PipeAsset = {
      ...newPipe,
      id: `p-${Date.now()}`
    };
    await apiClient.createAsset('pipe', createdPipe);
    await reloadAssetsList();
    setIsAddAssetModalOpen(false);
  };

  const handleEditManhole = async (updatedMh: ManholeAsset) => {
    await apiClient.updateAsset(updatedMh.id, 'manhole', updatedMh);
    await reloadAssetsList();
    setAssetToEdit(null);
  };

  const handleEditPumpStation = async (updatedPs: PumpStationAsset) => {
    await apiClient.updateAsset(updatedPs.id, 'pumpStation', updatedPs);
    await reloadAssetsList();
    setAssetToEdit(null);
  };

  const handleEditPipe = async (updatedPipe: PipeAsset) => {
    await apiClient.updateAsset(updatedPipe.id, 'pipe', updatedPipe);
    await reloadAssetsList();
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (id: string, _type: 'manhole' | 'pumpStation' | 'pipe') => {
    await apiClient.deleteAsset(id);
    await reloadAssetsList();
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

  const handleAddArea = (newArea: string) => {
    if (!areas.includes(newArea)) {
      setAreas(prev => [...prev, newArea]);
    }
  };

  const handleEditArea = (oldArea: string, newArea: string) => {
    setAreas(prev => prev.map(a => a === oldArea ? newArea : a));
    setManholes(prev => prev.map(m => m.area === oldArea ? { ...m, area: newArea } : m));
    setPumpStations(prev => prev.map(ps => ps.area === oldArea ? { ...ps, area: newArea } : ps));
    setPipes(prev => prev.map(p => p.area === oldArea ? { ...p, area: newArea } : p));
  };

  const handleDeleteArea = (areaToDelete: string) => {
    setAreas(prev => prev.filter(a => a !== areaToDelete));
  };

  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];
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
              reloadWorkOrders();
              reloadProjects();
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
                onAddArea={handleAddArea}
                onEditArea={handleEditArea}
                onDeleteArea={handleDeleteArea}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'inspections' && (
              <InspectionView
                inspections={inspections}
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
                onRestoreDataToSystem={(record) => {
                  alert(`Data sistem berhasil dipulihkan dari arsip snapshot '${record.filename}'.`);
                }}
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
          </main>
        </div>
      </div>

      {/* Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={isCreateWorkOrderModalOpen}
        onClose={() => {
          setIsCreateWorkOrderModalOpen(false);
          setWorkOrderToEdit(null);
        }}
        onSave={handleSaveWorkOrder}
        users={users}
        initialData={workOrderToEdit}
        isDarkMode={isDarkMode}
      />

      {/* Asset & Inspection Modals */}
      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onAddManhole={handleAddManhole}
        onAddPipe={handleAddPipe}
        onAddPumpStation={handleAddPumpStation}
        existingManholes={manholes}
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
        areas={areas}
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
    </div>
  );
};

export default App;
