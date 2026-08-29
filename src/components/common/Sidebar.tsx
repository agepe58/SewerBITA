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
  LogOut
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
  | 'users';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUserRole: UserRole;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUserRole,
  onLogout
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
    }
  ];

  return (
    <aside className="w-64 bg-[#F7F7F8] border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0 font-sans select-none">
      {/* Upper Brand & Views */}
      <div className="space-y-6">
        {/* Workspace Brand Badge */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-blue-500/20">
            <Droplets className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm tracking-tight leading-tight">
              SewerBITA
            </div>
            <div className="text-[11px] text-slate-500 font-semibold leading-tight">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition group ${isActive
                    ? 'bg-white text-slate-900 font-extrabold shadow-2xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAEAEB]'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                      ? 'bg-blue-50 text-[#2563EB] border border-blue-100'
                      : 'bg-slate-200/70 text-slate-600'
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
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-extrabold text-slate-900">Network GIS</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div className="text-[11px] text-slate-500 font-medium leading-tight">
            Sewerage Zone 1 & 2 Active
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Topology DAG</span>
            <span className="text-emerald-600 font-bold font-mono">100% OK</span>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs transition cursor-pointer shadow-2xs group"
            title="Keluar dari Sesi Sistem"
          >
            <LogOut className="w-4 h-4 text-rose-600 group-hover:scale-110 transition" />
            <span>Logout Sistem</span>
          </button>
        )}
      </div>
    </aside>
  );
};
