import React, { useState } from 'react';
import { X, Plus, MapPin, Boxes, GitBranch } from 'lucide-react';
import { ManholeAsset, PipeAsset, AssetType, SewerAsset } from '../../types/asset';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManhole: (manhole: Omit<ManholeAsset, 'id'>) => void;
  onAddPipe: (pipe: Omit<PipeAsset, 'id'>) => void;
  existingManholes: ManholeAsset[];
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddManhole,
  onAddPipe,
  existingManholes
}) => {
  const [assetType, setAssetType] = useState<AssetType>('manhole');

  // Form states for Manhole
  const [assetCode, setAssetCode] = useState('MH-' + Math.floor(100 + Math.random() * 900));
  const [name, setName] = useState('');
  const [area, setArea] = useState('Zone A - Sudirman');
  const [depthMeters, setDepthMeters] = useState(3.5);
  const [diameterMm, setDiameterMm] = useState(1000);
  const [material, setMaterial] = useState('Precast Concrete');
  const [lat, setLat] = useState(-6.2100);
  const [lng, setLng] = useState(106.8240);
  const [googleMapsInput, setGoogleMapsInput] = useState('');

  // Helper to parse Google Maps URL or "lat, lng" string automatically
  const parseGoogleMapsInput = (val: string) => {
    setGoogleMapsInput(val);
    if (!val.trim()) return;

    // Regex to extract Lat and Long from Google Maps formats
    // e.g. "-6.210452, 106.824123" or "@-6.210452,106.824123" or "q=-6.210452,106.824123"
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
  const [pipeCode, setPipeCode] = useState('P-' + Math.floor(100 + Math.random() * 900));
  const [pipeName, setPipeName] = useState('');
  const [fromAssetId, setFromAssetId] = useState(existingManholes[0]?.id || '');
  const [toAssetId, setToAssetId] = useState(existingManholes[1]?.id || '');
  const [pipeDiameter, setPipeDiameter] = useState(800);
  const [pipeMaterial, setPipeMaterial] = useState('Precast Concrete');
  const [pipeLength, setPipeLength] = useState(250);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const nextDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (assetType === 'manhole') {
      onAddManhole({
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
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
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
          <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Jenis Aset</label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={() => setAssetType('manhole')}
              className={`p-3 rounded-2xl border font-bold transition flex items-center justify-center gap-2 text-sm ${
                assetType === 'manhole'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4.5 h-4.5" />
              <span>Manhole</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('pipe')}
              className={`p-3 rounded-2xl border font-bold transition flex items-center justify-center gap-2 text-sm ${
                assetType === 'pipe'
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-4.5 h-4.5" />
              <span>Pipa Jaringan</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {assetType === 'manhole' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode Aset (ID)</label>
                  <input
                    type="text"
                    value={assetCode}
                    onChange={e => setAssetCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Area / Zona</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
                  >
                    <option value="Zone A - Sudirman">Zone A - Sudirman</option>
                    <option value="Zone A - Setiabudi">Zone A - Setiabudi</option>
                    <option value="Zone A - Manggarai">Zone A - Manggarai</option>
                    <option value="Zone B - Tebet">Zone B - Tebet</option>
                    <option value="Zone C - Pluit">Zone C - Pluit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Nama Deskriptif Manhole</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="mis. Manhole Kolektor Sudirman B3"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-semibold text-sm focus:outline-none focus:border-[#2563EB]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={e => setDiameterMm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
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
                <p className="text-[11px] text-slate-500">
                  Salin koordinat dari Google Maps (Klik kanan di Google Maps → Pilih angka koordinat), lalu tempel di atas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Latitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Longitude (Google Maps)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Kode Pipa (ID)</label>
                  <input
                    type="text"
                    value={pipeCode}
                    onChange={e => setPipeCode(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Area / Zona</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
                  >
                    <option value="Zone A - Sudirman">Zone A - Sudirman</option>
                    <option value="Zone A - Setiabudi">Zone A - Setiabudi</option>
                    <option value="Zone A - Manggarai">Zone A - Manggarai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold">Node Asal (From Manhole)</label>
                <select
                  value={fromAssetId}
                  onChange={e => setFromAssetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
                >
                  {existingManholes.map(mh => (
                    <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold">Panjang (meter)</label>
                  <input
                    type="number"
                    value={pipeLength}
                    onChange={e => setPipeLength(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold">Diameter (mm)</label>
                  <input
                    type="number"
                    value={pipeDiameter}
                    onChange={e => setPipeDiameter(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#2563EB] text-white font-extrabold hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 text-sm"
            >
              Simpan Aset Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
