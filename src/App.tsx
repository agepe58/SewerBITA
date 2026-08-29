import React, { useState, useMemo } from 'react';
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
  const [assetToEdit, setAssetToEdit] = useState<SewerAsset | null>(null);
  const [inspectionToEdit, setInspectionToEdit] = useState<InspectionRecord | null>(null);

  // Flow Tracing State
  const [activeTraceResult, setActiveTraceResult] = useState<NetworkTraceResult | null>(null);

  // Graph Engine Instance
  const graphEngine = useMemo(() => {
    return new NetworkGraphEngine(manholes, pumpStations, pipes);
  }, [manholes, pumpStations, pipes]);

  // Handlers for data modification
  const handleAddManhole = (
    newMh: Omit<ManholeAsset, 'id'>,
    intermediateInfo?: { upstreamId: string; downstreamId: string }
  ) => {
    const newMhId = `mh-${Date.now()}`;
    const createdMh: ManholeAsset = {
      ...newMh,
      id: newMhId
    };

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
    setPipes(prev => [created, ...prev]);
  };

  const handleAddPumpStation = (newPs: Omit<PumpStationAsset, 'id'>) => {
    const created: PumpStationAsset = {
      ...newPs,
      id: `ps-${Date.now()}`
    };
    setPumpStations(prev => [created, ...prev]);
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

  // Handlers for asset modification (Edit & Delete)
  const handleEditManhole = (updated: ManholeAsset) => {
    setManholes(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleEditPipe = (updated: PipeAsset) => {
    setPipes(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleEditPumpStation = (updated: PumpStationAsset) => {
    setPumpStations(prev => prev.map(ps => ps.id === updated.id ? updated : ps));
  };

  const handleDeleteAsset = (assetId: string) => {
    setManholes(prev => prev.filter(m => m.id !== assetId));
    setPumpStations(prev => prev.filter(p => p.id !== assetId));
    setPipes(prev => prev.filter(p => p.id !== assetId && p.fromAssetId !== assetId && p.toAssetId !== assetId));
  };

  const handleSaveEditedInspection = (updated: InspectionRecord) => {
    setInspections(prev => prev.map(i => i.id === updated.id ? updated : i));

    // Synchronize asset condition if changed
    setManholes(prev => prev.map(m => m.id === updated.assetId ? { ...m, condition: updated.condition } : m));
    setPipes(prev => prev.map(p => p.id === updated.assetId ? { ...p, condition: updated.condition } : p));
  };

  const handleDeleteInspection = (inspectionId: string) => {
    setInspections(prev => prev.filter(i => i.id !== inspectionId));
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
    <div className="min-h-screen w-full bg-[#F4F5F7] p-2 sm:p-3 lg:p-4 flex flex-col justify-center items-center font-sans text-slate-900 selection:bg-[#2563EB] selection:text-white">
      {/* Ramp HQ / Notion Clean Workspace Shell */}
      <div className="w-full max-w-[1920px] bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex min-h-[96vh] h-full">
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
    </div>
  );
};

export default App;
