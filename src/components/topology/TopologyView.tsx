import React, { useState } from 'react';
import {
  GitBranch,
  ArrowDown,
  ArrowUp,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Check,
  ShieldAlert,
  ListOrdered
} from 'lucide-react';
import { ManholeAsset, PumpStationAsset, PipeAsset, SewerAsset } from '../../types/asset';
import { NetworkTraceResult, TopologyValidationSummary } from '../../types/topology';
import { NetworkGraphEngine } from '../../services/graphEngine';

interface TopologyViewProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  graphEngine: NetworkGraphEngine;
  onApplyTraceResult: (trace: NetworkTraceResult) => void;
  onNavigateToMap: () => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  manholes,
  pumpStations,
  pipes,
  graphEngine,
  onApplyTraceResult,
  onNavigateToMap
}) => {
  const [selectedStartId, setSelectedStartId] = useState<string>(manholes[0]?.id || '');
  const [traceType, setTraceType] = useState<'downstream' | 'upstream'>('downstream');
  const [traceResult, setTraceResult] = useState<NetworkTraceResult | null>(null);
  const [validationReport, setValidationReport] = useState<TopologyValidationSummary | null>(null);

  const allAssetsMap = new Map<string, SewerAsset>();
  [...manholes, ...pumpStations, ...pipes].forEach(a => allAssetsMap.set(a.id, a));

  const handleRunTrace = () => {
    if (!selectedStartId) return;
    let res: NetworkTraceResult;
    if (traceType === 'downstream') {
      res = graphEngine.traceDownstream(selectedStartId);
    } else {
      res = graphEngine.traceUpstream(selectedStartId);
    }
    setTraceResult(res);
    onApplyTraceResult(res);
  };

  const handleRunValidation = () => {
    const report = graphEngine.validateTopology();
    setValidationReport(report);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1920px] mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <GitBranch className="w-6 h-6" />
            </div>
            <span>Network Topology & Flow Tracing</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
            Penelusuran jaringan air limbah dan validasi koneksi aset.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-[#0284C7] border border-slate-200 font-black text-sm px-6 py-3.5 rounded-full transition shadow-xs hover:scale-105 shrink-0 self-start md:self-auto"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Jalankan Diagnostic Validator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace Configurator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Configurator */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Konfigurasi Flow Tracing
            </h2>

            {/* Select Start Node */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-800">Pilih Aset Awal (Start Node)</label>
              <select
                value={selectedStartId}
                onChange={(e) => setSelectedStartId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#2563EB] font-extrabold cursor-pointer"
              >
                {manholes.map(mh => (
                  <option key={mh.id} value={mh.id}>
                    {mh.assetCode} — {mh.name} ({mh.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Trace Direction */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-800">Arah Tracing Network</label>
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setTraceType('downstream')}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${traceType === 'downstream'
                      ? 'bg-blue-50/80 border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <ArrowDown className="w-6 h-6 text-[#2563EB]" />
                  <span className="text-sm font-extrabold">Downstream</span>
                  <span className="text-xs text-slate-500 font-semibold">Menuju Pompa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTraceType('upstream')}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${traceType === 'upstream'
                      ? 'bg-sky-50/80 border-[#0284C7] text-[#0284C7] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <ArrowUp className="w-6 h-6 text-[#0284C7]" />
                  <span className="text-sm font-extrabold">Upstream</span>
                  <span className="text-xs text-slate-500 font-semibold">Jaringan Feeder</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleRunTrace}
                className="flex-1 flex items-center justify-center gap-2.5 bg-[#2563EB] text-white font-black py-4 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25 text-sm hover:scale-105"
              >
                <Play className="w-4.5 h-4.5 fill-white" />
                <span>Simulasi Flow Trace</span>
              </button>
            </div>
          </div>

          {/* Validation Summary Card */}
          {validationReport && (
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-900">Laporan Diagnostic Topology</h2>
                <span className={`px-3.5 py-1 rounded-full text-xs font-black ${validationReport.isValid ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                  {validationReport.isValid ? 'Topology Valid' : 'Isu Ditemukan'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                  <div className="text-slate-500 text-xs font-extrabold">Total Error</div>
                  <div className="text-2xl font-black text-[#DC2626] font-mono">{validationReport.errorsCount}</div>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                  <div className="text-slate-500 text-xs font-extrabold">Total Warning</div>
                  <div className="text-2xl font-black text-[#CA8A04] font-mono">{validationReport.warningsCount}</div>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {validationReport.issues.length === 0 ? (
                  <div className="text-center py-4 text-[#16A34A] text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Semua pipa dan manhole terhubung sempurna!</span>
                  </div>
                ) : (
                  validationReport.issues.map((issue) => (
                    <div key={issue.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${issue.severity === 'error' ? 'bg-[#F87171] text-white' : 'bg-[#FDE047] text-slate-900'}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-900 font-extrabold">{issue.issueType}</span>
                      </div>
                      <div className="text-slate-800 font-semibold text-xs">{issue.message}</div>
                      {issue.suggestedFix && (
                        <div className="text-xs text-[#2563EB] font-bold">Solusi: {issue.suggestedFix}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Trace Result Path Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Hasil Penelusuran Jalur</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Urutan aset yang dilalui oleh air limbah</p>
              </div>

              {traceResult && (
                <button
                  onClick={onNavigateToMap}
                  className="flex items-center gap-2 bg-[#2563EB] text-white font-extrabold text-xs px-5 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 hover:scale-105"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Visualisasikan di Peta →</span>
                </button>
              )}
            </div>

            {!traceResult ? (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <GitBranch className="w-14 h-14 mx-auto text-slate-300 animate-pulse" />
                <p className="text-sm font-semibold">Pilih Aset Awal dan klik "Simulasi Flow Trace" untuk melihat penelusuran graf.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 text-center">
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Manhole Dilalui</div>
                    <div className="text-2xl font-black text-[#2563EB] font-mono">{traceResult.traversedManholeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold font-mono">Pipa Dilalui</div>
                    <div className="text-2xl font-black text-[#0284C7] font-mono">{traceResult.traversedPipeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Total Jarak Aliran</div>
                    <div className="text-2xl font-black text-slate-900 font-mono">{traceResult.totalDistanceMeters} m</div>
                  </div>
                </div>

                {traceResult.destinationPumpStationId && (
                  <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 flex items-center justify-between text-xs text-[#2563EB]">
                    <span className="font-extrabold">Terminal Stasiun Pompa Tujuan:</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {allAssetsMap.get(traceResult.destinationPumpStationId)?.name}
                    </span>
                  </div>
                )}

                {/* Traversal Path Sequence */}
                <div className="space-y-3 pt-2">
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ListOrdered className="w-4.5 h-4.5 text-[#2563EB]" />
                    <span>Urutan Aliran Graf (Sequence):</span>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {traceResult.pathAssetIds.map((id, index) => {
                      const item = allAssetsMap.get(id);
                      if (!item) return null;

                      const isNode = item.type === 'manhole' || item.type === 'pump_station';

                      return (
                        <div
                          key={`${id}-${index}`}
                          className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition ${isNode
                              ? 'bg-slate-50/90 border-slate-200 text-slate-900 font-bold'
                              : 'bg-white border-slate-200/60 text-slate-600 pl-6'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-mono text-xs font-black">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                <span className="font-mono text-[#2563EB]">{item.assetCode}</span>
                                <span className="text-xs text-slate-600 font-semibold">({item.name})</span>
                              </div>
                              <div className="text-xs text-slate-500 capitalize font-medium mt-0.5">{item.type.replace('_', ' ')} • {item.area}</div>
                            </div>
                          </div>

                          <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold ${item.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
                              item.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
                            }`}>
                            {item.condition}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
