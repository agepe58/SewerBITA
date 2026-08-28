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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-auto min-h-full select-none py-6 px-4 shrink-0">
      {/* Brand & User Greeting Header */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <Droplets className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1">
              Sewer<span className="text-[#2563EB]">BITA</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono leading-none">Enterprise Intelligence</p>
          </div>
        </div>

        {/* User Greeting Block (As seen in Aoxa Screenshot) */}
        <div className="px-2 pt-2">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Hi, Jonathan</span>
            <span className="text-sm">👋</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Wastewater Manager</p>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const hasPerm = RBACService.hasPermission(currentUserRole, item.action);
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (!hasPerm && item.id === 'users') return null;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-bold shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
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
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
            <span className="text-xs font-bold text-slate-800">Network GIS Online</span>
          </div>
          <Activity className="w-3.5 h-3.5 text-[#2563EB]" />
        </div>
        <div className="text-[10px] text-slate-500 leading-tight">
          DKI Jakarta Sewerage Zone 1 & 2 Active
        </div>
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
          <span>Topology DAG: Valid</span>
          <span className="text-[#2563EB] font-bold font-mono">100% Flow</span>
        </div>
      </div>
    </aside>
  );
};
