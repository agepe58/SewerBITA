import React from 'react';
import {
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { WorkOrder, MaintenanceProject } from '../../types/workOrder';
import { UserProfile } from '../../types/rbac';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  workOrders: WorkOrder[];
  projects: MaintenanceProject[];
  users: UserProfile[];
  onNavigate: (tab: NavTab) => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workOrders = [],
  projects = [],
  users = [],
  onNavigate,
  isDarkMode = true
}) => {
  // 1. Calculate Real Metric Counts
  const totalWorkOrders = workOrders.length;
  const unfinishedWorkOrders = workOrders.filter(w => w.status !== 'Selesai' && w.status !== 'Ditutup').length;

  const now = new Date();
  const overdueWorkOrders = workOrders.filter(w => {
    if (w.status === 'Selesai' || w.status === 'Ditutup') return false;
    if (!w.dueDate) return false;
    return new Date(w.dueDate) < now;
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const closedLast7Days = workOrders.filter(w => {
    return (w.status === 'Selesai' || w.status === 'Ditutup') && new Date(w.createdAt) >= sevenDaysAgo;
  }).length;

  // Upcoming due in next 3 days
  const threeDaysAhead = new Date();
  threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);
  const upcomingDueWorkOrders = workOrders.filter(w => {
    if (w.status === 'Selesai' || w.status === 'Ditutup') return false;
    if (!w.dueDate) return false;
    const due = new Date(w.dueDate);
    return due >= now && due <= threeDaysAhead;
  });

  // Recent work orders (max 6)
  const recentWorkOrders = [...workOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Status counts
  const ditugaskanCount = workOrders.filter(w => w.status === 'Ditugaskan' || w.status === 'Baru' || w.status === 'Sedang Dikerjakan').length;
  const ditundaCount = workOrders.filter(w => w.status === 'Ditunda').length;
  const ditutupCount = workOrders.filter(w => w.status === 'Ditutup' || w.status === 'Selesai').length;

  // Primary active project
  const activeProject = projects[0] || {
    id: 'proj-01',
    title: 'Pintu air Balance Tank',
    status: 'Direncanakan',
    totalTasks: 0,
    completedTasks: 0
  };

  const projectProgress = activeProject.totalTasks > 0
    ? Math.round((activeProject.completedTasks / activeProject.totalTasks) * 100)
    : 0;

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800/90' : 'bg-white border-slate-200';

  const formatDueDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}.${mins}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP METRIC STAT CARDS (4 Columns matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Work Order */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{totalWorkOrders}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Total Work Order</div>
          </div>
        </div>

        {/* Card 2: Belum Selesai */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{unfinishedWorkOrders}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Belum Selesai</div>
          </div>
        </div>

        {/* Card 3: Melewati Batas Waktu */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-rose-400">{overdueWorkOrders.length}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Melewati Batas Waktu</div>
          </div>
        </div>

        {/* Card 4: Ditutup 7 Hari Terakhir */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{closedLast7Days}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Ditutup 7 Hari Terakhir</div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: TREN 7 HARI TERAKHIR & PRIORITAS AKTIF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tren 7 Hari Terakhir (2 Cols) */}
        <div className={`p-6 rounded-2xl border lg:col-span-2 shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4">Tren 7 Hari Terakhir</div>
          
          {/* SVG Curved Chart */}
          <div className="h-52 w-full flex flex-col justify-end pt-2">
            <svg viewBox="0 0 600 160" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="580" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#334155" />

              {/* Y Axis Labels */}
              <text x="25" y="24" fill="#64748B" fontSize="10" textAnchor="end">4</text>
              <text x="25" y="64" fill="#64748B" fontSize="10" textAnchor="end">3</text>
              <text x="25" y="104" fill="#64748B" fontSize="10" textAnchor="end">2</text>
              <text x="25" y="144" fill="#64748B" fontSize="10" textAnchor="end">0</text>

              {/* Curved Area Fill */}
              <path
                d="M 60 140 C 130 140, 180 140, 240 140 C 300 80, 340 30, 410 40 C 470 50, 480 135, 520 140 C 540 140, 560 120, 570 115 L 570 140 L 60 140 Z"
                fill="url(#trendGradient)"
              />

              {/* Curved Line Stroke */}
              <path
                d="M 60 140 C 130 140, 180 140, 240 140 C 300 80, 340 30, 410 40 C 470 50, 480 135, 520 140 C 540 140, 560 120, 570 115"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Highlight Point */}
              <circle cx="410" cy="40" r="4" fill="#38BDF8" className="animate-pulse" />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between px-6 pt-2 text-[11px] font-semibold text-slate-500">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>
          </div>
        </div>

        {/* Right: Prioritas Aktif Donut Chart (1 Col) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight">Prioritas Aktif</div>
          
          <div className="flex items-center justify-center my-auto py-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="4.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray="100, 100"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-xl font-black text-white">{totalWorkOrders}</div>
                <div className="text-[10px] font-bold text-slate-400">Aktif</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-2">
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Sedang ({totalWorkOrders})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER ROW: DISTRIBUSI STATUS, MELEWATI BATAS WAKTU, SEGERA JATUH TEMPO (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Col 1: Distribusi Status (Bar Chart) */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4">Distribusi Status</div>
          
          <div className="h-44 flex items-end justify-around px-2 pt-4 border-b border-slate-800">
            {/* Bar 1: Ditugaskan */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-sky-400">{ditugaskanCount}</div>
              <div
                className="w-12 bg-sky-500 rounded-t-lg transition-all"
                style={{ height: `${Math.max(16, (ditugaskanCount / Math.max(1, totalWorkOrders)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Ditugaskan</span>
            </div>

            {/* Bar 2: Ditunda */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-amber-400">{ditundaCount}</div>
              <div
                className="w-12 bg-amber-500/40 rounded-t-lg transition-all"
                style={{ height: `${Math.max(8, (ditundaCount / Math.max(1, totalWorkOrders)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Ditunda</span>
            </div>

            {/* Bar 3: Ditutup */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-emerald-400">{ditutupCount}</div>
              <div
                className="w-12 bg-emerald-500/40 rounded-t-lg transition-all"
                style={{ height: `${Math.max(8, (ditutupCount / Math.max(1, totalWorkOrders)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Ditutup</span>
            </div>
          </div>
        </div>

        {/* Col 2: Pengingat: Melewati Batas Waktu */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4 flex items-center justify-between">
            <span>Pengingat: Melewati Batas Waktu</span>
            {overdueWorkOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black">
                {overdueWorkOrders.length}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {overdueWorkOrders.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Tidak ada tiket yang melewati batas waktu.
              </div>
            ) : (
              overdueWorkOrders.slice(0, 3).map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.id} • {item.status} • jatuh tempo {formatDueDate(item.dueDate)}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-[10px] font-bold shrink-0">
                    {item.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Pengingat: Segera Jatuh Tempo */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4">Pengingat: Segera Jatuh Tempo</div>

          <div className="space-y-3">
            {upcomingDueWorkOrders.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Tidak ada tiket yang segera jatuh tempo.
              </div>
            ) : (
              upcomingDueWorkOrders.slice(0, 3).map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.id} • {item.status} • {formatDueDate(item.dueDate)}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-[10px] font-bold shrink-0">
                    {item.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: PEKERJAAN TERBARU, BEBAN KERJA TEKNISI, AKTIVITAS TERBARU (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Col 1: Pekerjaan Terbaru */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold tracking-tight">Pekerjaan Terbaru</span>
            <button
              onClick={() => onNavigate('work_orders')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentWorkOrders.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Belum ada work order yang dibuat.
              </div>
            ) : (
              recentWorkOrders.slice(0, 6).map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.id} • {item.status}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/25 text-blue-400 text-[10px] font-bold shrink-0">
                    {item.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: Beban Kerja Teknisi */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4">Beban Kerja Teknisi</div>

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Belum ada data teknisi.
              </div>
            ) : (
              users.slice(0, 5).map(u => {
                const assignedCount = workOrders.filter(w => w.picUserId === u.id || (w.picName && w.picName === u.name)).length;
                return (
                  <div key={u.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white truncate">{u.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0">{assignedCount} aktif</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, assignedCount * 25)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Col 3: Aktivitas Terbaru */}
        <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight mb-4">Aktivitas Terbaru</div>
          <div className="text-xs text-slate-500 py-10 text-center font-medium">
            Belum ada aktivitas.
          </div>
        </div>
      </div>

      {/* 5. FOOTER CARD: PROGRES PROYEK */}
      <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
        <div className="text-sm font-extrabold tracking-tight mb-4">Progres Proyek</div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-w-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-sm text-white">{activeProject.title}</div>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold">
              {activeProject.status}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${projectProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>{activeProject.completedTasks}/{activeProject.totalTasks} tugas</span>
              <span>{projectProgress}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
