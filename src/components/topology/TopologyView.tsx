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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-[#2DD4BF]" />
            <span>Network Topology & Flow Tracing Solver</span>
          </h1>
          <p className="text-xs text-slate-400">
            Penelusuran graf terarah (*Directed Graph DAG*) jaringan air limbah dan validasi integritas koneksi aset.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          className="flex items-center space-x-2 bg-[#1A1F2C] hover:bg-[#252C3D] text-[#06B6D4] border border-[#06B6D4]/40 font-bold text-xs px-4 py-2.5 rounded-full transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Jalankan Diagnostic Validator</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace Configurator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Configurator */}
          <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-5">
            <h2 className="text-base font-bold text-white border-b border-[#232A3B] pb-3">
              Konfigurasi Simulator Flow Tracing
            </h2>

            {/* Select Start Node */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Pilih Aset Awal (Start Node)</label>
              <select
                value={selectedStartId}
                onChange={(e) => setSelectedStartId(e.target.value)}
                className="w-full bg-[#080A0E] text-slate-200 border border-[#232A3B] rounded-xl p-3 text-xs focus:outline-none focus:border-[#2DD4BF]"
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
              <label className="text-xs font-semibold text-slate-300">Arah Tracing Network</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTraceType('downstream')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                    traceType === 'downstream'
                      ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-[#2DD4BF] font-bold'
                      : 'bg-[#1A1F2C] border-[#232A3B] text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-xs">Downstream</span>
                  <span className="text-[10px] text-slate-500 font-normal">Menuju Pompa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTraceType('upstream')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                    traceType === 'upstream'
                      ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#06B6D4] font-bold'
                      : 'bg-[#1A1F2C] border-[#232A3B] text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                  <span className="text-xs">Upstream</span>
                  <span className="text-[10px] text-slate-500 font-normal">Jaringan Feeder</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={handleRunTrace}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#2DD4BF] text-black font-extrabold py-3 rounded-xl hover:bg-[#5EEAD4] transition shadow-[0_0_15px_rgba(45,212,191,0.3)] text-xs"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Simulasi Flow Trace</span>
              </button>
            </div>
          </div>

          {/* Validation Summary Card */}
          {validationReport && (
            <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Laporan Diagnostic Topology</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${validationReport.isValid ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                  {validationReport.isValid ? 'Topology Valid' : 'Isu Ditemukan'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="text-slate-400 text-[10px]">Total Error</div>
                  <div className="text-lg font-bold text-[#EF4444] font-mono">{validationReport.errorsCount}</div>
                </div>
                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="text-slate-400 text-[10px]">Total Warning</div>
                  <div className="text-lg font-bold text-[#F59E0B] font-mono">{validationReport.warningsCount}</div>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {validationReport.issues.length === 0 ? (
                  <div className="text-center py-4 text-[#10B981] text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Semua pipa dan manhole terhubung sempurna!</span>
                  </div>
                ) : (
                  validationReport.issues.map((issue) => (
                    <div key={issue.id} className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B] text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${issue.severity === 'error' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="font-mono text-slate-300 font-bold">{issue.issueType}</span>
                      </div>
                      <div className="text-slate-300">{issue.message}</div>
                      {issue.suggestedFix && (
                        <div className="text-[10px] text-[#2DD4BF]">Solusi: {issue.suggestedFix}</div>
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
          <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-5">
            <div className="flex items-center justify-between border-b border-[#232A3B] pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Hasil Penelusuran Jalur (Network Path)</h2>
                <p className="text-xs text-slate-400">Urutan aset yang dilalui oleh air limbah</p>
              </div>

              {traceResult && (
                <button
                  onClick={onNavigateToMap}
                  className="flex items-center space-x-1.5 bg-[#2DD4BF] text-black font-bold text-xs px-3.5 py-2 rounded-full hover:bg-[#5EEAD4] transition shadow-[0_0_12px_rgba(45,212,191,0.3)]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Visualisasikan di Peta →</span>
                </button>
              )}
            </div>

            {!traceResult ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <GitBranch className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs">Pilih Aset Awal dan klik "Simulasi Flow Trace" untuk melihat penelusuran graf.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-[#1A1F2C] p-4 rounded-xl border border-[#232A3B] text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Manhole Dilalui</div>
                    <div className="text-lg font-black text-[#2DD4BF] font-mono">{traceResult.traversedManholeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">Pipa Dilalui</div>
                    <div className="text-lg font-black text-[#06B6D4] font-mono">{traceResult.traversedPipeIds.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Total Jarak Aliran</div>
                    <div className="text-lg font-black text-white font-mono">{traceResult.totalDistanceMeters} m</div>
                  </div>
                </div>

                {traceResult.destinationPumpStationId && (
                  <div className="bg-[#2DD4BF]/15 p-3 rounded-xl border border-[#2DD4BF]/40 flex items-center justify-between text-xs text-[#2DD4BF]">
                    <span className="font-bold">Terminal Stasiun Pompa Tujuan:</span>
                    <span className="font-mono font-extrabold text-white">
                      {allAssetsMap.get(traceResult.destinationPumpStationId)?.name}
                    </span>
                  </div>
                )}

                {/* Traversal Path Sequence */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-[#2DD4BF]" />
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
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                            isNode
                              ? 'bg-[#1A1F2C] border-[#232A3B] text-white font-semibold'
                              : 'bg-[#080A0E] border-[#232A3B]/60 text-slate-400 pl-6'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-5 h-5 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center font-mono text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{item.assetCode}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({item.name})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">{item.type.replace('_', ' ')} • {item.area}</div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.condition === 'Good' ? 'bg-[#10B981]/20 text-[#10B981]' :
                            item.condition === 'Warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#EF4444]/20 text-[#EF4444]'
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
