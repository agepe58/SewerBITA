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
    { key: 'manage_users', label: 'Kelola Пользователь & Peran RBAC' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2DD4BF]" />
            <span>User Management & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Pengaturan peran pengguna dan matriks hak akses keamanan (*Role-Based Permissions*).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Users List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-4">
            <h2 className="text-base font-bold text-white border-b border-[#232A3B] pb-3">
              Daftar Пользователь Terdaftar ({users.length})
            </h2>

            <div className="space-y-3">
              {users.map(usr => (
                <div key={usr.id} className="bg-[#1A1F2C] p-3.5 rounded-xl border border-[#232A3B] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={usr.avatar} alt={usr.name} className="w-9 h-9 rounded-full object-cover border border-[#2DD4BF]/40" />
                    <div>
                      <div className="font-bold text-white text-xs">{usr.name}</div>
                      <div className="text-[10px] text-slate-400">{usr.email}</div>
                      <div className="text-[10px] text-slate-500">{usr.department}</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    usr.role === 'Admin' ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]' :
                    usr.role === 'Engineer' ? 'bg-[#06B6D4]/20 text-[#06B6D4]' :
                    usr.role === 'Technician' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
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
          <div className="bg-[#141824] p-6 rounded-2xl border border-[#232A3B] space-y-4">
            <h2 className="text-base font-bold text-white border-b border-[#232A3B] pb-3">
              Matriks Hak Akses Peran (RBAC Permission Matrix)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#191E2D] text-slate-400 font-semibold border-b border-[#232A3B]">
                  <tr>
                    <th className="p-3">Aksi / Fitur</th>
                    {roles.map(r => (
                      <th key={r} className="p-3 text-center">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232A3B]">
                  {allActions.map(action => (
                    <tr key={action.key} className="hover:bg-[#1A1F2C]">
                      <td className="p-3 text-slate-200 font-medium">{action.label}</td>
                      {roles.map(role => {
                        const allowed = ROLE_PERMISSIONS[role].includes(action.key);
                        return (
                          <td key={role} className="p-3 text-center">
                            {allowed ? (
                              <span className="inline-flex p-1 rounded bg-[#10B981]/20 text-[#10B981]">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex p-1 rounded bg-[#232A3B] text-slate-500">
                                <X className="w-3.5 h-3.5" />
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
