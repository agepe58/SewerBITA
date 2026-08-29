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
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 space-y-4 p-6 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <Camera className="w-5 h-5 text-[#2563EB]" />
            <span>Simulasi QR Field Scanner Lapangan</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Graphics */}
        <div className="relative bg-slate-900 rounded-2xl h-52 border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-8 border-2 border-dashed border-[#38BDF8]/60 rounded-xl pointer-events-none"></div>
          <div className="w-full h-0.5 bg-[#38BDF8] shadow-md animate-bounce"></div>
          <QrCode className="w-14 h-14 text-slate-400 mb-2" />
          <div className="text-xs text-slate-300 font-mono font-semibold">Posisikan Kamera ke QR Tag Aset</div>
        </div>

        {/* Manual Code Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Atau Masukkan Kode QR Manual</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              placeholder="mis. MH-104 atau PS-001"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-[#2563EB]"
            />
            <button
              type="submit"
              className="bg-[#2563EB] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-xs text-sm"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Quick Demo Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Simulasi Langsung Tag QR Lapangan:</label>
          <div className="flex flex-wrap gap-2">
            {allAssets.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => handleSimulateScan(a.id)}
                className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#2563EB] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#2563EB] font-bold transition"
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
