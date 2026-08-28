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
  Trash2
} from 'lucide-react';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset, AssetCondition } from '../../types/asset';

interface AssetRegistryProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  onOpenAddModal: () => void;
  onOpenQrModal: (assetId: string) => void;
  onNavigateToMapWithAsset: (assetId: string) => void;
}

export const AssetRegistry: React.FC<AssetRegistryProps> = ({
  manholes,
  pumpStations,
  pipes,
  onOpenAddModal,
  onOpenQrModal,
  onNavigateToMapWithAsset
}) => {
  const [filterType, setFilterType] = useState<'all' | 'manhole' | 'pipe' | 'pump_station'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');

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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-[#2563EB]" />
            <span>Master Registry Aset Jaringan Air Limbah</span>
          </h1>
          <p className="text-xs text-slate-500">
            Katalog lengkap Manhole, Pipa Kolektor, dan Stasiun Pompa terpusat (*Single Source of Truth*).
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Aset Baru</span>
        </button>
      </div>

      {/* Control Bar: Tabs, Search, Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/80 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full font-bold transition ${filterType === 'all' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Semua Aset ({allAssets.length})
          </button>
          <button
            onClick={() => setFilterType('manhole')}
            className={`px-4 py-1.5 rounded-full font-bold transition ${filterType === 'manhole' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Manhole ({manholes.length})
          </button>
          <button
            onClick={() => setFilterType('pipe')}
            className={`px-4 py-1.5 rounded-full font-bold transition ${filterType === 'pipe' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pipa ({pipes.length})
          </button>
          <button
            onClick={() => setFilterType('pump_station')}
            className={`px-4 py-1.5 rounded-full font-bold transition ${filterType === 'pump_station' ? 'bg-[#16A34A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Stasiun Pompa ({pumpStations.length})
          </button>
        </div>

        {/* Search & Condition Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari ID, Nama Aset..."
              className="bg-slate-50 text-slate-900 text-xs rounded-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={filterCondition}
            onChange={e => setFilterCondition(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs rounded-full px-3.5 py-2 border border-slate-200 focus:outline-none focus:border-[#2563EB] font-medium"
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
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="p-4">Kode Aset (ID)</th>
                <th className="p-4">Nama Aset</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Area / Zona</th>
                <th className="p-4">Spesifikasi Singkat</th>
                <th className="p-4">Kondisi</th>
                <th className="p-4">Jatuh Tempo Inspeksi</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-mono font-bold text-[#2563EB]">{asset.assetCode}</td>
                  <td className="p-4 font-semibold text-slate-900">{asset.name}</td>
                  <td className="p-4 capitalize">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      asset.type === 'manhole' ? 'bg-blue-50 text-[#2563EB] border border-blue-100' :
                      asset.type === 'pipe' ? 'bg-sky-50 text-[#0284C7] border border-sky-100' : 'bg-emerald-50 text-[#16A34A] border border-emerald-100'
                    }`}>
                      {asset.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{asset.area}</td>
                  <td className="p-4 text-slate-600 font-mono">
                    {asset.type === 'manhole' && `${asset.depthMeters}m | ⌀${asset.diameterMm}mm`}
                    {asset.type === 'pipe' && `${asset.lengthMeters}m | ⌀${asset.diameterMm}mm`}
                    {asset.type === 'pump_station' && `${asset.capacityLps} L/s | ${asset.activePumps} Pompa`}
                  </td>
                  <td className="p-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-2xs ${
                      asset.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
                      asset.condition === 'Fair' ? 'bg-[#38BDF8] text-slate-900' :
                      asset.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-500">{asset.nextInspectionDue}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onNavigateToMapWithAsset(asset.id)}
                        className="p-2 bg-slate-100 hover:bg-blue-50 text-[#2563EB] rounded-full border border-slate-200 transition"
                        title="Lihat di Peta GIS"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenQrModal(asset.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-full border border-slate-200 transition"
                        title="Tampilkan QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
