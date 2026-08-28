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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center text-slate-900 space-y-5 font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <QrIcon className="w-5 h-5 text-[#2563EB]" />
            <span>Tag QR Code Resmi Aset</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Render Container */}
        <div className="bg-slate-50 p-6 rounded-2xl inline-block shadow-xs border-2 border-blue-200">
          <QRCodeSVG value={qrData} size={180} level="H" includeMargin={true} />
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xl font-black text-[#2563EB] tracking-wider">{asset.assetCode}</div>
          <div className="text-sm font-extrabold text-slate-900">{asset.name}</div>
          <div className="text-xs text-slate-600 font-semibold">{asset.area}</div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#2563EB] text-white font-extrabold text-sm py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Cetak Tag QR</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 rounded-full hover:bg-slate-200 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
