import React from 'react';
import { ClipboardCheck, FileText, Calendar, Plus } from 'lucide-react';
import { DailyReport } from '../../types/workOrder';

interface DailyReportsViewProps {
  reports?: DailyReport[];
  isDarkMode?: boolean;
}

export const DailyReportsView: React.FC<DailyReportsViewProps> = ({
  reports = [],
  isDarkMode = true
}) => {
  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold">Laporan Harian Operasional & Pemeliharaan</h2>
          <p className="text-xs text-slate-400">Rekapitulasi log aktivitas dan checklist teknisi harian</p>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
              <th className="py-3.5 px-4 font-bold">Tanggal</th>
              <th className="py-3.5 px-4 font-bold">Teknisi</th>
              <th className="py-3.5 px-4 font-bold">Ringkasan Pekerjaan</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                  Belum ada laporan harian yang disubmit.
                </td>
              </tr>
            ) : (
              reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-300">{rep.date}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{rep.technicianName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{rep.workSummary}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      {rep.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
