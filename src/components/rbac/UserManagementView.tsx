import React from 'react';
import { Users, ShieldCheck, Lock, Check, X, UserCheck } from 'lucide-react';
import { UserProfile, UserRole, ROLE_PERMISSIONS, PermissionAction } from '../../types/rbac';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onRoleChange
}) => {
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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-[#2563EB]" />
            <span>User Management & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            Pengaturan peran pengguna dan matriks hak akses keamanan (*Role-Based Permissions*).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Users List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Daftar Pengguna Terdaftar ({users.length})
            </h2>

            <div className="space-y-3">
              {users.map(usr => (
                <div key={usr.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={usr.avatar} alt={usr.name} className="w-10 h-10 rounded-full object-cover border border-blue-200 shadow-xs" />
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{usr.name}</div>
                      <div className="text-xs text-slate-600 font-medium">{usr.email}</div>
                      <div className="text-xs text-slate-500 font-semibold">{usr.department}</div>
                    </div>
                  </div>

                  <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
                    usr.role === 'Admin' ? 'bg-[#2563EB] text-white' :
                    usr.role === 'Engineer' ? 'bg-[#0284C7] text-white' :
                    usr.role === 'Technician' ? 'bg-[#16A34A] text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {usr.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Permissions Matrix Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Matriks Hak Akses Peran (RBAC Permission Matrix)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Aksi / Fitur</th>
                    {roles.map(r => (
                      <th key={r} className="p-3.5 text-center">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {allActions.map(action => (
                    <tr key={action.key} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 text-slate-900 font-bold">{action.label}</td>
                      {roles.map(role => {
                        const allowed = ROLE_PERMISSIONS[role].includes(action.key);
                        return (
                          <td key={role} className="p-3.5 text-center">
                            {allowed ? (
                              <span className="inline-flex p-1 rounded-full bg-emerald-100 text-[#16A34A]">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
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
    </div>
  );
};
