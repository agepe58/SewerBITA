import React, { useState } from 'react';
import { UserCircle, Mail, Phone, Building, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types/rbac';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  isDarkMode?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
  isDarkMode = true
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [isSaved, setIsSaved] = useState(false);

  const cardBg = isDarkMode ? 'bg-[#111827] border border-slate-700/90 shadow-md shadow-black/30' : 'bg-white border border-slate-300 shadow-sm';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name,
      phone,
      department
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const getInitials = (n: string) => {
    if (!n) return 'AP';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{ padding: '16px 16px 32px 16px' }}
    >
      <div className={`p-8 rounded-2xl border max-w-xl mx-auto space-y-6 shadow-md ${cardBg}`}>
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-black text-xl flex items-center justify-center shadow-md">
            {getInitials(currentUser.name)}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">{currentUser.name}</h2>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">{currentUser.email}</div>
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold">
              <ShieldCheck className="w-3 h-3" />
              <span>{currentUser.role}</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Email (Terverifikasi)</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Departemen / Divisi</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">Nomor Kontak (WhatsApp/Telepon)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-900 border-slate-700 text-white text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profil berhasil diperbarui!</span>
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
