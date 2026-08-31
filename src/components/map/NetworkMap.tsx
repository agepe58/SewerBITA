import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset } from '../../types/asset';
import { NetworkTraceResult } from '../../types/topology';
import { MapFilters } from './MapFilters';
import { AssetDrawer } from './AssetDrawer';
import { InspectionRecord } from '../../types/inspection';

interface NetworkMapProps {
  manholes: ManholeAsset[];
  pumpStations: PumpStationAsset[];
  pipes: PipeAsset[];
  inspections: InspectionRecord[];
  activeTraceResult: NetworkTraceResult | null;
  onTraceDownstream: (assetId: string) => void;
  onTraceUpstream: (assetId: string) => void;
  onClearTrace: () => void;
  onOpenQrModal: (assetId: string) => void;
  onOpenNewInspection: (assetId: string) => void;
  selectedAssetIdFromParent?: string | null;
}

// Custom Leaflet DivIcons for Light Minimal Theme
const createManholeIcon = (condition: string, isHighlighted: boolean) => {
  let color = '#16A34A'; // Good
  if (condition === 'Fair') color = '#0284C7';
  if (condition === 'Warning') color = '#CA8A04';
  if (condition === 'Critical') color = '#DC2626';

  const pulseClass = condition === 'Critical' || isHighlighted ? 'animate-ping' : '';
  const borderStyle = isHighlighted ? 'border-2 border-[#2563EB] scale-125' : 'border border-white';

  return L.divIcon({
    className: 'custom-mh-icon',
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        ${isHighlighted || condition === 'Critical' ? `<span class="absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}" style="background-color: ${color}"></span>` : ''}
        <div class="relative w-5 h-5 rounded-full flex items-center justify-center ${borderStyle} shadow-md" style="background-color: ${color}">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const createPumpStationIcon = (isHighlighted: boolean) => {
  return L.divIcon({
    className: 'custom-ps-icon',
    html: `
      <div class="relative flex items-center justify-center w-9 h-9 bg-[#2563EB] text-white rounded-xl border-2 border-white shadow-lg ${isHighlighted ? 'scale-125' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
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

export const NetworkMap: React.FC<NetworkMapProps> = ({
  manholes,
  pumpStations,
  pipes,
  inspections,
  activeTraceResult,
  onTraceDownstream,
  onTraceUpstream,
  onClearTrace,
  onOpenQrModal,
  onOpenNewInspection,
  selectedAssetIdFromParent
}) => {
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [showManholes, setShowManholes] = useState(true);
  const [showPipes, setShowPipes] = useState(true);
  const [showPumpStations, setShowPumpStations] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Basemap Switcher State (Default: Esri Satellite / CARTO Voyager)
  type BasemapType = 'esri_satellite' | 'carto_voyager' | 'carto_dark' | 'osm_standard';
  const [basemap, setBasemap] = useState<BasemapType>('esri_satellite');

  const BASEMAP_TILES: Record<BasemapType, { name: string; icon: string; url: string; attribution: string }> = {
    esri_satellite: {
      name: 'Foto Satelit Real',
      icon: '🛰️',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics &mdash; ArcGIS World Imagery'
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
    },
    osm_standard: {
      name: 'OpenStreetMap',
      icon: '🏙️',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  };

  // Defensive Coordinate Extractor
  const getCoords = (asset: any): [number, number] | null => {
    if (!asset) return null;
    const lat = Number(asset.coordinates?.lat ?? asset.latitude);
    const lng = Number(asset.coordinates?.lng ?? asset.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
    return [-6.444, 107.452];
  };

  // Center Coordinates for Bukit Indah
  const defaultCenter: [number, number] = [-6.444, 107.452];
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);

  // Synchronize when asset is selected from parent or table
  useEffect(() => {
    if (selectedAssetIdFromParent) {
      setSelectedAssetId(selectedAssetIdFromParent);
      const matched = [...manholes, ...pumpStations].find(a => a.id === selectedAssetIdFromParent);
      if (matched) {
        const c = getCoords(matched);
        if (c) setPanTarget(c);
      }
    }
  }, [selectedAssetIdFromParent, manholes, pumpStations]);

  const handleSelectAsset = (asset: SewerAsset | null) => {
    setSelectedAssetId(asset ? asset.id : null);
  };

  // Combined asset node coordinates mapping for polyline connections
  const nodeCoordsMap = new Map<string, [number, number]>();
  manholes.forEach(m => {
    const c = getCoords(m);
    if (c) nodeCoordsMap.set(m.id, c);
  });
  pumpStations.forEach(p => {
    const c = getCoords(p);
    if (c) nodeCoordsMap.set(p.id, c);
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

  const selectedAsset = [...manholes, ...pumpStations, ...pipes].find(a => a.id === selectedAssetId) || null;
  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];

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

      {/* Floating Quick Basemap Switcher Pill (Top Right) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs font-extrabold">
        <button
          onClick={() => setBasemap('esri_satellite')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'esri_satellite' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="Foto Satelit Real gratis dari Esri ArcGIS"
        >
          <span>🛰️</span>
          <span>Foto Satelit</span>
        </button>
        <button
          onClick={() => setBasemap('carto_voyager')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            basemap === 'carto_voyager' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="CARTO Voyager Clean GIS View"
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
        zoomControl={false}
      >
        <MapController centerCoords={panTarget} />

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

          let strokeColor = '#0284C7'; // default cyan
          if (pipe.condition === 'Warning') strokeColor = '#CA8A04';
          if (pipe.condition === 'Critical') strokeColor = '#DC2626';

          if (activeTraceResult) {
            strokeColor = inTrace ? '#2563EB' : '#94A3B8'; // Highlight trace, dim rest
          }

          const weight = inTrace ? 6 : 4;
          const opacity = activeTraceResult && !inTrace ? 0.3 : 0.9;

          return (
            <Polyline
              key={pipe.id}
              positions={[fromCoords, toCoords]}
              pathOptions={{
                color: strokeColor,
                weight: weight,
                opacity: opacity,
                className: 'flowing-pipe'
              }}
              eventHandlers={{
                click: () => handleSelectAsset(pipe)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[#2563EB] font-mono">{pipe.assetCode}</div>
                  <div className="font-semibold text-slate-900">{pipe.name}</div>
                  <div className="text-slate-600">Diameter: {pipe.diameterMm}mm ({pipe.material})</div>
                  <div className="text-slate-600">Panjang: {pipe.lengthMeters}m</div>
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
        {showManholes && filteredManholes.map((mh) => {
          const coords = getCoords(mh);
          if (!coords) return null;
          const inTrace = isAssetInTrace(mh.id);
          const icon = createManholeIcon(mh.condition, inTrace);
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
        {showPumpStations && filteredPumpStations.map((ps) => {
          const coords = getCoords(ps);
          if (!coords) return null;
          const inTrace = isAssetInTrace(ps.id);
          const icon = createPumpStationIcon(inTrace);

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
