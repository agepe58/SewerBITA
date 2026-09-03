import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset, WtpAsset, WaterAccessoryAsset, GreaseTrapAsset } from '../../types/asset';
import { NetworkTraceResult } from '../../types/topology';
import { MapFilters } from './MapFilters';
import { AssetDrawer } from './AssetDrawer';
import { InspectionRecord } from '../../types/inspection';

interface NetworkMapProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  wtps?: WtpAsset[];
  waterAccessories?: WaterAccessoryAsset[];
  greaseTraps?: GreaseTrapAsset[];
  inspections: InspectionRecord[];
  activeTraceResult: NetworkTraceResult | null;
  onTraceDownstream: (assetId: string) => void;
  onTraceUpstream: (assetId: string) => void;
  onClearTrace: () => void;
  onOpenQrModal: (assetId: string) => void;
  onOpenNewInspection: (assetId: string) => void;
  selectedAssetIdFromParent?: string | null;
  onRefreshOnZoom?: () => void;
}

// Custom Leaflet DivIcons Standardized with Vibrant Magenta Highlighting for Map Redirection
const createManholeIcon = (condition: string, isHighlighted: boolean) => {
  let color = '#8B4513'; // Coklat Sewer untuk Manhole Standard / Good
  if (condition === 'Fair') color = '#A0522D';
  if (condition === 'Warning') color = '#D97706';
  if (condition === 'Critical') color = '#DC2626';

  const finalColor = isHighlighted ? '#EC4899' : color;
  const pulseClass = isHighlighted ? 'animate-ping duration-300' : (condition === 'Critical' ? 'animate-ping' : '');
  const containerClass = isHighlighted ? 'scale-150 ring-4 ring-pink-400/90 shadow-2xl animate-bounce z-[9999]' : '';

  return L.divIcon({
    className: 'custom-mh-icon',
    html: `
      <div class="relative flex items-center justify-center w-[22px] h-[22px] ${containerClass}">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}" style="background-color: ${finalColor}"></span>
        <div class="relative w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white shadow-lg" style="background-color: ${finalColor}">
          <span class="w-2 h-2 rounded-full bg-white"></span>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createPumpStationIcon = (isHighlighted: boolean) => {
  const finalBg = isHighlighted ? 'bg-[#EC4899] ring-4 ring-pink-400/90 scale-150 animate-bounce shadow-2xl z-[9999]' : 'bg-[#2563EB]';
  const pulseClass = isHighlighted ? 'animate-ping duration-300' : '';

  return L.divIcon({
    className: 'custom-ps-icon',
    html: `
      <div class="relative flex items-center justify-center w-[22px] h-[22px]">
        ${isHighlighted ? `<span class="absolute inline-flex h-full w-full rounded-md bg-[#EC4899] opacity-75 ${pulseClass}"></span>` : ''}
        <div class="relative flex items-center justify-center w-[22px] h-[22px] ${finalBg} text-white rounded-md border-2 border-white shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createWtpIcon = (isHighlighted: boolean) => {
  const finalBg = isHighlighted ? 'bg-[#EC4899] ring-4 ring-pink-400/90 scale-150 animate-bounce shadow-2xl z-[9999]' : 'bg-[#0284C7]';
  const pulseClass = isHighlighted ? 'animate-ping duration-300' : '';

  return L.divIcon({
    className: 'custom-wtp-icon',
    html: `
      <div class="relative flex items-center justify-center w-[22px] h-[22px]">
        ${isHighlighted ? `<span class="absolute inline-flex h-full w-full rounded-md bg-[#EC4899] opacity-75 ${pulseClass}"></span>` : ''}
        <div class="relative flex items-center justify-center w-[22px] h-[22px] ${finalBg} text-white rounded-md border-2 border-white shadow-md">
          <span class="text-[10px]">🏭</span>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createWaterAccessoryIcon = (accessoryType: string, isHighlighted: boolean) => {
  const defaultBg = accessoryType === 'air_valve'
    ? 'bg-cyan-500'
    : accessoryType === 'dresser_joint'
    ? 'bg-emerald-500'
    : accessoryType === 'gate_valve'
    ? 'bg-indigo-600'
    : 'bg-sky-500';

  const finalBg = isHighlighted ? 'bg-[#EC4899] ring-4 ring-pink-400/90 scale-150 animate-bounce shadow-2xl z-[9999]' : defaultBg;
  const pulseClass = isHighlighted ? 'animate-ping duration-300' : '';

  const symbol = accessoryType === 'air_valve'
    ? '💨'
    : accessoryType === 'dresser_joint'
    ? '🔗'
    : accessoryType === 'gate_valve'
    ? '🚰'
    : '🔀';

  return L.divIcon({
    className: 'custom-accessory-icon',
    html: `
      <div class="relative flex items-center justify-center w-[22px] h-[22px]">
        ${isHighlighted ? `<span class="absolute inline-flex h-full w-full rounded-md bg-[#EC4899] opacity-75 ${pulseClass}"></span>` : ''}
        <div class="relative flex items-center justify-center w-[22px] h-[22px] ${finalBg} text-white rounded-md border-2 border-white shadow-md">
          <span class="text-[10px] font-bold">${symbol}</span>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createGreaseTrapIcon = (isHighlighted: boolean) => {
  const finalBg = isHighlighted ? 'bg-[#EC4899] ring-4 ring-pink-400/90 scale-150 animate-bounce shadow-2xl z-[9999]' : 'bg-amber-600';
  const pulseClass = isHighlighted ? 'animate-ping duration-300' : '';

  return L.divIcon({
    className: 'custom-grease-trap-icon',
    html: `
      <div class="relative flex items-center justify-center w-[22px] h-[22px]">
        ${isHighlighted ? `<span class="absolute inline-flex h-full w-full rounded-md bg-[#EC4899] opacity-75 ${pulseClass}"></span>` : ''}
        <div class="relative flex items-center justify-center w-[22px] h-[22px] ${finalBg} text-white rounded-md border-2 border-white shadow-md">
          <span class="text-[10px] font-bold">🍳</span>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};



// Component to handle pan to selected asset
const MapController: React.FC<{ centerCoords: [number, number] | null }> = ({ centerCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (centerCoords) {
      map.flyTo(centerCoords, 16, { duration: 1.2 });
    }
  }, [centerCoords, map]);
  return null;
};

// Component to automatically fit bounds ONLY ON INITIAL MAP LOAD (Never reset user zoom/pan)
const MapBoundsAutoFitter: React.FC<{ assets: SewerAsset[] }> = ({ assets }) => {
  const map = useMap();
  const hasFitted = React.useRef(false);

  useEffect(() => {
    if (!hasFitted.current && assets && assets.length > 0) {
      const points: [number, number][] = assets
        .map(a => {
          const item = a as any;
          const lat = Number(item.coordinates?.lat ?? item.latitude);
          const lng = Number(item.coordinates?.lng ?? item.longitude);
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) return [lat, lng] as [number, number];
          return null;
        })
        .filter((p): p is [number, number] => p !== null);

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        hasFitted.current = true;
      }
    }
  }, [assets, map]);

  return null;
};

export const NetworkMap: React.FC<NetworkMapProps> = ({
  manholes,
  pumpStations,
  pipes,
  wtps = [],
  waterAccessories = [],
  greaseTraps = [],
  inspections,
  activeTraceResult,
  onTraceDownstream,
  onTraceUpstream,
  onClearTrace,
  onOpenQrModal,
  onOpenNewInspection,
  selectedAssetIdFromParent,
  onRefreshOnZoom
}) => {
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [showManholes, setShowManholes] = useState(true);
  const [showPipes, setShowPipes] = useState(true);
  const [showPumpStations, setShowPumpStations] = useState(true);
  const [showWtps, setShowWtps] = useState(true);
  const [showWaterAccessories, setShowWaterAccessories] = useState(true);
  const [showGreaseTraps, setShowGreaseTraps] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Basemap Switcher State (Default: Google Hybrid Satellite)
  type BasemapType = 'google_hybrid' | 'google_satellite' | 'esri_satellite' | 'carto_voyager' | 'carto_dark';
  const [basemap, setBasemap] = useState<BasemapType>('google_hybrid');

  const BASEMAP_TILES: Record<BasemapType, { name: string; icon: string; url: string; attribution: string }> = {
    google_hybrid: {
      name: 'Google Satelit Hybrid',
      icon: '🛰️',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps'
    },
    google_satellite: {
      name: 'Google Satelit Raw',
      icon: '🌍',
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps'
    },
    esri_satellite: {
      name: 'ArcGIS Satellite',
      icon: '📡',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar &mdash; ArcGIS World Imagery'
    },
    carto_voyager: {
      name: 'CARTO Light GIS',
      icon: '🗺️',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    },
    carto_dark: {
      name: 'CARTO Night Mode',
      icon: '🌙',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
    }
  };

  // Center Coordinates for Bukit Indah
  const defaultCenter: [number, number] = [-6.444, 107.452];
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);

  // Defensive Coordinate Extractor
  const getRawCoords = (asset: any): [number, number] | null => {
    if (!asset) return null;
    const lat = Number(asset.coordinates?.lat ?? asset.latitude);
    const lng = Number(asset.coordinates?.lng ?? asset.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return null;
  };

  // Synchronize when asset is selected from parent or table
  useEffect(() => {
    if (selectedAssetIdFromParent) {
      setSelectedAssetId(selectedAssetIdFromParent);
      const allAssets = [...manholes, ...pumpStations, ...(wtps || []), ...(waterAccessories || []), ...(greaseTraps || [])];
      const matched = allAssets.find(a => a.id === selectedAssetIdFromParent);
      if (matched) {
        const c = getRawCoords(matched);
        if (c) setPanTarget(c);
      }
    }
  }, [selectedAssetIdFromParent, manholes, pumpStations, wtps, waterAccessories, greaseTraps]);

  const handleSelectAsset = (asset: SewerAsset | null) => {
    setSelectedAssetId(asset ? asset.id : null);
  };

  // Pure Precise GIS Coordinate Extractor (No Artificial Offsets)
  const getDisambiguatedCoords = (asset: any, idx: number): [number, number] => {
    const raw = getRawCoords(asset);
    if (!raw) {
      // Offset default fallback
      const angle = idx * 2.094; // 120 deg
      const radius = 0.0015;
      return [
        Number((-6.444 + Math.sin(angle) * radius).toFixed(6)),
        Number((107.452 + Math.cos(angle) * radius).toFixed(6))
      ];
    }
    return raw;
  };

  // Combined asset node coordinates mapping for polyline connections (Manholes, Pump Stations, WTPs, Accessories, Grease Traps)
  const nodeCoordsMap = new Map<string, [number, number]>();
  const allNodeAssets = [...manholes, ...pumpStations, ...(wtps || []), ...(waterAccessories || []), ...(greaseTraps || [])];
  
  allNodeAssets.forEach((asset, idx) => {
    const coords = getDisambiguatedCoords(asset, idx);
    if (asset.id) nodeCoordsMap.set(asset.id, coords);
    if (asset.assetCode) nodeCoordsMap.set(asset.assetCode, coords);
  });

  // Filters logic
  const filteredManholes = manholes.filter(m => {
    const areaMatch = selectedArea === 'All Areas' || m.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || m.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const filteredPumpStations = pumpStations.filter(p => {
    const areaMatch = selectedArea === 'All Areas' || p.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || p.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const filteredPipes = pipes.filter(p => {
    const areaMatch = selectedArea === 'All Areas' || p.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || p.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const filteredWtps = wtps.filter(w => {
    const areaMatch = selectedArea === 'All Areas' || w.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || w.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const filteredWaterAccessories = waterAccessories.filter(a => {
    const areaMatch = selectedArea === 'All Areas' || a.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || a.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const filteredGreaseTraps = greaseTraps.filter(gt => {
    const areaMatch = selectedArea === 'All Areas' || gt.area === selectedArea;
    const condMatch = selectedCondition === 'All Conditions' || gt.condition === selectedCondition;
    return areaMatch && condMatch;
  });

  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes, ...wtps, ...waterAccessories, ...greaseTraps];
  const selectedAsset = allAssets.find(a => a.id === selectedAssetId) || null;

  // Active Topology Trace Path Check
  const isAssetInTrace = (id: string) => {
    if (!activeTraceResult) return false;
    return activeTraceResult.pathAssetIds.includes(id);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden">
      {/* Floating Filter Bar Overlay */}
      <MapFilters
        selectedArea={selectedArea}
        onSelectArea={setSelectedArea}
        showManholes={showManholes}
        onToggleManholes={setShowManholes}
        showPipes={showPipes}
        onTogglePipes={setShowPipes}
        showPumpStations={showPumpStations}
        onTogglePumpStations={setShowPumpStations}
        selectedCondition={selectedCondition}
        onSelectCondition={setSelectedCondition}
        isTraceActive={!!activeTraceResult}
        onClearTrace={onClearTrace}
        basemap={basemap}
        onSelectBasemap={(b) => setBasemap(b as BasemapType)}
        availableAreas={Array.from(new Set([...manholes, ...pumpStations, ...pipes].map(a => a.area).filter(Boolean)))}
      />

      {/* Floating Highlight Active Banner (Center Top) */}
      {selectedAssetId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-white backdrop-blur-md border border-pink-500/60 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-ping"></span>
          <span>📍 Lokasi Aset: <span className="text-pink-400 font-mono font-extrabold">{allAssets.find(a => a.id === selectedAssetId)?.assetCode}</span> — {allAssets.find(a => a.id === selectedAssetId)?.name} <span className="text-pink-300 font-normal">(Titik Pink Menyala)</span></span>
          <button
            onClick={() => setSelectedAssetId(null)}
            className="ml-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center transition cursor-pointer text-[10px]"
            title="Tutup Sorotan"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Quick Basemap Switcher Pill (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-extrabold">
        <button
          onClick={() => setBasemap('google_hybrid')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'google_hybrid' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Foto Satelit Real Google Maps Hybrid"
        >
          <span>🛰️</span>
          <span>Google Satelit</span>
        </button>
        <button
          onClick={() => setBasemap('esri_satellite')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'esri_satellite' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="ArcGIS World Imagery Satellite"
        >
          <span>📡</span>
          <span>ArcGIS</span>
        </button>
        <button
          onClick={() => setBasemap('carto_voyager')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'carto_voyager' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="CARTO Light GIS View"
        >
          <span>🗺️</span>
          <span>Clean GIS</span>
        </button>
        <button
          onClick={() => setBasemap('carto_dark')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'carto_dark' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="CARTO Night Mode"
        >
          <span>🌙</span>
          <span>Night</span>
        </button>
      </div>

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full min-h-[600px]"
        zoomControl={true}
      >
        <MapController centerCoords={panTarget} />
        <MapBoundsAutoFitter assets={allAssets} />

        {/* Dynamic Basemap Tile Layer */}
        <TileLayer
          key={basemap}
          attribution={BASEMAP_TILES[basemap].attribution}
          url={BASEMAP_TILES[basemap].url}
          maxZoom={19}
        />

        {/* Render Pipe Polyline Lines */}
        {showPipes && filteredPipes.map((pipe) => {
          const fromCoords = nodeCoordsMap.get(pipe.fromAssetId);
          const toCoords = nodeCoordsMap.get(pipe.toAssetId);
          if (!fromCoords || !toCoords) return null;

          const inTrace = isAssetInTrace(pipe.id);
          const isTransmission = pipe.pipeCategory === 'transmission';

          // Waypoints support for non-straight transmission lines
          const positions: [number, number][] = [fromCoords];
          if (isTransmission && pipe.waypoints && Array.isArray(pipe.waypoints) && pipe.waypoints.length > 0) {
            pipe.waypoints.forEach(w => {
              if (w && typeof w.lat === 'number' && typeof w.lng === 'number') {
                positions.push([w.lat, w.lng]);
              }
            });
          }
          positions.push(toCoords);

          // PIPE COLOR DISTINCTION: Brown for Sewer & Blue for Clean Water (PAM)
          const isCleanWater = pipe.systemCategory === 'clean_water' || pipe.pipeCategory === 'clean_water_distribution';
          let strokeColor = '#8B4513'; // Default Coklat Pipa Sewer (Sewerage)
          if (isCleanWater) {
            strokeColor = '#0284C7'; // Biru Cerah Pipa Air Bersih (PAM)
          } else if (isTransmission) {
            strokeColor = '#8D4004'; // Coklat Tua Pipa Transmisi Tekanan (Force Main WWTP)
          }

          if (pipe.condition === 'Warning') strokeColor = '#D97706';
          if (pipe.condition === 'Critical') strokeColor = '#DC2626';

          if (activeTraceResult) {
            strokeColor = inTrace ? '#2563EB' : '#94A3B8'; // Highlight trace in blue, dim rest
          }

          const weight = inTrace ? 7 : (isTransmission ? 6 : 4);
          const opacity = activeTraceResult && !inTrace ? 0.3 : 0.95;
          const dashArray = isTransmission ? '10, 8' : undefined;

          return (
            <Polyline
              key={pipe.id}
              positions={positions}
              pathOptions={{
                color: strokeColor,
                weight: weight,
                opacity: opacity,
                dashArray: dashArray,
                className: isTransmission ? 'flowing-transmission-pipe' : 'flowing-pipe'
              }}
              eventHandlers={{
                click: () => handleSelectAsset(pipe)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#2563EB] font-mono">{pipe.assetCode}</span>
                    {isTransmission && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        ⚡ Transmission (Force Main)
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-900">{pipe.name}</div>
                  <div className="text-slate-600">Diameter: {pipe.diameterMm}mm ({pipe.material})</div>
                  {isTransmission && pipe.pressureBar && (
                    <div className="text-amber-600 font-bold">Tekanan Kerja: {pipe.pressureBar} bar</div>
                  )}
                  {isTransmission && pipe.destinationWwtpName && (
                    <div className="text-slate-600 font-semibold">Tujuan: 🏢 {pipe.destinationWwtpName}</div>
                  )}
                  <div className="text-slate-600">Panjang: {pipe.lengthMeters}m {pipe.waypoints?.length ? `(${pipe.waypoints.length} Tikungan Waypoint)` : ''}</div>
                  <button
                    onClick={() => handleSelectAsset(pipe)}
                    className="mt-2 text-[10px] bg-[#2563EB] text-white font-bold px-2.5 py-1 rounded-full w-full hover:bg-blue-700 transition"
                  >
                    Buka Detail Pipa
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Render Manhole Markers */}
        {showManholes && filteredManholes.map((mh, idx) => {
          const coords = getDisambiguatedCoords(mh, idx);
          if (!coords) return null;
          const inTrace = isAssetInTrace(mh.id);
          const isHighlighted = selectedAssetId === mh.id || selectedAssetIdFromParent === mh.id;
          const icon = createManholeIcon(mh.condition, isHighlighted || inTrace);
          const opacity = activeTraceResult && !inTrace ? 0.4 : 1.0;

          return (
            <Marker
              key={mh.id}
              position={coords}
              icon={icon}
              opacity={opacity}
              eventHandlers={{
                click: () => handleSelectAsset(mh)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#2563EB] font-mono">{mh.assetCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{mh.condition}</span>
                  </div>
                  <div className="font-bold text-slate-900">{mh.name}</div>
                  <div className="text-slate-500">Kedalaman: {mh.depthMeters}m | Area: {mh.area}</div>
                  <div className="pt-2 flex gap-1.5">
                    <button
                      onClick={() => onTraceDownstream(mh.id)}
                      className="text-[10px] bg-[#2563EB] text-white font-bold px-2.5 py-1 rounded-full flex-1 hover:bg-blue-700 transition"
                    >
                      Trace Downstream
                    </button>
                    <button
                      onClick={() => handleSelectAsset(mh)}
                      className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Pump Station Markers */}
        {showPumpStations && filteredPumpStations.map((ps, idx) => {
          const coords = getDisambiguatedCoords(ps, idx);
          if (!coords) return null;
          const inTrace = isAssetInTrace(ps.id);
          const isHighlighted = selectedAssetId === ps.id || selectedAssetIdFromParent === ps.id;
          const icon = createPumpStationIcon(isHighlighted || inTrace);

          return (
            <Marker
              key={ps.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => handleSelectAsset(ps)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-[#2563EB]">{ps.assetCode} — Pump Station</div>
                  <div className="font-bold text-slate-900">{ps.name}</div>
                  <div className="text-slate-600">Kapasitas: {ps.capacityLps} L/s ({ps.activePumps} Pompa Aktif)</div>
                  <button
                    onClick={() => handleSelectAsset(ps)}
                    className="mt-2 text-[10px] bg-[#2563EB] text-white font-bold px-2.5 py-1 rounded-full w-full hover:bg-blue-700 transition"
                  >
                    Buka Detail Stasiun Pompa
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render WTP (Water Treatment Plant) Markers */}
        {showWtps && filteredWtps.map((wtp, idx) => {
          const coords = getDisambiguatedCoords(wtp, idx);
          if (!coords) return null;
          const inTrace = isAssetInTrace(wtp.id);
          const isHighlighted = selectedAssetId === wtp.id || selectedAssetIdFromParent === wtp.id;
          const icon = createWtpIcon(isHighlighted || inTrace);

          return (
            <Marker
              key={wtp.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => handleSelectAsset(wtp)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0284C7] font-mono">{wtp.assetCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-700 border border-cyan-300">
                      🏭 WTP Air Bersih
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900">{wtp.name}</div>
                  <div className="text-slate-600 font-medium">Kapasitas Produksi: <span className="font-bold text-slate-900">{wtp.productionCapacityLps} L/detik</span></div>
                  <div className="text-slate-600 font-medium">Sumber Air Baku: <span className="font-bold text-slate-900">{wtp.rawWaterSource}</span></div>
                  <div className="text-emerald-600 font-bold">Kualitas: {wtp.waterQualityStatus}</div>
                  <button
                    onClick={() => handleSelectAsset(wtp)}
                    className="mt-2 text-[10px] bg-[#0284C7] text-white font-bold px-2.5 py-1 rounded-full w-full hover:bg-sky-700 transition"
                  >
                    Buka Detail Instalasi WTP
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Water Accessories & Valves Markers */}
        {showWaterAccessories && filteredWaterAccessories.map((acc, idx) => {
          const coords = getDisambiguatedCoords(acc, idx);
          if (!coords) return null;
          const inTrace = isAssetInTrace(acc.id);
          const isHighlighted = selectedAssetId === acc.id || selectedAssetIdFromParent === acc.id;
          const icon = createWaterAccessoryIcon(acc.accessoryType, isHighlighted || inTrace);

          return (
            <Marker
              key={acc.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => handleSelectAsset(acc)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-cyan-700 font-mono">{acc.assetCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 uppercase">
                      {acc.accessoryType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900">{acc.name}</div>
                  <div className="text-slate-600">Diameter: {acc.diameterMm}mm | Tekanan: {acc.pressureBar || 6.0} bar</div>
                  <div className="text-cyan-700 font-bold">Status Operasi: {acc.operatingStatus}</div>
                  <button
                    onClick={() => handleSelectAsset(acc)}
                    className="mt-2 text-[10px] bg-cyan-600 text-white font-bold px-2.5 py-1 rounded-full w-full hover:bg-cyan-700 transition"
                  >
                    Buka Detail Aksesoris
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Grease Trap Markers */}
        {showGreaseTraps && filteredGreaseTraps.map((gt, idx) => {
          const coords = getDisambiguatedCoords(gt, idx);
          if (!coords) return null;
          const inTrace = isAssetInTrace(gt.id);
          const isHighlighted = selectedAssetId === gt.id || selectedAssetIdFromParent === gt.id;
          const icon = createGreaseTrapIcon(isHighlighted || inTrace);

          return (
            <Marker
              key={gt.id}
              position={coords}
              icon={icon}
              eventHandlers={{
                click: () => handleSelectAsset(gt)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-bold text-amber-700 font-mono">{gt.assetCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-800 border border-amber-300 uppercase">
                      🍳 Grease Trap
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900">{gt.name}</div>
                  <div className="text-slate-600">Kapasitas: <span className="font-bold text-slate-900">{gt.capacityLiters} Liter</span> | Sekat: <span className="font-bold text-slate-900">{gt.chamberCount} Chambers</span></div>
                  <div className="text-amber-800 font-bold">Akumulasi Lemak: {gt.greaseLevelPercent || 15}%</div>
                  <button
                    onClick={() => handleSelectAsset(gt)}
                    className="mt-2 text-[10px] bg-amber-600 text-white font-bold px-2.5 py-1 rounded-full w-full hover:bg-amber-700 transition"
                  >
                    Buka Detail Grease Trap
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Asset Slide-over Drawer */}
      <AssetDrawer
        asset={selectedAsset}
        onClose={() => handleSelectAsset(null)}
        onTraceDownstream={onTraceDownstream}
        onTraceUpstream={onTraceUpstream}
        onOpenQrModal={onOpenQrModal}
        onOpenNewInspection={onOpenNewInspection}
        inspections={inspections}
        allAssets={allAssets}
      />
    </div>
  );
};
