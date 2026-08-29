import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  FileText,
  Edit3,
  Trash2
} from 'lucide-react';
import { InspectionRecord } from '../../types/inspection';

interface InspectionViewProps {
  inspections: InspectionRecord[];
  onOpenNewModal: () => void;
  onEditInspection: (inspection: InspectionRecord) => void;
  onDeleteInspection: (inspectionId: string) => void;
}

export const InspectionView: React.FC<InspectionViewProps> = ({
  inspections,
  onOpenNewModal,
  onEditInspection,
  onDeleteInspection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [inspectionToDelete, setInspectionToDelete] = useState<InspectionRecord | null>(null);

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

  const handleConfirmDelete = () => {
    if (inspectionToDelete) {
      onDeleteInspection(inspectionToDelete.id);
      setInspectionToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-[#2563EB]" />
            <span>Manajemen Inspeksi & Riwayat Lapangan</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            Log inspeksi berkala, pelaporan masalah fisik (*issue tracking*), dan dokumentasi lapangan.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Buat Laporan Inspeksi Baru</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari ID Aset, Catatan, Petugas..."
            style={{ paddingLeft: '48px' }}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium rounded-full pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm rounded-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#2563EB] font-bold cursor-pointer"
          >
            <option value="all">Semua Hasil Kondisi</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Inspections Timeline List (Aesthetic Card Spacing) */}
      <div className="space-y-5 sm:space-y-6">
        {filteredInspections.map(insp => (
          <div
            key={insp.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono font-black text-[#2563EB] text-base">{insp.assetCode}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{insp.assetName}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-bold">
                  {insp.issueCategory}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono font-semibold">
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

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => onEditInspection(insp)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Edit Laporan Inspeksi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setInspectionToDelete(insp)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Hapus Laporan Inspeksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-semibold">{insp.notes}</p>

            {insp.photos && insp.photos.length > 0 && (
              <div className="flex gap-3 pt-1">
                {insp.photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Inspeksi Foto" className="w-36 h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs" />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#0284C7]" />
                <span>Petugas: <strong className="text-slate-900 dark:text-white font-bold">{insp.inspectorName}</strong> ({insp.inspectorRole})</span>
              </div>

              {insp.actionTaken && (
                <div className="text-[#2563EB] dark:text-blue-400 font-extrabold">Tindakan: {insp.actionTaken}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {inspectionToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1400] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 w-full max-w-md rounded-xl shadow-2xl p-6 text-slate-900 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span>Konfirmasi Hapus Inspeksi</span>
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan inspeksi untuk aset <strong className="text-slate-900 font-mono">{inspectionToDelete.assetCode}</strong> (Tanggal: {inspectionToDelete.inspectionDate})? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectionToDelete(null)}
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
