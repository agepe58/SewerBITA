import React, { useState } from 'react';
import { GitBranch, MapPin, Layers } from 'lucide-react';
import { NetworkMap } from '../map/NetworkMap';
import { TopologyView } from '../topology/TopologyView';
import { ManholeAsset, PumpStationAsset, PipeAsset } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';
import { NetworkGraphEngine } from '../../services/graphEngine';
import { NetworkTraceResult } from '../../types/topology';

interface FlowchartViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  graphEngine: NetworkGraphEngine;
  onOpenQrModal?: (id: string) => void;
  onOpenNewInspection?: (id: string) => void;
  isDarkMode?: boolean;
}

export const FlowchartView: React.FC<FlowchartViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections = [],
  graphEngine,
  onOpenQrModal = () => {},
  onOpenNewInspection = () => {},
  isDarkMode = true
}) => {
  const [subTab, setSubTab] = useState<'flowchart' | 'gis_map' | 'topology'>('flowchart');
  const [activeTraceResult, setActiveTraceResult] = useState<NetworkTraceResult | null>(null);

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  const handleTraceDownstream = (assetId: string) => {
    const res = graphEngine.traceDownstream(assetId);
    setActiveTraceResult(res);
  };

  const handleTraceUpstream = (assetId: string) => {
    const res = graphEngine.traceUpstream(assetId);
    setActiveTraceResult(res);
  };

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sub Navigation Bar */}
      <div className={`p-2 rounded-2xl border flex items-center gap-2 max-w-lg shadow-xs ${cardBg}`}>
        <button
          onClick={() => setSubTab('flowchart')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'flowchart'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Flowchart Sistem</span>
        </button>

        <button
          onClick={() => setSubTab('gis_map')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'gis_map'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>GIS Network Map</span>
        </button>

        <button
          onClick={() => setSubTab('topology')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'topology'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Topology Solver</span>
        </button>
      </div>

      {/* Content based on sub-tab */}
      {subTab === 'flowchart' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${cardBg}`}>
          <div>
            <h2 className="text-base font-extrabold">Flowchart Alur Manajemen Pemeliharaan & Monitoring</h2>
            <p className="text-xs text-slate-400">Diagram alur sistem informasi dari pelaporan tiket hingga validasi penyelesaian</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-blue-400">1. INPUT TIKET / ANOMALI</div>
              <div className="text-xs font-semibold text-white">Pembuatan Work Order</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Teknisi/admin mencatat kerusakan mekanik/elektrik di WWTP, WTP, atau Manhole.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-sky-400">2. PENUGASAN (ASSIGN)</div>
              <div className="text-xs font-semibold text-white">Disposisi ke Teknisi</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tiket diteruskan ke teknisi terkait dengan batas waktu (due date) penyelesaian.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-amber-400">3. TINDAKAN LAPANGAN</div>
              <div className="text-xs font-semibold text-white">Eksekusi Maintenance</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Teknisi memindai QR Code aset, memperbaiki, dan mengunggah foto laporan kerja.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-black text-emerald-400">4. PENUTUPAN & AUDIT</div>
              <div className="text-xs font-semibold text-white">Verifikasi Selesai</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Status ditutup, metrik dashboard otomatis terupdate secara realtime.
              </p>
            </div>
          </div>
        </div>
      )}

      {subTab === 'gis_map' && (
        <div className="h-[650px] rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          <NetworkMap
            manholes={manholes}
            pumpStations={pumpStations}
            pipes={pipes}
            inspections={inspections}
            activeTraceResult={activeTraceResult}
            onTraceDownstream={handleTraceDownstream}
            onTraceUpstream={handleTraceUpstream}
            onClearTrace={() => setActiveTraceResult(null)}
            onOpenQrModal={onOpenQrModal}
            onOpenNewInspection={onOpenNewInspection}
          />
        </div>
      )}

      {subTab === 'topology' && (
        <TopologyView
          manholes={manholes}
          pumpStations={pumpStations}
          pipes={pipes}
          graphEngine={graphEngine}
          onApplyTraceResult={(trace) => {
            setActiveTraceResult(trace);
            setSubTab('gis_map');
          }}
          onNavigateToMap={() => setSubTab('gis_map')}
        />
      )}
    </div>
  );
};
