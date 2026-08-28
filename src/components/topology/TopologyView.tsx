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
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#2563EB]" />
            <span>Network Topology & Flow Tracing Solver</span>
          </h1>
          <p className="text-xs text-slate-500">
            Penelusuran graf terarah (*Directed Graph DAG*) jaringan air limbah dan validasi integritas koneksi aset.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0284C7] border border-slate-200 font-bold text-xs px-5 py-2.5 rounded-full transition shadow-xs"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Jalankan Diagnostic Validator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace Configurator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Configurator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Konfigurasi Simulator Flow Tracing
            </h2>

            {/* Select Start Node */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Aset Awal (Start Node)</label>
              <select
                value={selectedStartId}
                onChange={(e) => setSelectedStartId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#2563EB] font-medium"
              >
                {manholes.map(mh => (
                  <option key={mh.id} value={mh.id}>
                    {mh.assetCode} — {mh.name} ({mh.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Trace Direction */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Arah Tracing Network</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTraceType('downstream')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                    traceType === 'downstream'
                      ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-xs">Downstream</span>
                  <span className="text-[10px] text-slate-400 font-normal">Menuju Pompa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTraceType('upstream')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                    traceType === 'upstream'
                      ? 'bg-sky-50 border-[#0284C7] text-[#0284C7] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                  <span className="text-xs">Upstream</span>
                  <span className="text-[10px] text-slate-400 font-normal">Jaringan Feeder</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleRunTrace}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 text-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulasi Flow Trace</span>
              </button>
            </div>
          </div>

          {/* Validation Summary Card */}
          {validationReport && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Laporan Diagnostic Topology</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${validationReport.isValid ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                  {validationReport.isValid ? 'Topology Valid' : 'Isu Ditemukan'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-slate-400 text-[10px] font-bold">Total Error</div>
                  <div className="text-lg font-extrabold text-[#DC2626] font-mono">{validationReport.errorsCount}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-slate-400 text-[10px] font-bold">Total Warning</div>
                  <div className="text-lg font-extrabold text-[#CA8A04] font-mono">{validationReport.warningsCount}</div>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {validationReport.issues.length === 0 ? (
                  <div className="text-center py-4 text-[#16A34A] text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Semua pipa dan manhole terhubung sempurna!</span>
                  </div>
                ) : (
                  validationReport.issues.map((issue) => (
                    <div key={issue.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${issue.severity === 'error' ? 'bg-[#F87171] text-white' : 'bg-[#FDE047] text-slate-900'}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-900 font-bold">{issue.issueType}</span>
                      </div>
                      <div className="text-slate-700">{issue.message}</div>
                      {issue.suggestedFix && (
                        <div className="text-[10px] text-[#2563EB] font-bold">Solusi: {issue.suggestedFix}</div>
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
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Hasil Penelusuran Jalur (Network Path)</h2>
                <p className="text-xs text-slate-500">Urutan aset yang dilalui oleh air limbah</p>
              </div>

              {traceResult && (
                <button
                  onClick={onNavigateToMap}
                  className="flex items-center gap-1.5 bg-[#2563EB] text-white font-bold text-xs px-4 py-2 rounded-full hover:bg-[#1D4ED8] transition shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Visualisasikan di Peta →</span>
                </button>
              )}
            </div>

            {!traceResult ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <GitBranch className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
                <p className="text-xs">Pilih Aset Awal dan klik "Simulasi Flow Trace" untuk melihat penelusuran graf.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Manhole Dilalui</div>
                    <div className="text-lg font-black text-[#2563EB] font-mono">{traceResult.traversedManholeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold font-mono">Pipa Dilalui</div>
                    <div className="text-lg font-black text-[#0284C7] font-mono">{traceResult.traversedPipeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">Total Jarak Aliran</div>
                    <div className="text-lg font-black text-slate-900 font-mono">{traceResult.totalDistanceMeters} m</div>
                  </div>
                </div>

                {traceResult.destinationPumpStationId && (
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 flex items-center justify-between text-xs text-[#2563EB]">
                    <span className="font-bold">Terminal Stasiun Pompa Tujuan:</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {allAssetsMap.get(traceResult.destinationPumpStationId)?.name}
                    </span>
                  </div>
                )}

                {/* Traversal Path Sequence */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-[#2563EB]" />
                    <span>Urutan Aliran Graf (Sequence):</span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {traceResult.pathAssetIds.map((id, index) => {
                      const item = allAssetsMap.get(id);
                      if (!item) return null;

                      const isNode = item.type === 'manhole' || item.type === 'pump_station';

                      return (
                        <div
                          key={`${id}-${index}`}
                          className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                            isNode
                              ? 'bg-slate-50 border-slate-200 text-slate-900 font-semibold'
                              : 'bg-white border-slate-100 text-slate-500 pl-6'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-mono text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{item.assetCode}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({item.name})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">{item.type.replace('_', ' ')} • {item.area}</div>
                            </div>
                          </div>

                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            item.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
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
