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
  const [selectedAsset, setSelectedAsset] = useState<SewerAsset | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [selectedCondition, setSelectedCondition] = useState<string>('All Conditions');
  const [showManholes, setShowManholes] = useState(true);
  const [showPipes, setShowPipes] = useState(true);
  const [showPumpStations, setShowPumpStations] = useState(true);

  // Center map on Jakarta network default
  const defaultCenter: [number, number] = [-6.2128, 106.8255];
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);

  // Handle parent selection (e.g. from Dashboard click)
  useEffect(() => {
    if (selectedAssetIdFromParent) {
      const mh = manholes.find(m => m.id === selectedAssetIdFromParent);
      const ps = pumpStations.find(p => p.id === selectedAssetIdFromParent);
      const target = mh || ps;
      if (target && 'coordinates' in target) {
        setSelectedAsset(target);
        setPanTarget([target.coordinates.lat, target.coordinates.lng]);
      }
    }
  }, [selectedAssetIdFromParent, manholes, pumpStations]);

  // Combine node assets
  const allNodeAssets = [...manholes, ...pumpStations];
  const allAssets: SewerAsset[] = [...manholes, ...pumpStations, ...pipes];

  // Helper map for coordinates lookup
  const nodeCoordsMap = new Map<string, [number, number]>();
  allNodeAssets.forEach(node => {
    nodeCoordsMap.set(node.id, [node.coordinates.lat, node.coordinates.lng]);
  });

  // Filtered Assets
  const filteredManholes = manholes.filter(mh => {
    if (selectedArea !== 'All Areas' && mh.area !== selectedArea) return false;
    if (selectedCondition !== 'All Conditions' && mh.condition !== selectedCondition) return false;
    return true;
  });

  const filteredPumpStations = pumpStations.filter(ps => {
    if (selectedArea !== 'All Areas' && ps.area !== selectedArea) return false;
    if (selectedCondition !== 'All Conditions' && ps.condition !== selectedCondition) return false;
    return true;
  });

  const filteredPipes = pipes.filter(p => {
    if (selectedArea !== 'All Areas' && p.area !== selectedArea) return false;
    if (selectedCondition !== 'All Conditions' && p.condition !== selectedCondition) return false;
    return true;
  });

  // Check if asset is part of active trace
  const isAssetInTrace = (id: string) => {
    if (!activeTraceResult) return false;
    return activeTraceResult.pathAssetIds.includes(id);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
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
      />

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController centerCoords={panTarget} />

        {/* CartoDB Voyager Light Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                click: () => setSelectedAsset(pipe)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[#2563EB] font-mono">{pipe.assetCode}</div>
                  <div className="font-semibold text-slate-900">{pipe.name}</div>
                  <div className="text-slate-600">Diameter: {pipe.diameterMm}mm ({pipe.material})</div>
                  <div className="text-slate-600">Panjang: {pipe.lengthMeters}m</div>
                  <button
                    onClick={() => setSelectedAsset(pipe)}
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
          const inTrace = isAssetInTrace(mh.id);
          const icon = createManholeIcon(mh.condition, inTrace);
          const opacity = activeTraceResult && !inTrace ? 0.4 : 1.0;

          return (
            <Marker
              key={mh.id}
              position={[mh.coordinates.lat, mh.coordinates.lng]}
              icon={icon}
              opacity={opacity}
              eventHandlers={{
                click: () => setSelectedAsset(mh)
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
                      onClick={() => setSelectedAsset(mh)}
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
          const inTrace = isAssetInTrace(ps.id);
          const icon = createPumpStationIcon(inTrace);

          return (
            <Marker
              key={ps.id}
              position={[ps.coordinates.lat, ps.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => setSelectedAsset(ps)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-[#2563EB]">{ps.assetCode} — Pump Station</div>
                  <div className="font-bold text-slate-900">{ps.name}</div>
                  <div className="text-slate-600">Kapasitas: {ps.capacityLps} L/s ({ps.activePumps} Pompa Aktif)</div>
                  <button
                    onClick={() => setSelectedAsset(ps)}
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
        onClose={() => setSelectedAsset(null)}
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
