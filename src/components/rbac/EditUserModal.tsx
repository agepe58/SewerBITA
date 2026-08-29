import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Shield, Building2, Phone, Save, Eye, EyeOff } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/rbac';

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (updatedUser: UserProfile) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveUser
}) => {
  if (!isOpen || !user) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [department, setDepartment] = useState(user.department);
  const [password, setPassword] = useState(user.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(user.status || 'Active');
  const [avatar, setAvatar] = useState(user.avatar);

  const roles: UserRole[] = ['Admin', 'Engineer', 'Technician', 'Management'];

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDepartment(user.department);
      setPassword(user.password || '');
      setPhone(user.phone || '');
      setStatus(user.status || 'Active');
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveUser({
      ...user,
      name,
      email,
      role,
      department,
      password: password || undefined,
      phone: phone || undefined,
      status,
      avatar
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-[#2563EB]" />
            <span>Edit Profil & Akses Pengguna</span>
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
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={avatar}
              alt="Avatar Preview"
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs shrink-0"
              onError={(e) => {
                // Fallback avatar if URL is invalid
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
              }}
            />
            <div className="flex-1 space-y-1">
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">URL Foto Profil (Avatar)</label>
              <input
                type="text"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white text-xs font-mono text-slate-900 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Peran Sistem (Role)</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Departemen / Unit Kerja</label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Password Pengguna</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ketik password baru..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-3 pr-10 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nomor WhatsApp / HP</label>
              <input
                type="text"
                placeholder="+62 812-xxxx-xxxx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 font-mono font-bold text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Status Akun</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-extrabold transition ${
                  status === 'Active' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ● Active (Aktif)
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-extrabold transition ${
                  status === 'Inactive' ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ● Inactive (Non-aktif)
              </button>
            </div>
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
