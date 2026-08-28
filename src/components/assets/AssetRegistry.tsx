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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1920px] mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Boxes className="w-6 h-6" />
            </div>
            <span>Master Registry Aset Jaringan Air Limbah</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            Katalog lengkap Manhole, Pipa Kolektor, dan Stasiun Pompa terpusat (*Single Source of Truth*).
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2.5 bg-[#2563EB] text-white font-black text-sm px-6 py-3.5 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25 hover:scale-105 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>+ Tambah Aset Baru</span>
        </button>
      </div>

      {/* Control Bar: Tabs, Search, Filter */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80 text-sm font-bold gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-5 py-2.5 rounded-full transition ${filterType === 'all' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'}`}
          >
            Semua Aset ({allAssets.length})
          </button>
          <button
            onClick={() => setFilterType('manhole')}
            className={`px-5 py-2.5 rounded-full transition ${filterType === 'manhole' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'}`}
          >
            Manhole ({manholes.length})
          </button>
          <button
            onClick={() => setFilterType('pipe')}
            className={`px-5 py-2.5 rounded-full transition ${filterType === 'pipe' ? 'bg-[#0284C7] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'}`}
          >
            Pipa ({pipes.length})
          </button>
          <button
            onClick={() => setFilterType('pump_station')}
            className={`px-5 py-2.5 rounded-full transition ${filterType === 'pump_station' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'}`}
          >
            Stasiun Pompa ({pumpStations.length})
          </button>
        </div>

        {/* Search & Condition Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Kode Asset, Nama..."
              className="w-full bg-slate-50 text-slate-900 text-sm font-semibold rounded-full pl-11 pr-4 py-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <select
            value={filterCondition}
            onChange={e => setFilterCondition(e.target.value)}
            className="bg-slate-50 text-slate-800 text-sm rounded-full px-5 py-3 border border-slate-200 focus:outline-none focus:border-[#2563EB] font-extrabold cursor-pointer"
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
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
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
                  <td className="p-5 font-mono font-black text-[#2563EB] text-base">{asset.assetCode}</td>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onNavigateToMapWithAsset(asset.id)}
                        className="p-2.5 bg-slate-100 hover:bg-blue-50 text-[#2563EB] rounded-full border border-slate-200 transition"
                        title="Lihat di Peta GIS"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenQrModal(asset.id)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-full border border-slate-200 transition"
                        title="Tampilkan QR Code"
                      >
                        <QrCode className="w-4 h-4" />
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
