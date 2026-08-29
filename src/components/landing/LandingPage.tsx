import React from 'react';
import {
  MapPin,
  GitBranch,
  Boxes,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  return (
    <div className="h-screen w-full bg-[#0B0F17] text-white font-sans flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden selection:bg-[#2563EB] selection:text-white">
      {/* Ambient background glowing lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Top Left Logo (Absolute so it doesn't shift vertical centering) */}
      <header className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20">
        <div className="bg-white/95 p-2 sm:p-2.5 rounded-xl border border-white/20 shadow-md">
          <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-9 sm:h-11 w-auto object-contain" />
        </div>
      </header>

      {/* Main Content (100% Vertically and Horizontally Centered Viewport Hero) */}
      <main className="w-full max-w-4xl mx-auto z-10 text-center flex flex-col items-center justify-center space-y-8 my-auto">
        {/* Main Headline & Subtitle (Centered) */}
        <div className="space-y-4 max-w-3xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] text-center">
            Sistem Monitoring & Asset Management{' '}
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#34D399] bg-clip-text text-transparent">
              Jaringan Air Limbah
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed text-center pt-1">
            Platform intelijen terpadu untuk pemetaan peta GIS interaktif, analisis topologi alur jaringan, registrasi master aset, dan pelaporan inspeksi lapangan PT. Bukit Indah Tirta Alam.
          </p>
        </div>

        {/* Primary Action Button (Centered with Generous Padding) */}
        <div className="pt-2 flex justify-center w-full">
          <button
            onClick={onEnterDashboard}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-base sm:text-lg px-12 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/35 hover:shadow-blue-600/55 hover:scale-103 cursor-pointer group whitespace-nowrap"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Seamless Capability Indicator Grid (Centered Layout) */}
        <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#60A5FA]">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Interactive GIS Map</span>
            </div>
            <p className="text-xs text-slate-400 font-medium text-center">Pemetaan real-time node manhole, segmen pipa & stasiun pompa.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#34D399]">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Flow Topology</span>
            </div>
            <p className="text-xs text-slate-400 font-medium text-center">Analisis graf alur jaringan downstream & upstream tracing.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#FBBF24]">
              <Boxes className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Asset Registry</span>
            </div>
            <p className="text-xs text-slate-400 font-medium text-center">Katalog spesifikasi teknik, material, kedalaman & kapasitas.</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[#C084FC]">
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Inspeksi & QR Tag</span>
            </div>
            <p className="text-xs text-slate-400 font-medium text-center">Digitalisasi temuan lapangan, QR Scanner & penanganan isu.</p>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer (Absolute at bottom) */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[11px] sm:text-xs text-slate-500 font-medium z-20 px-4">
        <p>© 2026 PT. Bukit Indah Tirta Alam • Unit Pengolahan Air & Limbah Cair. All rights reserved.</p>
      </footer>
    </div>
  );
};
