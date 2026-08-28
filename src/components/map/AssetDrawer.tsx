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
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl z-[1100] flex flex-col justify-between text-xs text-slate-900 font-sans">
      {/* Header Bar */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-[#2563EB] font-mono">{asset.assetCode}</span>
            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
              asset.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
              asset.condition === 'Fair' ? 'bg-[#38BDF8] text-slate-900' :
              asset.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
            }`}>
              {asset.condition}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Quick Actions */}
        <div className="p-4 space-y-3 bg-slate-50 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 leading-snug">{asset.name}</h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{asset.area}</span>
          </div>

          {/* Flow Tracing CTA Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onTraceDownstream(asset.id)}
              className="flex items-center justify-center gap-1.5 bg-[#2563EB] text-white font-bold py-2 rounded-full hover:bg-[#1D4ED8] transition shadow-xs"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Trace Downstream</span>
            </button>

            <button
              onClick={() => onTraceUpstream(asset.id)}
              className="flex items-center justify-center gap-1.5 bg-white text-[#0284C7] border border-slate-200 font-bold py-2 rounded-full hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Trace Upstream</span>
            </button>
          </div>
        </div>

        {/* Drawer Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'specs' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Spesifikasi
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'topology' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Topology
          </button>

          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'inspections' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Inspeksi ({assetInspections.length})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2.5 text-[11px] font-bold border-b-2 transition ${
              activeTab === 'photos' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-400 hover:text-slate-700'
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
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold">Jenis Aset</div>
                  <div className="font-bold text-slate-900 capitalize">{asset.type.replace('_', ' ')}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold">Tahun Instalasi</div>
                  <div className="font-bold text-slate-900">{asset.installationYear}</div>
                </div>
              </div>

              {asset.type === 'manhole' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-bold text-[#2563EB] text-[11px]">Dimensi & Kedalaman Manhole</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Kedalaman: <span className="font-bold text-slate-900">{asset.depthMeters} m</span></div>
                    <div>Diameter: <span className="font-bold text-slate-900">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-bold text-slate-900">{asset.material}</span></div>
                    <div>Penutup: <span className="font-bold text-slate-900">{asset.coverCondition}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'pipe' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-bold text-[#0284C7] text-[11px]">Spesifikasi Pipa Jaringan</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Panjang: <span className="font-bold text-slate-900">{asset.lengthMeters} m</span></div>
                    <div>Diameter: <span className="font-bold text-slate-900">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-bold text-slate-900">{asset.material}</span></div>
                    <div>Arah Aliran: <span className="font-bold text-[#2563EB] capitalize">{asset.flowDirection}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'pump_station' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-bold text-[#16A34A] text-[11px]">Spesifikasi Stasiun Pompa</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Kapasitas: <span className="font-bold text-slate-900">{asset.capacityLps} L/dtk</span></div>
                    <div>Jumlah Pompa: <span className="font-bold text-slate-900">{asset.activePumps} / {asset.pumpCount} Aktif</span></div>
                    <div className="col-span-2">Catu Daya: <span className="font-bold text-slate-900">{asset.powerSource}</span></div>
                  </div>
                </div>
              )}

              {/* Coordinates */}
              {'coordinates' in asset && asset.coordinates && (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">Koordinat Geografis (GIS)</div>
                  <div className="font-mono text-slate-800 font-bold">Lat: {asset.coordinates.lat}, Lng: {asset.coordinates.lng}</div>
                  {asset.coordinates.elevation && (
                    <div className="text-[10px] text-slate-500">Elevasi Tanah: {asset.coordinates.elevation} mdpl</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-slate-800">Sambungan Jaringan (Topology Flow)</div>
              
              {asset.type === 'pipe' ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold">Node Asal (From)</div>
                    <div className="font-bold text-[#2563EB]">
                      {getAssetById(asset.fromAssetId)?.assetCode} — {getAssetById(asset.fromAssetId)?.name}
                    </div>
                  </div>

                  <div className="flex justify-center text-[#2563EB] font-mono text-xs font-bold">
                    ↓ Flow Downstream ({asset.lengthMeters}m) ↓
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold">Node Tujuan (To)</div>
                    <div className="font-bold text-[#0284C7]">
                      {getAssetById(asset.toAssetId)?.assetCode} — {getAssetById(asset.toAssetId)?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold">Pipa Masuk (Upstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.toAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#2563EB] font-mono font-bold flex items-center justify-between">
                          <span>{pipe.assetCode} (Dari: {getAssetById(pipe.fromAssetId)?.assetCode})</span>
                          <span>{pipe.diameterMm}mm</span>
                        </div>
                      ))}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold">Pipa Keluar (Downstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.fromAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#0284C7] font-mono font-bold flex items-center justify-between">
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
                <div className="text-center py-6 text-slate-400 font-medium">Belum ada catatan inspeksi untuk aset ini.</div>
              ) : (
                assetInspections.map(insp => (
                  <div key={insp.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{insp.issueCategory}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{insp.inspectionDate}</span>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed font-medium">{insp.notes}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Inspector: {insp.inspectorName}</span>
                      <span className="text-[#2563EB] font-bold">{insp.condition}</span>
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
                  <img key={idx} src={url} alt="Aset" className="w-full h-40 object-cover rounded-2xl border border-slate-200 shadow-xs" />
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-medium">Tidak ada foto attachment.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
        <button
          onClick={() => onOpenNewInspection(asset.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-xs"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Buat Inspeksi</span>
        </button>

        <button
          onClick={() => onOpenQrModal(asset.id)}
          className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 transition"
          title="Tampilkan QR Code Aset"
        >
          <QrCode className="w-4 h-4 text-[#2563EB]" />
        </button>
      </div>
    </div>
  );
};
