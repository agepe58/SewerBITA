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
    <div className="min-h-screen bg-[#080A0E] text-slate-100 selection:bg-[#2DD4BF] selection:text-black">
      {/* Landing Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-[#232A3B]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF] flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.4)] shrink-0">
            <Droplets className="w-6 h-6 text-black" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-xl tracking-tight text-white">
              Sewer<span className="text-[#2DD4BF]">BITA</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-[#1A1F2C] border border-[#232A3B] px-2 py-0.5 rounded-full font-mono hidden sm:inline-block">
              Enterprise Network Intelligence
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-medium text-slate-300">
          <a href="#features" className="hover:text-[#2DD4BF] transition">Fitur Utama</a>
          <a href="#topology" className="hover:text-[#2DD4BF] transition">Network Topology</a>
          <a href="#inspection" className="hover:text-[#2DD4BF] transition">Inspeksi QR</a>
          <a href="#architecture" className="hover:text-[#2DD4BF] transition">Arsitektur GIS</a>
        </div>

        <button
          onClick={onEnterDashboard}
          className="flex items-center gap-2 bg-[#2DD4BF] text-black font-bold text-xs px-4 sm:px-5 py-2.5 rounded-full hover:bg-[#5EEAD4] transition shadow-[0_0_20px_rgba(45,212,191,0.35)] hover:scale-105 shrink-0"
        >
          <span>Buka Portal Monitoring</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#2DD4BF]/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#12151E] border border-[#232A3B] px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse shrink-0"></span>
              <span className="text-xs font-semibold text-[#2DD4BF]">Next-Gen Wastewater GIS & Topology Tracing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Single Source of Truth untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] via-[#06B6D4] to-white">Jaringan Air Limbah</span>
            </h1>

            <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Dokumentasi terstruktur lokasi Manhole, Pipa Kolektor, dan Stasiun Pompa. Visualisasikan arah aliran (*directional flow*), telusuri jalur jaringan (*downstream & upstream tracing*), dan kelola riwayat inspeksi secara *real-time*.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onEnterDashboard}
                className="flex items-center gap-3 bg-[#2DD4BF] text-black font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-full hover:bg-[#5EEAD4] transition shadow-[0_0_25px_rgba(45,212,191,0.4)]"
              >
                <MapPin className="w-4 h-4" />
                <span>Masuk Aplikasi & Peta GIS</span>
              </button>

              <a
                href="#features"
                className="flex items-center gap-2 bg-[#12151E] text-slate-200 border border-[#232A3B] hover:border-[#2DD4BF]/50 font-semibold text-xs sm:text-sm px-5 sm:px-6 py-3 sm:py-3.5 rounded-full transition"
              >
                <GitBranch className="w-4 h-4 text-[#06B6D4]" />
                <span>Pelajari Flow Tracing</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 border-t border-[#232A3B]">
              <div className="bg-[#12151E]/60 p-3 rounded-2xl border border-[#232A3B]/80 text-center sm:text-left">
                <div className="text-lg sm:text-2xl font-black text-white font-mono">&lt; 1 Menit</div>
                <div className="text-[10px] sm:text-xs text-slate-400">Pencarian Aset Peta</div>
              </div>
              <div className="bg-[#12151E]/60 p-3 rounded-2xl border border-[#232A3B]/80 text-center sm:text-left">
                <div className="text-lg sm:text-2xl font-black text-[#2DD4BF] font-mono">100% DAG</div>
                <div className="text-[10px] sm:text-xs text-slate-400">Network Topology Valid</div>
              </div>
              <div className="bg-[#12151E]/60 p-3 rounded-2xl border border-[#232A3B]/80 text-center sm:text-left">
                <div className="text-lg sm:text-2xl font-black text-[#06B6D4] font-mono">QR Tagged</div>
                <div className="text-[10px] sm:text-xs text-slate-400">Field Scanning Support</div>
              </div>
            </div>
          </div>

          {/* Right Visual Dashboard Preview Frame */}
          <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
            <div className="relative rounded-3xl bg-[#12151E] border border-[#232A3B] p-4 sm:p-5 shadow-2xl overflow-hidden group">
              <div className="flex items-center justify-between mb-3 border-b border-[#232A3B] pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span className="ml-1 text-xs font-mono text-slate-400">SewerBITA Live Monitor</span>
                </div>
                <span className="text-[10px] text-[#2DD4BF] bg-[#1A1F2C] px-2 py-0.5 rounded font-mono border border-[#2DD4BF]/30">
                  Zone A - Sudirman
                </span>
              </div>

              {/* Graphic Topology Schema */}
              <div className="bg-[#080A0E] rounded-2xl p-4 sm:p-5 relative border border-[#232A3B] space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981] font-bold text-xs shrink-0">
                      MH-101
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Sudirman A1</div>
                      <div className="text-[10px] text-slate-400">Elevasi: 12.4m</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded font-semibold">Good</span>
                </div>

                {/* Animated Arrow Connector */}
                <div className="flex items-center justify-center gap-2 py-0.5 text-slate-500">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-[#10B981] to-[#F59E0B] relative overflow-hidden">
                    <div className="w-full h-full bg-white animate-pulse"></div>
                  </div>
                  <span className="text-[10px] font-mono text-[#2DD4BF]">P-003 (800mm Pipe)</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B] flex items-center justify-center text-[#F59E0B] font-bold text-xs shrink-0">
                      MH-103
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Setiabudi B1</div>
                      <div className="text-[10px] text-slate-400">Sedimen +20cm</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-semibold">Warning</span>
                </div>

                {/* Downstream Connector */}
                <div className="flex items-center justify-center gap-2 py-0.5 text-slate-500">
                  <div className="h-6 w-0.5 bg-gradient-to-b from-[#F59E0B] to-[#2DD4BF] relative"></div>
                  <span className="text-[10px] font-mono text-[#06B6D4]">Flow Downstream →</span>
                </div>

                <div className="flex items-center justify-between bg-[#141824] p-3 rounded-xl border border-[#2DD4BF]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2DD4BF] text-black font-bold text-xs flex items-center justify-center shadow-[0_0_12px_rgba(45,212,191,0.5)] shrink-0">
                      PS-001
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Stasiun Pompa Manggarai</div>
                      <div className="text-[10px] text-[#2DD4BF]">Kapasitas: 450 L/s</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#2DD4BF] text-black px-2 py-0.5 rounded font-bold">Terminal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#0E1118] border-t border-[#232A3B]">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Solusi Komprehensif Operasional Air Limbah</h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Dirancang untuk Administrator, Engineer, dan Teknisi Lapangan untuk meminimalkan waktu troubleshooting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#12151E] p-5 sm:p-6 rounded-2xl border border-[#232A3B] hover:border-[#2DD4BF]/40 transition space-y-3 sm:space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Peta GIS Interaktif</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pemetaan lokasi presisi Manhole, Pipa, dan Stasiun Pompa dengan peta tema gelap dan indikator status aset.
              </p>
            </div>

            <div className="bg-[#12151E] p-5 sm:p-6 rounded-2xl border border-[#232A3B] hover:border-[#06B6D4]/40 transition space-y-3 sm:space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Downstream & Upstream Trace</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penelusuran otomatis jalur air limbah dari manhole manapun langsung menuju ke stasiun pompa tujuan.
              </p>
            </div>

            <div className="bg-[#12151E] p-5 sm:p-6 rounded-2xl border border-[#232A3B] hover:border-[#10B981]/40 transition space-y-3 sm:space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Inspeksi & QR Tagging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan QR Code unik di lapangan menggunakan kamera HP untuk langsung membuka spesifikasi dan form inspeksi.
              </p>
            </div>

            <div className="bg-[#12151E] p-5 sm:p-6 rounded-2xl border border-[#232A3B] hover:border-[#F59E0B]/40 transition space-y-3 sm:space-y-4">
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">Topology Validator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pemeriksaan otomatis pipa tanpa node, manhole terisolasi, dan error koordinat GIS secara berkala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#232A3B] text-center text-xs text-slate-500 px-4">
        <p>© 2026 SewerBITA Wastewater Network Monitoring. Built with React, TypeScript & Leaflet GIS.</p>
      </footer>
    </div>
  );
};
