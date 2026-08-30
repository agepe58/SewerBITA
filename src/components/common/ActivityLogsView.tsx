import React from 'react';
import { Activity, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { ActivityLog } from '../../types/workOrder';

interface ActivityLogsViewProps {
  logs?: ActivityLog[];
  isDarkMode?: boolean;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  logs = [],
  isDarkMode = true
}) => {
  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div>
        <h2 className="text-base font-extrabold">Log Aktivitas & Audit Trail</h2>
        <p className="text-xs text-slate-400">Riwayat lengkap aktivitas penugasan, perubahan status, dan pemeliharaan</p>
      </div>

      <div className={`rounded-2xl border p-6 space-y-4 shadow-sm ${cardBg}`}>
        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            Belum ada log aktivitas yang tercatat.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      <span className="text-blue-400 font-black">{log.user}</span> {log.action} <span className="text-slate-200 font-bold">{log.entity}</span>
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
