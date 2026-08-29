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
    <header className="h-18 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3">
      {/* Left: Global Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-80 lg:w-[420px] shrink">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ID Aset, Manhole, Pipa, Area..."
          style={{ paddingLeft: '50px', paddingRight: '48px' }}
          className="w-full bg-[#F8FAFC] text-slate-900 text-sm font-medium rounded-full py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition shadow-2xs"
        />
        <span className="hidden sm:block absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
          ⌘F
        </span>
      </form>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Landing Page Toggle */}
        <button
          onClick={onToggleLandingPage}
          className="flex items-center gap-1.5 text-sm text-slate-800 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-full border border-slate-200 transition font-bold"
          title="Lihat Landing Page Publik"
        >
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <span className="hidden md:inline">Landing Page</span>
        </button>

        {/* QR Code Quick Scanner Button */}
        <button
          onClick={onOpenQrScanner}
          className="flex items-center gap-2 text-sm bg-[#2563EB] text-white font-bold px-4.5 py-2 rounded-full hover:bg-[#1D4ED8] transition shadow-md shadow-blue-500/20"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan QR Aset</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-600 hover:text-slate-900 rounded-full bg-slate-100 border border-slate-200 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full"></span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-full border border-slate-200 text-sm transition"
          >
            <UserCheck className="w-4 h-4 text-[#0284C7]" />
            <div className="text-left hidden sm:block">
              <div className="text-xs text-slate-400 leading-none font-medium">Role Aktif</div>
              <div className="font-bold text-slate-900">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50">
              <div className="px-3.5 py-2 text-xs text-slate-400 border-b border-slate-100 font-bold">
                Simulasi Peran Pengguna (RBAC)
              </div>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                    currentUser.role === role ? 'text-[#2563EB] font-extrabold bg-blue-50/50' : 'text-slate-800 font-medium'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full border border-blue-200 object-cover shadow-xs"
          />
          <div className="hidden xl:block text-left">
            <div className="text-sm font-extrabold text-slate-900 leading-tight">{currentUser.name}</div>
            <div className="text-xs text-slate-500 font-medium leading-tight">{currentUser.department}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
