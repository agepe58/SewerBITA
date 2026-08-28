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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-[#12151E] border border-[#232A3B] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-xs text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-[#232A3B] flex items-center justify-between bg-[#141824]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#2DD4BF]" />
            <span>Tambah Aset Jaringan Baru</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="p-4 bg-[#080A0E] border-b border-[#232A3B]">
          <label className="text-[10px] text-slate-400 uppercase font-semibold">Jenis Aset</label>
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setAssetType('manhole')}
              className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center space-x-2 ${
                assetType === 'manhole'
                  ? 'bg-[#2DD4BF] text-black border-[#2DD4BF]'
                  : 'bg-[#1A1F2C] text-slate-300 border-[#232A3B]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Manhole</span>
            </button>

            <button
              type="button"
              onClick={() => setAssetType('pipe')}
              className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center space-x-2 ${
                assetType === 'pipe'
                  ? 'bg-[#06B6D4] text-black border-[#06B6D4]'
                  : 'bg-[#1A1F2C] text-slate-300 border-[#232A3B]'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Pipa Jaringan</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {assetType === 'manhole' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Kode Aset (ID)</label>
                  <input
                    type="text"
                    value={assetCode}
                    onChange={e => setAssetCode(e.target.value)}
                    required
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Area / Zona</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1"
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
                <label className="text-[10px] text-slate-400">Nama Deskriptif Manhole</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="mis. Manhole Kolektor Sudirman B3"
                  required
                  className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Kedalaman (meter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={depthMeters}
                    onChange={e => setDepthMeters(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Diameter (mm)</label>
                  <input
                    type="number"
                    value={diameterMm}
                    onChange={e => setDiameterMm(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Latitude GIS</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={e => setLat(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Longitude GIS</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={e => setLng(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Kode Pipa (ID)</label>
                  <input
                    type="text"
                    value={pipeCode}
                    onChange={e => setPipeCode(e.target.value)}
                    required
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Area / Zona</label>
                  <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1"
                  >
                    <option value="Zone A - Sudirman">Zone A - Sudirman</option>
                    <option value="Zone A - Setiabudi">Zone A - Setiabudi</option>
                    <option value="Zone A - Manggarai">Zone A - Manggarai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Node Asal (From Manhole)</label>
                <select
                  value={fromAssetId}
                  onChange={e => setFromAssetId(e.target.value)}
                  className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1"
                >
                  {existingManholes.map(mh => (
                    <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Node Tujuan (To Manhole / Station)</label>
                <select
                  value={toAssetId}
                  onChange={e => setToAssetId(e.target.value)}
                  className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1"
                >
                  {existingManholes.map(mh => (
                    <option key={mh.id} value={mh.id}>{mh.assetCode} — {mh.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400">Panjang (meter)</label>
                  <input
                    type="number"
                    value={pipeLength}
                    onChange={e => setPipeLength(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Diameter (mm)</label>
                  <input
                    type="number"
                    value={pipeDiameter}
                    onChange={e => setPipeDiameter(Number(e.target.value))}
                    className="w-full bg-[#080A0E] border border-[#232A3B] rounded-lg p-2 text-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#232A3B] text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#2DD4BF] text-black font-extrabold hover:bg-[#5EEAD4]"
            >
              Simpan Aset Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
