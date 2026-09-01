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
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl z-[1100] flex flex-col justify-between text-sm text-slate-900 font-sans">
      {/* Header Bar */}
      <div>
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-base text-[#2563EB] font-mono">{asset.assetCode}</span>
            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
              asset.condition === 'Good' ? 'bg-[#4ADE80] text-slate-900' :
              asset.condition === 'Fair' ? 'bg-[#38BDF8] text-slate-900' :
              asset.condition === 'Warning' ? 'bg-[#FDE047] text-slate-900' : 'bg-[#F87171] text-white'
            }`}>
              {asset.condition}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Quick Actions */}
        <div className="p-5 space-y-3.5 bg-slate-50 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{asset.name}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <MapPin className="w-4 h-4 text-[#0284C7]" />
            <span>{asset.area}</span>
          </div>

          {/* Flow Tracing CTA Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onTraceDownstream(asset.id)}
              className="flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold py-2.5 rounded-full hover:bg-[#1D4ED8] transition shadow-xs text-xs"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Trace Downstream</span>
            </button>

            <button
              onClick={() => onTraceUpstream(asset.id)}
              className="flex items-center justify-center gap-2 bg-white text-[#0284C7] border border-slate-200 font-extrabold py-2.5 rounded-full hover:bg-slate-50 transition shadow-2xs text-xs"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Trace Upstream</span>
            </button>
          </div>
        </div>

        {/* Drawer Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-white text-xs">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'specs' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Spesifikasi
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'topology' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Topology
          </button>

          <button
            onClick={() => setActiveTab('inspections')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'inspections' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Inspeksi ({assetInspections.length})
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'photos' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dokumentasi
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto max-h-[calc(100vh-340px)] space-y-4 text-xs">
          {activeTab === 'specs' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold">Jenis Aset</div>
                  <div className="font-extrabold text-slate-900 text-sm capitalize">{asset.type.replace('_', ' ')}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold">Tahun Instalasi</div>
                  <div className="font-extrabold text-slate-900 text-sm">{asset.installationYear}</div>
                </div>
              </div>

              {asset.type === 'manhole' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="font-extrabold text-[#2563EB] text-xs">Dimensi & Kedalaman Manhole</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Kedalaman: <span className="font-extrabold text-slate-900">{asset.depthMeters} m</span></div>
                    <div>Diameter: <span className="font-extrabold text-slate-900">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-extrabold text-slate-900">{asset.material}</span></div>
                    <div>Penutup: <span className="font-extrabold text-slate-900">{asset.coverCondition}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'pipe' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="font-extrabold text-[#0284C7] text-xs flex items-center justify-between">
                    <span>Spesifikasi Pipa Jaringan</span>
                    {asset.pipeCategory === 'transmission' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-700 font-extrabold border border-amber-300">
                        ⚡ Transmisi (Force Main)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/20 text-sky-700 font-extrabold">
                        💧 Gravitasi
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Panjang Total: <span className="font-extrabold text-slate-900">{asset.lengthMeters} m</span></div>
                    <div>Diameter: <span className="font-extrabold text-slate-900">{asset.diameterMm} mm</span></div>
                    <div>Material: <span className="font-extrabold text-slate-900">{asset.material}</span></div>
                    <div>Arah Aliran: <span className="font-extrabold text-[#2563EB] capitalize">{asset.flowDirection}</span></div>
                    {asset.pipeCategory === 'transmission' && (
                      <>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 font-bold text-amber-700">
                          Tekanan Kerja: <span className="font-extrabold text-slate-900">{asset.pressureBar || 6.0} Bar</span>
                        </div>
                        <div className="col-span-2 font-bold text-slate-700">
                          Tujuan WWTP / IPAL: <span className="font-extrabold text-slate-900">🏢 {asset.destinationWwtpName || 'WWTP Main Plant'}</span>
                        </div>
                        {asset.waypoints && asset.waypoints.length > 0 && (
                          <div className="col-span-2 font-bold text-amber-700">
                            Tikungan Rute: <span className="font-extrabold text-slate-900">{asset.waypoints.length} Point Lekukan Jalan</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {asset.type === 'pump_station' && (
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="font-extrabold text-[#16A34A] text-xs">Spesifikasi Stasiun Pompa</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Kapasitas: <span className="font-extrabold text-slate-900">{asset.capacityLps} L/dtk</span></div>
                    <div>Jumlah Pompa: <span className="font-extrabold text-slate-900">{asset.activePumps} / {asset.pumpCount} Aktif</span></div>
                    <div className="col-span-2">Catu Daya: <span className="font-extrabold text-slate-900">{asset.powerSource}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'wtp' && (
                <div className="space-y-2.5 bg-[#0284C7]/5 p-4 rounded-2xl border border-cyan-200">
                  <div className="font-extrabold text-[#0284C7] text-xs flex items-center justify-between">
                    <span>Spesifikasi WTP Air Bersih</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-700 font-extrabold border border-cyan-300">
                      🏭 WTP Air Bersih
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Kapasitas Produksi: <span className="font-extrabold text-slate-900">{asset.productionCapacityLps} L/s</span></div>
                    <div>Sumber Air Baku: <span className="font-extrabold text-slate-900">{asset.rawWaterSource}</span></div>
                    <div className="col-span-2 text-emerald-600 font-bold">Status Kualitas: <span className="font-extrabold text-slate-900">{asset.waterQualityStatus}</span></div>
                  </div>
                </div>
              )}

              {asset.type === 'water_accessory' && (
                <div className="space-y-2.5 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200">
                  <div className="font-extrabold text-indigo-700 text-xs flex items-center justify-between">
                    <span>Aksesoris & Valve Jaringan Pipa</span>
                    <div className="flex items-center gap-1">
                      {asset.systemCategory === 'sewerage' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-700 font-extrabold border border-amber-300">
                          ⚡ Transmisi Air Limbah
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-700 font-extrabold border border-cyan-300">
                          🚰 Air Bersih (PAM)
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-700 font-extrabold uppercase border border-indigo-300">
                        {asset.accessoryType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Diameter Aksesoris: <span className="font-extrabold text-slate-900">{asset.diameterMm} mm</span></div>
                    <div>Tekanan Kerja: <span className="font-extrabold text-slate-900">{asset.pressureBar || 6.0} Bar</span></div>
                    <div className="col-span-2 text-indigo-700 font-bold">Status Operasi: <span className="font-extrabold text-slate-900">{asset.operatingStatus}</span></div>
                  </div>
                </div>
              )}
              {asset.type === 'grease_trap' && (
                <div className="space-y-2.5 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                  <div className="font-extrabold text-amber-800 text-xs flex items-center justify-between">
                    <span>🍳 Grease Trap (Pre-Treatment Inlet)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-800 font-extrabold uppercase border border-amber-300">
                      {asset.chamberCount || 3} Sekat / Chambers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <div>Kapasitas Tangki: <span className="font-extrabold text-slate-900">{asset.capacityLiters} Liter</span></div>
                    <div>Jadwal Kuras: <span className="font-extrabold text-slate-900">Setiap {asset.cleaningFrequencyDays} Hari</span></div>
                    <div className="col-span-2 text-amber-800 font-bold flex items-center justify-between">
                      <span>Akumulasi Lemak:</span>
                      <span className={`px-2 py-0.5 rounded-md font-extrabold ${
                        (asset.greaseLevelPercent || 0) > 70
                          ? 'bg-red-500/20 text-red-700 border border-red-300'
                          : (asset.greaseLevelPercent || 0) > 40
                          ? 'bg-amber-500/20 text-amber-700 border border-amber-300'
                          : 'bg-emerald-500/20 text-emerald-700'
                      }`}>
                        {asset.greaseLevelPercent || 15}% {(asset.greaseLevelPercent || 0) > 70 ? '🚨 Perlu Dikuras' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinates */}
              {'coordinates' in asset && asset.coordinates && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-bold">Koordinat Geografis (GIS)</div>
                  <div className="font-mono text-slate-900 font-extrabold text-xs">Lat: {asset.coordinates.lat}, Lng: {asset.coordinates.lng}</div>
                  {asset.coordinates.elevation && (
                    <div className="text-xs text-slate-600 font-medium">Elevasi Tanah: {asset.coordinates.elevation} mdpl</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="space-y-3.5 text-xs">
              <div className="text-xs font-bold text-slate-900">Sambungan Jaringan (Topology Flow)</div>
              
              {asset.type === 'pipe' ? (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold">Node Asal (From)</div>
                    <div className="font-extrabold text-[#2563EB] text-sm">
                      {getAssetById(asset.fromAssetId)?.assetCode} — {getAssetById(asset.fromAssetId)?.name}
                    </div>
                  </div>

                  <div className="flex justify-center text-[#2563EB] font-mono text-xs font-extrabold">
                    ↓ Flow Downstream ({asset.lengthMeters}m) ↓
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold">Node Tujuan (To)</div>
                    <div className="font-extrabold text-[#0284C7] text-sm">
                      {getAssetById(asset.toAssetId)?.assetCode} — {getAssetById(asset.toAssetId)?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="text-xs text-slate-500 font-bold">Pipa Masuk (Upstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.toAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#2563EB] font-mono font-extrabold text-xs flex items-center justify-between">
                          <span>{pipe.assetCode} (Dari: {getAssetById(pipe.fromAssetId)?.assetCode})</span>
                          <span>{pipe.diameterMm}mm</span>
                        </div>
                      ))}
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="text-xs text-slate-500 font-bold">Pipa Keluar (Downstream Connections)</div>
                    {allAssets
                      .filter((a): a is PipeAsset => a.type === 'pipe' && a.fromAssetId === asset.id)
                      .map(pipe => (
                        <div key={pipe.id} className="text-[#0284C7] font-mono font-extrabold text-xs flex items-center justify-between">
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
            <div className="space-y-3 text-xs">
              {assetInspections.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-medium">Belum ada catatan inspeksi untuk aset ini.</div>
              ) : (
                assetInspections.map(insp => (
                  <div key={insp.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{insp.issueCategory}</span>
                      <span className="text-xs text-slate-500 font-mono font-semibold">{insp.inspectionDate}</span>
                    </div>
                    <p className="text-slate-800 text-xs leading-relaxed font-semibold">{insp.notes}</p>
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-slate-200/60 font-medium">
                      <span>Inspector: {insp.inspectorName}</span>
                      <span className="text-[#2563EB] font-extrabold">{insp.condition}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-3 text-xs">
              {asset.photos && asset.photos.length > 0 ? (
                asset.photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Aset" className="w-full h-48 object-cover rounded-2xl border border-slate-200 shadow-xs" />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 font-medium">Tidak ada foto attachment.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4.5 border-t border-slate-100 bg-white flex items-center gap-2.5">
        <button
          onClick={() => onOpenNewInspection(asset.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-xs"
        >
          <ClipboardCheck className="w-4.5 h-4.5" />
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
