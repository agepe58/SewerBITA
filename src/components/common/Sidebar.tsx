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
      label: 'User Management (RBAC)',
      icon: Users,
      action: 'manage_users' as const
    }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col justify-between h-auto min-h-full select-none py-6 px-4 shrink-0">
      {/* Brand & User Greeting Header */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex flex-col gap-2 px-2 pb-3 border-b border-slate-100">
          <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200/80 flex items-center justify-center">
            <img src="/logo.jpg" alt="PT. Bukit Indah Tirta Alam Logo" className="w-full h-auto max-h-14 object-contain" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold pt-0.5">
            <span className="text-slate-900 font-extrabold text-sm">Sewer<span className="text-[#2563EB]">BITA</span></span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">Online</span>
          </div>
        </div>

        {/* User Greeting Block */}
        <div className="px-2 pt-2">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Hi, Jonathan</span>
            <span className="text-base">👋</span>
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">Wastewater Manager</p>
        </div>

        {/* Navigation List */}
        <nav className="space-y-2 pt-2">
          {navItems.map((item) => {
            const hasPerm = RBACService.hasPermission(currentUserRole, item.action);
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (!hasPerm && item.id === 'users') return null;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-full text-sm font-semibold transition group ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-500/25'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-50 text-[#2563EB] border border-blue-100'
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
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
            <span className="text-sm font-extrabold text-slate-900">Network GIS Online</span>
          </div>
          <Activity className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div className="text-xs text-slate-600 font-medium leading-tight">
          DKI Jakarta Sewerage Zone 1 & 2 Active
        </div>
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Topology DAG: Valid</span>
          <span className="text-[#2563EB] font-extrabold font-mono">100% Flow</span>
        </div>
      </div>
    </aside>
  );
};
