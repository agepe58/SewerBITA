import React, { useState } from 'react';
import { X, UserPlus, Save, Eye, EyeOff } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/rbac';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (newUser: UserProfile) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Engineer');
  const [department, setDepartment] = useState('Unit Pengolahan Air Limbah');
  const [password, setPassword] = useState('bita123456');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  const roles: UserRole[] = ['Admin', 'Engineer', 'Technician', 'Management'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      department,
      password,
      phone: phone || undefined,
      status: 'Active',
      avatar
    };

    onAddUser(created);
    onClose();

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-sm text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#2563EB]" />
            <span>Tambah Pengguna Sistem Baru</span>
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
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Misal: Budi Santoso, ST"
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
                placeholder="budi@bukitindah.co.id"
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
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">Password Awal</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
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

          {/* Avatar URL */}
          <div>
            <label className="text-xs text-slate-600 font-bold uppercase tracking-wider">URL Foto Profil (Avatar)</label>
            <input
              type="text"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full bg-slate-50 font-mono text-xs text-slate-900 border border-slate-200 rounded-xl p-3 mt-1 focus:bg-white focus:outline-none focus:border-[#2563EB]"
            />
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
              <span>Simpan Pengguna Baru</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
