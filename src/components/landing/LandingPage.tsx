import React from 'react';
import {
  Droplets,
  MapPin,
  GitBranch,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Activity,
  Zap,
  Layers,
  Database,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#D9E4FF] via-[#EBF1FF] to-[#D2E2FF] text-slate-900 selection:bg-[#2563EB] selection:text-white font-sans flex flex-col justify-between">
      {/* Landing Navbar */}
      <header className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between border-b border-white/60 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-white/90 p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Sewer<span className="text-[#2563EB]">BITA</span>
            </span>
            <span className="text-xs text-slate-600 bg-white/80 border border-slate-200/90 px-3 py-1 rounded-full font-mono font-bold hidden sm:inline-block shadow-2xs">
              Enterprise Network Intelligence
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-bold text-slate-700">
          <a href="#features" className="hover:text-[#2563EB] transition">Fitur Utama</a>
          <a href="#topology" className="hover:text-[#2563EB] transition">Network Topology</a>
          <a href="#inspection" className="hover:text-[#2563EB] transition">Inspeksi QR</a>
          <a href="#architecture" className="hover:text-[#2563EB] transition">Arsitektur GIS</a>
        </div>

        <button
          onClick={onEnterDashboard}
          className="flex items-center gap-2.5 bg-[#2563EB] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25 hover:scale-105 shrink-0"
        >
          <span>Buka Portal Monitoring</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-8 lg:px-12 flex-1 flex items-center">
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 bg-white/90 border border-slate-200 px-4 py-2 rounded-full shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse shrink-0"></span>
              <span className="text-xs sm:text-sm font-extrabold text-[#2563EB]">Next-Gen Wastewater GIS & Topology Tracing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Single Source of Truth untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0284C7] to-[#16A34A]">Jaringan Air Limbah</span>
            </h1>

            <p className="text-slate-700 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
              Dokumentasi terstruktur lokasi Manhole, Pipa Kolektor, dan Stasiun Pompa. Visualisasikan arah aliran (*directional flow*), telusuri jalur jaringan (*downstream & upstream tracing*), dan kelola riwayat inspeksi secara *real-time*.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-3 bg-[#2563EB] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-full hover:bg-[#1D4ED8] transition shadow-lg shadow-blue-500/25 hover:scale-105"
              >
                <MapPin className="w-5 h-5" />
                <span>Masuk Aplikasi & Peta GIS</span>
              </button>

              <a
                href="#features"
                className="flex items-center gap-2.5 bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 font-bold text-sm sm:text-base px-7 py-4 rounded-full transition shadow-2xs"
              >
                <GitBranch className="w-5 h-5 text-[#0284C7]" />
                <span>Pelajari Flow Tracing</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-10 border-t border-slate-300/60">
              <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/90 text-center sm:text-left shadow-xs">
                <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono">&lt; 1 Menit</div>
                <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">Pencarian Aset Peta</div>
              </div>
              <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/90 text-center sm:text-left shadow-xs">
                <div className="text-xl sm:text-3xl font-black text-[#2563EB] font-mono">100% DAG</div>
                <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">Network Topology Valid</div>
              </div>
              <div className="bg-white/90 p-5 rounded-2xl border border-slate-200/90 text-center sm:text-left shadow-xs">
                <div className="text-xl sm:text-3xl font-black text-[#0284C7] font-mono">QR Tagged</div>
                <div className="text-xs sm:text-sm text-slate-600 font-bold mt-1">Field Scanning Support</div>
              </div>
            </div>
          </div>

          {/* Right Visual Dashboard Preview Frame */}
          <div className="lg:col-span-5 relative w-full mx-auto">
            <div className="relative rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-2xl overflow-hidden group">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F87171]"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FDE047]"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#4ADE80]"></span>
                  <span className="ml-1 text-xs font-mono text-slate-500 font-bold">SewerBITA Live Monitor</span>
                </div>
                <span className="text-xs text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full font-mono font-extrabold border border-blue-100">
                  Zone A - Sudirman
                </span>
              </div>

              {/* Graphic Topology Schema */}
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 relative border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#16A34A] font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-200">
                      MH-101
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Sudirman A1</div>
                      <div className="text-xs text-slate-500 font-medium">Elevasi: 12.4m</div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#4ADE80] text-slate-900 px-3 py-1 rounded-full font-extrabold">Good</span>
                </div>

                {/* Animated Arrow Connector */}
                <div className="flex items-center justify-center gap-2 py-1 text-slate-600">
                  <div className="h-8 w-1 bg-gradient-to-b from-[#16A34A] to-[#CA8A04] relative overflow-hidden rounded-full">
                    <div className="w-full h-full bg-white animate-pulse"></div>
                  </div>
                  <span className="text-xs font-mono text-[#2563EB] font-extrabold">P-003 (800mm Pipe)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#CA8A04] font-extrabold text-sm flex items-center justify-center shrink-0 border border-amber-200">
                      MH-103
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Setiabudi B1</div>
                      <div className="text-xs text-slate-500 font-medium">Sedimen +20cm</div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#FDE047] text-slate-900 px-3 py-1 rounded-full font-extrabold">Warning</span>
                </div>

                {/* Downstream Connector */}
                <div className="flex items-center justify-center gap-2 py-1 text-slate-600">
                  <div className="h-8 w-1 bg-gradient-to-b from-[#CA8A04] to-[#2563EB] relative rounded-full"></div>
                  <span className="text-xs font-mono text-[#0284C7] font-extrabold">Flow Downstream →</span>
                </div>

                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                      PS-001
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Stasiun Pompa Manggarai</div>
                      <div className="text-xs text-[#2563EB] font-extrabold">Kapasitas: 450 L/s</div>
                    </div>
                  </div>
                  <span className="text-xs bg-[#2563EB] text-white px-3 py-1 rounded-full font-extrabold">Terminal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-8 lg:px-12 bg-white/80 border-t border-slate-200/80">
        <div className="w-full max-w-[1800px] mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Solusi Komprehensif Operasional Air Limbah</h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Dirancang untuk Administrator, Engineer, dan Teknisi Lapangan untuk meminimalkan waktu troubleshooting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#2563EB]/40 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Peta GIS Interaktif</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Pemetaan lokasi presisi Manhole, Pipa, dan Stasiun Pompa dengan peta terang voyager dan indikator status aset.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0284C7]/40 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284C7]">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Downstream & Upstream Trace</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Penelusuran otomatis jalur air limbah dari manhole manapun langsung menuju ke stasiun pompa tujuan.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#16A34A]/40 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#16A34A]">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Inspeksi & QR Tagging</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Scan QR Code unik di lapangan menggunakan kamera HP untuk langsung membuka spesifikasi dan form inspeksi.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#CA8A04]/40 transition space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#CA8A04]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Topology Validator</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Pemeriksaan otomatis pipa tanpa node, manhole terisolasi, dan error koordinat GIS secara berkala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200/80 text-center text-xs sm:text-sm font-semibold text-slate-600 px-4 w-full shrink-0">
        <p>© 2026 SewerBITA Wastewater Network Monitoring. Built with React, TypeScript & Leaflet GIS.</p>
      </footer>
    </div>
  );
};
