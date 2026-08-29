import React, { useState } from 'react';
import { X, ClipboardCheck, Camera, Check } from 'lucide-react';
import { SewerAsset, AssetCondition } from '../../types/asset';
import { InspectionRecord, IssueCategory } from '../../types/inspection';
import { UserProfile } from '../../types/rbac';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInspection: (inspection: Omit<InspectionRecord, 'id'>) => void;
  allAssets: SewerAsset[];
  currentUser: UserProfile;
  preselectedAssetId?: string | null;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  onAddInspection,
  allAssets,
  currentUser,
  preselectedAssetId
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    preselectedAssetId || allAssets[0]?.id || ''
  );
  const [condition, setCondition] = useState<AssetCondition>('Good');
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('Normal / Routine');
  const [notes, setNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAsset = allAssets.find(a => a.id === selectedAssetId);
    if (!targetAsset) return;

    onAddInspection({
      assetId: targetAsset.id,
      assetCode: targetAsset.assetCode,
      assetName: targetAsset.name,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectorName: currentUser.name,
      inspectorRole: currentUser.role,
      condition,
      issueCategory,
      notes: notes || 'Inspeksi lapangan rutin.',
      photos: photoUrl ? [photoUrl] : [],
      actionTaken: actionTaken || undefined,
      requiresFollowUp
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#2563EB]" />
            <span>Buat Laporan Inspeksi Lapangan</span>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Asset Selector */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Pilih Aset Terinspeksi</label>
            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
            >
              {allAssets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} — {a.name} ({a.area})
                </option>
              ))}
            </select>
          </div>

          {/* Rating Condition */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kondisi Aset Hasil Inspeksi</label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {(['Good', 'Fair', 'Warning', 'Critical'] as AssetCondition[]).map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`py-2.5 rounded-xl border font-bold text-xs transition shadow-2xs ${
                    condition === c
                      ? c === 'Good' ? 'bg-[#4ADE80] text-slate-900 border-[#4ADE80]' :
                        c === 'Fair' ? 'bg-[#38BDF8] text-slate-900 border-[#38BDF8]' :
                        c === 'Warning' ? 'bg-[#FDE047] text-slate-900 border-[#FDE047]' : 'bg-[#F87171] text-white border-[#F87171]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Category */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kategori Masalah / Temuan</label>
            <select
              value={issueCategory}
              onChange={e => setIssueCategory(e.target.value as IssueCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 focus:outline-none focus:border-[#2563EB] font-bold text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Field Notes */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Catatan Petugas & Detail Kerusakan</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jelaskan kondisi fisik, tingkat penyumbatan, retakan, atau bau..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-semibold text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Photo Attachment Demo */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#2563EB]" />
              <span>URL Foto Dokumentasi Lapangan (Opsional)</span>
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 mt-1.5 font-mono text-xs focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-[#2563EB] text-white font-extrabold hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20 text-sm"
            >
              Kirim Laporan Inspeksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
