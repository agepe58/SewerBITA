import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  FileText,
  Edit2,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { InspectionRecord } from '../../types/inspection';

interface InspectionViewProps {
  inspections: InspectionRecord[];
  onOpenNewModal: () => void;
  onOpenScheduleModal?: () => void;
  onEditInspection: (inspection: InspectionRecord) => void;
  onDeleteInspection: (inspectionId: string) => void;
  isDarkMode?: boolean;
}

export const InspectionView: React.FC<InspectionViewProps> = ({
  inspections = [],
  onOpenNewModal,
  onOpenScheduleModal,
  onEditInspection,
  onDeleteInspection,
  isDarkMode = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('all');

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      if (selectedCondition !== 'all' && insp.condition !== selectedCondition) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (insp.assetCode || '').toLowerCase().includes(q) ||
          (insp.inspectorName || '').toLowerCase().includes(q) ||
          (insp.notes || '').toLowerCase().includes(q) ||
          (insp.issueCategory || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inspections, searchQuery, selectedCondition]);

  const handleExportCsv = () => {
    const headers = ['ID Inspeksi', 'Kode Aset', 'Pemeriksa', 'Tanggal', 'Kondisi', 'Kategori Isu', 'Catatan', 'Tindakan'];
    const rows = filteredInspections.map(i => [
      i.id,
      i.assetCode,
      `"${(i.inspectorName || '').replace(/"/g, '""')}"`,
      i.inspectionDate,
      i.condition,
      `"${(i.issueCategory || '').replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
      `"${(i.actionTaken || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SewerBITA_Inspections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-white border-slate-200';

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export .xlsx / .csv</span>
        </button>

        {onOpenScheduleModal && (
          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-950/60 text-blue-400 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Jadwal Inspeksi Manhole</span>
          </button>
        )}

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Inspeksi Baru</span>
        </button>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className={`p-4 rounded-2xl border space-y-3 shadow-xs ${cardBg}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode aset, nama pemeriksa, atau catatan..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                isDarkMode
                  ? 'bg-slate-900/90 border-slate-800 text-white focus:border-blue-500'
                  : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Kondisi Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition outline-none cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-slate-200 focus:border-blue-500'
                : 'bg-slate-100 border-slate-200 text-slate-700 focus:border-blue-500'
            }`}
          >
            <option value="all">Semua Kondisi</option>
            <option value="Good">Good (Baik)</option>
            <option value="Fair">Fair (Cukup)</option>
            <option value="Warning">Warning (Waspada)</option>
            <option value="Critical">Critical (Kritis)</option>
          </select>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800/90 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                <th className="py-3.5 px-4 font-bold">Kode Aset</th>
                <th className="py-3.5 px-4 font-bold">Pemeriksa</th>
                <th className="py-3.5 px-4 font-bold">Tanggal</th>
                <th className="py-3.5 px-4 font-bold">Kondisi</th>
                <th className="py-3.5 px-4 font-bold">Kategori Masalah</th>
                <th className="py-3.5 px-4 font-bold">Catatan</th>
                <th className="py-3.5 px-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Belum ada data catatan inspeksi lapangan.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((insp) => {
                  return (
                    <tr
                      key={insp.id}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {insp.assetCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {insp.inspectorName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {insp.inspectionDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          insp.condition === 'Good'
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : insp.condition === 'Fair'
                            ? 'bg-sky-600/30 text-sky-400'
                            : insp.condition === 'Warning'
                            ? 'bg-amber-600/30 text-amber-400'
                            : 'bg-rose-600/30 text-rose-400'
                        }`}>
                          {insp.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {insp.issueCategory || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                        {insp.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditInspection(insp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                            title="Edit Inspeksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan inspeksi aset ${insp.assetCode}?`)) {
                                onDeleteInspection(insp.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Hapus Inspeksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
