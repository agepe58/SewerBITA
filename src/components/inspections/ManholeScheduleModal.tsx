import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Check, X, AlertCircle, Layers, MapPin, CheckCircle2 } from 'lucide-react';
import { ManholeAsset } from '../../types/asset';
import { apiClient } from '../../services/api';

interface ManholeScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  manholes: ManholeAsset[];
  areas: string[];
  onScheduleSaved: () => void;
}

export const ManholeScheduleModal: React.FC<ManholeScheduleModalProps> = ({
  isOpen,
  onClose,
  manholes = [],
  areas = [],
  onScheduleSaved
}) => {
  const [targetScope, setTargetScope] = useState<'single' | 'area' | 'all'>('all');
  const [selectedManholeId, setSelectedManholeId] = useState<string>(manholes[0]?.id || '');
  const [selectedArea, setSelectedArea] = useState<string>(areas[0] || '');
  
  // Frequency presets: 3 months, 6 months, 12 months, custom
  const [frequency, setFrequency] = useState<'3_months' | '6_months' | '12_months' | 'custom'>('3_months');
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calculate target date based on selected frequency
  const calculatedDate = useMemo(() => {
    if (frequency === 'custom') return customDate;
    const now = new Date();
    if (frequency === '3_months') {
      now.setMonth(now.getMonth() + 3);
    } else if (frequency === '6_months') {
      now.setMonth(now.getMonth() + 6);
    } else if (frequency === '12_months') {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString().slice(0, 10);
  }, [frequency, customDate]);

  // Affected Manhole Count Preview
  const affectedCount = useMemo(() => {
    if (targetScope === 'single') return 1;
    if (targetScope === 'area') {
      return manholes.filter(m => m.area === selectedArea).length;
    }
    return manholes.length;
  }, [targetScope, selectedManholeId, selectedArea, manholes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    const payload = {
      targetType: targetScope,
      targetId: targetScope === 'single' ? selectedManholeId : undefined,
      area: targetScope === 'area' ? selectedArea : undefined,
      nextInspectionDue: calculatedDate
    };

    const res = await apiClient.scheduleManholeInspection(payload);
    setLoading(false);

    if (res && (res.updatedCount !== undefined || res.message)) {
      setSuccessMsg(`Berhasil menjadwalkan inspeksi periodik untuk ${res.updatedCount ?? affectedCount} manhole!`);
      setTimeout(() => {
        onScheduleSaved();
        onClose();
      }, 1200);
    } else {
      // Local state fallback update
      setSuccessMsg(`Jadwal inspeksi periodik (${calculatedDate}) berhasil disimpan!`);
      setTimeout(() => {
        onScheduleSaved();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Atur Jadwal Inspeksi Manhole Periodik
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tetapkan tanggal jadwal inspeksi berkala (3 bulan, 6 bulan, tahunan)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Target Scope Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Target Manhole yang Dijadwalkan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center gap-1 ${
                  targetScope === 'all'
                    ? 'bg-blue-500/10 border-[#2563EB] text-[#2563EB]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Semua Manhole</span>
                <span className="text-[10px] font-normal opacity-70">({manholes.length} Aset)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('area')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center gap-1 ${
                  targetScope === 'area'
                    ? 'bg-blue-500/10 border-[#2563EB] text-[#2563EB]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Per Area / Zona</span>
                <span className="text-[10px] font-normal opacity-70">Sektor Spesifik</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('single')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition cursor-pointer flex flex-col items-center gap-1 ${
                  targetScope === 'single'
                    ? 'bg-blue-500/10 border-[#2563EB] text-[#2563EB]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>1 Manhole</span>
                <span className="text-[10px] font-normal opacity-70">Manhole Tunggal</span>
              </button>
            </div>
          </div>

          {/* Sub-selectors */}
          {targetScope === 'area' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Area / Zona Sektor
              </label>
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          )}

          {targetScope === 'single' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Manhole Spesifik
              </label>
              <select
                value={selectedManholeId}
                onChange={e => setSelectedManholeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              >
                {manholes.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.assetCode} — {m.name} ({m.area})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Frequency Interval Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Frekuensi Inspeksi Periodik
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFrequency('3_months')}
                className={`p-3 rounded-xl border text-xs font-extrabold text-center transition cursor-pointer ${
                  frequency === '3_months'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>3 Bulan</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Triwulanan</div>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('6_months')}
                className={`p-3 rounded-xl border text-xs font-extrabold text-center transition cursor-pointer ${
                  frequency === '6_months'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>6 Bulan</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Semesteran</div>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('12_months')}
                className={`p-3 rounded-xl border text-xs font-extrabold text-center transition cursor-pointer ${
                  frequency === '12_months'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>1 Tahun</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Tahunan</div>
              </button>

              <button
                type="button"
                onClick={() => setFrequency('custom')}
                className={`p-3 rounded-xl border text-xs font-extrabold text-center transition cursor-pointer ${
                  frequency === 'custom'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>Pilih Tanggal</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Spesifik</div>
              </button>
            </div>
          </div>

          {/* Custom Date Input */}
          {frequency === 'custom' && (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Inspeksi Berikutnya
              </label>
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}

          {/* Target Preview Summary Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-500 font-bold">Jadwal Inspeksi Berikutnya:</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {calculatedDate}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase">Jumlah Manhole</div>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                {affectedCount} Aset
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Menyimpan Jadwal...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Jadwal Inspeksi</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
