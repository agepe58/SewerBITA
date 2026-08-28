import React, { useState } from 'react';
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
  Filter,
  ArrowUpDown,
  Maximize2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ManholeAsset, PumpStationAsset, PipeAsset } from '../../types/asset';
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
  const [activeBoardTab, setActiveBoardTab] = useState<'board' | 'metrics'>('board');

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

  // Ramp HQ Kanban Tasks Arrays
  const todoCriticalTasks = [
    { id: 'task-1', title: 'Inspeksi Darurat Manhole MH-SD-03 (Tersumbat)', code: 'MH-SD-03', area: 'Zone A - Sudirman', tag: 'Critical', color: 'rose' },
    { id: 'task-2', title: 'Pembersihan Sedimentasi Pipa Segmen P-MH-SD-01_MH-SD-02', code: 'P-SD-01', area: 'Zone A - Sudirman', tag: 'High Priority', color: 'rose' },
    { id: 'task-3', title: 'Penggantian Cover Manhole Damaged Zona B', code: 'MH-TB-04', area: 'Zone B - Tebet', tag: 'Urgent', color: 'amber' },
    { id: 'task-4', title: 'Perbaikan Pompa 3 Stasiun Pompa Tebet Utama', code: 'PS-002', area: 'Zone B - Tebet', tag: 'Pump Fault', color: 'rose' },
    { id: 'task-5', title: 'Uji Tekanan Aliran Pipa Kolektor Pluit Line C', code: 'P-PL-02', area: 'Zone C - Pluit', tag: 'Review', color: 'purple' },
    { id: 'task-6', title: 'Audit Sensor Flow Rate Stasiun Manggarai', code: 'PS-003', area: 'Zone A - Manggarai', tag: 'Telemetry', color: 'purple' },
    { id: 'task-7', title: 'Inspeksi Rutin Manhole MH-SB-05 (Jatuh Tempo)', code: 'MH-SB-05', area: 'Zone A - Setiabudi', tag: 'Overdue', color: 'amber' }
  ];

  const inProgressTasks = [
    { id: 'task-8', title: 'Pembersihan Submersible Pump Stasiun Tebet', code: 'PS-002', area: 'Zone B - Tebet', tag: 'Active Field', color: 'amber' },
    { id: 'task-9', title: 'Penggantian Pipa HDPE 800mm Segmen B2', code: 'P-TB-01', area: 'Zone B - Tebet', tag: 'Underway', color: 'amber' },
    { id: 'task-10', title: 'Penyusunan Laporan Inspeksi Fisik Q3', code: 'REP-Q3', area: 'All Zones', tag: 'Documentation', color: 'sky' },
    { id: 'task-11', title: 'Kalibrasi Sensor GIS Manhole MH-SD-01', code: 'MH-SD-01', area: 'Zone A - Sudirman', tag: 'GIS Sync', color: 'sky' },
    { id: 'task-12', title: 'Pemasangan Barcode QR Tag Manhole Baru', code: 'MH-SD-01.1', area: 'Zone A - Sudirman', tag: 'Tagging', color: 'emerald' }
  ];

  const inReviewTasks = [
    { id: 'task-13', title: 'Laporan Hasil High-Pressure Flashing Pipa Sudirman', code: 'P-SD-03', area: 'Zone A - Sudirman', tag: 'QA Review', color: 'sky' },
    { id: 'task-14', title: 'Hasil Uji Lab Kualitas Air Limbah Inlet WWTP', code: 'LAB-089', area: 'Zone C - Pluit', tag: 'Lab Analysis', color: 'sky' },
    { id: 'task-15', title: 'Audit Kepatuhan Lingkungan Hidup Q3', code: 'AUD-2026', area: 'All Zones', tag: 'Compliance', color: 'purple' }
  ];

  const completeTasks = [
    { id: 'task-16', title: 'Registrasi 12 Manhole Baru Zona Sudirman', code: 'MH-SD-BATCH', area: 'Zone A - Sudirman', tag: 'Completed', color: 'emerald' },
    { id: 'task-17', title: 'Pemasangan Pipa Kolektor Utama 1200mm Pluit', code: 'P-PL-MAIN', area: 'Zone C - Pluit', tag: 'Verified', color: 'emerald' },
    { id: 'task-18', title: 'Pengujian Telemetri SCADA Stasiun Pompa', code: 'SCADA-TEST', area: 'All Stations', tag: 'Passed', color: 'emerald' },
    { id: 'task-19', title: 'Inspeksi Berkala Stasiun Pompa Pluit Utama', code: 'PS-001', area: 'Zone C - Pluit', tag: 'Passed', color: 'emerald' },
    { id: 'task-20', title: 'Laporan Harian Debit Air Limbah 450 L/s', code: 'DAILY-450', area: 'Zone A - Sudirman', tag: 'Normal Flow', color: 'emerald' },
    { id: 'task-21', title: 'Sertifikasi Kelayakan Fisik Jaringan 2026', code: 'CERT-2026', area: 'All Zones', tag: 'Certified', color: 'emerald' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1920px] mx-auto text-slate-900 font-sans">
      {/* Ramp HQ / Notion Title Header & View Switcher Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Brand Icon */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 p-2.5 flex items-center justify-center border border-slate-200 shadow-2xs shrink-0">
              <img src="/favicon.jpg" alt="PT. BITA Icon" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">SewerBITA HQ</h1>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                  PT. Bukit Indah Tirta Alam
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Sistem Monitoring & Papan Operasional Management Air Limbah Kota Bukit Indah
              </p>
            </div>
          </div>

          {/* Action Bar Right (Notion Top Bar Actions) */}
          <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-slate-500">
              <button className="p-1.5 hover:text-slate-900 rounded-lg transition" title="Urutkan"><ArrowUpDown className="w-4 h-4" /></button>
              <button className="p-1.5 hover:text-slate-900 rounded-lg transition" title="Filter"><Filter className="w-4 h-4" /></button>
              <button onClick={onOpenQrScanner} className="p-1.5 hover:text-slate-900 rounded-lg transition" title="Scan QR"><QrCode className="w-4 h-4 text-[#2563EB]" /></button>
            </div>

            <button
              onClick={onOpenAddAssetModal}
              className="flex items-center gap-1.5 bg-[#2563EB] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aset</span>
            </button>

            <button
              onClick={onOpenNewInspectionModal}
              className="flex items-center gap-1.5 bg-[#18181B] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Inspeksi</span>
            </button>
          </div>
        </div>

        {/* Ramp View Switcher Pills */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBoardTab('board')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                activeBoardTab === 'board'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Papan Operasional Tasks</span>
              <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-1.5 py-0.2 rounded-md">{todoCriticalTasks.length + inProgressTasks.length + inReviewTasks.length + completeTasks.length}</span>
            </button>

            <button
              onClick={() => setActiveBoardTab('metrics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                activeBoardTab === 'metrics'
                  ? 'bg-slate-100 text-slate-900 border border-slate-300/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Metrik & Ringkasan KPI</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Peta GIS Interaktif</span>
            </button>

            <button
              onClick={() => onNavigate('topology')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              <span>Flow Topology Solver</span>
            </button>

            <button
              onClick={() => onNavigate('assets')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-600" />
              <span>Katalog Asset Registry</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono font-semibold shrink-0 hidden lg:block">
            Status: <span className="text-emerald-600 font-bold">● Network Normal</span>
          </div>
        </div>
      </div>

      {/* RAMP HQ 4-COLUMN KANBAN BOARD (Matches Reference Design Image) */}
      {activeBoardTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {/* Column 1: 🟣 To-do / Critical (10) */}
          <div className="bg-[#F7F7F8] p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>To-do</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-400">{todoCriticalTasks.length}</span>
              </div>
              <button onClick={onOpenAddAssetModal} className="text-slate-400 hover:text-slate-700 p-1"><Plus className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5">
              {todoCriticalTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {t.code}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      t.color === 'rose' ? 'bg-rose-100 text-rose-700' :
                      t.color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {t.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition leading-snug">
                    {t.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    <span>{t.area}</span>
                    <button
                      onClick={() => onNavigate('map')}
                      className="text-[#2563EB] font-bold hover:underline opacity-0 group-hover:opacity-100 transition"
                    >
                      Buka Peta →
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={onOpenAddAssetModal}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New item</span>
              </button>
            </div>
          </div>

          {/* Column 2: 🟡 In progress / Maintenance (5) */}
          <div className="bg-[#F7F7F8] p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>In progress</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-400">{inProgressTasks.length}</span>
              </div>
              <button onClick={onOpenNewInspectionModal} className="text-slate-400 hover:text-slate-700 p-1"><Plus className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5">
              {inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {t.code}
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {t.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#0284C7] transition leading-snug">
                    {t.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    <span>{t.area}</span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={onOpenNewInspectionModal}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New item</span>
              </button>
            </div>
          </div>

          {/* Column 3: 🔵 In review / Inspection (3) */}
          <div className="bg-[#F7F7F8] p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="bg-sky-100 text-sky-700 text-xs font-black px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>In review</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-400">{inReviewTasks.length}</span>
              </div>
              <button onClick={() => onNavigate('inspections')} className="text-slate-400 hover:text-slate-700 p-1"><Plus className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5">
              {inReviewTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {t.code}
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      {t.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-purple-700 transition leading-snug">
                    {t.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    <span>{t.area}</span>
                    <button
                      onClick={() => onNavigate('inspections')}
                      className="text-purple-600 font-bold hover:underline"
                    >
                      Tinjau →
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => onNavigate('inspections')}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New item</span>
              </button>
            </div>
          </div>

          {/* Column 4: 🟢 Complete / Operational (34) */}
          <div className="bg-[#F7F7F8] p-3.5 rounded-2xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Complete</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-400">{completeTasks.length}</span>
              </div>
              <button onClick={() => onNavigate('assets')} className="text-slate-400 hover:text-slate-700 p-1"><Plus className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5">
              {completeTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all space-y-2.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {t.code}
                    </span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {t.tag}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition leading-snug">
                    {t.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                    <span>{t.area}</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* METRICS & KPI TAB VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Assets */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aset Terdaftar</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">{totalAssets}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">UNIT</span>
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
                <span>{totalManholes} Manhole • {totalPipes} Pipa</span>
                <span className="text-[#2563EB] font-bold">100% GIS</span>
              </div>
            </div>

            {/* Card 2: Pipe Length */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Panjang Jaringan Pipa</span>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
                  <GitBranch className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">{totalPipeLengthKm}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">KM</span>
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
                <span>Terbagi 3 Zona GIS</span>
                <span className="text-[#0284C7] font-bold">Flow OK</span>
              </div>
            </div>

            {/* Card 3: Pump Stations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stasiun Pompa Utama</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">{totalPumpStations}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">UNIT</span>
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
                <span>Kapasitas: 670 L/s</span>
                <span className="text-[#059669] font-bold">100% Active</span>
              </div>
            </div>

            {/* Card 4: Critical Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Kondisi Perhatian</span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-rose-600 font-mono">{totalCritical + warningCount}</span>
                <span className="text-xs font-bold text-rose-400 font-mono">LOKASI</span>
              </div>
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between font-medium">
                <span>{totalCritical} Critical • {warningCount} Warning</span>
                <button onClick={() => onNavigate('map')} className="text-[#2563EB] font-bold hover:underline">Peta →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
