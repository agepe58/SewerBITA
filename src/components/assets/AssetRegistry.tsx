import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  QrCode,
  MapPin,
  GitBranch,
  Boxes,
  Eye,
  FileSpreadsheet,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset, AssetCondition } from '../../types/asset';

interface AssetRegistryProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  onOpenAddModal: () => void;
  onOpenQrModal: (assetId: string) => void;
  onNavigateToMapWithAsset: (assetId: string) => void;
  onEditAsset: (asset: SewerAsset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetRegistry: React.FC<AssetRegistryProps> = ({
  manholes,
  pumpStations,
  pipes,
  onOpenAddModal,
  onOpenQrModal,
  onNavigateToMapWithAsset,
  onEditAsset,
  onDeleteAsset
}) => {
  const [filterType, setFilterType] = useState<'all' | 'manhole' | 'pipe' | 'pump_station'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [assetToDelete, setAssetToDelete] = useState<SewerAsset | null>(null);

  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];

  const filteredAssets = allAssets.filter(asset => {
    if (filterType !== 'all' && asset.type !== filterType) return false;
    if (filterCondition !== 'all' && asset.condition !== filterCondition) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.assetCode.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      onDeleteAsset(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1920px] mx-auto font-sans">
      {/* Workspace Header Bar Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-[#2563EB]">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Master Registry Aset Jaringan Air Limbah</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Katalog lengkap Manhole, Pipa Kolektor, dan Stasiun Pompa terpusat (*Single Source of Truth*).
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2.5 bg-[#2563EB] text-white font-black text-sm px-6 py-3.5 rounded-xl hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Tambah Aset Baru</span>
        </button>
      </div>

      {/* Control Bar: Tabs, Search, Filter */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap bg-slate-100/90 dark:bg-slate-800 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700 text-sm font-bold gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-5 py-2.5 rounded-full transition cursor-pointer ${filterType === 'all' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'}`}
          >
            Semua Aset ({allAssets.length})
          </button>
          <button
            onClick={() => setFilterType('manhole')}
            className={`px-5 py-2.5 rounded-full transition cursor-pointer ${filterType === 'manhole' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'}`}
          >
            Manhole ({manholes.length})
          </button>
          <button
            onClick={() => setFilterType('pipe')}
            className={`px-5 py-2.5 rounded-full transition cursor-pointer ${filterType === 'pipe' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'}`}
          >
            Pipa ({pipes.length})
          </button>
          <button
            onClick={() => setFilterType('pump_station')}
            className={`px-5 py-2.5 rounded-full transition cursor-pointer ${filterType === 'pump_station' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'}`}
          >
            Stasiun Pompa ({pumpStations.length})
          </button>
        </div>

        {/* Search & Condition Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Kode Asset, Nama..."
              style={{ paddingLeft: '48px' }}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold rounded-full pr-4 py-3 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={filterCondition}
            onChange={e => setFilterCondition(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-full px-5 py-3 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] font-extrabold cursor-pointer"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Assets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-5">Kode Aset (ID)</th>
                <th className="p-5">Nama Aset</th>
                <th className="p-5">Jenis Aset</th>
                <th className="p-5">Area / Zona</th>
                <th className="p-5">Spesifikasi Fisik</th>
                <th className="p-5">Kondisi Status</th>
                <th className="p-5">Jatuh Tempo Inspeksi</th>
                <th className="p-5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-5">
                    <div className="font-mono font-black text-[#2563EB] text-base">{asset.assetCode}</div>
                    {asset.type === 'manhole' && 'sequenceNumber' in asset && asset.sequenceNumber && (
                      <div className="text-[11px] text-[#0284C7] font-bold font-mono">
                        Urutan Flow #{asset.sequenceNumber}
                      </div>
                    )}
                  </td>
                  <td className="p-5 font-bold text-slate-900">{asset.name}</td>
                  <td className="p-5 capitalize">
                    <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold ${
                      asset.type === 'manhole' ? 'bg-blue-50 text-[#2563EB] border border-blue-100' :
                      asset.type === 'pipe' ? 'bg-sky-50 text-[#0284C7] border border-sky-100' : 'bg-emerald-50 text-[#059669] border border-emerald-100'
                    }`}>
                      {asset.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600 font-semibold">{asset.area}</td>
                  <td className="p-5 text-slate-700 font-mono font-semibold">
                    {asset.type === 'manhole' && `${asset.depthMeters}m | ⌀${asset.diameterMm}mm`}
                    {asset.type === 'pipe' && `${asset.lengthMeters}m | ⌀${asset.diameterMm}mm`}
                    {asset.type === 'pump_station' && `${asset.capacityLps} L/s | ${asset.activePumps} Pompa`}
                  </td>
                  <td className="p-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs ${
                      asset.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
                      asset.condition === 'Fair' ? 'bg-[#38BDF8] text-slate-900' :
                      asset.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="p-5 font-mono text-slate-600 font-bold">{asset.nextInspectionDue}</td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onNavigateToMapWithAsset(asset.id)}
                        className="p-2 bg-slate-100 hover:bg-blue-50 text-[#2563EB] rounded-lg border border-slate-200 transition"
                        title="Lihat di Peta GIS"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenQrModal(asset.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg border border-slate-200 transition"
                        title="Tampilkan QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditAsset(asset)}
                        className="p-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-lg border border-slate-200 transition"
                        title="Edit Asset"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setAssetToDelete(asset)}
                        className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg border border-slate-200 transition"
                        title="Hapus Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1400] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 w-full max-w-md rounded-xl shadow-2xl p-6 text-slate-900 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span>Konfirmasi Hapus Asset</span>
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus aset <strong className="text-slate-900 font-mono">{assetToDelete.assetCode} ({assetToDelete.name})</strong>? Tindakan ini akan menghapus aset secara permanen dari katalog master.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition shadow-md shadow-rose-500/20 text-sm"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
