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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#2DD4BF]" />
            <span>Manajemen Inspeksi & Riwayat Lapangan</span>
          </h1>
          <p className="text-xs text-slate-400">
            Log inspeksi berkala, pelaporan masalah fisik (*issue tracking*), dan dokumentasi lapangan.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center space-x-2 bg-[#2DD4BF] text-black font-bold text-xs px-4 py-2.5 rounded-full hover:bg-[#5EEAD4] transition shadow-[0_0_15px_rgba(45,212,191,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Laporan Inspeksi Baru</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#141824] p-4 rounded-2xl border border-[#232A3B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari ID Aset, Catatan, Petugas..."
            className="w-full bg-[#080A0E] text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 border border-[#232A3B] focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            className="bg-[#080A0E] text-slate-200 text-xs rounded-xl px-3 py-2 border border-[#232A3B] focus:outline-none focus:border-[#2DD4BF]"
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
            className="bg-[#141824] p-5 rounded-2xl border border-[#232A3B] hover:border-slate-500 transition space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#232A3B] pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-extrabold text-[#2DD4BF] text-sm">{insp.assetCode}</span>
                <span className="font-bold text-white text-xs">{insp.assetName}</span>
                <span className="text-[10px] bg-[#1A1F2C] px-2 py-0.5 rounded text-slate-400 border border-[#232A3B]">
                  {insp.issueCategory}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {insp.inspectionDate}
                </span>

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  insp.condition === 'Good' ? 'bg-[#10B981]/20 text-[#10B981]' :
                  insp.condition === 'Fair' ? 'bg-[#06B6D4]/20 text-[#06B6D4]' :
                  insp.condition === 'Warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                }`}>
                  {insp.condition}
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">{insp.notes}</p>

            {insp.photos && insp.photos.length > 0 && (
              <div className="flex gap-3 pt-1">
                {insp.photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Inspeksi Foto" className="w-32 h-24 object-cover rounded-xl border border-[#232A3B]" />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#232A3B]">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Petugas: <strong className="text-slate-200">{insp.inspectorName}</strong> ({insp.inspectorRole})</span>
              </div>

              {insp.actionTaken && (
                <div className="text-[#2DD4BF]">Tindakan: {insp.actionTaken}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
