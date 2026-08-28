import React, { useState, useMemo } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { NetworkMap } from './components/map/NetworkMap';
import { TopologyView } from './components/topology/TopologyView';
import { AssetRegistry } from './components/assets/AssetRegistry';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { InspectionView } from './components/inspections/InspectionView';
import { NewInspectionModal } from './components/inspections/NewInspectionModal';
import { QrCodeModal } from './components/qr/QrCodeModal';
import { QrScannerModal } from './components/qr/QrScannerModal';
import { ImportExportView } from './components/data/ImportExportView';
import { UserManagementView } from './components/rbac/UserManagementView';

import { INITIAL_MANHOLES, INITIAL_PUMP_STATIONS, INITIAL_PIPES, INITIAL_INSPECTIONS, INITIAL_USERS } from './services/mockData';
import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from './types/asset';
import { InspectionRecord } from './types/inspection';
import { UserRole, UserProfile } from './types/rbac';
import { NetworkGraphEngine } from './services/graphEngine';
import { NetworkTraceResult } from './types/topology';

export const App: React.FC = () => {
  // App view state
  const [isLandingPage, setIsLandingPage] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Master Data States
  const [manholes, setManholes] = useState<ManholeAsset[]>(INITIAL_MANHOLES);
  const [pumpStations, setPumpStations] = useState<PumpStationAsset[]>(INITIAL_PUMP_STATIONS);
  const [pipes, setPipes] = useState<PipeAsset[]>(INITIAL_PIPES);
  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  const [users] = useState<UserProfile[]>(INITIAL_USERS);

  // Active User & Role
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  // Modals state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  const [isQrScannerModalOpen, setIsQrScannerModalOpen] = useState(false);
  const [activeQrAssetId, setActiveQrAssetId] = useState<string | null>(null);
  const [selectedAssetIdForMap, setSelectedAssetIdForMap] = useState<string | null>(null);

  // Flow Tracing State
  const [activeTraceResult, setActiveTraceResult] = useState<NetworkTraceResult | null>(null);

  // Graph Engine Instance
  const graphEngine = useMemo(() => {
    return new NetworkGraphEngine(manholes, pumpStations, pipes);
  }, [manholes, pumpStations, pipes]);

  // Handlers for data modification
  const handleAddManhole = (newMh: Omit<ManholeAsset, 'id'>) => {
    const created: ManholeAsset = {
      ...newMh,
      id: `mh-${Date.now()}`
    };
    setManholes(prev => [created, ...prev]);
  };

  const handleAddPipe = (newPipe: Omit<PipeAsset, 'id'>) => {
    const created: PipeAsset = {
      ...newPipe,
      id: `p-${Date.now()}`
    };
    setPipes(prev => [created, ...prev]);
  };

  const handleAddInspection = (newInsp: Omit<InspectionRecord, 'id'>) => {
    const created: InspectionRecord = {
      ...newInsp,
      id: `insp-${Date.now()}`
    };
    setInspections(prev => [created, ...prev]);

    // Update asset condition state if necessary
    setManholes(prev => prev.map(m => m.id === newInsp.assetId ? { ...m, condition: newInsp.condition } : m));
    setPipes(prev => prev.map(p => p.id === newInsp.assetId ? { ...p, condition: newInsp.condition } : p));
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
    return <LandingPage onEnterDashboard={() => setIsLandingPage(false)} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#D9E4FF] via-[#EBF1FF] to-[#D2E2FF] p-2 sm:p-4 lg:p-6 flex flex-col justify-center items-center font-sans text-slate-900 selection:bg-[#2563EB] selection:text-white">
      {/* Floating Card Container Shell (Aoxa Aesthetics) */}
      <div className="w-full max-w-[1920px] bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl shadow-blue-900/15 border border-white/80 overflow-hidden flex min-h-[95vh] h-full">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUserRole={currentUser.role}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
          {/* Top Header */}
          <Header
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onOpenQrScanner={() => setIsQrScannerModalOpen(true)}
            onSearchAsset={handleSearchAsset}
            onToggleLandingPage={() => setIsLandingPage(true)}
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
              />
            )}

            {activeTab === 'inspections' && (
              <InspectionView
                inspections={inspections}
                onOpenNewModal={() => setIsNewInspectionModalOpen(true)}
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
        existingManholes={manholes}
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
    </div>
  );
};

export default App;
