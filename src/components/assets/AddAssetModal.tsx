import React, { useState } from 'react';
import { X, Plus, MapPin, Boxes, GitBranch, Zap, Layers } from 'lucide-react';
import { ManholeAsset, PipeAsset, PumpStationAsset, AssetType, SewerAsset, WtpAsset, WaterAccessoryAsset, WaterAccessoryType, SystemCategory } from '../../types/asset';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManhole: (
    manhole: Omit<ManholeAsset, 'id'>,
    intermediateInfo?: { upstreamId: string; downstreamId: string }
  ) => void;
  onAddPipe: (pipe: Omit<PipeAsset, 'id'>) => void;
  onAddPumpStation: (pumpStation: Omit<PumpStationAsset, 'id'>) => void;
  onAddWtp?: (wtp: Omit<WtpAsset, 'id'>) => void;
  onAddWaterAccessory?: (accessory: Omit<WaterAccessoryAsset, 'id'>) => void;
  existingManholes: ManholeAsset[];
  existingPumpStations?: PumpStationAsset[];
  areas: string[];
  onAddArea: (newAreaName: string) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddManhole,
  onAddPipe,
  onAddPumpStation,
  onAddWtp,
  onAddWaterAccessory,
  existingManholes,
  existingPumpStations = [],
  areas,
  onAddArea
}) => {
  const [assetType, setAssetType] = useState<AssetType>('manhole');

  // Dynamic Area management state
  const [area, setArea] = useState(areas[0] || '');
  const [isAddingNewArea, setIsAddingNewArea] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');

  // Form states for Manhole
  const [assetCode, setAssetCode] = useState('MH-' + Math.floor(100 + Math.random() * 900));
  const [name, setName] = useState('');
  const [depthMeters, setDepthMeters] = useState(3.5);
  const [diameterMm, setDiameterMm] = useState(1000);
  const [material, setMaterial] = useState('Precast Concrete');
  // Dynamic initial coordinates near Kota Bukit Indah
  const [lat, setLat] = useState(() => -6.444 + ((existingManholes.length || 0) * 0.0025));
  const [lng, setLng] = useState(() => 107.452 + ((existingManholes.length || 0) * 0.003));
  const [googleMapsInput, setGoogleMapsInput] = useState('');

  // Form states for Pump Station
  const [psCode, setPsCode] = useState('PS-' + Math.floor(100 + Math.random() * 900));
  const [psName, setPsName] = useState('');
  const [capacityLps, setCapacityLps] = useState(450);
  const [pumpCount, setPumpCount] = useState(4);
  const [activePumps, setActivePumps] = useState(3);
  const [powerSource, setPowerSource] = useState('PLN 250 kVA + Diesel Genset');

  // WTP States
  const [wtpCode, setWtpCode] = useState('WTP-' + Math.floor(100 + Math.random() * 900));
  const [wtpName, setWtpName] = useState('');
  const [productionCapacityLps, setProductionCapacityLps] = useState(500);
  const [rawWaterSource, setRawWaterSource] = useState('Sungai Citarum / Waduk Jatiluhur');
  const [waterQualityStatus, setWaterQualityStatus] = useState('Aman - Sesuai Permenkes 2023');

  // Water Accessory States
  const [accCode, setAccCode] = useState('ACC-' + Math.floor(100 + Math.random() * 900));
  const [accName, setAccName] = useState('');
  const [accessoryType, setAccessoryType] = useState<WaterAccessoryType>('air_valve');
  const [accSystemCategory, setAccSystemCategory] = useState<SystemCategory>('sewerage');
  const [accDiameter, setAccDiameter] = useState(150);
  const [accPressure, setAccPressure] = useState(6.0);
  const [operatingStatus, setOperatingStatus] = useState<'Normal Open' | 'Normal Closed' | 'Active' | 'Under Maintenance'>('Normal Open');

  // Intermediate Insertion State
  const [isIntermediate, setIsIntermediate] = useState(false);
  const [upstreamMhId, setUpstreamMhId] = useState(existingManholes[0]?.id || '');
  const [downstreamMhId, setDownstreamMhId] = useState(existingManholes[1]?.id || '');

  const handleCreateNewArea = () => {
    if (customAreaName.trim()) {
      const trimmed = customAreaName.trim();
      onAddArea(trimmed);
      setArea(trimmed);
      setIsAddingNewArea(false);
      setCustomAreaName('');
    }
  };

  // Helper to handle intermediate selection
  const handleSelectIntermediateUpstream = (uId: string) => {
    setUpstreamMhId(uId);
    const uMh = existingManholes.find(m => m.id === uId);
    if (uMh) {
      setAssetCode(`${uMh.assetCode}.A`);
      setName(`Manhole Sisipan ${uMh.assetCode}.A`);
      setArea(uMh.area);

      // If downstream exists, set midpoint coords
      const dMh = existingManholes.find(m => m.id === downstreamMhId);
      if (dMh) {
        setLat(Number(((uMh.coordinates.lat + dMh.coordinates.lat) / 2).toFixed(6)));
        setLng(Number(((uMh.coordinates.lng + dMh.coordinates.lng) / 2).toFixed(6)));
      }
    }
  };

  // Helper to parse Google Maps URL or "lat, lng" string automatically
  const parseGoogleMapsInput = (val: string) => {
    setGoogleMapsInput(val);
    if (!val.trim()) return;

    const match = val.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (match) {
      const parsedLat = parseFloat(match[1]);
      const parsedLng = parseFloat(match[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLat(parsedLat);
        setLng(parsedLng);
      }
    }
  };

  // Form states for Pipe
  const [pipeCode, setPipeCode] = useState('');
  const [pipeName, setPipeName] = useState('');
  const [fromAssetId, setFromAssetId] = useState(existingManholes[0]?.id || '');
  const [toAssetId, setToAssetId] = useState(existingManholes[1]?.id || '');
  const [pipeDiameter, setPipeDiameter] = useState(800);
  const [pipeMaterial, setPipeMaterial] = useState('HDPE');
  const [pipeLength, setPipeLength] = useState(450);

  // Transmission & Clean Water Pipe specific state
  const [pipeCategory, setPipeCategory] = useState<'gravity' | 'transmission' | 'clean_water_distribution'>('gravity');
  const [pressureBar, setPressureBar] = useState<number>(6.0);
  const [destinationWwtpName, setDestinationWwtpName] = useState<string>('WWTP Bukit Indah Central');
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number }[]>([]);

  // Auto-generate Manhole Code based on Civil Engineering Standards (e.g. MH-SD-01, MH-SD-01.1)
  React.useEffect(() => {
    if (isIntermediate && upstreamMhId) {
      const uMh = existingManholes.find(m => m.id === upstreamMhId);
      if (uMh) {
        const prefix = uMh.assetCode;
        const subCount = existingManholes.filter(m => m.assetCode.startsWith(`${prefix}.`)).length;
        const autoCode = `${prefix}.${subCount + 1}`;
        setAssetCode(autoCode);
        setName(`Manhole Sisipan ${autoCode}`);
      }
    } else if (area) {
      const cleanArea = area.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const areaParts = cleanArea.split(/\s+/);
      const areaTag = areaParts.map(p => p[0]?.toUpperCase() || '').join('').slice(0, 3) || 'AR';
      const prefix = `MH-${areaTag}`;
      const count = existingManholes.filter(m => m.area === area).length + 1;
      const autoCode = `${prefix}-${String(count).padStart(2, '0')}`;
      setAssetCode(autoCode);
      setName(`Manhole Kolektor ${autoCode}`);
    }
  }, [isIntermediate, upstreamMhId, area, isOpen]);

  // Auto-generate Pipe Code based on Category & Connected Assets
  React.useEffect(() => {
    const allNodes = [...existingManholes, ...existingPumpStations];
    const fromNode = allNodes.find(m => m.id === fromAssetId);
    const toNode = allNodes.find(m => m.id === toAssetId);

    if (pipeCategory === 'clean_water_distribution') {
      const code = `P-CW-${Math.floor(100 + Math.random() * 900)}`;
      setPipeCode(code);
      setPipeName(`Pipa Distribusi Air Bersih PAM ${code}`);
      setPipeMaterial('HDPE PN10 / Ductile Iron');
      setPipeDiameter(300);
      setPressureBar(6.0);
    } else if (pipeCategory === 'transmission') {
      const psNode = existingPumpStations.find(p => p.id === fromAssetId) || existingPumpStations[0];
      const code = `P-TR-${psNode ? psNode.assetCode : 'PS'}_WWTP`;
      setPipeCode(code);
      setPipeName(`Pipa Transmisi Tekanan ${psNode ? psNode.assetCode : 'Stasiun Pompa'} → WWTP IPAL`);
      setPipeMaterial('HDPE PN16');
      setPipeDiameter(400);
      setPressureBar(10.0);
    } else if (fromNode && toNode) {
      const code = `P-${fromNode.assetCode}_${toNode.assetCode}`;
      setPipeCode(code);
      setPipeName(`Pipa Segmen ${fromNode.assetCode} → ${toNode.assetCode}`);
    }
  }, [fromAssetId, toAssetId, pipeCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nextDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (assetType === 'manhole') {
      onAddManhole(
        {
          assetCode,
          name: name || `Manhole Baru ${assetCode}`,
          type: 'manhole',
          area,
          status: 'Active',
          condition: 'Good',
          installationYear: 2026,
          lastInspectedAt: today,
          nextInspectionDue: nextDue,
          latitude: Number(lat),
          longitude: Number(lng),
          coordinates: { lat: Number(lat), lng: Number(lng), elevation: 10 },
          depthMeters: Number(depthMeters),
          diameterMm: Number(diameterMm),
          material,
          coverCondition: 'Good - New Sealed',
          photos: []
        },
        isIntermediate && upstreamMhId && downstreamMhId
          ? { upstreamId: upstreamMhId, downstreamId: downstreamMhId }
          : undefined
      );
    } else if (assetType === 'pump_station') {
      onAddPumpStation({
        assetCode: psCode,
        name: psName || `Stasiun Pompa ${psCode}`,
        type: 'pump_station',
        area,
        status: 'Active',
        condition: 'Good',
        installationYear: 2026,
        lastInspectedAt: today,
        nextInspectionDue: nextDue,
        latitude: Number(lat),
        longitude: Number(lng),
        coordinates: { lat: Number(lat), lng: Number(lng), elevation: 10 },
        capacityLps: Number(capacityLps),
        pumpCount: Number(pumpCount),
        activePumps: Number(activePumps),
        powerSource,
        photos: []
      });
    } else if (assetType === 'wtp') {
      if (onAddWtp) {
        onAddWtp({
          assetCode: wtpCode,
          name: wtpName || `WTP Air Bersih ${wtpCode}`,
          type: 'wtp',
          area,
          systemCategory: 'clean_water',
          status: 'Active',
          condition: 'Good',
          installationYear: 2026,
          lastInspectedAt: today,
          nextInspectionDue: nextDue,
          latitude: Number(lat),
          longitude: Number(lng),
          coordinates: { lat: Number(lat), lng: Number(lng), elevation: 15 },
          productionCapacityLps: Number(productionCapacityLps),
          rawWaterSource,
          waterQualityStatus,
          photos: []
        });
      }
    } else if (assetType === 'water_accessory') {
      if (onAddWaterAccessory) {
        onAddWaterAccessory({
          assetCode: accCode,
          name: accName || `Aksesoris Pipa ${accCode}`,
          type: 'water_accessory',
          area,
          systemCategory: accSystemCategory,
          status: 'Active',
          condition: 'Good',
          installationYear: 2026,
          lastInspectedAt: today,
          nextInspectionDue: nextDue,
          latitude: Number(lat),
          longitude: Number(lng),
          coordinates: { lat: Number(lat), lng: Number(lng), elevation: 12 },
          accessoryType,
          diameterMm: Number(accDiameter),
          pressureBar: Number(accPressure),
          operatingStatus,
          photos: []
        });
      }
    } else {
      onAddPipe({
        assetCode: pipeCode,
        name: pipeName || `Pipa ${pipeCode}`,
        type: 'pipe',
        area,
        systemCategory: pipeCategory === 'clean_water_distribution' ? 'clean_water' : 'sewerage',
        status: 'Active',
        condition: 'Good',
        installationYear: 2026,
        lastInspectedAt: today,
        nextInspectionDue: nextDue,
        fromAssetId: (pipeCategory === 'transmission' || pipeCategory === 'clean_water_distribution') && existingPumpStations[0] ? (fromAssetId || existingPumpStations[0].id) : fromAssetId,
        toAssetId: (pipeCategory === 'transmission' || pipeCategory === 'clean_water_distribution') && existingManholes[0] ? (toAssetId || existingManholes[0].id) : toAssetId,
        diameterMm: Number(pipeDiameter),
        material: pipeMaterial,
        lengthMeters: Number(pipeLength),
        flowDirection: 'downstream',
        pipeCategory,
        waypoints: (pipeCategory === 'transmission' || pipeCategory === 'clean_water_distribution') ? waypoints : [],
        pressureBar: (pipeCategory === 'transmission' || pipeCategory === 'clean_water_distribution') ? Number(pressureBar) : undefined,
        destinationWwtpName: pipeCategory === 'transmission' ? destinationWwtpName : (pipeCategory === 'clean_water_distribution' ? 'Zona Distribusi Pelanggan' : undefined),
        photos: []
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#2563EB]" />
            <span>Tambah Aset Jaringan Baru</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="p-4.5 bg-slate-50 border-b border-slate-100">
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Jenis Aset Jaringan</label>
          <div className="grid grid-cols-3 gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => setAssetType('manhole')}
              className={`p-3 rounded-2xl border font-bold transition flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                assetType === 'manhole'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Manhole</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('pipe')}
              className={`p-3 rounded-2xl border font-bold transition flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                assetType === 'pipe'
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Pipa</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('pump_station')}
              className={`p-2.5 rounded-2xl border font-bold transition flex items-center justify-center gap-1 text-xs ${
                assetType === 'pump_station'
                  ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Stasiun Pompa</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('wtp')}
              className={`p-2.5 rounded-2xl border font-bold transition flex items-center justify-center gap-1 text-xs ${
                assetType === 'wtp'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🏭 WTP Air Bersih</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('water_accessory')}
              className={`p-2.5 rounded-2xl border font-bold transition flex items-center justify-center gap-1 text-xs ${
                assetType === 'water_accessory'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🚰 Valve & Aksesoris</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Dynamic Area Selector Component */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <span>Area / Zona / Sektor</span>
              </span>
            </div>

            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#2563EB]"
            >
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {assetType === 'manhole' && (
            <>
              {/* Intermediate Insertion Toggle */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isIntermediate}
                    onChange={e => {
                      const checked = e.target.checked;
                      setIsIntermediate(checked);
                      if (checked && existingManholes.length >= 2) {
                        handleSelectIntermediateUpstream(existingManholes[0].id);
                      }
                    }}
                    className="w-4 h-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
                  />
                  <span className="text-xs font-extrabold text-slate-900">
                    Sisipkan di antara 2 Manhole (Intermediate Node)
                  </span>
                </label>

                {isIntermediate && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-500 font-bold">Node Hulu (Upstream)</label>
                      <select
                        value={upstreamMhId}
                        onChange={e => handleSelectIntermediateUpstream(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                      >
                        {existingManholes.map(m => (
                          <option key={m.id} value={m.id}>{m.assetCode} — {m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-bold">Node Hilir (Downstream)</label>
                      <select
                        value={downstreamMhId}
                        onChange={e => {
                          setDownstreamMhId(e.target.value);
                          const dMh = existingManholes.find(m => m.id === e.target.value);
                          const uMh = existingManholes.find(m => m.id === upstreamMhId);
                          if (uMh && dMh) {
                            setLat(Number(((uMh.coordinates.lat + dMh.coordinates.lat) / 2).toFixed(6)));
                            setLng(Number(((uMh.coordinates.lng + dMh.coordinates.lng) / 2).toFixed(6)));
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                      >
                        {existingManholes.map(m => (
                          <option key={m.id} value={m.id}>{m.assetCode} — {m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Kode Aset (ID)</label>
                <input
                  type="text"
                  value={assetCode}
                  onChange={e => setAssetCode(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Nama Deskriptif Manhole</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="mis. Manhole Kolektor Sudirman B3"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kedalaman (meter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depthMeters}
                    onChange={e => setDepthMeters(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={e => setDiameterMm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Quick Google Maps Coordinates Input Helper */}
              <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    <span>Paste Link / Koordinat Google Maps</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Format: Lat, Lng / URL</span>
                </div>
                <input
                  type="text"
                  value={googleMapsInput}
                  onChange={e => parseGoogleMapsInput(e.target.value)}
                  placeholder="Paste e.g. -6.210452, 106.824123 atau Link Google Maps"
                  className="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Latitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Longitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </>
          )}

          {assetType === 'pump_station' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode Stasiun Pompa (ID)</label>
                  <input
                    type="text"
                    value={psCode}
                    onChange={e => setPsCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Kapasitas Aliran (L/detik)</label>
                  <input
                    type="number"
                    value={capacityLps}
                    onChange={e => setCapacityLps(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Nama Stasiun Pompa</label>
                <input
                  type="text"
                  value={psName}
                  onChange={e => setPsName(e.target.value)}
                  placeholder="mis. Stasiun Pompa Tebet Utama"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Total Unit Pompa</label>
                  <input
                    type="number"
                    value={pumpCount}
                    onChange={e => setPumpCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Jumlah Pompa Aktif</label>
                  <input
                    type="number"
                    value={activePumps}
                    onChange={e => setActivePumps(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Sumber Daya Listrik & Backup</label>
                <input
                  type="text"
                  value={powerSource}
                  onChange={e => setPowerSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-[#059669]"
                />
              </div>

              {/* Quick Google Maps Coordinates Input Helper */}
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#059669]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#059669]" />
                    <span>Paste Link / Koordinat Google Maps</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Format: Lat, Lng / URL</span>
                </div>
                <input
                  type="text"
                  value={googleMapsInput}
                  onChange={e => parseGoogleMapsInput(e.target.value)}
                  placeholder="Paste e.g. -6.210452, 106.824123 atau Link Google Maps"
                  className="w-full bg-white border border-emerald-200 rounded-xl p-2.5 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Latitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Longitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono text-sm focus:outline-none focus:border-[#059669]"
                  />
                </div>
              </div>
            </>
          )}

          {assetType === 'pipe' && (
            <>
              {/* Category Selector Tab */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Kategori Pipa Jaringan</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setPipeCategory('gravity')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      pipeCategory === 'gravity'
                        ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>💧 Gravitasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPipeCategory('transmission')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      pipeCategory === 'transmission'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>⚡ Transmisi (WWTP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPipeCategory('clean_water_distribution')}
                    className={`p-2 rounded-xl border text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                      pipeCategory === 'clean_water_distribution'
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🚰 Air Bersih (PAM)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode Pipa (ID)</label>
                  <input
                    type="text"
                    value={pipeCode}
                    onChange={e => setPipeCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Panjang Total (meter)</label>
                  <input
                    type="number"
                    value={pipeLength}
                    onChange={e => setPipeLength(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {pipeCategory === 'gravity' ? (
                <>
                  <div>
                    <label className="text-xs text-slate-600 font-bold">Node Asal (From Manhole)</label>
                    <select
                      value={fromAssetId}
                      onChange={e => setFromAssetId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 focus:outline-none focus:border-[#0284C7] font-bold text-sm"
                    >
                      {existingManholes.map(mh => (
                        <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-bold">Node Tujuan (To Manhole)</label>
                    <select
                      value={toAssetId}
                      onChange={e => setToAssetId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 focus:outline-none focus:border-[#0284C7] font-bold text-sm"
                    >
                      {existingManholes.map(mh => (
                        <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Transmission Pipe Form Fields */}
                  <div>
                    <label className="text-xs text-amber-700 dark:text-amber-400 font-extrabold">Stasiun Pompa Pengirim (Force Main Origin)</label>
                    <select
                      value={fromAssetId}
                      onChange={e => setFromAssetId(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-3 text-slate-900 mt-1 focus:outline-none focus:border-amber-500 font-bold text-sm"
                    >
                      {existingPumpStations.length > 0 ? (
                        existingPumpStations.map(ps => (
                          <option key={ps.id} value={ps.id}>⚡ {ps.assetCode} — {ps.name} ({ps.capacityLps} L/s)</option>
                        ))
                      ) : (
                        existingManholes.map(mh => (
                          <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-bold">Nama Tujuan IPAL / WWTP</label>
                    <input
                      type="text"
                      value={destinationWwtpName}
                      onChange={e => setDestinationWwtpName(e.target.value)}
                      placeholder="mis. WWTP Bukit Indah Central Main Plant"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 font-bold">Tekanan Kerja (Bar)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={pressureBar}
                        onChange={e => setPressureBar(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600 font-bold">Material Pipa Bertekanan</label>
                      <select
                        value={pipeMaterial}
                        onChange={e => setPipeMaterial(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-bold text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="HDPE PN16">HDPE PN16 (High Density Polyethylene)</option>
                        <option value="Ductile Iron (DI)">Ductile Iron (DI Pipe)</option>
                        <option value="Carbon Steel">Carbon Steel / Baja Lapis</option>
                        <option value="uPVC Pressure">uPVC Pressure Pipe</option>
                      </select>
                    </div>
                  </div>

                  {/* Waypoints Route Curve Generator */}
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-amber-800">Waypoint Tikungan Jalur ({waypoints.length})</div>
                        <div className="text-[11px] text-amber-700/80 font-medium">Lekukan rute berbelok mengikuti jalan raya</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const ps = existingPumpStations.find(p => p.id === fromAssetId) || existingPumpStations[0];
                          const rawLat = ps?.latitude ?? ps?.coordinates?.lat ?? -6.444;
                          const rawLng = ps?.longitude ?? ps?.coordinates?.lng ?? 107.452;
                          const baseLat = typeof rawLat === 'number' && !isNaN(rawLat) ? rawLat : -6.444;
                          const baseLng = typeof rawLng === 'number' && !isNaN(rawLng) ? rawLng : 107.452;
                          const autoWaypoints = [
                            { lat: Number((baseLat + 0.0018).toFixed(6)), lng: Number((baseLng + 0.0012).toFixed(6)) },
                            { lat: Number((baseLat + 0.0035).toFixed(6)), lng: Number((baseLng + 0.0028).toFixed(6)) }
                          ];
                          setWaypoints(autoWaypoints);
                          setPipeLength(680);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] transition shadow-2xs cursor-pointer"
                      >
                        ⚡ Generate Rute Tikungan
                      </button>
                    </div>

                    {waypoints.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {waypoints.map((wp, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">Tikungan #{idx + 1}: <span className="font-mono text-amber-700">{wp.lat}, {wp.lng}</span></span>
                            <button
                              type="button"
                              onClick={() => setWaypoints(waypoints.filter((_, i) => i !== idx))}
                              className="text-rose-500 font-bold hover:text-rose-700 px-1.5 py-0.5 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter Pipa (mm)</label>
                  <input
                    type="number"
                    value={pipeDiameter}
                    onChange={e => setPipeDiameter(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Bahan Material</label>
                  <input
                    type="text"
                    value={pipeMaterial}
                    onChange={e => setPipeMaterial(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
            </>
          )}

          {assetType === 'wtp' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode WTP (ID)</label>
                  <input
                    type="text"
                    value={wtpCode}
                    onChange={e => setWtpCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Kapasitas Produksi (L/s)</label>
                  <input
                    type="number"
                    value={productionCapacityLps}
                    onChange={e => setProductionCapacityLps(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Nama Instalasi WTP Air Bersih</label>
                <input
                  type="text"
                  value={wtpName}
                  onChange={e => setWtpName(e.target.value)}
                  placeholder="mis. WTP Instalasi Pengolahan Air Bersih Utama Jatiluhur"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Sumber Air Baku</label>
                  <input
                    type="text"
                    value={rawWaterSource}
                    onChange={e => setRawWaterSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Status Kualitas Air</label>
                  <input
                    type="text"
                    value={waterQualityStatus}
                    onChange={e => setWaterQualityStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>
            </>
          )}

          {assetType === 'water_accessory' && (
            <>
              {/* System Category Selector */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Peruntukan Sistem Jaringan Pipa</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setAccSystemCategory('sewerage')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      accSystemCategory === 'sewerage'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>⚡ Transmisi Air Limbah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccSystemCategory('clean_water')}
                    className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      accSystemCategory === 'clean_water'
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🚰 Distribusi Air Bersih (PAM)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode Aksesoris (ID)</label>
                  <input
                    type="text"
                    value={accCode}
                    onChange={e => setAccCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Jenis Aksesoris / Valve</label>
                  <select
                    value={accessoryType}
                    onChange={e => setAccessoryType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-bold text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="air_valve">💨 Air Release Valve (Katup Pelepas Udara)</option>
                    <option value="dresser_joint">🔗 Dresser Joint (Sambungan Fleksibel)</option>
                    <option value="gate_valve">🚰 Gate Valve (Katup Penutup Aliran)</option>
                    <option value="check_valve">🛑 Check Valve (Katup Satu Arah)</option>
                    <option value="tee_fitting">🔀 Percabangan Tee Fitting</option>
                    <option value="reducer_joint">📐 Reducer Joint (Pengecil Diameter)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Nama Titik Sambungan / Aksesoris</label>
                <input
                  type="text"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  placeholder="mis. Air Valve Pipa Utama Jl. Sudirman KM 4"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-semibold text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={accDiameter}
                    onChange={e => setAccDiameter(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Tekanan (Bar)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={accPressure}
                    onChange={e => setAccPressure(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Status Operasi</label>
                  <select
                    value={operatingStatus}
                    onChange={e => setOperatingStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-bold text-xs focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Normal Open">Normal Open</option>
                    <option value="Normal Closed">Normal Closed</option>
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-full bg-[#2563EB] text-white font-extrabold hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 text-sm"
            >
              Simpan Aset Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
