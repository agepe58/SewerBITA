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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1200] flex items-center justify-center p-4">
      <div className="bg-[#12151E] border border-[#232A3B] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-xs text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-[#232A3B] flex items-center justify-between bg-[#141824]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#2DD4BF]" />
            <span>Buat Laporan Inspeksi Lapangan</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Asset Selector */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Pilih Aset Terinspeksi</label>
            <select
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="w-full bg-[#080A0E] border border-[#232A3B] rounded-xl p-2.5 text-slate-200 mt-1 focus:outline-none focus:border-[#2DD4BF]"
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
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Kondisi Aset Hasil Inspeksi</label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {(['Good', 'Fair', 'Warning', 'Critical'] as AssetCondition[]).map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`py-2 rounded-xl border font-bold text-[11px] transition ${
                    condition === c
                      ? c === 'Good' ? 'bg-[#10B981] text-black border-[#10B981]' :
                        c === 'Fair' ? 'bg-[#06B6D4] text-black border-[#06B6D4]' :
                        c === 'Warning' ? 'bg-[#F59E0B] text-black border-[#F59E0B]' : 'bg-[#EF4444] text-white border-[#EF4444]'
                      : 'bg-[#1A1F2C] text-slate-400 border-[#232A3B]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Category */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Kategori Masalah / Temuan</label>
            <select
              value={issueCategory}
              onChange={e => setIssueCategory(e.target.value as IssueCategory)}
              className="w-full bg-[#080A0E] border border-[#232A3B] rounded-xl p-2.5 text-slate-200 mt-1 focus:outline-none focus:border-[#2DD4BF]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Field Notes */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Catatan Petugas & Detail Kerusakan</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jelaskan kondisi fisik, tingkat penyumbatan, retakan, atau bau..."
              className="w-full bg-[#080A0E] border border-[#232A3B] rounded-xl p-2.5 text-slate-200 mt-1 focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          {/* Photo Attachment Demo */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Camera className="w-3 h-3 text-[#2DD4BF]" />
              <span>URL Foto Dokumentasi Lapangan (Opsional)</span>
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-[#080A0E] border border-[#232A3B] rounded-xl p-2.5 text-slate-200 mt-1 font-mono text-[11px]"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#232A3B] text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#2DD4BF] text-black font-extrabold hover:bg-[#5EEAD4]"
            >
              Kirim Laporan Inspeksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
