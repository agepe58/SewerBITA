import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  GitBranch,
  Boxes,
  ClipboardCheck,
  FileSpreadsheet,
  Users,
  Droplets,
  Activity,
  Layers,
  ChevronRight,
  LogOut,
  HardDriveDownload
} from 'lucide-react';
import { UserRole } from '../../types/rbac';
import { RBACService } from '../../services/rbacService';

export type NavTab =
  | 'dashboard'
  | 'map'
  | 'topology'
  | 'assets'
  | 'inspections'
  | 'data'
  | 'users'
  | 'backup';

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
  currentUserRole,
  onLogout,
  isDarkMode = false
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: 'view_dashboard' as const
    },
    {
      id: 'map' as NavTab,
      label: 'Interactive GIS Map',
      icon: MapPin,
      action: 'view_map' as const,
      badge: 'Live'
    },
    {
      id: 'topology' as NavTab,
      label: 'Flow Topology Solver',
      icon: GitBranch,
      action: 'view_assets' as const
    },
    {
      id: 'assets' as NavTab,
      label: 'Master Asset Registry',
      icon: Boxes,
      action: 'view_assets' as const
    },
    {
      id: 'inspections' as NavTab,
      label: 'Inspections & Reports',
      icon: ClipboardCheck,
      action: 'create_inspection' as const
    },
    {
      id: 'data' as NavTab,
      label: 'Data Import / Export',
      icon: FileSpreadsheet,
      action: 'export_data' as const
    },
    {
      id: 'users' as NavTab,
      label: 'User Management',
      icon: Users,
      action: 'manage_users' as const
    },
    {
      id: 'backup' as NavTab,
      label: 'Backup & Restore (NAS/Drive)',
      icon: HardDriveDownload,
      action: 'manage_backups' as const,
      badge: 'Admin'
    }
  ];

  return (
    <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 font-sans select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-[#F7F7F8] border-slate-200/80 text-slate-900'
    }`}>
      {/* Upper Brand & Views */}
      <div className="space-y-6">
        {/* Workspace Brand Badge */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-2xs shrink-0 flex items-center justify-center">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <div>
            <div className={`font-black text-sm tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              SewerBITA
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
              PT. Bukit Indah Tirta Alam
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          Workspace Views
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const hasPerm = RBACService.hasPermission(currentUserRole, item.action);
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (!hasPerm && item.id === 'users') return null;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition group cursor-pointer ${
                  isActive
                    ? isDarkMode ? 'bg-slate-800 text-white font-extrabold border border-slate-700 shadow-2xs' : 'bg-white text-slate-900 font-extrabold shadow-2xs border border-slate-200/90'
                    : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAEAEB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                      ? 'bg-blue-50 text-[#2563EB] border border-blue-100'
                      : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200/70 text-slate-600'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Widgets & Logout Button */}
      <div className="space-y-3 mt-4">
        <div className={`p-3.5 rounded-xl border space-y-2 shadow-2xs ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/70'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className={`text-xs font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>Network GIS</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="text-[11px] text-slate-500 font-medium leading-tight">
            Sewerage Zone 1 & 2 Active
          </div>
          <div className={`pt-1.5 border-t flex items-center justify-between text-[11px] font-medium ${
            isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Topology DAG</span>
            <span className="text-emerald-500 font-bold font-mono">100% OK</span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border font-extrabold text-xs transition cursor-pointer shadow-2xs group ${
              isDarkMode ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-900/60' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            }`}
            title="Keluar dari Sesi Sistem"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition" />
            <span>Logout Sistem</span>
          </button>
        )}
      </div>
    </aside>
  );
};
