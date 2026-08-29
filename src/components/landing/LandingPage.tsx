import React from 'react';
import {
  MapPin,
  GitBranch,
  Boxes,
  ClipboardCheck,
  ArrowRight,
  ShieldCheck,
  Lock,
  Activity,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] text-slate-900 selection:bg-[#2563EB] selection:text-white font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-10">
      {/* Top Bar Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-9 sm:h-11 w-auto object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
              Sewer<span className="text-[#2563EB]">BITA</span>
            </div>
            <div className="text-[11px] text-slate-500 font-bold tracking-wider uppercase">
              Internal Operational Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Enterprise System Online</span>
          </span>
        </div>
      </header>

      {/* Main Internal Portal Central Card */}
      <main className="w-full max-w-3xl mx-auto my-auto py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-8 sm:p-12 text-center space-y-7 relative overflow-hidden">
          {/* Subtle Accent Glow Header Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2563EB] via-[#0284C7] to-[#059669]"></div>

          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          {/* Title & Organization Subtitle */}
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-extrabold px-3 py-1 rounded-full border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Restricted Access • Portal Internal BITA</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Sistem Monitoring & Asset Management Jaringan Air Limbah
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-semibold pt-1">
              PT. BUKIT INDAH TIRTA ALAM
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={onEnterDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#2563EB] text-white font-extrabold text-base px-9 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 hover:scale-102 cursor-pointer"
            >
              <span>Masuk ke Application Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Module Capabilities */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <div className="text-xs font-extrabold text-slate-900">Peta GIS</div>
              <div className="text-[11px] text-slate-500 font-medium">Pemetaan Node & Pipa</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <GitBranch className="w-4 h-4 text-[#0284C7]" />
              <div className="text-xs font-extrabold text-slate-900">Flow Topology</div>
              <div className="text-[11px] text-slate-500 font-medium">Topik Downstream Trace</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <Boxes className="w-4 h-4 text-[#059669]" />
              <div className="text-xs font-extrabold text-slate-900">Asset Registry</div>
              <div className="text-[11px] text-slate-500 font-medium">Katalog & Spesifikasi</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
              <ClipboardCheck className="w-4 h-4 text-purple-600" />
              <div className="text-xs font-extrabold text-slate-900">Inspeksi QR</div>
              <div className="text-[11px] text-slate-500 font-medium">Field Log & QR Scan</div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center text-xs text-slate-500 font-semibold py-2">
        <p>© 2026 PT. Bukit Indah Tirta Alam • Unit Pengolahan Air & Limbah Cair. All rights reserved.</p>
      </footer>
    </div>
  );
};
