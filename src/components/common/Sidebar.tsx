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
  ChevronRight
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUserRole
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
      label: 'Topology & Flow Tracing',
      icon: GitBranch,
      action: 'view_map' as const,
      badge: 'Core'
    },
    {
      id: 'assets' as NavTab,
      label: 'Asset Registry',
      icon: Boxes,
      action: 'view_assets' as const
    },
    {
      id: 'inspections' as NavTab,
      label: 'Inspections & Field',
      icon: ClipboardCheck,
      action: 'view_assets' as const
    },
    {
      id: 'data' as NavTab,
      label: 'Import / Export Data',
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
    <aside className="w-72 bg-[#F7F7F8] border-r border-slate-200/70 flex flex-col justify-between h-auto min-h-full select-none py-5 px-3.5 shrink-0">
      {/* Brand & User Greeting Header */}
      <div className="space-y-5">
        {/* Brand Logo Box */}
        <div className="flex flex-col gap-2 px-1.5 pb-3 border-b border-slate-200/60">
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 flex items-center justify-center shadow-2xs">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="w-full h-auto max-h-12 object-contain" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold pt-1 px-1">
            <span className="text-slate-900 font-extrabold text-sm tracking-tight">Sewer<span className="text-[#2563EB]">BITA</span></span>
            <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* User Greeting Block */}
        <div className="px-2 pt-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-black text-sm border border-blue-200">
            J
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              <span>Jonathan</span>
              <span className="text-xs">👋</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Wastewater Manager</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-2 pt-2 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
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

      {/* Footer Network Status Widget */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-2 mt-4 shadow-2xs">
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
    </aside>
  );
};
