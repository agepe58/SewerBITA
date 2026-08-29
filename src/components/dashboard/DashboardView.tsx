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
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  UserCheck,
  TrendingUp,
  ExternalLink
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
  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];
  const totalAssets = allAssets.length;

  // 1. PRD 7.1 Statistik Aset Calculations
  const totalManholes = manholes.length;
  const totalPipes = pipes.length;
  const totalPumpStations = pumpStations.length;

  const totalActive = allAssets.filter(a => a.status === 'Active').length;
  const needingInspection = allAssets.filter(a => a.status === 'Pending Inspection' || a.condition === 'Warning' || a.condition === 'Critical').length;
  
  const criticalAssets = allAssets.filter(a => a.condition === 'Critical');
  const warningAssets = allAssets.filter(a => a.condition === 'Warning');
  const totalProblematic = criticalAssets.length + warningAssets.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueInspectionCount = allAssets.filter(a => a.nextInspectionDue < todayStr).length;

  // Condition breakdown
  const goodCount = allAssets.filter(a => a.condition === 'Good').length;
  const fairCount = allAssets.filter(a => a.condition === 'Fair').length;

  // 2. PRD 7.1 Distribusi Aset Berdasarkan Area
  const areaMap = new Map<string, number>();
  allAssets.forEach(a => {
    areaMap.set(a.area, (areaMap.get(a.area) || 0) + 1);
  });
  const areaDistribution = Array.from(areaMap.entries()).map(([areaName, count]) => ({
    areaName,
    count,
    percentage: Math.round((count / totalAssets) * 100)
  }));

  // 3. PRD 7.1 Aktivitas Inspeksi Terbaru (Top 5)
  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
    .slice(0, 5);

  // 4. PRD 7.1 Daftar Aset Bermasalah
  const problematicAssets = allAssets.filter(a => a.condition === 'Critical' || a.condition === 'Warning');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1920px] mx-auto text-slate-900 font-sans">
      {/* Workspace Header & Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 p-2.5 flex items-center justify-center border border-slate-200 shadow-2xs shrink-0">
              <img src="/favicon.jpg" alt="PT. BITA Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
                <span className="bg-[#2563EB]/10 text-[#2563EB] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                  PRD Section 7.1 Compliant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Monitoring Aset, Topologi Aliran, dan Riwayat Inspeksi Lapangan PT. Bukit Indah Tirta Alam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={onOpenAddAssetModal}
              className="flex items-center gap-2 bg-[#2563EB] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Aset Baru</span>
            </button>

            <button
              onClick={onOpenNewInspectionModal}
              className="flex items-center gap-2 bg-[#18181B] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Input Inspeksi</span>
            </button>
          </div>
        </div>

        {/* Quick View Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5 overflow-x-auto text-xs font-bold">
          <button onClick={() => onNavigate('map')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 hover:bg-blue-100 transition">
            <MapPin className="w-4 h-4" />
            <span>Peta GIS Interaktif →</span>
          </button>

          <button onClick={() => onNavigate('topology')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition">
            <GitBranch className="w-4 h-4" />
            <span>Flow Topology Solver →</span>
          </button>

          <button onClick={() => onNavigate('assets')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200/70 transition">
            <Boxes className="w-4 h-4" />
            <span>Katalog Master Aset →</span>
          </button>
        </div>
      </div>

      {/* PRD SECTION 7.1.1 — 7 STATISTIK ASET (7 KPI Metric Cards Grid) */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          7.1.1 Ringkasan Statistik Aset (PRD Standard)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* 1. Total Manhole */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Manhole</span>
              <MapPin className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">{totalManholes}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Struktur Titik Node</div>
          </div>

          {/* 2. Total Pipa */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Pipa</span>
              <GitBranch className="w-4 h-4 text-[#0284C7]" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">{totalPipes}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Segmen Pipa Kolektor</div>
          </div>

          {/* 3. Total Stasiun Pompa */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Stasiun Pompa</span>
              <Zap className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">{totalPumpStations}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Outlet Pompa Utama</div>
          </div>

          {/* 4. Total Aset Aktif */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Aset Aktif</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600 font-mono">{totalActive}</div>
            <div className="text-[11px] text-slate-400 font-semibold">{((totalActive / totalAssets) * 100).toFixed(0)}% Beroperasi Normal</div>
          </div>

          {/* 5. Aset Membutuhkan Inspeksi */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Butuh Inspeksi</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600 font-mono">{needingInspection}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Pending / Risk Review</div>
          </div>

          {/* 6. Aset Bermasalah */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700">
              <span>Aset Bermasalah</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600 font-mono">{totalProblematic}</div>
            <div className="text-[11px] text-slate-400 font-semibold">{criticalAssets.length} Critical • {warningAssets.length} Warning</div>
          </div>

          {/* 7. Aset Overdue Inspection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs card-hover space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Overdue Inspection</span>
              <AlertCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-purple-600 font-mono">{overdueInspectionCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold">Jatuh Tempo Terlewati</div>
          </div>
        </div>
      </div>

      {/* PRD SECTION 7.1.2 — VISUALISASI & DASHBOARD FEEDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 Cols): Kondisi Aset & Distribusi Per Area */}
        <div className="lg:col-span-7 space-y-6">
          {/* PRD Visualisasi 1: Ringkasan Kondisi Aset */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-[#2563EB]" />
                <span>Ringkasan Kondisi Kelayakan Aset</span>
              </h2>
              <span className="text-xs text-slate-500 font-bold font-mono">Total {totalAssets} Unit</span>
            </div>

            {/* Progress Bar Breakdown */}
            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
              <div style={{ width: `${(goodCount / totalAssets) * 100}%` }} className="bg-[#4ADE80] h-full rounded-l-full" title={`Good: ${goodCount}`}></div>
              <div style={{ width: `${(fairCount / totalAssets) * 100}%` }} className="bg-[#38BDF8] h-full" title={`Fair: ${fairCount}`}></div>
              <div style={{ width: `${(warningAssets.length / totalAssets) * 100}%` }} className="bg-[#FACC15] h-full" title={`Warning: ${warningAssets.length}`}></div>
              <div style={{ width: `${(criticalAssets.length / totalAssets) * 100}%` }} className="bg-[#F87171] h-full rounded-r-full" title={`Critical: ${criticalAssets.length}`}></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                  <span>Good</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></span>
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{goodCount}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{((goodCount / totalAssets) * 100).toFixed(0)}% dari total</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                  <span>Fair</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                </div>
                <div className="text-2xl font-black text-sky-600 font-mono mt-1">{fairCount}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{((fairCount / totalAssets) * 100).toFixed(0)}% dari total</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                  <span>Warning</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
                </div>
                <div className="text-2xl font-black text-amber-600 font-mono mt-1">{warningAssets.length}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{((warningAssets.length / totalAssets) * 100).toFixed(0)}% dari total</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
                  <span>Critical</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span>
                </div>
                <div className="text-2xl font-black text-rose-600 font-mono mt-1">{criticalAssets.length}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{((criticalAssets.length / totalAssets) * 100).toFixed(0)}% dari total</div>
              </div>
            </div>
          </div>

          {/* PRD Visualisasi 2: Distribusi Aset Berdasarkan Area */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-[#0284C7]" />
                <span>Distribusi Aset Berdasarkan Area / Zona</span>
              </h2>
              <span className="text-xs text-slate-500 font-bold">{areaDistribution.length} Zona Terdaftar</span>
            </div>

            <div className="space-y-3">
              {areaDistribution.map(item => (
                <div key={item.areaName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                    <span>{item.areaName}</span>
                    <span className="font-mono text-slate-600">{item.count} Aset ({item.percentage}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#0284C7] rounded-full transition-all"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Aktivitas Inspeksi Terbaru & Daftar Aset Bermasalah */}
        <div className="lg:col-span-5 space-y-6">
          {/* PRD Visualisasi 4: Daftar Aset Bermasalah */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                <span>Daftar Aset Bermasalah (Critical / Warning)</span>
              </h2>
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                {totalProblematic} Lokasi
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {problematicAssets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Tidak ada aset bermasalah saat ini.</p>
              ) : (
                problematicAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-between transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#2563EB] text-xs">{asset.assetCode}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
                          asset.condition === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {asset.condition}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{asset.name}</div>
                      <div className="text-[11px] text-slate-500">{asset.area}</div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('map');
                        onSelectAssetForMap(asset.id);
                      }}
                      className="text-xs bg-white text-[#2563EB] font-bold px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-blue-50 transition shrink-0 flex items-center gap-1"
                    >
                      <span>Peta</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PRD Visualisasi 3: Aktivitas Inspeksi Terbaru */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="w-4.5 h-4.5 text-[#059669]" />
                <span>Aktivitas Inspeksi Terbaru</span>
              </h2>
              <button onClick={() => onNavigate('inspections')} className="text-xs text-[#2563EB] font-bold hover:underline">
                Lihat Semua →
              </button>
            </div>

            <div className="space-y-3">
              {recentInspections.map(insp => (
                <div key={insp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{insp.assetName}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                      insp.condition === 'Good' ? 'bg-emerald-100 text-emerald-800' :
                      insp.condition === 'Fair' ? 'bg-sky-100 text-sky-800' :
                      insp.condition === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {insp.condition}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{insp.notes}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <UserCheck className="w-3 h-3 text-[#2563EB]" />
                      <span>{insp.inspectorName}</span>
                    </span>
                    <span className="font-mono">{insp.inspectionDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
