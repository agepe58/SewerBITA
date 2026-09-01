import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, MapPin, Boxes, GitBranch, Zap } from 'lucide-react';
import { ManholeAsset, PipeAsset, PumpStationAsset, SewerAsset, AssetCondition } from '../../types/asset';

interface EditAssetModalProps {
  asset: SewerAsset | null;
  onClose: () => void;
  onSaveManhole: (updated: ManholeAsset) => void;
  onSavePipe: (updated: PipeAsset) => void;
  onSavePumpStation: (updated: PumpStationAsset) => void;
  areas: string[];
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  asset,
  onClose,
  onSaveManhole,
  onSavePipe,
  onSavePumpStation,
  areas
}) => {
  if (!asset) return null;

  // Base state
  const [assetCode, setAssetCode] = useState(asset.assetCode);
  const [name, setName] = useState(asset.name);
  const [area, setArea] = useState(asset.area);
  const [condition, setCondition] = useState<AssetCondition>(asset.condition);
  const [nextInspectionDue, setNextInspectionDue] = useState(asset.nextInspectionDue || '');

  // Manhole states
  const [depthMeters, setDepthMeters] = useState(asset.type === 'manhole' ? asset.depthMeters : 3.5);
  const [diameterMm, setDiameterMm] = useState(asset.type === 'manhole' || asset.type === 'pipe' ? asset.diameterMm : 1000);
  const [mhMaterial, setMhMaterial] = useState(asset.type === 'manhole' ? asset.material : 'Precast Concrete');
  const [lat, setLat] = useState(asset.type === 'manhole' || asset.type === 'pump_station' ? asset.coordinates.lat : -6.444);
  const [lng, setLng] = useState(asset.type === 'manhole' || asset.type === 'pump_station' ? asset.coordinates.lng : 107.452);

  // Pipe states
  const [lengthMeters, setLengthMeters] = useState(asset.type === 'pipe' ? asset.lengthMeters : 100);
  const [pipeMaterial, setPipeMaterial] = useState(asset.type === 'pipe' ? asset.material : 'PVC');
  const [pipeCategory, setPipeCategory] = useState<'gravity' | 'transmission' | 'clean_water_distribution'>(asset.type === 'pipe' ? asset.pipeCategory || 'gravity' : 'gravity');
  const [pressureBar, setPressureBar] = useState<number>(asset.type === 'pipe' ? asset.pressureBar || 6.0 : 6.0);
  const [destinationWwtpName, setDestinationWwtpName] = useState<string>(asset.type === 'pipe' ? asset.destinationWwtpName || 'WWTP Bukit Indah Central' : 'WWTP Bukit Indah Central');

  // Pump Station states
  const [capacityLps, setCapacityLps] = useState(asset.type === 'pump_station' ? asset.capacityLps : 450);
  const [pumpCount, setPumpCount] = useState(asset.type === 'pump_station' ? asset.pumpCount : 4);
  const [activePumps, setActivePumps] = useState(asset.type === 'pump_station' ? asset.activePumps : 3);
  const [powerSource, setPowerSource] = useState(asset.type === 'pump_station' ? asset.powerSource : 'PLN 3-Phase + Generator');

  // Synchronize states when target asset changes
  useEffect(() => {
    if (asset) {
      setAssetCode(asset.assetCode);
      setName(asset.name);
      setArea(asset.area);
      setCondition(asset.condition);
      setNextInspectionDue(asset.nextInspectionDue || '');

      if (asset.type === 'manhole') {
        setDepthMeters(asset.depthMeters);
        setDiameterMm(asset.diameterMm);
        setMhMaterial(asset.material);
        setLat(asset.coordinates.lat);
        setLng(asset.coordinates.lng);
      } else if (asset.type === 'pipe') {
        setLengthMeters(asset.lengthMeters);
        setDiameterMm(asset.diameterMm);
        setPipeMaterial(asset.material);
        setPipeCategory(asset.pipeCategory || 'gravity');
        setPressureBar(asset.pressureBar || 6.0);
        setDestinationWwtpName(asset.destinationWwtpName || 'WWTP Bukit Indah Central');
      } else if (asset.type === 'pump_station') {
        setCapacityLps(asset.capacityLps);
        setPumpCount(asset.pumpCount);
        setActivePumps(asset.activePumps);
        setPowerSource(asset.powerSource);
        setLat(asset.coordinates.lat);
        setLng(asset.coordinates.lng);
      }
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (asset.type === 'manhole') {
      onSaveManhole({
        ...(asset as ManholeAsset),
        assetCode,
        name,
        area,
        condition,
        nextInspectionDue,
        depthMeters: Number(depthMeters),
        diameterMm: Number(diameterMm),
        material: mhMaterial,
        coordinates: { lat: Number(lat), lng: Number(lng) }
      });
    } else if (asset.type === 'pipe') {
      onSavePipe({
        ...(asset as PipeAsset),
        assetCode,
        name,
        area,
        condition,
        nextInspectionDue,
        lengthMeters: Number(lengthMeters),
        diameterMm: Number(diameterMm),
        material: pipeMaterial,
        pipeCategory,
        pressureBar: pipeCategory === 'transmission' ? Number(pressureBar) : undefined,
        destinationWwtpName: pipeCategory === 'transmission' ? destinationWwtpName : undefined,
      });
    } else if (asset.type === 'pump_station') {
      onSavePumpStation({
        ...(asset as PumpStationAsset),
        assetCode,
        name,
        area,
        condition,
        nextInspectionDue,
        capacityLps: Number(capacityLps),
        pumpCount: Number(pumpCount),
        activePumps: Number(activePumps),
        powerSource,
        coordinates: { lat: Number(lat), lng: Number(lng) }
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#2563EB]" />
            <span>Edit Asset: <span className="font-mono text-[#2563EB]">{asset.assetCode}</span></span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Asset Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kode Asset ID</label>
              <input
                type="text"
                required
                value={assetCode}
                onChange={e => setAssetCode(e.target.value)}
                className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kondisi Status</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as AssetCondition)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Good">Good (Baik)</option>
                <option value="Fair">Fair (Cukup)</option>
                <option value="Warning">Warning (Waspada)</option>
                <option value="Critical">Critical (Bahaya)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nama Deskripsi Asset</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Area & Next Inspection Due */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Area / Zona</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Jatuh Tempo Inspeksi</label>
              {asset.type === 'grease_trap' ? (
                <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-2.5 mt-1 font-bold text-xs">
                  🏢 Pemilik Gedung (Mandiri)
                </div>
              ) : (
                <input
                  type="date"
                  value={nextInspectionDue}
                  onChange={e => setNextInspectionDue(e.target.value)}
                  className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              )}
            </div>
          </div>

          {/* Manhole Technical Fields */}
          {asset.type === 'manhole' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-[#2563EB] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4" />
                <span>Spesifikasi Fisik Manhole</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kedalaman (Meter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depthMeters}
                    onChange={e => setDepthMeters(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={e => setDiameterMm(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pipe Technical Fields */}
          {asset.type === 'pipe' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-[#0284C7] font-black uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4" />
                  <span>Spesifikasi Fisik Pipa Segmen</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${pipeCategory === 'transmission' ? 'bg-amber-100 text-amber-800 font-extrabold border border-amber-300' : 'bg-sky-100 text-sky-800 font-bold'}`}>
                  {pipeCategory === 'transmission' ? '⚡ Transmisi (Force Main)' : '💧 Gravitasi'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kategori Pipa</label>
                  <select
                    value={pipeCategory}
                    onChange={e => setPipeCategory(e.target.value as any)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  >
                    <option value="gravity">💧 Gravitasi Standard</option>
                    <option value="transmission">⚡ Transmisi (Force Main WWTP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Material Pipa</label>
                  <input
                    type="text"
                    value={pipeMaterial}
                    onChange={e => setPipeMaterial(e.target.value)}
                    className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>

              {pipeCategory === 'transmission' && (
                <div className="grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                  <div>
                    <label className="text-xs text-amber-800 font-bold">Tekanan Kerja (Bar)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={pressureBar}
                      onChange={e => setPressureBar(Number(e.target.value))}
                      className="w-full bg-white font-mono font-bold text-slate-900 border border-amber-300 rounded-xl p-2.5 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-800 font-bold">Tujuan WWTP / IPAL</label>
                    <input
                      type="text"
                      value={destinationWwtpName}
                      onChange={e => setDestinationWwtpName(e.target.value)}
                      className="w-full bg-white font-semibold text-slate-900 border border-amber-300 rounded-xl p-2.5 mt-1 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Panjang (Meter)</label>
                  <input
                    type="number"
                    value={lengthMeters}
                    onChange={e => setLengthMeters(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={e => setDiameterMm(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pump Station Technical Fields */}
          {asset.type === 'pump_station' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-[#059669] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Spesifikasi Stasiun Pompa</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kapasitas (L/s)</label>
                  <input
                    type="number"
                    value={capacityLps}
                    onChange={e => setCapacityLps(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Total Unit Pompa</label>
                  <input
                    type="number"
                    value={pumpCount}
                    onChange={e => setPumpCount(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Pompa Aktif</label>
                  <input
                    type="number"
                    value={activePumps}
                    onChange={e => setActivePumps(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-2.5 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-extrabold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
