import React from 'react';
import {
  Boxes,
  MapPin,
  GitBranch,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle,
  Activity,
  ArrowRight,
  Droplets,
  Zap,
  Calendar,
  Layers
} from 'lucide-react';
import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  onNavigate: (tab: NavTab) => void;
  isDarkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  manholes = [],
  pumpStations = [],
  pipes = [],
  inspections = [],
  onNavigate,
  isDarkMode = true
}) => {
  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];
  const totalAssets = allAssets.length;

  const totalActive = allAssets.filter(a => a.status === 'Active').length;
  const totalCriticalOrWarning = allAssets.filter(a => a.condition === 'Critical' || a.condition === 'Warning').length;
  const totalInspections = inspections.length;

  // Condition breakdown
  const goodCount = allAssets.filter(a => a.condition === 'Good').length;
  const fairCount = allAssets.filter(a => a.condition === 'Fair').length;
  const warningCount = allAssets.filter(a => a.condition === 'Warning').length;
  const criticalCount = allAssets.filter(a => a.condition === 'Critical').length;

  // Overdue Inspections
  const now = new Date();
  const overdueAssets = allAssets.filter(a => {
    if (!a.nextInspectionDue) return false;
    return new Date(a.nextInspectionDue) < now;
  });

  // Upcoming Due Inspections (next 14 days)
  const fourteenDaysAhead = new Date();
  fourteenDaysAhead.setDate(fourteenDaysAhead.getDate() + 14);
  const upcomingDueAssets = allAssets.filter(a => {
    if (!a.nextInspectionDue) return false;
    const due = new Date(a.nextInspectionDue);
    return due >= now && due <= fourteenDaysAhead;
  });

  // Recent assets/inspections
  const recentInspections = [...inspections].slice(0, 6);

  const cardBg = isDarkMode 
    ? 'bg-[#111827] border border-slate-700/90 shadow-xl shadow-black/40 hover:border-blue-500/60 transition-all duration-200' 
    : 'bg-white border border-slate-300 shadow-md hover:border-blue-400 transition-all duration-200';

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{ padding: '16px 16px 32px 16px' }}
    >
      
      {/* 1. TOP METRIC STAT CARDS (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" style={{ marginBottom: '14px' }}>
        {/* Card 1: Total Aset Jaringan */}
        <div
          onClick={() => onNavigate('assets')}
          className={`p-5 rounded-lg border flex items-center gap-3.5 transition-all shadow-md cursor-pointer ${cardBg}`}
        >
          <div className="w-11 h-11 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Boxes className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">{totalAssets}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Total Aset Jaringan</div>
          </div>
        </div>

        {/* Card 2: Aset Aktif / Normal */}
        <div
          onClick={() => onNavigate('assets')}
          className={`p-5 rounded-lg border flex items-center gap-3.5 transition-all shadow-md cursor-pointer ${cardBg}`}
        >
          <div className="w-11 h-11 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">{totalActive}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Aset Aktif / Normal</div>
          </div>
        </div>

        {/* Card 3: Kondisi Kritis / Anomali */}
        <div
          onClick={() => onNavigate('assets')}
          className={`p-5 rounded-lg border flex items-center gap-3.5 transition-all shadow-md cursor-pointer ${cardBg}`}
        >
          <div className="w-11 h-11 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-rose-400">{totalCriticalOrWarning}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Perhatian / Kritis</div>
          </div>
        </div>

        {/* Card 4: Inspeksi Terselesaikan */}
        <div
          onClick={() => onNavigate('inspections')}
          className={`p-5 rounded-lg border flex items-center gap-3.5 transition-all shadow-md cursor-pointer ${cardBg}`}
        >
          <div className="w-11 h-11 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <ClipboardCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">{totalInspections}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Inspeksi Selesai</div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: TREN 7 HARI & DISTRIBUSI KONDISI ASET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5" style={{ marginBottom: '14px' }}>
        {/* Left: Tren 7 Hari Terakhir (Curved Area Chart) */}
        <div className={`p-5 rounded-lg border lg:col-span-2 shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80 flex items-center justify-between">
            <span>Tren Pemantauan & Inspeksi 7 Hari Terakhir</span>
            <span className="text-xs font-semibold text-blue-400">7 Hari</span>
          </div>
          
          <div className="h-52 w-full flex flex-col justify-end pt-2">
            <svg viewBox="0 0 600 160" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="sewerTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="580" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#334155" />

              {/* Y Axis Labels */}
              <text x="25" y="24" fill="#64748B" fontSize="10" textAnchor="end">10</text>
              <text x="25" y="64" fill="#64748B" fontSize="10" textAnchor="end">7</text>
              <text x="25" y="104" fill="#64748B" fontSize="10" textAnchor="end">3</text>
              <text x="25" y="144" fill="#64748B" fontSize="10" textAnchor="end">0</text>

              {/* Curved Area Fill */}
              <path
                d="M 60 140 C 130 140, 180 140, 240 140 C 300 80, 340 30, 410 40 C 470 50, 480 135, 520 140 C 540 140, 560 120, 570 115 L 570 140 L 60 140 Z"
                fill="url(#sewerTrendGradient)"
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

        {/* Right: Prioritas / Distribusi Kondisi Aset (Donut Chart) */}
        <div className={`p-5 rounded-lg border flex flex-col justify-between shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-2 border-b border-slate-800/80">Kondisi Aset Jaringan</div>
          
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
                <div className="text-xl font-black text-white">{totalAssets}</div>
                <div className="text-[10px] font-bold text-slate-400">Total Aset</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Good ({goodCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>Fair ({fairCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Warning ({warningCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Critical ({criticalCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER ROW: DISTRIBUSI TIPE ASET & PENGINGAT JATUH TEMPO (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5" style={{ marginBottom: '14px' }}>
        
        {/* Col 1: Distribusi Tipe Aset (Bar Chart) */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80">Distribusi Tipe Aset</div>
          
          <div className="h-44 flex items-end justify-around px-2 pt-4 border-b border-slate-800">
            {/* Bar 1: Manhole */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-sky-400">{manholes.length}</div>
              <div
                className="w-12 bg-sky-500 rounded-t-lg transition-all"
                style={{ height: `${Math.max(16, (manholes.length / Math.max(1, totalAssets)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Manhole</span>
            </div>

            {/* Bar 2: Stasiun Pompa */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-amber-400">{pumpStations.length}</div>
              <div
                className="w-12 bg-amber-500 rounded-t-lg transition-all"
                style={{ height: `${Math.max(16, (pumpStations.length / Math.max(1, totalAssets)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Pompa</span>
            </div>

            {/* Bar 3: Pipa */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-emerald-400">{pipes.length}</div>
              <div
                className="w-12 bg-emerald-500 rounded-t-lg transition-all"
                style={{ height: `${Math.max(16, (pipes.length / Math.max(1, totalAssets)) * 100)}px` }}
              ></div>
              <span className="text-[10px] font-semibold text-slate-400 mt-2">Pipa</span>
            </div>
          </div>
        </div>

        {/* Col 2: Pengingat: Melewati Batas Waktu */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80 flex items-center justify-between">
            <span>Pengingat: Melewati Batas Waktu</span>
            {overdueAssets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black">
                {overdueAssets.length}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {overdueAssets.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Semua aset dalam jadwal inspeksi yang baik.
              </div>
            ) : (
              overdueAssets.slice(0, 3).map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{a.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {a.assetCode} • {a.area} • jatuh tempo {formatDate(a.nextInspectionDue)}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600/30 text-rose-400 text-[10px] font-bold shrink-0">
                    {a.condition}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Pengingat: Segera Jatuh Tempo */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80">Pengingat: Segera Jatuh Tempo</div>

          <div className="space-y-3">
            {upcomingDueAssets.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Tidak ada aset yang jatuh tempo dalam 14 hari ke depan.
              </div>
            ) : (
              upcomingDueAssets.slice(0, 3).map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{a.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {a.assetCode} • {a.area} • {formatDate(a.nextInspectionDue)}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-400 text-[10px] font-bold shrink-0">
                    {a.condition}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: RIWAYAT INSPEKSI TERBARU & STATUS STASIUN POMPA (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5" style={{ marginBottom: '14px' }}>
        
        {/* Col 1: Riwayat Inspeksi Terbaru */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
            <span className="text-sm font-extrabold tracking-tight">Inspeksi Lapangan Terbaru</span>
            <button
              onClick={() => onNavigate('inspections')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentInspections.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Belum ada catatan inspeksi.
              </div>
            ) : (
              recentInspections.slice(0, 5).map(insp => (
                <div key={insp.id} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate text-white">{insp.assetCode} - {insp.inspectorName}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {insp.inspectionDate} • {insp.issueCategory}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/25 text-blue-400 text-[10px] font-bold shrink-0">
                    {insp.condition}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: Stasiun Pompa Operasional */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80">Status Stasiun Pompa</div>

          <div className="space-y-4">
            {pumpStations.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center font-medium">
                Belum ada data stasiun pompa.
              </div>
            ) : (
              pumpStations.slice(0, 4).map(ps => {
                const total = ps.pumpCount || 1;
                const active = ps.activePumps || 0;
                const percent = Math.round((active / Math.max(1, total)) * 100);
                return (
                  <div key={ps.id} className="space-y-1.5 pb-2 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white truncate">{ps.name}</span>
                      <span className="text-sky-400 text-[11px] shrink-0">{active}/{total} Pompa Aktif</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Kapasitas: {ps.capacityLps || 0} L/s • {ps.powerSource || 'PLN'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Col 3: Aktivitas Sistem Terbaru */}
        <div className={`p-5 rounded-lg border shadow-md ${cardBg}`}>
          <div className="text-sm font-extrabold tracking-tight pb-2.5 mb-3 border-b border-slate-800/80">Aktivitas Sistem Terbaru</div>
          <div className="text-xs text-slate-500 py-10 text-center font-medium">
            Sistem beroperasi normal (PostGIS database online).
          </div>
        </div>
      </div>

    </div>
  );
};
