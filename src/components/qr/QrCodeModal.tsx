import React from 'react';
import { X, Download, Printer, QrCode as QrIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SewerAsset } from '../../types/asset';

interface QrCodeModalProps {
  asset: SewerAsset | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  const qrData = JSON.stringify({
    system: 'SewerBITA',
    assetId: asset.id,
    assetCode: asset.assetCode,
    type: asset.type,
    area: asset.area
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-[#12151E] border border-[#232A3B] w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-[#232A3B] pb-3">
          <div className="flex items-center space-x-2 font-bold text-xs">
            <QrIcon className="w-4 h-4 text-[#2DD4BF]" />
            <span>Tag QR Code Resmi Aset</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Render Container */}
        <div className="bg-white p-6 rounded-2xl inline-block shadow-lg border-4 border-[#2DD4BF]">
          <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
        </div>

        <div className="space-y-1">
          <div className="font-mono text-lg font-black text-[#2DD4BF] tracking-wider">{asset.assetCode}</div>
          <div className="text-xs font-bold text-white">{asset.name}</div>
          <div className="text-[10px] text-slate-400">{asset.area}</div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center space-x-2 bg-[#2DD4BF] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[#5EEAD4]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tag QR</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[#1A1F2C] border border-[#232A3B] text-xs font-semibold text-slate-300 rounded-xl hover:bg-[#252C3D]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
