import React, { useState } from 'react';
import { Users, ShieldCheck, Lock, Check, X, UserCheck, Plus, Edit3, Trash2, AlertTriangle, Key } from 'lucide-react';
import { UserProfile, UserRole, ROLE_PERMISSIONS, PermissionAction } from '../../types/rbac';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onOpenAddUserModal: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onRoleChange,
  onEditUser,
  onDeleteUser,
  onOpenAddUserModal
}) => {
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const roles: UserRole[] = ['Admin', 'Engineer', 'Technician', 'Management'];

  const allActions: { key: PermissionAction; label: string }[] = [
    { key: 'view_dashboard', label: 'Melihat Dashboard Executive' },
    { key: 'view_map', label: 'Akses Peta GIS Interaktif' },
    { key: 'view_assets', label: 'Melihat Master Registry Aset' },
    { key: 'add_asset', label: 'Menambah Aset Baru (Manhole/Pipa)' },
    { key: 'edit_asset', label: 'Mengubah Data Aset' },
    { key: 'edit_topology', label: 'Koreksi Topology & Directional Flow' },
    { key: 'create_inspection', label: 'Membuat Laporan Inspeksi' },
    { key: 'export_data', label: 'Export Data CSV/Excel' },
    { key: 'import_data', label: 'Import Data Massal' },
    { key: 'manage_users', label: 'Kelola Pengguna & Peran RBAC' }
  ];

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Workspace Header Bar Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-[#2563EB]">
              <Users className="w-5 h-5" />
            </div>
            <span>User Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Pengaturan pengguna sistem, autentikasi password, peran (*role*), dan matriks hak akses (*Role-Based Permissions*).
          </p>
        </div>

        <button
          onClick={onOpenAddUserModal}
          className="flex items-center gap-2.5 bg-[#2563EB] text-white font-black text-sm px-6 py-3.5 rounded-xl hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/25 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Tambah Pengguna Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Active Users List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Daftar Pengguna Terdaftar ({users.length})</span>
            </h2>

            <div className="space-y-3.5">
              {users.map(usr => (
                <div key={usr.id} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={usr.avatar} alt={usr.name} className="w-10 h-10 rounded-full object-cover border border-blue-200 dark:border-blue-800 shadow-xs shrink-0" />
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate flex items-center gap-1.5">
                        <span>{usr.name}</span>
                        {usr.id === currentUser.id && (
                          <span className="text-[10px] bg-blue-100 text-[#2563EB] dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">Anda</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{usr.email}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">{usr.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${usr.role === 'Admin' ? 'bg-[#2563EB] text-white' :
                        usr.role === 'Engineer' ? 'bg-[#0284C7] text-white' :
                          usr.role === 'Technician' ? 'bg-[#16A34A] text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                      {usr.role}
                    </span>

                    <button
                      onClick={() => onEditUser(usr)}
                      className="p-1.5 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      title="Edit User (Nama, Password, Role, Departemen)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setUserToDelete(usr)}
                      disabled={usr.id === currentUser.id}
                      className={`p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer ${
                        usr.id === currentUser.id ? 'opacity-40 cursor-not-allowed text-slate-300 dark:text-slate-600' : 'hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400'
                      }`}
                      title={usr.id === currentUser.id ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Permissions Matrix Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Matriks Hak Akses Peran (RBAC Permission Matrix)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Aksi / Fitur</th>
                    {roles.map(r => (
                      <th key={r} className="p-3.5 text-center">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {allActions.map(action => (
                    <tr key={action.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition">
                      <td className="p-3.5 text-slate-900 dark:text-white font-bold">{action.label}</td>
                      {roles.map(role => {
                        const allowed = ROLE_PERMISSIONS[role].includes(action.key);
                        return (
                          <td key={role} className="p-3.5 text-center">
                            {allowed ? (
                              <span className="inline-flex p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#16A34A] dark:text-emerald-400">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <X className="w-4 h-4" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1400] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 w-full max-w-md rounded-xl shadow-2xl p-6 text-slate-900 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600 font-extrabold text-base border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span>Konfirmasi Hapus Pengguna</span>
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-slate-900 font-bold">{userToDelete.name}</strong> ({userToDelete.email})? Pengguna ini tidak akan dapat login lagi.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition shadow-md shadow-rose-500/20 text-sm"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
