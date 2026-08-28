import React from 'react';
import {
  Boxes,
  MapPin,
  GitBranch,
  AlertTriangle,
  ClipboardCheck,
  Zap,
  ArrowUpRight,
  Droplets,
  Activity,
  Plus,
  QrCode,
  FileSpreadsheet,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ManholeAsset, PumpStationAsset, PipeAsset, AssetSummaryStats } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';
import { NavTab } from '../common/Sidebar';

interface DashboardViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  onNavigate: (tab: NavTab) => void;
  onOpenAddAssetModal: () => void;
  onOpenQrScanner: () => void;
  onOpenNewInspectionModal: () => void;
  onSelectAssetForMap: (assetId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections,
  onNavigate,
  onOpenAddAssetModal,
  onOpenQrScanner,
  onOpenNewInspectionModal,
  onSelectAssetForMap
}) => {
  // Compute Stats
  const totalManholes = manholes.length;
  const totalPipes = pipes.length;
  const totalPumpStations = pumpStations.length;
  const totalAssets = totalManholes + totalPipes + totalPumpStations;

  const criticalManholes = manholes.filter(m => m.condition === 'Critical');
  const criticalPipes = pipes.filter(p => p.condition === 'Critical');
  const totalCritical = criticalManholes.length + criticalPipes.length;

  const warningCount = manholes.filter(m => m.condition === 'Warning').length + pipes.filter(p => p.condition === 'Warning').length;
  const goodCount = manholes.filter(m => m.condition === 'Good').length + pipes.filter(p => p.condition === 'Good').length;
  const fairCount = manholes.filter(m => m.condition === 'Fair').length + pipes.filter(p => p.condition === 'Fair').length;

  const totalPipeLengthKm = (pipes.reduce((sum, p) => sum + p.lengthMeters, 0) / 1000).toFixed(2);

  const overdueCount = manholes.filter(m => new Date(m.nextInspectionDue) < new Date()).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Hero Overview Banner (Aoxa Style) */}
      <div className="bg-gradient-to-r from-[#EBF5FF] via-[#E8F1FF] to-[#DDF0FF] rounded-3xl p-6 sm:p-8 border border-blue-100/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Ambient Shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-1.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">SewerBITA Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Lacak status aset, panjang jaringan pipa kolektor, dan riwayat inspeksi air limbah terkini secara *real-time*.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenAddAssetModal}
            className="flex items-center gap-2 bg-[#2563EB] text-white font-bold text-xs px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Aset Baru</span>
          </button>

          <button
            onClick={onOpenNewInspectionModal}
            className="flex items-center gap-2 bg-white text-slate-700 font-bold text-xs px-5 py-3 rounded-full hover:bg-slate-50 transition border border-slate-200 shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4 text-[#0284C7]" />
            <span>Buat Inspeksi</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Grid (Aoxa Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="text-xs font-semibold text-slate-500">Total Aset Terdaftar</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{totalAssets}</div>
            <span className="text-xs font-bold text-slate-400 font-mono">ASET</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{totalManholes} Manhole • {totalPipes} Pipa</span>
            <span className="text-[#2563EB] font-bold">100% GIS</span>
          </div>
        </div>

        {/* Card 2: Pipe Length */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="text-xs font-semibold text-slate-500">Panjang Jaringan Pipa</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{totalPipeLengthKm}</div>
            <span className="text-xs font-bold text-slate-400 font-mono">KM</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Terbagi dalam 3 Zone</span>
            <span className="text-[#0284C7] font-bold">Flow OK</span>
          </div>
        </div>

        {/* Card 3: Pump Stations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="text-xs font-semibold text-slate-500">Stasiun Pompa Utama</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{totalPumpStations}</div>
            <span className="text-xs font-bold text-slate-400 font-mono">UNIT</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Kapasitas: 670 L/s</span>
            <span className="text-[#16A34A] font-bold">Semua Aktif</span>
          </div>
        </div>

        {/* Card 4: Critical Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="text-xs font-semibold text-rose-500">Aset Critical / Warning</div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-rose-600 font-mono tracking-tight">{totalCritical + warningCount}</div>
            <span className="text-xs font-bold text-rose-400 font-mono">ALERT</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{totalCritical} Critical • {warningCount} Warning</span>
            <button onClick={() => onNavigate('map')} className="text-[#2563EB] font-bold hover:underline">
              Buka Peta →
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts & Overview Row (Aoxa Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trend Graph & Distribution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trend Chart Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Distribusi & Tren Kondisi Aset</h2>
                <p className="text-xs text-slate-400">Persentase kelayakan Manhole dan Pipa Jaringan</p>
              </div>
              <button onClick={() => onNavigate('assets')} className="text-xs text-[#2563EB] font-bold hover:underline">
                Lihat Katalog Aset →
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-3 pt-2">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
                <div style={{ width: `${(goodCount / totalAssets) * 100}%` }} className="bg-[#4ADE80] h-full rounded-l-full" title={`Good: ${goodCount}`}></div>
                <div style={{ width: `${(fairCount / totalAssets) * 100}%` }} className="bg-[#38BDF8] h-full" title={`Fair: ${fairCount}`}></div>
                <div style={{ width: `${(warningCount / totalAssets) * 100}%` }} className="bg-[#FACC15] h-full" title={`Warning: ${warningCount}`}></div>
                <div style={{ width: `${(totalCritical / totalAssets) * 100}%` }} className="bg-[#F87171] h-full rounded-r-full" title={`Critical: ${totalCritical}`}></div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">Good</div>
                  <div className="text-base font-bold text-emerald-600 font-mono">{goodCount}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">Fair</div>
                  <div className="text-base font-bold text-sky-600 font-mono">{fairCount}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">Warning</div>
                  <div className="text-base font-bold text-amber-600 font-mono">{warningCount}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">Critical</div>
                  <div className="text-base font-bold text-rose-600 font-mono">{totalCritical}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Shortcut Operasional</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('map')}
                className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-2 transition group"
              >
                <MapPin className="w-5 h-5 text-[#2563EB] group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-slate-900">Peta GIS</div>
                <div className="text-[10px] text-slate-400">Interactive GIS Map</div>
              </button>

              <button
                onClick={() => onNavigate('topology')}
                className="bg-slate-50 hover:bg-sky-50/50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-2 transition group"
              >
                <GitBranch className="w-5 h-5 text-[#0284C7] group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-slate-900">Flow Tracing</div>
                <div className="text-[10px] text-slate-400">DAG Flow Solver</div>
              </button>

              <button
                onClick={onOpenQrScanner}
                className="bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-2 transition group"
              >
                <QrCode className="w-5 h-5 text-[#16A34A] group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-slate-900">Scan QR Tag</div>
                <div className="text-[10px] text-slate-400">Field Mobile Scanner</div>
              </button>

              <button
                onClick={() => onNavigate('data')}
                className="bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-2 transition group"
              >
                <FileSpreadsheet className="w-5 h-5 text-[#CA8A04] group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-slate-900">Import / Export</div>
                <div className="text-[10px] text-slate-400">CSV & Excel Tools</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status Banner & Table Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Banner (Aoxa Great Jobs Style) */}
          <div className="bg-gradient-to-br from-blue-500 to-[#1D4ED8] text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex items-center justify-between">
            <div className="space-y-2 relative z-10">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Network Optimal!</span>
                <span className="text-lg">🥳</span>
              </h2>
              <p className="text-xs text-blue-100 max-w-xs leading-relaxed">
                Seluruh stasiun pompa utama dan 85% jaringan dalam kondisi normal.
              </p>
              <div className="pt-2 text-xs font-mono font-bold flex gap-4 text-blue-100">
                <span>Good: <strong>{goodCount}</strong></span>
                <span>Fair: <strong>{fairCount}</strong></span>
                <span>Warnings: <strong>{warningCount}</strong></span>
              </div>
            </div>
            <Droplets className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4 pointer-events-none" />
          </div>

          {/* Urgent Critical Assets Table Feed (Aoxa Table Style) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Aset Bermasalah & Perhatian</span>
              </h2>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                {totalCritical} Critical
              </span>
            </div>

            <div className="space-y-2.5">
              {manholes.filter(m => m.condition === 'Critical' || m.condition === 'Warning').map((mh) => (
                <div
                  key={mh.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-slate-900">{mh.assetCode}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
                        mh.condition === 'Critical' ? 'bg-[#F87171] text-white' : 'bg-[#FDE047] text-slate-900'
                      }`}>
                        {mh.condition}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{mh.name}</div>
                    <div className="text-[10px] text-slate-400">{mh.area}</div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('map');
                      onSelectAssetForMap(mh.id);
                    }}
                    className="text-xs bg-white text-[#2563EB] font-bold px-3 py-1.5 rounded-full border border-slate-200 shadow-xs hover:bg-blue-50 transition shrink-0"
                  >
                    Peta →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
