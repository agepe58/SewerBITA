import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, ClipboardCheck, Calendar, User } from 'lucide-react';
import { InspectionRecord, IssueCategory } from '../../types/inspection';
import { AssetCondition } from '../../types/asset';

interface EditInspectionModalProps {
  inspection: InspectionRecord | null;
  onClose: () => void;
  onSaveInspection: (updated: InspectionRecord) => void;
}

export const EditInspectionModal: React.FC<EditInspectionModalProps> = ({
  inspection,
  onClose,
  onSaveInspection
}) => {
  if (!inspection) return null;

  const [condition, setCondition] = useState<AssetCondition>(inspection.condition);
  const [issueCategory, setIssueCategory] = useState<IssueCategory>(inspection.issueCategory);
  const [inspectionDate, setInspectionDate] = useState(inspection.inspectionDate);
  const [inspectorName, setInspectorName] = useState(inspection.inspectorName);
  const [notes, setNotes] = useState(inspection.notes);
  const [actionTaken, setActionTaken] = useState(inspection.actionTaken || '');
  const [requiresFollowUp, setRequiresFollowUp] = useState(inspection.requiresFollowUp || false);

  const categories: IssueCategory[] = [
    'Normal / Routine',
    'Blockage',
    'Sedimentation',
    'Structural Damage',
    'Cover Damage',
    'Leakage',
    'Overflow',
    'Odour'
  ];

  useEffect(() => {
    if (inspection) {
      setCondition(inspection.condition);
      setIssueCategory(inspection.issueCategory);
      setInspectionDate(inspection.inspectionDate);
      setInspectorName(inspection.inspectorName);
      setNotes(inspection.notes);
      setActionTaken(inspection.actionTaken || '');
      setRequiresFollowUp(inspection.requiresFollowUp || false);
    }
  }, [inspection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveInspection({
      ...inspection,
      condition,
      issueCategory,
      inspectionDate,
      inspectorName,
      notes,
      actionTaken,
      requiresFollowUp
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#2563EB]" />
            <span>Edit Laporan Inspeksi: <span className="font-mono text-[#2563EB]">{inspection.assetCode}</span></span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Asset Info Header */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Aset Terinspeksi</div>
            <div className="font-bold text-slate-900 text-sm">{inspection.assetName} (<span className="font-mono text-[#2563EB]">{inspection.assetCode}</span>)</div>
          </div>

          {/* Condition & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kondisi Hasil Inspeksi</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as AssetCondition)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Good">Good (Baik)</option>
                <option value="Fair">Fair (Cukup)</option>
                <option value="Warning">Warning (Waspada)</option>
                <option value="Critical">Critical (Bahaya)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kategori Temuan / Isu</label>
              <select
                value={issueCategory}
                onChange={e => setIssueCategory(e.target.value as IssueCategory)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Inspector Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nama Petugas Inspeksi</label>
              <input
                type="text"
                required
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Tanggal Inspeksi</label>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={e => setInspectionDate(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Catatan Detail Temuan Lapangan</label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 font-medium text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB] leading-relaxed"
            />
          </div>

          {/* Action Taken */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Tindakan Langsung Yang Diambil</label>
            <input
              type="text"
              placeholder="Misal: Pembersihan sedimen, penggantian paking cover..."
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Requires Follow Up Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold text-slate-800">
              <input
                type="checkbox"
                checked={requiresFollowUp}
                onChange={e => setRequiresFollowUp(e.target.checked)}
                className="accent-[#2563EB] w-4.5 h-4.5 cursor-pointer"
              />
              <span>Memerlukan Perbaikan / Follow-up Lanjutan</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-extrabold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
