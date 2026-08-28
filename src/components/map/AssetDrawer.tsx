import React, { useState } from 'react';
import {
  X,
  GitBranch,
  QrCode,
  ClipboardCheck,
  MapPin,
  Calendar,
  Layers,
  ArrowDown,
  ArrowUp,
  FileText,
  Camera
} from 'lucide-react';
import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset } from '../../types/asset';
import { InspectionRecord } from '../../types/inspection';

interface AssetDrawerProps {
  asset: SewerAsset | null;
  onClose: () => void;
  onTraceDownstream: (assetId: string) => void;
  onTraceUpstream: (assetId: string) => void;
  onOpenQrModal: (assetId: string) => void;
  onOpenNewInspection: (assetId: string) => void;
  inspections: InspectionRecord[];
  allAssets: SewerAsset[];
}

export const AssetDrawer: React.FC<AssetDrawerProps> = ({
  asset,
  onClose,
  onTraceDownstream,
  onTraceUpstream,
  onOpenQrModal,
  onOpenNewInspection,
  inspections,
  allAssets
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'topology' | 'inspections' | 'photos'>('specs');

  if (!asset) return null;

  const assetInspections = inspections.filter(i => i.assetId === asset.id);

  // Helper to find asset by ID
  const getAssetById = (id: string) => allAssets.find(a => a.id === id);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#12151E] border-l border-[#232A3B] shadow-2xl z-[1100] flex flex-col justify-between text-xs text-slate-200">
      {/* Header Bar */}
      <div>
        <div className="p-4 border-b border-[#232A3B] flex items-center justify-between bg-[#141824]">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-[#2DD4BF] font-mono">{asset.assetCode}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              asset.condition === 'Good' ? 'bg-[#10B981]/20 text-[#10B981]' :
              asset.condition === 'Fair' ? 'bg-[#06B6D4]/20 text-[#06B6D4]' :
              asset.condition === 'Warning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#EF4444]/20 text-[#EF4444]'
            }`}>
              {asset.condition}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1F2C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Quick Actions */}
        <div className="p-4 space-y-3 bg-[#080A0E] border-b border-[#232A3B]">
          <h2 className="text-base font-extrabold text-white leading-snug">{asset.name}</h2>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{asset.area}</span>
          </div>

          {/* Flow Tracing CTA Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onTraceDownstream(asset.id)}
              className="flex items-center justify-center space-x-1.5 bg-[#2DD4BF] text-black font-bold py-2 rounded-xl hover:bg-[#5EEAD4] transition shadow-[0_0_10px_rgba(45,212,191,0.3)]"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Trace Downstream</span>
            </button>

            <button
              onClick={() => onTraceUpstream(asset.id)}
              className="flex items-center justify-center space-x-1.5 bg-[#1A1F2C] text-[#06B6D4] border border-[#06B6D4]/40 font-bold py-2 rounded-xl hover:bg-[#252C3D] transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Trace Upstream</span>
            </button>
          </div>
        </div>

        {/* Drawer Navigation Tabs */}
        <div className="flex border-b border-[#232A3B] bg-[#141824]">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-2.5 text-[11px] font-semibold border-b-2 transition ${
              activeTab === 'specs' ? 'border-[#2DD4BF] text-[#2DD4BF]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Spesifikasi
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex-1 py-2.5 text-[11px] font-semibold border-b-2 transition ${
              activeTab === 'topology' ? 'border-[#2DD4BF] text-[#2DD4BF]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Koneksi Topology
          </button>

          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex-1 py-2.5 text-[11px] font-semibold border-b-2 transition ${
              activeTab === 'inspections' ? 'border-[#2DD4BF] text-[#2DD4BF]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Inspeksi ({assetInspections.length})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2.5 text-[11px] font-semibold border-b-2 transition ${
              activeTab === 'photos' ? 'border-[#2DD4BF] text-[#2DD4BF]' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dokumentasi
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-320px)] space-y-4">
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="text-[10px] text-slate-400">Jenis Aset</div>
                  <div className="font-bold text-white capitalize">{asset.type.replace('_', ' ')}</div>
                </div>

                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="text-[10px] text-slate-400">Tahun Instalasi</div>
                  <div className="font-bold text-white">{asset.installationYear}</div>
                </div>
              </div>

              {asset.type === 'manhole' && (
                <div className="space-y-2 bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="font-bold text-[#2DD4BF] text-[11px]">Dimensi & Kedalaman Manhole</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Kedalaman: <span className="font-bold text-white">{asset.depthMeters} m</span></div>
                    <div>Diameter: <span className="font-bold text-white">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-bold text-white">{asset.material}</span></div>
                    <div>Penutup: <span className="font-bold text-white">{asset.coverCondition}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'pipe' && (
                <div className="space-y-2 bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="font-bold text-[#06B6D4] text-[11px]">Spesifikasi Pipa Jaringan</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Panjang: <span className="font-bold text-white">{asset.lengthMeters} m</span></div>
                    <div>Diameter: <span className="font-bold text-white">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-bold text-white">{asset.material}</span></div>
                    <div>Arah Aliran: <span className="font-bold text-[#2DD4BF] capitalize">{asset.flowDirection}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'pump_station' && (
                <div className="space-y-2 bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                  <div className="font-bold text-[#10B981] text-[11px]">Spesifikasi Stasiun Pompa</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Kapasitas: <span className="font-bold text-white">{asset.capacityLps} L/dtk</span></div>
                    <div>Jumlah Pompa: <span className="font-bold text-white">{asset.activePumps} / {asset.pumpCount} Aktif</span></div>
                    <div className="col-span-2">Catu Daya: <span className="font-bold text-white">{asset.powerSource}</span></div>
                  </div>
                </div>
              )}

              {/* Coordinates */}
              {'coordinates' in asset && asset.coordinates && (
                <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B] space-y-1">
                  <div className="text-[10px] text-slate-400 font-semibold">Koordinat Geografis (GIS)</div>
                  <div className="font-mono text-slate-200">Lat: {asset.coordinates.lat}, Lng: {asset.coordinates.lng}</div>
                  {asset.coordinates.elevation && (
                    <div className="text-[10px] text-slate-400">Elevasi Tanah: {asset.coordinates.elevation} mdpl</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-300">Sambungan Jaringan (Topology Flow)</div>
              
              {asset.type === 'pipe' ? (
                <div className="space-y-3">
                  <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                    <div className="text-[10px] text-slate-400">Node Asal (From)</div>
                    <div className="font-bold text-[#2DD4BF]">
                      {getAssetById(asset.fromAssetId)?.assetCode} — {getAssetById(asset.fromAssetId)?.name}
                    </div>
                  </div>

                  <div className="flex justify-center text-[#2DD4BF] font-mono text-xs">
                    ↓ Flow Downstream ({asset.lengthMeters}m) ↓
                  </div>

                  <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B]">
                    <div className="text-[10px] text-slate-400">Node Tujuan (To)</div>
                    <div className="font-bold text-[#06B6D4]">
                      {getAssetById(asset.toAssetId)?.assetCode} — {getAssetById(asset.toAssetId)?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B] space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold">Pipa Masuk (Upstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.toAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#2DD4BF] font-mono flex items-center justify-between">
                          <span>{pipe.assetCode} (Dari: {getAssetById(pipe.fromAssetId)?.assetCode})</span>
                          <span>{pipe.diameterMm}mm</span>
                        </div>
                      ))}
                  </div>

                  <div className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B] space-y-1">
                    <div className="text-[10px] text-slate-400 font-semibold">Pipa Keluar (Downstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.fromAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#06B6D4] font-mono flex items-center justify-between">
                          <span>{pipe.assetCode} (Ke: {getAssetById(pipe.toAssetId)?.assetCode})</span>
                          <span>{pipe.diameterMm}mm</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspections' && (
            <div className="space-y-3">
              {assetInspections.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Belum ada catatan inspeksi untuk aset ini.</div>
              ) : (
                assetInspections.map(insp => (
                  <div key={insp.id} className="bg-[#1A1F2C] p-3 rounded-xl border border-[#232A3B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{insp.issueCategory}</span>
                      <span className="text-[10px] text-slate-400">{insp.inspectionDate}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{insp.notes}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#232A3B]">
                      <span>Inspector: {insp.inspectorName}</span>
                      <span className="text-[#2DD4BF] font-semibold">{insp.condition}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-3">
              {asset.photos && asset.photos.length > 0 ? (
                asset.photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Aset" className="w-full h-40 object-cover rounded-xl border border-[#232A3B]" />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">Tidak ada foto attachment.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-[#232A3B] bg-[#141824] flex items-center space-x-2">
        <button
          onClick={() => onOpenNewInspection(asset.id)}
          className="flex-1 flex items-center justify-center space-x-2 bg-[#2DD4BF] text-black font-bold py-2.5 rounded-xl hover:bg-[#5EEAD4] transition"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Buat Inspeksi</span>
        </button>

        <button
          onClick={() => onOpenQrModal(asset.id)}
          className="p-2.5 bg-[#1A1F2C] hover:bg-[#252C3D] text-slate-200 border border-[#232A3B] rounded-xl transition"
          title="Tampilkan QR Code Aset"
        >
          <QrCode className="w-4 h-4 text-[#2DD4BF]" />
        </button>
      </div>
    </div>
  );
};
