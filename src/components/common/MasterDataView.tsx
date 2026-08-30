import React, { useState } from 'react';
import { Boxes, ClipboardCheck, FileSpreadsheet } from 'lucide-react';
import { AssetRegistry } from '../assets/AssetRegistry';
import { InspectionView } from '../inspections/InspectionView';
import { ImportExportView } from '../data/ImportExportView';
import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';
import { UserProfile } from '../../types/rbac';

interface MasterDataViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  currentUser: UserProfile;
  onOpenAddAssetModal: () => void;
  onEditAsset: (asset: SewerAsset) => void;
  onDeleteAsset: (id: string, type: 'manhole' | 'pumpStation' | 'pipe') => void;
  onOpenNewInspectionModal: () => void;
  onEditInspection: (inspection: InspectionRecord) => void;
  onDeleteInspection: (id: string) => void;
  onGenerateQr: (assetId: string) => void;
  onSelectAssetForMap: (assetId: string) => void;
  onImportManholes: (newManholes: ManholeAsset[]) => void;
  isDarkMode?: boolean;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections,
  currentUser: _currentUser,
  onOpenAddAssetModal,
  onEditAsset,
  onDeleteAsset,
  onOpenNewInspectionModal,
  onEditInspection,
  onDeleteInspection,
  onGenerateQr,
  onSelectAssetForMap,
  onImportManholes,
  isDarkMode = true
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'inspections' | 'import_export'>('assets');

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  const handleDeleteAssetById = (assetId: string) => {
    if (manholes.some(m => m.id === assetId)) {
      onDeleteAsset(assetId, 'manhole');
    } else if (pumpStations.some(ps => ps.id === assetId)) {
      onDeleteAsset(assetId, 'pumpStation');
    } else {
      onDeleteAsset(assetId, 'pipe');
    }
  };

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sub Navigation Bar */}
      <div className={`p-2 rounded-2xl border flex items-center gap-2 max-w-lg shadow-xs ${cardBg}`}>
        <button
          onClick={() => setActiveSubTab('assets')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'assets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Master Aset</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inspections')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'inspections'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Inspeksi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('import_export')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'import_export'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Import / Export</span>
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'assets' && (
        <AssetRegistry
          manholes={manholes}
          pumpStations={pumpStations}
          pipes={pipes}
          onOpenAddModal={onOpenAddAssetModal}
          onOpenQrModal={onGenerateQr}
          onNavigateToMapWithAsset={onSelectAssetForMap}
          onEditAsset={onEditAsset}
          onDeleteAsset={handleDeleteAssetById}
        />
      )}

      {activeSubTab === 'inspections' && (
        <InspectionView
          inspections={inspections}
          onOpenNewModal={onOpenNewInspectionModal}
          onEditInspection={onEditInspection}
          onDeleteInspection={onDeleteInspection}
        />
      )}

      {activeSubTab === 'import_export' && (
        <ImportExportView
          manholes={manholes}
          pumpStations={pumpStations}
          pipes={pipes}
          inspections={inspections}
          onBatchImportManholes={onImportManholes}
        />
      )}
    </div>
  );
};
