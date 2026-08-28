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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-[#12151E] border border-[#232A3B] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-xs text-slate-100 space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-[#232A3B] pb-3">
          <div className="flex items-center space-x-2 font-bold text-xs">
            <Camera className="w-4 h-4 text-[#2DD4BF]" />
            <span>Simulasi QR Field Scanner Lapangan</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Graphics */}
        <div className="relative bg-[#080A0E] rounded-2xl h-48 border-2 border-[#232A3B] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-8 border-2 border-dashed border-[#2DD4BF]/60 rounded-xl pointer-events-none"></div>
          <div className="w-full h-0.5 bg-[#2DD4BF] shadow-[0_0_15px_#2DD4BF] animate-bounce"></div>
          <QrCode className="w-12 h-12 text-slate-600 mb-2" />
          <div className="text-[10px] text-slate-400 font-mono">Posisikan Kamera ke QR Tag Aset</div>
        </div>

        {/* Manual Code Input */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">Atau Masukkan Kode QR Manual</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              placeholder="mis. MH-104 atau PS-001"
              className="flex-1 bg-[#080A0E] border border-[#232A3B] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-[#2DD4BF]"
            />
            <button
              type="submit"
              className="bg-[#2DD4BF] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#5EEAD4]"
            >
              Scan
            </button>
          </div>
        </form>

        {/* Quick Demo Selector */}
        <div className="space-y-1.5 pt-2 border-t border-[#232A3B]">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">Simulasi Langsung Tag QR Lapangan:</label>
          <div className="flex flex-wrap gap-2">
            {allAssets.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => handleSimulateScan(a.id)}
                className="bg-[#1A1F2C] hover:bg-[#252C3D] border border-[#232A3B] hover:border-[#2DD4BF] px-2.5 py-1 rounded-lg font-mono text-[10px] text-[#2DD4BF]"
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
