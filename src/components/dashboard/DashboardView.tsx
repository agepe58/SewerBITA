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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1920px] mx-auto text-slate-900 font-sans">
      {/* Hero Overview Banner */}
      <div className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#0284C7] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient Glow Graphic Shapes */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-blue-100 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Wastewater Asset Management • PT. Bukit Indah Tirta Alam</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Executive Overview & Monitoring
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-3xl leading-relaxed font-medium">
            Monitoring kondisi Manhole, Pipa Kolektor, dan Stasiun Pompa secara *real-time*. Lakukan penelusuran graf (*flow tracing*) dan pantau integritas jaringan air limbah.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenAddAssetModal}
            className="flex items-center gap-2.5 bg-white text-[#2563EB] font-black text-sm px-6 py-3.5 rounded-full hover:bg-blue-50 transition shadow-lg hover:scale-105"
          >
            <Plus className="w-5 h-5 text-[#2563EB]" />
            <span>+ Tambah Aset Baru</span>
          </button>

          <button
            onClick={onOpenNewInspectionModal}
            className="flex items-center gap-2.5 bg-blue-900/40 backdrop-blur-md text-white font-extrabold text-sm px-5.5 py-3.5 rounded-full hover:bg-blue-900/60 transition border border-white/30 shadow-xs"
          >
            <ClipboardCheck className="w-5 h-5 text-sky-300" />
            <span>Buat Inspeksi</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards Grid (Responsive 1 -> 2 -> 4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Assets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="h-1.5 w-full bg-[#2563EB] absolute top-0 left-0"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">Total Aset Terdaftar</span>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">{totalAssets}</span>
              <span className="text-xs font-black text-slate-400 font-mono">UNIT ASET</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between font-semibold">
            <span>{totalManholes} Manhole • {totalPipes} Pipa</span>
            <span className="text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full font-extrabold border border-blue-100">100% GIS</span>
          </div>
        </div>

        {/* Card 2: Pipe Length */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="h-1.5 w-full bg-[#0284C7] absolute top-0 left-0"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">Panjang Jaringan Pipa</span>
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284C7] shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">{totalPipeLengthKm}</span>
              <span className="text-xs font-black text-slate-400 font-mono">KILOMETER</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between font-semibold">
            <span>Terbagi dalam 3 Zona GIS</span>
            <span className="text-[#0284C7] bg-sky-50 px-2.5 py-0.5 rounded-full font-extrabold border border-sky-100">Flow OK</span>
          </div>
        </div>

        {/* Card 3: Pump Stations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="h-1.5 w-full bg-[#059669] absolute top-0 left-0"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">Stasiun Pompa Utama</span>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">{totalPumpStations}</span>
              <span className="text-xs font-black text-slate-400 font-mono">STASIUN</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between font-semibold">
            <span>Kapasitas: 670 L/s</span>
            <span className="text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-100">Semua Aktif</span>
          </div>
        </div>

        {/* Card 4: Critical Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="h-1.5 w-full bg-[#E11D48] absolute top-0 left-0"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-rose-600 uppercase tracking-wider">Aset Critical / Warning</span>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-rose-600 font-mono tracking-tight">{totalCritical + warningCount}</span>
              <span className="text-xs font-black text-rose-400 font-mono">LOKASI</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 flex items-center justify-between font-semibold">
            <span>{totalCritical} Critical • {warningCount} Warning</span>
            <button onClick={() => onNavigate('map')} className="text-[#2563EB] font-extrabold hover:underline flex items-center gap-1">
              <span>Buka Peta</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts & Overview Row (Responsive 1 -> 12 Columns Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trend Graph & Operational Shortcuts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Distribution Chart Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Distribusi & Tren Kondisi Aset</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Persentase kelayakan fisik Manhole dan Pipa Jaringan</p>
              </div>
              <button onClick={() => onNavigate('assets')} className="text-xs sm:text-sm text-[#2563EB] font-bold hover:underline self-start sm:self-auto">
                Lihat Katalog Aset →
              </button>
            </div>

            {/* Visual Progress Bar Breakdown */}
            <div className="space-y-4 pt-1">
              <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex p-1 border border-slate-200 shadow-inner">
                <div style={{ width: `${(goodCount / totalAssets) * 100}%` }} className="bg-[#4ADE80] h-full rounded-l-full transition-all duration-500" title={`Good: ${goodCount}`}></div>
                <div style={{ width: `${(fairCount / totalAssets) * 100}%` }} className="bg-[#38BDF8] h-full transition-all duration-500" title={`Fair: ${fairCount}`}></div>
                <div style={{ width: `${(warningCount / totalAssets) * 100}%` }} className="bg-[#FACC15] h-full transition-all duration-500" title={`Warning: ${warningCount}`}></div>
                <div style={{ width: `${(totalCritical / totalAssets) * 100}%` }} className="bg-[#F87171] h-full rounded-r-full transition-all duration-500" title={`Critical: ${totalCritical}`}></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Good</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">{goodCount}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{((goodCount / totalAssets) * 100).toFixed(0)}% dari total</div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Fair</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                  </div>
                  <div className="text-2xl font-black text-sky-600 font-mono">{fairCount}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{((fairCount / totalAssets) * 100).toFixed(0)}% dari total</div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Warning</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 font-mono">{warningCount}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{((warningCount / totalAssets) * 100).toFixed(0)}% dari total</div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Critical</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span>
                  </div>
                  <div className="text-2xl font-black text-rose-600 font-mono">{totalCritical}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{((totalCritical / totalAssets) * 100).toFixed(0)}% dari total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900">Pintasan Fitur Utama</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => onNavigate('map')}
                className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200/90 p-5 rounded-2xl text-left space-y-2.5 transition card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                  <MapPin className="w-5 h-5 group-hover:scale-110 transition" />
                </div>
                <div className="text-sm font-extrabold text-slate-900">Peta GIS</div>
                <div className="text-xs text-slate-500 font-semibold">Interactive GIS Map</div>
              </button>

              <button
                onClick={() => onNavigate('topology')}
                className="bg-slate-50 hover:bg-sky-50/60 border border-slate-200/90 p-5 rounded-2xl text-left space-y-2.5 transition card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <GitBranch className="w-5 h-5 group-hover:scale-110 transition" />
                </div>
                <div className="text-sm font-extrabold text-slate-900">Flow Tracing</div>
                <div className="text-xs text-slate-500 font-semibold">DAG Flow Solver</div>
              </button>

              <button
                onClick={onOpenQrScanner}
                className="bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/90 p-5 rounded-2xl text-left space-y-2.5 transition card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center">
                  <QrCode className="w-5 h-5 group-hover:scale-110 transition" />
                </div>
                <div className="text-sm font-extrabold text-slate-900">Scan QR Tag</div>
                <div className="text-xs text-slate-500 font-semibold">Field Mobile Scanner</div>
              </button>

              <button
                onClick={() => onNavigate('data')}
                className="bg-slate-50 hover:bg-amber-50/60 border border-slate-200/90 p-5 rounded-2xl text-left space-y-2.5 transition card-hover group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition" />
                </div>
                <div className="text-sm font-extrabold text-slate-900">Import / Export</div>
                <div className="text-xs text-slate-500 font-semibold">CSV & Excel Tools</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Status Banner & Table Feed */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-2.5 relative z-10">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Integritas Jaringan Optimal</span>
                <span className="text-xl">✨</span>
              </h2>
              <p className="text-sm text-blue-100 max-w-xs leading-relaxed font-medium">
                Seluruh stasiun pompa utama aktif dan 85% jaringan pipa berada dalam kondisi prima.
              </p>
              <div className="pt-2 text-xs font-mono font-bold flex gap-4 text-blue-100">
                <span>Good: <strong className="text-white">{goodCount}</strong></span>
                <span>Fair: <strong className="text-white">{fairCount}</strong></span>
                <span>Warnings: <strong className="text-white">{warningCount}</strong></span>
              </div>
            </div>
            <Droplets className="w-28 h-28 text-white/10 absolute -right-4 -bottom-4 pointer-events-none" />
          </div>

          {/* Urgent Critical Assets Table Feed */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
                <AlertTriangle className="w-5.5 h-5.5 text-rose-500" />
                <span>Aset Bermasalah & Perhatian</span>
              </h2>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                {totalCritical} Critical
              </span>
            </div>

            <div className="space-y-3.5">
              {manholes.filter(m => m.condition === 'Critical' || m.condition === 'Warning').map((mh) => (
                <div
                  key={mh.id}
                  className="p-4 bg-slate-50/80 hover:bg-slate-100/90 rounded-2xl border border-slate-200/70 flex items-center justify-between transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base font-mono text-[#2563EB]">{mh.assetCode}</span>
                      <span className={`text-xs px-3 py-0.5 rounded-full font-bold shadow-2xs ${
                        mh.condition === 'Critical' ? 'bg-[#F87171] text-white' : 'bg-[#FDE047] text-slate-900'
                      }`}>
                        {mh.condition}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{mh.name}</div>
                    <div className="text-xs text-slate-500 font-semibold">{mh.area}</div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('map');
                      onSelectAssetForMap(mh.id);
                    }}
                    className="text-xs bg-white text-[#2563EB] font-extrabold px-4 py-2 rounded-full border border-slate-200 shadow-xs hover:bg-blue-50 transition shrink-0"
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
