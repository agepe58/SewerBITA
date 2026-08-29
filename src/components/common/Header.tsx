import React, { useState } from 'react';
import { Search, QrCode, Bell, UserCheck, ChevronDown, ShieldAlert, Sparkles, LogOut, Sun, Moon, Edit3, User } from 'lucide-react';
import { UserProfile, UserRole } from '../../types/rbac';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
  onOpenQrScanner: () => void;
  onSearchAsset: (query: string) => void;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  onOpenQrScanner,
  onSearchAsset,
  onLogout,
  isDarkMode = false,
  onToggleDarkMode,
  onOpenEditProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const roles: UserRole[] = ['Admin', 'Engineer', 'Technician', 'Management'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchAsset(searchQuery);
    }
  };

  return (
    <header className={`h-18 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111827]/95 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-100 text-slate-900'
    }`}>
      {/* Left: Dual-Function Global Search Box */}
      <form onSubmit={handleSearchSubmit} className="relative w-64 sm:w-96 lg:w-[480px] shrink">
        {/* Left Magnifying Glass Search Icon */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />

        {/* Input Box */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ID Aset, Manhole, Pipa, Area..."
          style={{ paddingLeft: '50px', paddingRight: '52px' }}
          className={`w-full text-sm font-medium rounded-full py-2.5 border transition shadow-2xs ${
            isDarkMode
              ? 'bg-slate-900 text-slate-100 border-slate-700 focus:bg-slate-950 focus:border-[#2563EB]'
              : 'bg-[#F8FAFC] text-slate-900 border-slate-200 focus:bg-white focus:border-[#2563EB]'
          }`}
        />

        {/* Right QR Code Scanner Button (Dual Function Search Box) */}
        <button
          type="button"
          onClick={onOpenQrScanner}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-full transition border border-blue-100 flex items-center justify-center shadow-2xs group cursor-pointer"
          title="Scan QR Code Aset"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </form>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications */}
        <button className={`relative p-2.5 rounded-full border transition cursor-pointer ${
          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
        }`}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping"></span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full"></span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition cursor-pointer ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#0284C7]" />
            <div className="text-left hidden sm:block">
              <div className="text-xs text-slate-400 leading-none font-medium">Role Aktif</div>
              <div className="font-bold">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isRoleDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-52 border rounded-2xl shadow-xl py-1 z-50 ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-3.5 py-2 text-xs text-slate-400 border-b border-slate-800 font-bold">
                Simulasi Peran Pengguna (RBAC)
              </div>
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleChange(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition cursor-pointer ${
                    currentUser.role === role
                      ? 'text-[#2563EB] font-extrabold bg-blue-50/20'
                      : isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-800 font-medium'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser.role === role && <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Badge with Dropdown (Dark mode, Edit profile, Logout) */}
        <div className={`relative border-l pl-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer group"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-blue-900 object-cover shadow-xs group-hover:border-[#2563EB] transition shrink-0"
            />
            <div className="text-left hidden sm:block">
              <div className="text-sm font-extrabold leading-tight">{currentUser.name}</div>
              <div className="text-xs text-slate-500 font-medium leading-tight">{currentUser.department}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition ml-0.5" />
          </button>

          {/* User Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-64 border rounded-xl shadow-2xl py-2 z-50 font-sans divide-y transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100 divide-slate-800' : 'bg-white border-slate-200 text-slate-900 divide-slate-100'
            }`}>
              {/* User Header Info */}
              <div className="px-4 py-2.5 space-y-0.5">
                <div className="font-extrabold text-sm">{currentUser.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{currentUser.email}</div>
                <div className="pt-1">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] border border-blue-100 dark:border-blue-800">
                    {currentUser.role} • {currentUser.department}
                  </span>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-1.5">
                {/* Edit Profile Option */}
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    if (onOpenEditProfile) onOpenEditProfile();
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Edit3 className="w-4 h-4 text-[#2563EB]" />
                    <span>Edit Profil User</span>
                  </div>
                </button>

                {/* Dark Mode Toggle Option */}
                {onToggleDarkMode && (
                  <button
                    onClick={() => {
                      onToggleDarkMode();
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                      <span>{isDarkMode ? 'Mode Terang (Light Mode)' : 'Mode Gelap (Dark Mode)'}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isDarkMode ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>
                )}
              </div>

              {/* Logout Action */}
              <div className="pt-1.5">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-extrabold flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Logout Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
