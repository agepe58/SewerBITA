import React from 'react';
import { Filter, Layers, Check, X, GitBranch } from 'lucide-react';
import { AssetCondition } from '../../types/asset';

interface MapFiltersProps {
  selectedArea: string;
  onSelectArea: (area: string) => void;
  showManholes: boolean;
  onToggleManholes: (val: boolean) => void;
  showPipes: boolean;
  onTogglePipes: (val: boolean) => void;
  showPumpStations: boolean;
  onTogglePumpStations: (val: boolean) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  isTraceActive: boolean;
  onClearTrace: () => void;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  selectedArea,
  onSelectArea,
  showManholes,
  onToggleManholes,
  showPipes,
  onTogglePipes,
  showPumpStations,
  onTogglePumpStations,
  selectedCondition,
  onSelectCondition,
  isTraceActive,
  onClearTrace
}) => {
  const areas = ['All Areas', 'Zone A - Sudirman', 'Zone A - Setiabudi', 'Zone A - Manggarai', 'Zone B - Tebet', 'Zone C - Pluit'];
  const conditions = ['All Conditions', 'Good', 'Fair', 'Warning', 'Critical'];

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl w-72 space-y-4 text-xs text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Filter className="w-4 h-4 text-[#2563EB]" />
          <span>Layer & Filter Peta GIS</span>
        </div>
      </div>

      {/* Active Flow Trace Badge */}
      {isTraceActive && (
        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#2563EB]">
            <GitBranch className="w-4 h-4 animate-pulse" />
            <span className="font-bold">Mode Trace Aktif</span>
          </div>
          <button
            onClick={onClearTrace}
            className="text-[10px] bg-[#2563EB] text-white font-bold px-2 py-0.5 rounded-full hover:bg-blue-700"
          >
            Reset Trace
          </button>
        </div>
      )}

      {/* Filter by Area */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Area / Zona</label>
        <select
          value={selectedArea}
          onChange={(e) => onSelectArea(e.target.value)}
          className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB]"
        >
          {areas.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Filter by Condition */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kondisi Aset</label>
        <select
          value={selectedCondition}
          onChange={(e) => onSelectCondition(e.target.value)}
          className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB]"
        >
          {conditions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Layers Toggle */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Layer Aset</label>
        <div className="space-y-1">
          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
            <span className="text-slate-700 font-medium">Manhole Markers</span>
            <input
              type="checkbox"
              checked={showManholes}
              onChange={(e) => onToggleManholes(e.target.checked)}
              className="accent-[#2563EB] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
            <span className="text-slate-700 font-medium">Pipa & Directional Flow</span>
            <input
              type="checkbox"
              checked={showPipes}
              onChange={(e) => onTogglePipes(e.target.checked)}
              className="accent-[#2563EB] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
            <span className="text-slate-700 font-medium">Stasiun Pompa</span>
            <input
              type="checkbox"
              checked={showPumpStations}
              onChange={(e) => onTogglePumpStations(e.target.checked)}
              className="accent-[#2563EB] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
