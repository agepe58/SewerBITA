import React, { useState } from 'react';
import {
  RefreshCw,
  Smartphone,
  Bell,
  Sun,
  Moon,
  LogOut,
  UserCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/rbac';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  currentUser: UserProfile;
  onRoleChange: (newRole: UserRole) => void;
  onRefresh?: () => void;
  onOpenDownloadApp?: () => void;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onRoleChange: _onRoleChange,
  onRefresh,
  onOpenDownloadApp,
  onLogout,
  isDarkMode = true,
  onToggleDarkMode,
  onOpenEditProfile: _onOpenEditProfile
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Monitoring',
          subtitle: 'Ringkasan operasional dan kondisi aset jaringan air limbah secara real-time'
        };
      case 'map':
        return {
          title: 'Peta GIS Interaktif',
          subtitle: 'Visualisasi spasial geospasial manhole, stasiun pompa, dan pipa limbah'
        };
      case 'topology':
        return {
          title: 'Topologi & Flow Tracing',
          subtitle: 'Solver aliran hidrolik hulu ke hilir (upstream & downstream flow)'
        };
      case 'assets':
        return {
          title: 'Registri Aset Master',
          subtitle: 'Katalog terpadu data teknis manhole, stasiun pompa, dan segmen pipa'
        };
      case 'inspections':
        return {
          title: 'Inspeksi Lapangan',
          subtitle: 'Riwayat audit kondisi fisik, foto kerusakan, dan catatan inspeksi'
        };
      case 'qr_scanner':
        return {
          title: 'Scan QR Code Aset',
          subtitle: 'Pemindaian cepat kode QR untuk identifikasi dan inspeksi aset'
        };
      case 'data':
        return {
          title: 'Import / Export Data',
          subtitle: 'Ekspor dan impor data inventaris jaringan format CSV / Excel / GeoJSON'
        };
      case 'users':
        return {
          title: 'Manajemen Pengguna',
          subtitle: 'Kelola hak akses role-based access control (Admin, Engineer, Teknisi)'
        };
      case 'backup':
        return {
          title: 'Backup & Pemulihan',
          subtitle: 'Pencadangan database PostgreSQL dan restore arsip sistem'
        };
      case 'profile':
        return {
          title: 'Profil Saya',
          subtitle: 'Pengaturan akun pengguna dan informasi kontak personal'
        };
      default:
        return {
          title: 'Dashboard Monitoring',
          subtitle: 'Sistem Informasi Jaringan Air Limbah SewerBITA'
        };
    }
  };

  const pageInfo = getPageInfo();

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getInitials = (name: string) => {
    if (!name) return 'AP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className={`h-20 border-b px-6 flex items-center justify-between sticky top-0 z-30 font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0F17] border-slate-800/80 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Left: Dynamic Page Title & Subtitle */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight leading-tight">
          {pageInfo.title}
        </h1>
        <p className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right Action Tools matching Screenshot */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Live Sync 3s Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Sync 3s</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Refresh Data Sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          <span>Refresh</span>
        </button>

        {/* Download App Button */}
        <button
          onClick={onOpenDownloadApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-semibold transition cursor-pointer shadow-2xs"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mobile App</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className={`p-2 rounded-xl border transition cursor-pointer ${
            isDarkMode ? 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
            1
          </span>
        </div>

        {/* Dark / Light Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        )}

        {/* User Initials Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-9 h-9 rounded-xl bg-[#1E293B] hover:bg-[#334155] border border-blue-500/40 text-blue-300 font-extrabold text-xs flex items-center justify-center shadow-md transition cursor-pointer"
          >
            {getInitials(currentUser.name)}
          </button>

          {isUserDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isDarkMode ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-3 py-2 border-b border-slate-800/80">
                <div className="font-extrabold text-sm truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                  <UserCheck className="w-3 h-3" />
                  <span>{currentUser.role}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
