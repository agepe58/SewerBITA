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

  // Helper for safe percentage calculation
  const getPercentage = (count: number) => totalAssets > 0 ? ((count / totalAssets) * 100).toFixed(0) : '0';

  // 2. PRD 7.1 Distribusi Aset Berdasarkan Area
  const areaMap = new Map<string, number>();
  allAssets.forEach(a => {
    areaMap.set(a.area, (areaMap.get(a.area) || 0) + 1);
  });
  const areaDistribution = Array.from(areaMap.entries()).map(([areaName, count]) => ({
    areaName,
    count,
    percentage: totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0
  }));

  // 3. PRD 7.1 Aktivitas Inspeksi Terbaru (Top 5)
  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
    .slice(0, 5);

  // 4. PRD 7.1 Daftar Aset Bermasalah
  const problematicAssets = allAssets.filter(a => a.condition === 'Critical' || a.condition === 'Warning');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full max-w-[1920px] mx-auto font-sans min-h-[calc(100vh-70px)] flex flex-col">
      {/* Workspace Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Monitoring Aset, Topologi Aliran, dan Riwayat Inspeksi Lapangan PT. Bukit Indah Tirta Alam
        </p>
      </div>

      {/* Ringkasan Statistik Aset (7 KPI Metric Cards Grid) */}
      <div className="space-y-4 mb-2">
        <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1">
          Ringkasan Statistik Aset
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-6">
          {/* 1. Total Manhole */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Total Manhole</span>
              <MapPin className="w-4.5 h-4.5 text-[#2563EB]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{totalManholes}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">Struktur Titik Node</div>
          </div>

          {/* 2. Total Pipa */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Total Pipa</span>
              <GitBranch className="w-4.5 h-4.5 text-[#0284C7]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{totalPipes}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">Segmen Pipa Kolektor</div>
          </div>

          {/* 3. Total Stasiun Pompa */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Stasiun Pompa</span>
              <Zap className="w-4.5 h-4.5 text-[#059669]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{totalPumpStations}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">Outlet Pompa Utama</div>
          </div>

          {/* 4. Total Aset Aktif */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>Aset Aktif</span>
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{totalActive}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">{getPercentage(totalActive)}% Normal</div>
          </div>

          {/* 5. Aset Membutuhkan Inspeksi */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <span>Butuh Inspeksi</span>
              <Clock className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">{needingInspection}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">Pending / Review</div>
          </div>

          {/* 6. Aset Bermasalah */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <span>Bermasalah</span>
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">{totalProblematic}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">{criticalAssets.length} Critical • {warningAssets.length} Warning</div>
          </div>

          {/* 7. Aset Overdue Inspection */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 card-hover flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              <span>Overdue</span>
              <AlertCircle className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">{overdueInspectionCount}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate">Jatuh Tempo Lewat</div>
          </div>
        </div>
      </div>

      {/* PRD SECTION 7.1.2 — VISUALISASI & DASHBOARD FEEDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 flex-1">
        {/* LEFT COLUMN (7 Cols): Kondisi Aset & Daftar Aset Bermasalah */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 flex flex-col">
          {/* PRD Visualisasi 1: Ringkasan Kondisi Aset */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2563EB]" />
                  <span>Ringkasan Kondisi Kelayakan Aset</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Proporsi fisik jaringan berdasarkan hasil inspeksi teknis</p>
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-extrabold font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                Total {totalAssets} Unit
              </span>
            </div>

            {/* Progress Bar Breakdown */}
            <div className="space-y-3">
              <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-inner">
                <div style={{ width: `${totalAssets > 0 ? (goodCount / totalAssets) * 100 : 0}%` }} className="bg-[#4ADE80] h-full rounded-l-full" title={`Good: ${goodCount}`}></div>
                <div style={{ width: `${totalAssets > 0 ? (fairCount / totalAssets) * 100 : 0}%` }} className="bg-[#38BDF8] h-full" title={`Fair: ${fairCount}`}></div>
                <div style={{ width: `${totalAssets > 0 ? (warningAssets.length / totalAssets) * 100 : 0}%` }} className="bg-[#FACC15] h-full" title={`Warning: ${warningAssets.length}`}></div>
                <div style={{ width: `${totalAssets > 0 ? (criticalAssets.length / totalAssets) * 100 : 0}%` }} className="bg-[#F87171] h-full rounded-r-full" title={`Critical: ${criticalAssets.length}`}></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold flex items-center justify-between">
                    <span>Good (Baik)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{goodCount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{getPercentage(goodCount)}% dari total</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold flex items-center justify-between">
                    <span>Fair (Cukup)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                  </div>
                  <div className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1">{fairCount}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{getPercentage(fairCount)}% dari total</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold flex items-center justify-between">
                    <span>Warning (Waspada)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]"></span>
                  </div>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{warningAssets.length}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{getPercentage(warningAssets.length)}% dari total</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold flex items-center justify-between">
                    <span>Critical (Bahaya)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]"></span>
                  </div>
                  <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">{criticalAssets.length}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{getPercentage(criticalAssets.length)}% dari total</div>
                </div>
              </div>
            </div>
          </div>

          {/* PRD Visualisasi 4: Daftar Aset Bermasalah (Pindah ke Kolom Kiri) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span>Daftar Aset Bermasalah</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Aset berkondisi Critical & Warning yang memerlukan perbaikan</p>
              </div>
              <span className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-900">
                {totalProblematic} Lokasi
              </span>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {problematicAssets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8 font-semibold">Tidak ada aset bermasalah saat ini.</p>
              ) : (
                problematicAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#2563EB] text-sm">{asset.assetCode}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-black ${asset.condition === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                          {asset.condition}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{asset.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{asset.area}</div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('map');
                        onSelectAssetForMap(asset.id);
                      }}
                      className="text-xs bg-white dark:bg-slate-900 text-[#2563EB] font-extrabold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition shrink-0 flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                    >
                      <span>Buka Peta</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Distribusi Per Area & Aktivitas Inspeksi Terbaru */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8 flex flex-col">
          {/* PRD Visualisasi 2: Distribusi Aset Berdasarkan Area */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0284C7]" />
                  <span>Aset Berdasarkan Area</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Sebaran infra air limbah di seluruh area</p>
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-extrabold font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                {areaDistribution.length} Area Terdaftar
              </span>
            </div>

            <div className="space-y-4">
              {areaDistribution.map(item => (
                <div key={item.areaName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    <span>{item.areaName}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-400">{item.count} Aset ({item.percentage}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700 p-0.5">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#0284C7] rounded-full transition-all"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRD Visualisasi 3: Aktivitas Inspeksi Terbaru */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#059669]" />
                  <span>Aktivitas Inspeksi Terbaru</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Catatan temuan inspeksi lapangan terkini</p>
              </div>
              <button onClick={() => onNavigate('inspections')} className="text-xs text-[#2563EB] font-extrabold hover:underline cursor-pointer">
                Lihat Semua →
              </button>
            </div>

            <div className="space-y-3.5">
              {recentInspections.map(insp => (
                <div key={insp.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white font-mono text-sm">{insp.assetName}</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${insp.condition === 'Good' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        insp.condition === 'Fair' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                          insp.condition === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                      {insp.condition}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{insp.notes}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{insp.inspectorName}</span>
                    </span>
                    <span className="font-mono text-slate-400">{insp.inspectionDate}</span>
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
