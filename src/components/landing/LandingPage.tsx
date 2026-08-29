import React from 'react';
import {
  MapPin,
  GitBranch,
  Boxes,
  ClipboardCheck,
  ArrowRight,
  Lock,
  Activity,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-white font-sans flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-hidden selection:bg-[#2563EB] selection:text-white">
      {/* Ambient background glowing lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 py-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="bg-white/95 p-2 rounded-xl border border-white/20 shadow-md">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
              <span>Sewer</span>
              <span className="text-[#3B82F6]">BITA</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">
              PT. Bukit Indah Tirta Alam
            </div>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Enterprise System Online</span>
          </span>
        </div>
      </header>

      {/* Main Content (Frameless Hero Section) */}
      <main className="w-full max-w-4xl mx-auto my-auto py-12 z-10 text-center space-y-9">
        {/* Security Notice Badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/90 text-slate-300 text-xs font-bold px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Restricted Operational Access • Portal Internal BITA</span>
        </div>

        {/* Main Headline & Subtitle */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Sistem Monitoring & Asset Management{' '}
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#34D399] bg-clip-text text-transparent">
              Jaringan Air Limbah
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            Platform intelijen terpadu untuk pemetaan peta GIS interaktif, analisis topologi alur jaringan, registrasi master aset, dan pelaporan inspeksi lapangan PT. Bukit Indah Tirta Alam.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onEnterDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-extrabold text-base px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-103 cursor-pointer group"
          >
            <span>Masuk ke Dashboard Operasional</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Seamless Capability Indicator Grid (No Cards) */}
        <div className="pt-12 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#60A5FA]">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Interactive GIS Map</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Pemetaan real-time node manhole, segmen pipa & stasiun pompa.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#34D399]">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Flow Topology</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Analisis graf alur jaringan downstream & upstream tracing.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FBBF24]">
              <Boxes className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Asset Registry</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Katalog spesifikasi teknik, material, kedalaman & kapasitas.</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#C084FC]">
              <ClipboardCheck className="w-4 h-4" />
              <span className="text-sm font-extrabold text-white">Inspeksi & QR Tag</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Digitalisasi temuan lapangan, QR Scanner & penanganan isu.</p>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center text-xs text-slate-500 font-medium z-10 py-2">
        <p>© 2026 PT. Bukit Indah Tirta Alam • Unit Pengolahan Air & Limbah Cair. All rights reserved.</p>
      </footer>
    </div>
  );
};
