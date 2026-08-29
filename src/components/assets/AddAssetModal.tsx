import React, { useState } from 'react';
import { X, Plus, MapPin, Boxes, GitBranch, Zap, Layers } from 'lucide-react';
import { ManholeAsset, PipeAsset, PumpStationAsset, AssetType, SewerAsset } from '../../types/asset';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManhole: (
    manhole: Omit<ManholeAsset, 'id'>,
    intermediateInfo?: { upstreamId: string; downstreamId: string }
  ) => void;
  onAddPipe: (pipe: Omit<PipeAsset, 'id'>) => void;
  onAddPumpStation: (pumpStation: Omit<PumpStationAsset, 'id'>) => void;
  existingManholes: ManholeAsset[];
  areas: string[];
  onAddArea: (newAreaName: string) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddManhole,
  onAddPipe,
  onAddPumpStation,
  existingManholes,
  areas,
  onAddArea
}) => {
  const [assetType, setAssetType] = useState<AssetType>('manhole');

  // Dynamic Area management state
  const [area, setArea] = useState(areas[0] || 'Zone A - Sudirman');
  const [isAddingNewArea, setIsAddingNewArea] = useState(false);
  const [customAreaName, setCustomAreaName] = useState('');

  // Form states for Manhole
  const [assetCode, setAssetCode] = useState('MH-' + Math.floor(100 + Math.random() * 900));
  const [name, setName] = useState('');
  const [depthMeters, setDepthMeters] = useState(3.5);
  const [diameterMm, setDiameterMm] = useState(1000);
  const [material, setMaterial] = useState('Precast Concrete');
  const [lat, setLat] = useState(-6.2100);
  const [lng, setLng] = useState(106.8240);
  const [googleMapsInput, setGoogleMapsInput] = useState('');

  // Form states for Pump Station
  const [psCode, setPsCode] = useState('PS-' + Math.floor(100 + Math.random() * 900));
  const [psName, setPsName] = useState('');
  const [capacityLps, setCapacityLps] = useState(450);
  const [pumpCount, setPumpCount] = useState(4);
  const [activePumps, setActivePumps] = useState(3);
  const [powerSource, setPowerSource] = useState('PLN 250 kVA + Diesel Genset');

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
  const [pipeMaterial, setPipeMaterial] = useState('Precast Concrete');
  const [pipeLength, setPipeLength] = useState(250);

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
      const prefixMap: Record<string, string> = {
        'Zone A - Sudirman': 'MH-SD',
        'Zone A - Setiabudi': 'MH-SB',
        'Zone A - Manggarai': 'MH-MG',
        'Zone B - Tebet': 'MH-TB',
        'Zone C - Pluit': 'MH-PL'
      };
      const prefix = prefixMap[area] || `MH-${area.split(' ')[0].toUpperCase()}`;
      const count = existingManholes.filter(m => m.area === area).length + 1;
      const autoCode = `${prefix}-${String(count).padStart(2, '0')}`;
      setAssetCode(autoCode);
      setName(`Manhole Kolektor ${autoCode}`);
    }
  }, [isIntermediate, upstreamMhId, area, isOpen]);

  // Auto-generate Pipe Code based on Civil Engineering Standards (P-{FromCode}_{ToCode})
  React.useEffect(() => {
    if (fromAssetId && toAssetId) {
      const fromMh = existingManholes.find(m => m.id === fromAssetId);
      const toMh = existingManholes.find(m => m.id === toAssetId);
      if (fromMh && toMh) {
        const code = `P-${fromMh.assetCode}_${toMh.assetCode}`;
        setPipeCode(code);
        setPipeName(`Pipa Segmen ${fromMh.assetCode} → ${toMh.assetCode}`);
      }
    }
  }, [fromAssetId, toAssetId, isOpen]);

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
        coordinates: { lat: Number(lat), lng: Number(lng), elevation: 10 },
        capacityLps: Number(capacityLps),
        pumpCount: Number(pumpCount),
        activePumps: Number(activePumps),
        powerSource,
        photos: []
      });
    } else {
      onAddPipe({
        assetCode: pipeCode,
        name: pipeName || `Pipa ${pipeCode}`,
        type: 'pipe',
        area,
        status: 'Active',
        condition: 'Good',
        installationYear: 2026,
        lastInspectedAt: today,
        nextInspectionDue: nextDue,
        fromAssetId,
        toAssetId,
        diameterMm: Number(pipeDiameter),
        material: pipeMaterial,
        lengthMeters: Number(pipeLength),
        flowDirection: 'downstream',
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
              className={`p-3 rounded-2xl border font-bold transition flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                assetType === 'pump_station'
                  ? 'bg-[#059669] text-white border-[#059669] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Stasiun Pompa</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Dynamic Area Selector Component */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                <span>Area / Zona / Sektor</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewArea(!isAddingNewArea)}
                className="text-[11px] text-[#2563EB] font-extrabold hover:underline"
              >
                {isAddingNewArea ? '← Pilih dari Daftar' : '+ Tambah Area Baru'}
              </button>
            </div>

            {!isAddingNewArea ? (
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#2563EB]"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAreaName}
                  onChange={e => setCustomAreaName(e.target.value)}
                  placeholder="mis. Zone D - Kemang / Sektor 4"
                  className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={handleCreateNewArea}
                  className="bg-[#2563EB] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition"
                >
                  Simpan Area
                </button>
              </div>
            )}
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
                  <label className="text-xs text-slate-600 font-bold">Panjang Pipa (meter)</label>
                  <input
                    type="number"
                    value={pipeLength}
                    onChange={e => setPipeLength(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1 font-mono font-bold text-sm focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

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
                <label className="text-xs text-slate-600 font-bold">Node Tujuan (To Manhole / Station)</label>
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
