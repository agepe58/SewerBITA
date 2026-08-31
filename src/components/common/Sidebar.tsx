import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  GitBranch,
  Boxes,
  ClipboardCheck,
  QrCode,
  FileSpreadsheet,
  Users,
  HardDriveDownload,
  UserCircle,
  LogOut,
  Map
} from 'lucide-react';
import { UserRole } from '../../types/rbac';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'topology'
  | 'assets'
  | 'areas'
  | 'inspections'
  | 'qr_scanner'
  | 'data'
  | 'users'
  | 'backup'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUserRole: UserRole;
  onLogout?: () => void;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUserRole: _currentUserRole,
  onLogout,
  isDarkMode = true
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'map' as NavTab,
      label: 'Peta GIS Interaktif',
      icon: MapPin,
      badge: 'Live'
    },
    {
      id: 'topology' as NavTab,
      label: 'Topologi & Flow Tracing',
      icon: GitBranch
    },
    {
      id: 'assets' as NavTab,
      label: 'Registri Aset Master',
      icon: Boxes
    },
    {
      id: 'areas' as NavTab,
      label: 'Manajemen Area / Zona',
      icon: Map
    },
    {
      id: 'inspections' as NavTab,
      label: 'Inspeksi Lapangan',
      icon: ClipboardCheck
    },
    {
      id: 'qr_scanner' as NavTab,
      label: 'Scan QR Code Aset',
      icon: QrCode
    },
    {
      id: 'data' as NavTab,
      label: 'Import / Export Data',
      icon: FileSpreadsheet
    },
    {
      id: 'users' as NavTab,
      label: 'Manajemen Pengguna',
      icon: Users
    },
    {
      id: 'backup' as NavTab,
      label: 'Backup & Pemulihan',
      icon: HardDriveDownload
    },
    {
      id: 'profile' as NavTab,
      label: 'Profil Saya',
      icon: UserCircle
    }
  ];

  return (
    <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 font-sans select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0F17] border-slate-800/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Upper Brand & Navigation Menu */}
      <div className="space-y-4">
        {/* Workspace Brand Badge */}
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="bg-white/95 p-1.5 rounded-xl border border-white/20 shadow-md shrink-0 flex items-center justify-center">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
              Unit Pengolahan Air & Limbah
            </div>
            <div className={`font-black text-xs sm:text-sm tracking-tight leading-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Kota Bukit Indah
            </div>
            <div className="text-[9px] text-blue-400 font-semibold truncate leading-tight">
              SewerBITA Asset System
            </div>
          </div>
        </div>

        {/* Navigation Item Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isDarkMode
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate text-left">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      {onLogout && (
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      )}
    </aside>
  );
};
