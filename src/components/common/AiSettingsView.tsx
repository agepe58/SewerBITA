import React, { useState } from 'react';
import { Sparkles, Brain, Sliders, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AiSettingsViewProps {
  isDarkMode?: boolean;
}

export const AiSettingsView: React.FC<AiSettingsViewProps> = ({ isDarkMode = true }) => {
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [predictiveMaintenance, setPredictiveMaintenance] = useState(true);
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');

  const cardBg = isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className={`p-6 space-y-6 font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`p-8 rounded-2xl border max-w-2xl mx-auto space-y-6 shadow-md ${cardBg}`}>
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold">Pengaturan Kecerdasan Buatan (AI Engine)</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Konfigurasi model analitik prediktif dan deteksi anomali jaringan pipa air limbah
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Toggle 1: Deteksi Anomali Debit */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-white">Deteksi Anomali Debit & Tekanan Pipa</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Otomatis mendeteksi indikasi luapan / penyumbatan dari sensor debit air</div>
            </div>
            <input
              type="checkbox"
              checked={anomalyDetection}
              onChange={(e) => setAnomalyDetection(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 2: Prediksi Jadwal Maintenance */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-white">Prediksi Siklus Pemeliharaan Pompa</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Memprediksi waktu penggantian oli dan impeller pompa submersible</div>
            </div>
            <input
              type="checkbox"
              checked={predictiveMaintenance}
              onChange={(e) => setPredictiveMaintenance(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Toggle 3: Auto-Assignment */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-white">Disposisi Otomatis (Smart Dispatch)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Menugaskan work order darurat ke teknisi terdekat berdasarkan lokasi GPS</div>
            </div>
            <input
              type="checkbox"
              checked={autoAssignment}
              onChange={(e) => setAutoAssignment(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Threshold Slider */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-white">Ambang Batas Keyakinan AI (Confidence Threshold)</span>
              <span className="text-blue-400">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert('Pengaturan AI berhasil diperbarui!')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Simpan Konfigurasi AI
          </button>
        </div>
      </div>
    </div>
  );
};
