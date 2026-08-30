import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { NetworkMap } from './components/map/NetworkMap';
import { TopologyView } from './components/topology/TopologyView';
import { AssetRegistry } from './components/assets/AssetRegistry';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { EditAssetModal } from './components/assets/EditAssetModal';
import { InspectionView } from './components/inspections/InspectionView';
import { NewInspectionModal } from './components/inspections/NewInspectionModal';
import { EditInspectionModal } from './components/inspections/EditInspectionModal';
import { QrCodeModal } from './components/qr/QrCodeModal';
import { QrScannerModal } from './components/qr/QrScannerModal';
import { ImportExportView } from './components/data/ImportExportView';
import { UserManagementView } from './components/rbac/UserManagementView';
import { EditUserModal } from './components/rbac/EditUserModal';
import { AddUserModal } from './components/rbac/AddUserModal';
import { BackupRestoreView } from './components/admin/BackupRestoreView';

import { INITIAL_MANHOLES, INITIAL_PUMP_STATIONS, INITIAL_PIPES, INITIAL_INSPECTIONS, INITIAL_USERS } from './services/mockData';
import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from './types/asset';
import { InspectionRecord } from './types/inspection';
import { UserRole, UserProfile } from './types/rbac';
import { NetworkGraphEngine } from './services/graphEngine';
import { NetworkTraceResult } from './types/topology';
import { apiClient } from './services/api';
import { authService } from './services/authService';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  // App view & Theme state
  const [isLandingPage, setIsLandingPage] = useState<boolean>(true);
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
    return INITIAL_MANHOLES;
  });

  const [pumpStations, setPumpStations] = useState<PumpStationAsset[]>(() => {
    const saved = localStorage.getItem('sewerbita_pump_stations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load pumpStations', e); }
    }
    return INITIAL_PUMP_STATIONS;
  });

  const [pipes, setPipes] = useState<PipeAsset[]>(() => {
    const saved = localStorage.getItem('sewerbita_pipes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load pipes', e); }
    }
    return INITIAL_PIPES;
  });

  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('sewerbita_inspections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error('Failed to load inspections', e); }
    }
    return INITIAL_INSPECTIONS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sewerbita_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error('Failed to load users', e); }
    }
    return INITIAL_USERS;
  });

  // Sync state changes automatically to LocalStorage
  useEffect(() => {
    localStorage.setItem('sewerbita_manholes', JSON.stringify(manholes));
  }, [manholes]);

  useEffect(() => {
    localStorage.setItem('sewerbita_pump_stations', JSON.stringify(pumpStations));
  }, [pumpStations]);

  useEffect(() => {
    localStorage.setItem('sewerbita_pipes', JSON.stringify(pipes));
  }, [pipes]);

  useEffect(() => {
    localStorage.setItem('sewerbita_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('sewerbita_users', JSON.stringify(users));
  }, [users]);

  // Load Real Data from Backend PostgreSQL API on App Startup
  useEffect(() => {
    const loadRealDatabaseData = async () => {
      const assetData = await apiClient.getAssets();
      if (assetData) {
        setManholes(assetData.manholes || []);
        setPumpStations(assetData.pumpStations || []);
        setPipes(assetData.pipes || []);
      }
      const inspectionData = await apiClient.getInspections();
      if (inspectionData) {
        setInspections(inspectionData);
      }
      const userData = await apiClient.getUsers();
      if (userData && userData.length > 0) {
        setUsers(userData);
      }
    };
    loadRealDatabaseData();
  }, []);

  // Active User & Role Session Initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return authService.getCurrentSession() || INITIAL_USERS[0];
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Modals state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
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

  // Handlers for data modification with Backend API sync
  const handleAddManhole = (
    newMh: Omit<ManholeAsset, 'id'>,
    intermediateInfo?: { upstreamId: string; downstreamId: string }
  ) => {
    const newMhId = `mh-${Date.now()}`;
    const createdMh: ManholeAsset = {
      ...newMh,
      id: newMhId
    };

    apiClient.createAsset('manhole', createdMh);

    let updatedPipes = [...pipes];

    // If inserted between two registered manholes, split the existing pipe automatically
    if (intermediateInfo) {
      const { upstreamId, downstreamId } = intermediateInfo;
      const existingPipeIndex = pipes.findIndex(
        p => (p.fromAssetId === upstreamId && p.toAssetId === downstreamId) ||
             (p.fromAssetId === downstreamId && p.toAssetId === upstreamId)
      );

      if (existingPipeIndex !== -1) {
        const oldPipe = pipes[existingPipeIndex];
        const halfLength = Math.round(oldPipe.lengthMeters / 2);
        const fromMh = manholes.find(m => m.id === oldPipe.fromAssetId);
        const toMh = manholes.find(m => m.id === oldPipe.toAssetId);

        const fromCode = fromMh ? fromMh.assetCode : 'MH';
        const toCode = toMh ? toMh.assetCode : 'MH';

        const pipeA: PipeAsset = {
          ...oldPipe,
          id: `p-${Date.now()}-a`,
          assetCode: `P-${fromCode}_${createdMh.assetCode}`,
          name: `Pipa Segmen ${fromCode} → ${createdMh.assetCode}`,
          fromAssetId: oldPipe.fromAssetId,
          toAssetId: newMhId,
          lengthMeters: halfLength
        };

        const pipeB: PipeAsset = {
          ...oldPipe,
          id: `p-${Date.now()}-b`,
          assetCode: `P-${createdMh.assetCode}_${toCode}`,
          name: `Pipa Segmen ${createdMh.assetCode} → ${toCode}`,
          fromAssetId: newMhId,
          toAssetId: oldPipe.toAssetId,
          lengthMeters: halfLength
        };

        apiClient.createAsset('pipe', pipeA);
        apiClient.createAsset('pipe', pipeB);
        apiClient.deleteAsset(oldPipe.id);

        updatedPipes = pipes.filter((_, idx) => idx !== existingPipeIndex).concat([pipeA, pipeB]);
        setPipes(updatedPipes);
      }
    }

    const allManholesUnsequenced = [createdMh, ...manholes];
    const tempEngine = new NetworkGraphEngine(allManholesUnsequenced, pumpStations, updatedPipes);
    const sequencedManholes = tempEngine.computeDynamicSequences(allManholesUnsequenced);

    setManholes(sequencedManholes);
  };

  // Dynamic Master Areas / Zones state
  const [areas, setAreas] = useState<string[]>([
    'Zone A - Sudirman',
    'Zone A - Setiabudi',
    'Zone A - Manggarai',
    'Zone B - Tebet',
    'Zone C - Pluit'
  ]);

  const handleAddArea = (newAreaName: string) => {
    const trimmed = newAreaName.trim();
    if (trimmed && !areas.includes(trimmed)) {
      setAreas(prev => [...prev, trimmed]);
    }
  };

  const handleAddPipe = (newPipe: Omit<PipeAsset, 'id'>) => {
    const created: PipeAsset = {
      ...newPipe,
      id: `p-${Date.now()}`
    };
    apiClient.createAsset('pipe', created);
    setPipes(prev => [created, ...prev]);
  };

  const handleAddPumpStation = (newPs: Omit<PumpStationAsset, 'id'>) => {
    const created: PumpStationAsset = {
      ...newPs,
      id: `ps-${Date.now()}`
    };
    apiClient.createAsset('pumpStation', created);
    setPumpStations(prev => [created, ...prev]);
  };

  const handleAddInspection = (newInsp: Omit<InspectionRecord, 'id'>) => {
    const created: InspectionRecord = {
      ...newInsp,
      id: `insp-${Date.now()}`
    };
    apiClient.createInspection(created);
    setInspections(prev => [created, ...prev]);

    // Update asset condition state if necessary
    setManholes(prev => prev.map(m => m.id === newInsp.assetId ? { ...m, condition: newInsp.condition } : m));
    setPipes(prev => prev.map(p => p.id === newInsp.assetId ? { ...p, condition: newInsp.condition } : p));
  };

  // Handlers for asset modification (Edit & Delete)
  const handleEditManhole = (updated: ManholeAsset) => {
    apiClient.updateAsset(updated.id, 'manhole', updated);
    setManholes(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleEditPipe = (updated: PipeAsset) => {
    apiClient.updateAsset(updated.id, 'pipe', updated);
    setPipes(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleEditPumpStation = (updated: PumpStationAsset) => {
    apiClient.updateAsset(updated.id, 'pumpStation', updated);
    setPumpStations(prev => prev.map(ps => ps.id === updated.id ? updated : ps));
  };

  const handleDeleteAsset = (assetId: string) => {
    apiClient.deleteAsset(assetId);
    setManholes(prev => prev.filter(m => m.id !== assetId));
    setPumpStations(prev => prev.filter(p => p.id !== assetId));
    setPipes(prev => prev.filter(p => p.id !== assetId && p.fromAssetId !== assetId && p.toAssetId !== assetId));
  };

  const handleSaveEditedInspection = (updated: InspectionRecord) => {
    apiClient.updateInspection(updated.id, updated);
    setInspections(prev => prev.map(i => i.id === updated.id ? updated : i));

    // Synchronize asset condition if changed
    setManholes(prev => prev.map(m => m.id === updated.assetId ? { ...m, condition: updated.condition } : m));
    setPipes(prev => prev.map(p => p.id === updated.assetId ? { ...p, condition: updated.condition } : p));
  };

  const handleDeleteInspection = (inspectionId: string) => {
    apiClient.deleteInspection(inspectionId);
    setInspections(prev => prev.filter(i => i.id !== inspectionId));
  };

  // User management handlers
  const handleSaveEditedUser = (updated: UserProfile) => {
    apiClient.updateUser(updated.id, updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  const handleAddUser = (newUser: UserProfile) => {
    apiClient.createUser(newUser);
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    apiClient.deleteUser(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleRoleChange = (newRole: UserRole) => {
    const userForRole = users.find(u => u.role === newRole) || { ...currentUser, role: newRole };
    setCurrentUser(userForRole);
  };

  // Tracing actions from Map Drawer
  const handleTraceDownstreamFromMap = (assetId: string) => {
    const res = graphEngine.traceDownstream(assetId);
    setActiveTraceResult(res);
  };

  const handleTraceUpstreamFromMap = (assetId: string) => {
    const res = graphEngine.traceUpstream(assetId);
    setActiveTraceResult(res);
  };

  // Find asset for QR Modal
  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];
  const qrTargetAsset = activeQrAssetId ? allAssets.find(a => a.id === activeQrAssetId) || null : null;

  // Global search asset handler
  const handleSearchAsset = (query: string) => {
    const found = allAssets.find(a =>
      a.assetCode.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      setSelectedAssetIdForMap(found.id);
      setActiveTab('map');
      setIsLandingPage(false);
    } else {
      alert(`Aset '${query}' tidak ditemukan.`);
    }
  };

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
          initialMode={authModalMode}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen w-full p-2 sm:p-3 lg:p-4 flex flex-col justify-center items-center font-sans selection:bg-[#2563EB] selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0F17] text-slate-100 dark' : 'bg-[#F4F5F7] text-slate-900'
    }`}>
      {/* Ramp HQ / Notion Clean Workspace Shell */}
      <div className={`w-full max-w-[1920px] rounded-2xl shadow-sm border overflow-hidden flex min-h-[96vh] h-full transition-colors duration-300 ${
        isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUserRole={currentUser.role}
          onLogout={() => setIsLandingPage(true)}
          isDarkMode={isDarkMode}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0B0F17]' : 'bg-[#F8FAFC]'
        }`}>
          {/* Top Header */}
          <Header
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onOpenQrScanner={() => setIsQrScannerModalOpen(true)}
            onSearchAsset={handleSearchAsset}
            onLogout={() => {
              authService.logout();
              setIsLandingPage(true);
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenEditProfile={() => setUserToEdit(currentUser)}
            onOpenAuthModal={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
          />

          {/* Tab Router Views */}
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                manholes={manholes}
                pumpStations={pumpStations}
                pipes={pipes}
                inspections={inspections}
                onNavigate={setActiveTab}
                onOpenAddAssetModal={() => setIsAddAssetModalOpen(true)}
                onOpenQrScanner={() => setIsQrScannerModalOpen(true)}
                onOpenNewInspectionModal={() => setIsNewInspectionModalOpen(true)}
                onSelectAssetForMap={(id) => {
                  setSelectedAssetIdForMap(id);
                  setActiveTab('map');
                }}
              />
            )}

            {activeTab === 'map' && (
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
            )}

            {activeTab === 'topology' && (
              <TopologyView
                manholes={manholes}
                pumpStations={pumpStations}
                pipes={pipes}
                graphEngine={graphEngine}
                onApplyTraceResult={setActiveTraceResult}
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
                onDeleteAsset={handleDeleteAsset}
              />
            )}

            {activeTab === 'inspections' && (
              <InspectionView
                inspections={inspections}
                onOpenNewModal={() => setIsNewInspectionModalOpen(true)}
                onEditInspection={(insp) => setInspectionToEdit(insp)}
                onDeleteInspection={handleDeleteInspection}
              />
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
          </main>
        </div>
      </div>

      {/* Modals */}
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
        initialMode={authModalMode}
      />
    </div>
  );
};

export default App;
