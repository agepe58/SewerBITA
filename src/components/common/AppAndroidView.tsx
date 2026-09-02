import React from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';

interface AppAndroidViewProps {
  isDarkMode?: boolean;
}

export const AppAndroidView: React.FC<AppAndroidViewProps> = ({ isDarkMode = true }) => {
  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`p-8 rounded-2xl border max-w-3xl mx-auto shadow-md ${cardBg}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold">BITA GIS Mobile App (Android)</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Aplikasi pendamping lapangan untuk teknisi pemeliharaan jaringan pipa & stasiun pompa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fitur Aplikasi Mobile:</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pencatatan Work Order & Laporan Lapangan Realtime</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pemindai QR Code Manhole & Stasiun Pompa</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unggah Bukti Foto Kondisi & Kerusakan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GPS Offline Mapping & Geolocation Tracking</span>
              </li>
            </ul>

            <div className="pt-4">
              <a
                href="/sewerbita-release.apk"
                download="SewerBITA-Android.apk"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Paket APK Android (v1.2.0)</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="p-3 bg-white rounded-xl shadow-md mb-3">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://sewer.kbi.web.id"
                alt="QR Code Download"
                className="w-32 h-32"
              />
            </div>
            <div className="text-xs font-bold text-slate-200">Scan untuk Akses Langsung di HP</div>
            <div className="text-[11px] text-slate-400 mt-0.5">https://sewer.kbi.web.id</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Aplikasi ini telah terverifikasi aman untuk jaringan operasional internal PT. Bukit Indah Tirta Alam.</span>
        </div>
      </div>
    </div>
  );
};
