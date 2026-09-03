import React, { useState } from 'react';
import { Filter, Layers, Check, X, GitBranch, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
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
  basemap: string;
  onSelectBasemap: (basemap: string) => void;
  availableAreas?: string[];
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
  onClearTrace,
  basemap,
  onSelectBasemap,
  availableAreas = []
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const areas = ['All Areas', ...Array.from(new Set(availableAreas))];
  const conditions = ['All Conditions', 'Good', 'Fair', 'Warning', 'Critical'];

  // Render Collapsed (Minimized Pill View)
  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-extrabold text-slate-900 hover:bg-blue-50 hover:text-[#2563EB] transition hover:scale-102 group cursor-pointer"
          title="Perbesar / Buka Card Layer & Filter Peta GIS"
        >
          <SlidersHorizontal className="w-4.5 h-4.5 text-[#2563EB]" />
          <span>Layer & Filter Peta GIS</span>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] transition" />
        </button>
      </div>
    );
  }

  // Render Full Expanded Card View
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 p-4.5 rounded-xl shadow-xl w-80 space-y-4 text-sm text-slate-800 font-sans transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter className="w-5 h-5 text-[#2563EB]" />
          <span>Layer & Filter Peta GIS</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Mengecilkan Card Filter"
        >
          <ChevronUp className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Active Flow Trace Badge */}
      {isTraceActive && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#2563EB]">
            <GitBranch className="w-4 h-4 animate-pulse" />
            <span className="font-extrabold text-sm">Mode Trace Aktif</span>
          </div>
          <button
            onClick={onClearTrace}
            className="text-xs bg-[#2563EB] text-white font-bold px-3 py-1 rounded-full hover:bg-blue-700 transition shadow-2xs"
          >
            Reset Trace
          </button>
        </div>
      )}

      {/* Basemap Switcher Selector */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tipe Peta Dasar (Basemap)</label>
        <select
          value={basemap}
          onChange={(e) => onSelectBasemap(e.target.value)}
          className="w-full bg-slate-50 text-slate-900 font-bold border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] cursor-pointer"
        >
          <option value="esri_satellite">🛰️ Foto Satelit Real (Esri ArcGIS - Gratis)</option>
          <option value="carto_voyager">🗺️ CARTO Voyager (Clean Light GIS)</option>
          <option value="carto_dark">🌙 CARTO Dark Matter (Night Mode)</option>
          <option value="osm_standard">🏙️ OpenStreetMap Standard</option>
        </select>
      </div>

      {/* Filter by Area */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Area / Zona</label>
        <select
          value={selectedArea}
          onChange={(e) => onSelectArea(e.target.value)}
          className="w-full bg-slate-50 text-slate-900 font-bold border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        >
          {areas.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Filter by Condition */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kondisi Aset</label>
        <select
          value={selectedCondition}
          onChange={(e) => onSelectCondition(e.target.value)}
          className="w-full bg-slate-50 text-slate-900 font-bold border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
        >
          {conditions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Layers Toggle */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Layer Aset</label>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 font-bold text-slate-800">
            <span>Manhole Markers</span>
            <input
              type="checkbox"
              checked={showManholes}
              onChange={(e) => onToggleManholes(e.target.checked)}
              className="accent-[#2563EB] w-4.5 h-4.5 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 font-bold text-slate-800">
            <span>Pipa & Directional Flow</span>
            <input
              type="checkbox"
              checked={showPipes}
              onChange={(e) => onTogglePipes(e.target.checked)}
              className="accent-[#2563EB] w-4.5 h-4.5 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 font-bold text-slate-800">
            <span>Stasiun Pompa</span>
            <input
              type="checkbox"
              checked={showPumpStations}
              onChange={(e) => onTogglePumpStations(e.target.checked)}
              className="accent-[#2563EB] w-4.5 h-4.5 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Pipe Color Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Legenda Warna Pipa</label>
        <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs font-bold">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1.5 rounded-full bg-[#8B4513]"></span>
              <span className="text-slate-800">Pipa Sewer (Air Limbah)</span>
            </span>
            <span className="text-[10px] text-amber-900 font-extrabold font-mono">Coklat</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1.5 rounded-full bg-[#0284C7]"></span>
              <span className="text-slate-800">Pipa Air Bersih (PAM)</span>
            </span>
            <span className="text-[10px] text-sky-700 font-extrabold font-mono">Biru</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-1.5 rounded-full bg-[#8D4004]"></span>
              <span className="text-slate-800">Pipa Transmisi Tekanan</span>
            </span>
            <span className="text-[10px] text-amber-950 font-extrabold font-mono">Coklat Tua</span>
          </div>
        </div>
      </div>
    </div>
  );
};
