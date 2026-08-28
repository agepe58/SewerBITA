import React, { useState } from 'react';
import { Search, QrCode, Bell, UserCheck, ChevronDown, ShieldAlert, Sparkles } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/rbac';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
  onOpenQrScanner: () => void;
  onSearchAsset: (query: string) => void;
  onToggleLandingPage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onOpenQrScanner,
  onSearchAsset,
  onToggleLandingPage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: UserRole[] = ['Admin', 'Engineer', 'Technician', 'Management'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchAsset(searchQuery);
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3">
      {/* Left: Global Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-44 sm:w-72 lg:w-96 shrink">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ID Aset, Manhole, Pipa, Area..."
          className="w-full bg-[#F8FAFC] text-slate-900 text-xs rounded-full pl-10 pr-10 sm:pr-12 py-2 border border-slate-200/80 focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition shadow-xs"
        />
        <span className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 font-mono">
          ⌘F
        </span>
      </form>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Landing Page Toggle */}
        <button
          onClick={onToggleLandingPage}
          className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-3.5 py-1.5 rounded-full border border-slate-200 transition font-medium"
          title="Lihat Landing Page Publik"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="hidden md:inline">Landing Page</span>
        </button>

        {/* QR Code Quick Scanner Button */}
        <button
          onClick={onOpenQrScanner}
          className="flex items-center gap-1.5 text-xs bg-[#2563EB] text-white font-bold px-4 py-1.5 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan QR Aset</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 border border-slate-200 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0284C7]" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-400 leading-none">Role Aktif</div>
              <div className="font-semibold text-slate-800">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] text-slate-400 border-b border-slate-100 font-medium">
                Simulasi Peran Пользователь (RBAC)
              </div>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    currentUser.role === role ? 'text-[#2563EB] font-bold bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full border border-blue-200 object-cover shadow-xs"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{currentUser.department}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
