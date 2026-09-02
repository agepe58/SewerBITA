import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  QrCode,
  MapPin,
  GitBranch,
  Boxes,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset, AssetCondition } from '../../types/asset';
import { UserRole, hasPermission } from '../../types/rbac';

interface AssetRegistryProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  currentUserRole?: UserRole;
  onOpenAddModal: () => void;
  onOpenQrModal: (assetId: string) => void;
  onNavigateToMapWithAsset: (assetId: string) => void;
  onEditAsset: (asset: SewerAsset) => void;
  onDeleteAsset: (assetId: string) => void;
  isDarkMode?: boolean;
}

export const AssetRegistry: React.FC<AssetRegistryProps> = ({
  manholes = [],
  pumpStations = [],
  pipes = [],
  currentUserRole = 'Technician',
  onOpenAddModal,
  onOpenQrModal,
  onNavigateToMapWithAsset,
  onEditAsset,
  onDeleteAsset,
  isDarkMode = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua Tipe');
  const [selectedCondition, setSelectedCondition] = useState<string>('Semua Kondisi');
  const [selectedArea, setSelectedArea] = useState<string>('Semua Area');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua Status');

  // Filter Tabs
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'manhole' | 'pump_station' | 'pipe'>('all');

  const allAssets: SewerAsset[] = useMemo(() => {
    return [
      ...manholes.map(m => ({ ...m, type: 'manhole' as const })),
      ...pumpStations.map(ps => ({ ...ps, type: 'pump_station' as const })),
      ...pipes.map(p => ({ ...p, type: 'pipe' as const }))
    ];
  }, [manholes, pumpStations, pipes]);

  // Unique areas
  const areas = useMemo(() => {
    const set = new Set<string>();
    allAssets.forEach(a => { if (a.area) set.add(a.area); });
    return Array.from(set);
  }, [allAssets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return allAssets.filter(asset => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = (asset.assetCode || '').toLowerCase().includes(q);
        const matchesName = (asset.name || '').toLowerCase().includes(q);
        const matchesArea = (asset.area || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesArea) return false;
      }

      // Tab filter
      if (activeTabFilter !== 'all' && asset.type !== activeTabFilter) {
        return false;
      }

      // Dropdown Type
      if (selectedType !== 'Semua Tipe') {
        if (selectedType === 'Manhole' && asset.type !== 'manhole') return false;
        if (selectedType === 'Stasiun Pompa' && asset.type !== 'pump_station') return false;
        if (selectedType === 'Pipa' && asset.type !== 'pipe') return false;
      }

      // Condition
      if (selectedCondition !== 'Semua Kondisi' && asset.condition !== selectedCondition) {
        return false;
      }

      // Area
      if (selectedArea !== 'Semua Area' && asset.area !== selectedArea) {
        return false;
      }

      // Status
      if (selectedStatus !== 'Semua Status' && asset.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [allAssets, searchQuery, activeTabFilter, selectedType, selectedCondition, selectedArea, selectedStatus]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Tipe', 'Kode Aset', 'Nama Aset', 'Area', 'Kondisi', 'Status', 'Jatuh Tempo Inspeksi'];
    const rows = filteredAssets.map(a => [
      a.type,
      a.assetCode,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.area.replace(/"/g, '""')}"`,
      a.condition,
      a.status,
      a.nextInspectionDue || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SewerBITA_Assets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isDarkMode ? 'bg-[#111827] border border-slate-700/90 shadow-md shadow-black/30' : 'bg-white border border-slate-300 shadow-sm';
  const filterInputClass = `px-3 py-2 rounded-xl text-xs font-semibold border transition outline-none cursor-pointer ${
    isDarkMode
      ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus:border-blue-500'
      : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-blue-500'
  }`;

  return (
    <div
      className={`font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{ padding: '16px 16px 32px 16px' }}
    >
      
      {/* Workspace Header Bar Card */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-7 rounded-xl border border-slate-300 dark:border-slate-700/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ marginBottom: '14px' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-[#2563EB]">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Registri Aset Master</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Katalog lengkap dan manajemen data master aset Manhole, Stasiun Pompa, dan Pipa Jaringan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export .csv</span>
          </button>

          {hasPermission(currentUserRole, 'add_asset') && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className={`p-4 rounded-xl border space-y-4 shadow-xs ${cardBg}`} style={{ marginBottom: '14px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau nama aset..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-white focus:border-blue-500'
                  : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Tipe Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Tipe">Semua Tipe</option>
            <option value="Manhole">Manhole</option>
            <option value="Stasiun Pompa">Stasiun Pompa</option>
            <option value="Pipa">Pipa</option>
          </select>

          {/* Kondisi Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Kondisi">Semua Kondisi</option>
            <option value="Good">Good (Baik)</option>
            <option value="Fair">Fair (Cukup)</option>
            <option value="Warning">Warning (Waspada)</option>
            <option value="Critical">Critical (Kritis)</option>
          </select>

          {/* Area Dropdown */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Area">Semua Area</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={filterInputClass}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Active">Active (Aktif)</option>
            <option value="Inactive">Inactive (Non-Aktif)</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua Aset ({allAssets.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('manhole')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'manhole'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Manhole ({manholes.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('pump_station')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'pump_station'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Stasiun Pompa ({pumpStations.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('pipe')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTabFilter === 'pipe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipa Jaringan ({pipes.length})
          </button>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className={`rounded-xl border overflow-hidden shadow-sm ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800/90 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                <th className="py-3.5 px-4 font-bold">Kode Aset</th>
                <th className="py-3.5 px-4 font-bold">Nama Aset</th>
                <th className="py-3.5 px-4 font-bold">Tipe</th>
                <th className="py-3.5 px-4 font-bold">Area / Zona</th>
                <th className="py-3.5 px-4 font-bold">Kondisi</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Jatuh Tempo</th>
                <th className="py-3.5 px-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    Tidak ada aset yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  return (
                    <tr
                      key={asset.id}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Kode Aset */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 font-bold whitespace-nowrap">
                        {asset.assetCode}
                      </td>

                      {/* Nama Aset */}
                      <td className="py-3.5 px-4 font-extrabold text-white">
                        {asset.name}
                      </td>

                      {/* Tipe */}
                      <td className="py-3.5 px-4 text-slate-300 font-semibold text-[10px]">
                        {asset.type === 'pump_station' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold">Stasiun Pompa</span>
                        ) : asset.type === 'wtp' ? (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 font-extrabold border border-cyan-500/30">🏭 WTP Air Bersih</span>
                        ) : asset.type === 'water_accessory' ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-extrabold uppercase border border-indigo-500/30">🚰 {((asset as any).accessoryType || 'Accessory').replace('_', ' ')}</span>
                        ) : asset.type === 'grease_trap' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30">🍳 Grease Trap</span>
                        ) : asset.type === 'pipe' ? (
                          (asset as any).pipeCategory === 'transmission' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30">⚡ Transmisi (Force Main)</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 font-extrabold">💧 Pipa Gravitasi</span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-extrabold">Manhole</span>
                        )}
                      </td>

                      {/* Area */}
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {asset.area}
                      </td>

                      {/* Kondisi Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          asset.condition === 'Good'
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : asset.condition === 'Fair'
                            ? 'bg-sky-600/30 text-sky-400'
                            : asset.condition === 'Warning'
                            ? 'bg-amber-600/30 text-amber-400'
                            : 'bg-rose-600/30 text-rose-400'
                        }`}>
                          {asset.condition}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">
                          {asset.status}
                        </span>
                      </td>

                      {/* Jatuh Tempo */}
                      <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {asset.nextInspectionDue || '-'}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* QR Code */}
                          <button
                            onClick={() => onOpenQrModal(asset.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition cursor-pointer"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* GIS Map Target */}
                          <button
                            onClick={() => onNavigateToMapWithAsset(asset.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                            title="Lihat di Peta GIS"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          {hasPermission(currentUserRole, 'edit_asset') && (
                            <button
                              onClick={() => onEditAsset(asset)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                              title="Edit Aset"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {hasPermission(currentUserRole, 'delete_asset') && (
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus aset "${asset.name}" (${asset.assetCode})?`)) {
                                  onDeleteAsset(asset.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. TABLE FOOTER */}
        <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <div>
            Total {filteredAssets.length} aset - Halaman 1 dari 1
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-600 cursor-not-allowed text-xs font-bold"
            >
              Sebelumnya
            </button>
            <button
              disabled
              className="px-3 py-1.5 rounded-xl border border-slate-800 text-slate-600 cursor-not-allowed text-xs font-bold"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
