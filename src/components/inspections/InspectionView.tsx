import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { InspectionRecord } from '../../types/inspection';

interface InspectionViewProps {
  inspections: InspectionRecord[];
  onOpenNewModal: () => void;
}

export const InspectionView: React.FC<InspectionViewProps> = ({
  inspections,
  onOpenNewModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const filteredInspections = inspections.filter(insp => {
    if (selectedCondition !== 'all' && insp.condition !== selectedCondition) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        insp.assetCode.toLowerCase().includes(q) ||
        insp.assetName.toLowerCase().includes(q) ||
        insp.inspectorName.toLowerCase().includes(q) ||
        insp.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-[#2563EB]" />
            <span>Manajemen Inspeksi & Riwayat Lapangan</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            Log inspeksi berkala, pelaporan masalah fisik (*issue tracking*), dan dokumentasi lapangan.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>+ Buat Laporan Inspeksi Baru</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari ID Aset, Catatan, Petugas..."
            className="w-full bg-slate-50 text-slate-900 text-sm font-medium rounded-full pl-12 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            className="bg-slate-50 text-slate-800 text-sm rounded-full px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-[#2563EB] font-bold"
          >
            <option value="all">Semua Hasil Kondisi</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Inspections Timeline List */}
      <div className="space-y-4">
        {filteredInspections.map(insp => (
          <div
            key={insp.id}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition space-y-3.5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-[#2563EB] text-base">{insp.assetCode}</span>
                <span className="font-bold text-slate-900 text-sm">{insp.assetName}</span>
                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 border border-slate-200/80 font-bold">
                  {insp.issueCategory}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-mono font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {insp.inspectionDate}
                </span>

                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-2xs ${
                  insp.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
                  insp.condition === 'Fair' ? 'bg-[#38BDF8] text-slate-900' :
                  insp.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
                }`}>
                  {insp.condition}
                </span>
              </div>
            </div>

            <p className="text-slate-800 text-sm leading-relaxed font-semibold">{insp.notes}</p>

            {insp.photos && insp.photos.length > 0 && (
              <div className="flex gap-3 pt-1">
                {insp.photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Inspeksi Foto" className="w-36 h-28 object-cover rounded-2xl border border-slate-200 shadow-xs" />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0284C7]" />
                <span>Petugas: <strong className="text-slate-900 font-bold">{insp.inspectorName}</strong> ({insp.inspectorRole})</span>
              </div>

              {insp.actionTaken && (
                <div className="text-[#2563EB] font-extrabold">Tindakan: {insp.actionTaken}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
