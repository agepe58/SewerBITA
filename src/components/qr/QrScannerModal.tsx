import React, { useState } from 'react';
import { X, QrCode, Camera, Check, Search } from 'lucide-react';
import { SewerAsset } from '../../types/asset';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAssets: SewerAsset[];
  onSelectAsset: (assetId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  allAssets,
  onSelectAsset
}) => {
  const [scannedCode, setScannedCode] = useState('');

  if (!isOpen) return null;

  const handleSimulateScan = (assetId: string) => {
    onSelectAsset(assetId);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allAssets.find(
      a => a.assetCode.toLowerCase() === scannedCode.trim().toLowerCase()
    );
    if (found) {
      onSelectAsset(found.id);
      onClose();
    } else {
      alert(`Aset dengan kode ${scannedCode} tidak ditemukan.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-xs text-slate-900 space-y-4 p-6 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Camera className="w-4 h-4 text-[#2563EB]" />
            <span>Simulasi QR Field Scanner Lapangan</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Graphics */}
        <div className="relative bg-slate-900 rounded-2xl h-48 border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-8 border-2 border-dashed border-[#38BDF8]/60 rounded-xl pointer-events-none"></div>
          <div className="w-full h-0.5 bg-[#38BDF8] shadow-md animate-bounce"></div>
          <QrCode className="w-12 h-12 text-slate-500 mb-2" />
          <div className="text-[10px] text-slate-300 font-mono">Posisikan Kamera ke QR Tag Aset</div>
        </div>

        {/* Manual Code Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase">Atau Masukkan Kode QR Manual</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              placeholder="mis. MH-104 atau PS-001"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#2563EB]"
            />
            <button
              type="submit"
              className="bg-[#2563EB] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#1D4ED8] transition shadow-xs"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Quick Demo Selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-[10px] text-slate-400 font-bold uppercase">Simulasi Langsung Tag QR Lapangan:</label>
          <div className="flex flex-wrap gap-2">
            {allAssets.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => handleSimulateScan(a.id)}
                className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#2563EB] px-3 py-1 rounded-full font-mono text-[10px] text-[#2563EB] font-bold transition"
              >
                [{a.assetCode}] {a.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
