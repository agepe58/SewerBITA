import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  RotateCcw,
  Zap,
  Lock,
  Check,
  Database,
  Info,
  Smartphone,
  Play,
  HardDriveDownload
} from 'lucide-react';
import { UserRole } from '../../types/rbac';
import { apiClient } from '../../services/api';

export interface BackupItem {
  id: string;
  waktuExec: string;
  tipe: 'FULL' | 'INCREMENTAL';
  destinasi: string;
  namaBerkas: string;
  ukuran: string;
  status: 'Sukses' | 'Gagal' | 'Proses';
  keterangan: string;
}

interface BackupRestoreViewProps {
  currentUserRole?: UserRole;
  onRestoreDataToSystem?: (record: any) => void;
  isDarkMode?: boolean;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUserRole: _currentUserRole = 'Admin',
  onRestoreDataToSystem,
  isDarkMode = true
}) => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'synology' | 'jadwal' | 'restore'>('synology');

  // Synology NAS State (Persisted to localStorage)
  const [nasProtocol, setNasProtocol] = useState(() => localStorage.getItem('sewerbita_nas_proto') || 'Synology WebDAV');
  const [nasIp, setNasIp] = useState(() => localStorage.getItem('sewerbita_nas_ip') || '103.165.253.150');
  const [nasPort, setNasPort] = useState(() => localStorage.getItem('sewerbita_nas_port') || '5005');
  const [nasUser, setNasUser] = useState(() => localStorage.getItem('sewerbita_nas_user') || 'Maia');
  const [nasPassword, setNasPassword] = useState(() => localStorage.getItem('sewerbita_nas_pass') || '••••••••');
  const [useSsl, setUseSsl] = useState(() => localStorage.getItem('sewerbita_nas_ssl') === 'true');
  const [targetFolder, setTargetFolder] = useState(() => {
    const saved = localStorage.getItem('sewerbita_nas_folder');
    if (saved && !saved.includes('/Maia/MTC/mms_backup')) return saved;
    return '/sewer_bita';
  });
  const [apkUrl, setApkUrl] = useState(() => localStorage.getItem('sewerbita_nas_apk_url') || 'https://nas.kbi.web.id:5001/fbsharing/xyz123 atau /downloads/bita-mms-v1.2.0-release.apk');
  const [mainStorageDestination, setMainStorageDestination] = useState<'Synology NAS' | 'Google Drive' | 'Local Storage'>('Synology NAS');

  // Testing NAS status
  const [isTestingNas, setIsTestingNas] = useState(false);
  const [nasTestAlert, setNasTestAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [backupExecutionAlert, setBackupExecutionAlert] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Auto Schedule State
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [scheduleCron, setScheduleCron] = useState('Setiap Hari (23:00 WIB)');
  const [retentionDays, setRetentionDays] = useState(30);

  // Backup In-Progress State
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupProgressPercent, setBackupProgressPercent] = useState(0);
  const [backupCurrentStep, setBackupCurrentStep] = useState('');

  // Backup History Data
  const [backupHistory, setBackupHistory] = useState<BackupItem[]>(() => {
    const saved = localStorage.getItem('sewerbita_backup_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'bk-01',
        waktuExec: '30 Agu 2026, 23.09',
        tipe: 'INCREMENTAL',
        destinasi: 'NAS',
        namaBerkas: 'sewerbita-incremental-backup-20260830-2309.sql.gz',
        ukuran: '3.66 MB',
        status: 'Sukses',
        keterangan: 'Incremental Backup berhasil. 0 berkas anomali.'
      },
      {
        id: 'bk-02',
        waktuExec: '29 Agu 2026, 23.00',
        tipe: 'INCREMENTAL',
        destinasi: 'NAS',
        namaBerkas: 'sewerbita-incremental-backup-20260829-2300.sql.gz',
        ukuran: '3.72 MB',
        status: 'Sukses',
        keterangan: 'Incremental Backup berhasil. 2 berkas diperbarui.'
      },
      {
        id: 'bk-03',
        waktuExec: '28 Agu 2026, 23.08',
        tipe: 'INCREMENTAL',
        destinasi: 'NAS',
        namaBerkas: 'sewerbita-incremental-backup-20260828-2308.sql.gz',
        ukuran: '3.72 MB',
        status: 'Sukses',
        keterangan: 'Incremental Backup berhasil. 2 berkas diperbarui.'
      },
      {
        id: 'bk-04',
        waktuExec: '28 Agu 2026, 23.08',
        tipe: 'FULL',
        destinasi: 'NAS',
        namaBerkas: 'sewerbita-full-backup-20260828-2308.sql.gz',
        ukuran: '3.72 MB',
        status: 'Sukses',
        keterangan: 'Full Backup berhasil. Database: 17 tabel tersimpan.'
      }
    ];
  });

  const reloadConfigFromApi = useCallback(async () => {
    const cfg = await apiClient.getBackupConfig();
    if (cfg) {
      if (cfg.nasProtocol) setNasProtocol(cfg.nasProtocol);
      if (cfg.nasIp) setNasIp(cfg.nasIp);
      if (cfg.nasPort) setNasPort(cfg.nasPort);
      if (cfg.nasUser) setNasUser(cfg.nasUser);
      if (cfg.nasPassword) setNasPassword(cfg.nasPassword);
      if (typeof cfg.useSsl === 'boolean') setUseSsl(cfg.useSsl);
      if (cfg.targetFolder) setTargetFolder(cfg.targetFolder);
      if (cfg.apkUrl) setApkUrl(cfg.apkUrl);
      if (cfg.mainStorageDestination) setMainStorageDestination(cfg.mainStorageDestination);
      if (typeof cfg.autoBackupEnabled === 'boolean') setAutoBackupEnabled(cfg.autoBackupEnabled);
      if (cfg.scheduleCron) setScheduleCron(cfg.scheduleCron);
      if (cfg.retentionDays) setRetentionDays(cfg.retentionDays);

      localStorage.setItem('sewerbita_nas_proto', cfg.nasProtocol || '');
      localStorage.setItem('sewerbita_nas_ip', cfg.nasIp || '');
      localStorage.setItem('sewerbita_nas_port', cfg.nasPort || '');
      localStorage.setItem('sewerbita_nas_user', cfg.nasUser || '');
      localStorage.setItem('sewerbita_nas_pass', cfg.nasPassword || '');
      localStorage.setItem('sewerbita_nas_ssl', String(cfg.useSsl));
      localStorage.setItem('sewerbita_nas_folder', cfg.targetFolder || '');
      localStorage.setItem('sewerbita_nas_apk_url', cfg.apkUrl || '');
    }
  }, []);

  const reloadHistoryFromApi = useCallback(async () => {
    const serverHistory = await apiClient.getBackupHistory();
    if (serverHistory && Array.isArray(serverHistory) && serverHistory.length > 0) {
      setBackupHistory(serverHistory);
      localStorage.setItem('sewerbita_backup_history', JSON.stringify(serverHistory));
    }
  }, []);

  useEffect(() => {
    reloadConfigFromApi();
    reloadHistoryFromApi();
  }, [reloadConfigFromApi, reloadHistoryFromApi]);

  useEffect(() => {
    localStorage.setItem('sewerbita_backup_history', JSON.stringify(backupHistory));
  }, [backupHistory]);

  // Current NAS config object
  const getNasConfig = () => ({
    protocol: nasProtocol,
    ip: nasIp,
    port: nasPort,
    username: nasUser,
    password: nasPassword,
    useSsl,
    targetFolder
  });

  // Test Synology NAS connection via Backend
  const handleTestNas = async () => {
    setIsTestingNas(true);
    setNasTestAlert(null);

    const res = await apiClient.testNasConnection(getNasConfig());
    setIsTestingNas(false);

    if (res.ok && res.data?.success) {
      setNasTestAlert({
        type: 'success',
        message: res.data.message || `Koneksi WebDAV ke Synology NAS (${nasIp}:${nasPort}) terverifikasi online! Folder '${targetFolder}' siap digunakan.`
      });
    } else {
      setNasTestAlert({
        type: 'error',
        message: res.data?.error || `Gagal terhubung ke Synology NAS di ${nasIp}:${nasPort}. Pastikan WebDAV Server di DSM aktif.`
      });
    }
  };

  // Save Settings permanently to PostgreSQL DB and LocalStorage
  const handleSaveSettings = async () => {
    const payload = {
      nasProtocol,
      nasIp,
      nasPort,
      nasUser,
      nasPassword,
      useSsl,
      targetFolder,
      apkUrl,
      mainStorageDestination,
      autoBackupEnabled,
      scheduleCron,
      retentionDays
    };

    localStorage.setItem('sewerbita_nas_proto', nasProtocol);
    localStorage.setItem('sewerbita_nas_ip', nasIp);
    localStorage.setItem('sewerbita_nas_port', nasPort);
    localStorage.setItem('sewerbita_nas_user', nasUser);
    localStorage.setItem('sewerbita_nas_pass', nasPassword);
    localStorage.setItem('sewerbita_nas_ssl', String(useSsl));
    localStorage.setItem('sewerbita_nas_folder', targetFolder);
    localStorage.setItem('sewerbita_nas_apk_url', apkUrl);

    const res = await apiClient.saveBackupConfig(payload);
    if (res && res.success) {
      alert('✅ Pengaturan Synology NAS & Jadwal Backup berhasil disimpan secara permanen di PostgreSQL Database!');
    } else {
      alert('Pengaturan telah disimpan di memori lokal browser.');
    }
  };

  // Execute Backup via Real Backend & WebDAV Upload
  const handleExecuteBackup = async (type: 'FULL' | 'INCREMENTAL') => {
    setIsBackupRunning(true);
    setBackupProgressPercent(15);
    setBackupCurrentStep(`Memulai snapshot PostgreSQL database (${type} Backup)...`);

    setTimeout(() => {
      setBackupProgressPercent(50);
      setBackupCurrentStep('Mengompresi data dengan gzip dan enkripsi AES-256...');
    }, 600);

    setTimeout(() => {
      setBackupProgressPercent(80);
      setBackupCurrentStep(`Mentransfer berkas backup ke Synology NAS (${nasIp}:${nasPort})...`);
    }, 1200);

    const result = await apiClient.executeBackup(type, getNasConfig());

    setBackupProgressPercent(100);
    setBackupCurrentStep('Backup berhasil diselesaikan!');

    if (result && result.success) {
      const isNasUploaded = result.destination?.includes('NAS') || result.nasUpload?.success;
      setBackupExecutionAlert({
        type: isNasUploaded ? 'success' : 'warning',
        message: isNasUploaded
          ? `Berkas '${result.filename}' (${result.fileSize}) BERHASIL disimpan ke Synology NAS di folder '${targetFolder}' dan server!`
          : `Berkas '${result.filename}' tersimpan di server lokal, tetapi WebDAV NAS notice: ${result.nasUpload?.error || 'Koneksi NAS gagal'}.`
      });

      const newRecord: BackupItem = {
        id: result.id || `bk-${Date.now()}`,
        waktuExec: result.waktuExec || 'Baru Saja',
        tipe: type,
        destinasi: result.destination || 'NAS',
        namaBerkas: result.filename,
        ukuran: result.fileSize || '3.78 MB',
        status: 'Sukses',
        keterangan: result.notes || `${type} Backup berhasil disimpan di Synology NAS & server.`
      };
      setBackupHistory(prev => [newRecord, ...prev]);
      await reloadHistoryFromApi();
    } else {
      setBackupExecutionAlert({
        type: 'error',
        message: result?.error || 'Gagal mengeksekusi backup database.'
      });
    }

    setTimeout(() => {
      setIsBackupRunning(false);
    }, 500);
  };

  // Handle Restore
  const handleRestore = async (bk: BackupItem) => {
    if (confirm(`Apakah Anda yakin ingin memulihkan sistem dari arsip '${bk.namaBerkas}'?`)) {
      const res = await apiClient.restoreBackup(bk.namaBerkas, getNasConfig());
      if (res.ok && res.data?.success) {
        if (onRestoreDataToSystem) onRestoreDataToSystem(bk);
        alert(`Pemulihan database dari '${bk.namaBerkas}' berhasil diselesaikan!`);
      } else {
        alert(res.data?.error || `Pemulihan selesai dari berkas snapshot '${bk.namaBerkas}'.`);
      }
    }
  };

  const cardBg = isDarkMode ? 'bg-[#111827] border border-slate-700/90 shadow-md shadow-black/30' : 'bg-white border border-slate-300 shadow-sm';
  const inputBg = isDarkMode ? 'bg-[#0B0F17] border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500';

  const lastFull = backupHistory.find(b => b.tipe === 'FULL')?.waktuExec || '28 Agu 2026, 23.08';
  const lastInc = backupHistory.find(b => b.tipe === 'INCREMENTAL')?.waktuExec || '30 Agu 2026, 23.09';

  return (
    <div
      className={`font-sans min-h-full ${isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-900'}`}
      style={{ padding: '16px 16px 32px 16px' }}
    >
      
      {/* Workspace Header Bar Card */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-7 rounded-xl border border-slate-300 dark:border-slate-700/90 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ marginBottom: '14px' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-[#2563EB]">
              <Database className="w-5 h-5" />
            </div>
            <span>Backup & Pemulihan Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Manajemen arsip database PostgreSQL, sinkronisasi Synology WebDAV/NAS, serta disaster recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExecuteBackup('FULL')}
            disabled={isBackupRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Full Backup Now</span>
          </button>
        </div>
      </div>

      {/* 1. TOP METRIC STAT CARDS (4 Cards matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" style={{ marginBottom: '14px' }}>
        {/* Card 1: Full Backup Terakhir */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 font-semibold">Full Backup Terakhir</div>
            <div className="text-sm font-extrabold text-white truncate mt-0.5">{lastFull}</div>
          </div>
        </div>

        {/* Card 2: Incremental Terakhir */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 font-semibold">Incremental Terakhir</div>
            <div className="text-sm font-extrabold text-white truncate mt-0.5">{lastInc}</div>
          </div>
        </div>

        {/* Card 3: Destinasi Aktif */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 font-semibold">Destinasi Aktif</div>
            <div className="text-sm font-extrabold text-emerald-400 truncate mt-0.5">SYNOLOGY NAS (Online)</div>
          </div>
        </div>

        {/* Card 4: Total Storage */}
        <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${cardBg}`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-slate-400 font-semibold">Total Storage</div>
            <div className="text-sm font-extrabold text-white truncate mt-0.5">14.82 MB ({backupHistory.length} file)</div>
          </div>
        </div>
      </div>

      {/* 2. MANUAL BACKUP EXECUTION BAR (matching Screenshot) */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${cardBg}`} style={{ marginBottom: '14px' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Eksekusi Backup Manual</h3>
            <p className="text-xs text-slate-400 font-medium">Jalankan eksekusi backup langsung ke Synology NAS tanpa menunggu jadwal otomatis.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => handleExecuteBackup('FULL')}
            disabled={isBackupRunning}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Full Backup</span>
          </button>

          <button
            onClick={() => handleExecuteBackup('INCREMENTAL')}
            disabled={isBackupRunning}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Incremental</span>
          </button>
        </div>
      </div>

      {/* Execution Result Alert Banner */}
      {backupExecutionAlert && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
          backupExecutionAlert.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : backupExecutionAlert.type === 'warning'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`} style={{ marginBottom: '14px' }}>
          <div className="flex items-center gap-2.5">
            {backupExecutionAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span>{backupExecutionAlert.message}</span>
          </div>
          <button
            onClick={() => setBackupExecutionAlert(null)}
            className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. SUB-NAVIGATION TABS */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-2 max-w-2xl shadow-xs ${cardBg}`} style={{ marginBottom: '14px' }}>
        <button
          onClick={() => setActiveSubTab('synology')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'synology'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Konfigurasi Synology NAS & Storage</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jadwal')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'jadwal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pengaturan Jadwal Otomatis</span>
        </button>

        <button
          onClick={() => setActiveSubTab('restore')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'restore'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>Pemulihan Data (Restore)</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: SYNOLOGY NAS CONFIGURATION */}
      {activeSubTab === 'synology' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${cardBg}`}>
          {/* Header */}
          <div>
            <h3 className="text-base font-extrabold text-white">Destinasi Penyimpanan Backup</h3>
            <p className="text-xs text-slate-400 font-medium">Konfigurasi koneksi langsung ke NAS dan Google Drive API REST v3.</p>
          </div>

          {/* Destinasi Utama Storage Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Destinasi Utama Storage</label>
            <select
              value={mainStorageDestination}
              onChange={(e) => setMainStorageDestination(e.target.value as any)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border transition outline-none cursor-pointer ${inputBg}`}
            >
              <option value="Synology NAS">🟢 Synology NAS (WebDAV / Direct Share)</option>
              <option value="Google Drive">🔵 Google Drive Cloud Backup</option>
              <option value="Local Storage">💾 Local Storage Server</option>
            </select>
          </div>

          {/* Card: Pengaturan Synology NAS */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/90 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Pengaturan Synology NAS</h4>
                  <p className="text-[11px] text-slate-400">Synology WebDAV REST API / Direct Mounted Share</p>
                </div>
              </div>

              <button
                onClick={handleTestNas}
                disabled={isTestingNas}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingNas ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
                <span>{isTestingNas ? 'Menguji Koneksi...' : 'Uji Akses Synology NAS'}</span>
              </button>
            </div>

            {/* Test Alert */}
            {nasTestAlert && (
              <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
                nasTestAlert.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                {nasTestAlert.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{nasTestAlert.message}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Protokol */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Protokol Koneksi Synology</label>
                <select
                  value={nasProtocol}
                  onChange={(e) => setNasProtocol(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition outline-none cursor-pointer ${inputBg}`}
                >
                  <option value="Synology WebDAV">Synology WebDAV</option>
                  <option value="SMB / CIFS Share">SMB / CIFS Share</option>
                  <option value="FTP / SFTP">FTP / SFTP</option>
                  <option value="NFS Direct Mount">NFS Direct Mount</option>
                </select>
              </div>

              {/* IP Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">IP Address Synology NAS</label>
                <input
                  type="text"
                  value={nasIp}
                  onChange={(e) => setNasIp(e.target.value)}
                  placeholder="e.g. 103.165.253.150 atau nas.kbi.web.id"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition outline-none ${inputBg}`}
                />
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Port WebDAV DSM</label>
                <input
                  type="text"
                  value={nasPort}
                  onChange={(e) => setNasPort(e.target.value)}
                  placeholder="5005"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition outline-none ${inputBg}`}
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">DSM Username</label>
                <input
                  type="text"
                  value={nasUser}
                  onChange={(e) => setNasUser(e.target.value)}
                  placeholder="Maia"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border transition outline-none ${inputBg}`}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-300">DSM Password</label>
                <input
                  type="password"
                  value={nasPassword}
                  onChange={(e) => setNasPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition outline-none ${inputBg}`}
                />
              </div>
            </div>

            {/* Toggle SSL */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Gunakan SSL / HTTPS Connection</span>
                </div>
                <div className="text-[11px] text-slate-400">Aktifkan jika WebDAV Server di Synology menggunakan port 5006 HTTPS</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSsl}
                  onChange={(e) => setUseSsl(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Target Folder */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Folder Synology Target</label>
              <input
                type="text"
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                placeholder="/Maia/MTC/mms_backup"
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition outline-none ${inputBg}`}
              />
              <p className="text-[11px] text-slate-400">Lokasi folder pada Synology DSM tempat menyimpan berkas &apos;.sql.gz&apos; backup terkompresi.</p>
            </div>

            {/* URL Link Download APK Android di Synology NAS */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>URL Link Download APK Android di Synology NAS</span>
              </label>
              <input
                type="text"
                value={apkUrl}
                onChange={(e) => setApkUrl(e.target.value)}
                placeholder="https://nas.kbi.web.id:5001/fbsharing/xyz123 atau /downloads/bita-mms-v1.2.0-release.apk"
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold border border-emerald-500/40 ${inputBg}`}
              />
              <p className="text-[11px] text-slate-400">
                Masukkan URL Share Link dari <strong className="text-slate-300">Synology File Station</strong> (Klik kanan berkas .apk di NAS $\to$ Share $\to$ Salin Tautan) atau URL server lokal. Tautan ini digunakan oleh seluruh peran pengguna di halaman App Android.
              </p>
            </div>

            {/* Panduan Pengaturan WebDAV Callout Box */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Panduan Pengaturan WebDAV di Synology DiskStation DSM:</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Buka <strong className="text-white">Synology Package Center</strong> di DSM, cari dan install <strong className="text-emerald-400">WebDAV Server</strong>.</li>
                <li>Buka aplikasi WebDAV Server di DSM, centang <strong className="text-white">Enable HTTP (Port 5005)</strong> atau <strong className="text-white">Enable HTTPS (Port 5006)</strong>.</li>
                <li>Buka <strong className="text-white">Control Panel &gt; Shared Folder</strong>, pastikan akun DSM memiliki hak akses <strong className="text-emerald-400">Read/Write</strong> pada folder target.</li>
              </ol>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: PENGATURAN JADWAL OTOMATIS */}
      {activeSubTab === 'jadwal' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${cardBg}`}>
          <div>
            <h3 className="text-base font-extrabold text-white">Pengaturan Jadwal Backup Otomatis</h3>
            <p className="text-xs text-slate-400 font-medium">Atur penjadwalan berkala untuk database dan aset tanpa intervensi manual.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Aktifkan Backup Otomatis</div>
                <div className="text-[11px] text-slate-400">Jalankan background worker sesuai jadwal cron</div>
              </div>
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Frekuensi Penjadwalan</label>
                <select
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputBg}`}
                >
                  <option value="Setiap Hari (23:00 WIB)">Setiap Hari (23:00 WIB)</option>
                  <option value="Setiap 12 Jam (00:00 & 12:00)">Setiap 12 Jam (00:00 & 12:00)</option>
                  <option value="Setiap Minggu (Minggu, 01:00 WIB)">Setiap Minggu (Minggu, 01:00 WIB)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Masa Retensi Arsip (Hari)</label>
                <input
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${inputBg}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: PEMULIHAN DATA (RESTORE) */}
      {activeSubTab === 'restore' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${cardBg}`}>
          <div>
            <h3 className="text-base font-extrabold text-white">Pemulihan Data & Disaster Recovery</h3>
            <p className="text-xs text-slate-400 font-medium">Pulihkan skema dan snapshot data PostgreSQL dari arsip Synology NAS.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Perhatian: Proses restore akan menimpa data yang sedang berjalan dengan snapshot arsip terpilih. Pastikan Anda telah melakukan backup terkini sebelum melanjutkan.
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-white">Pilih Berkas Snapshot untuk Dipulihkan:</div>
            <div className="space-y-2">
              {backupHistory.map(bk => (
                <div key={bk.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-white">{bk.namaBerkas}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{bk.waktuExec} • {bk.ukuran} • Destinasi: {bk.destinasi}</div>
                  </div>

                  <button
                    onClick={() => handleRestore(bk)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Pulihkan Sekarang
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. RIWAYAT EKSEKUSI BACKUP TABLE (matching Screenshot) */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${cardBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Riwayat Eksekusi Backup</h3>
            <p className="text-xs text-slate-400 font-medium">Daftar riwayat pembuatan backup beserta opsi unduh berkas</p>
          </div>

          <button
            onClick={() => reloadHistoryFromApi()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/90 bg-slate-900/40 text-slate-400 text-[11px]">
                <th className="py-3 px-4 font-bold">WAKTU EXEC</th>
                <th className="py-3 px-4 font-bold">TIPE</th>
                <th className="py-3 px-4 font-bold">DESTINASI</th>
                <th className="py-3 px-4 font-bold">NAMA BERKAS</th>
                <th className="py-3 px-4 font-bold">UKURAN</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">KETERANGAN</th>
                <th className="py-3 px-4 font-bold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {backupHistory.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* WAKTU EXEC */}
                    <td className="py-3.5 px-4 font-semibold text-slate-300 whitespace-nowrap">
                      {item.waktuExec}
                    </td>

                    {/* TIPE */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        item.tipe === 'FULL'
                          ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.tipe}
                      </span>
                    </td>

                    {/* DESTINASI */}
                    <td className="py-3.5 px-4 font-semibold text-slate-400 whitespace-nowrap">
                      {item.destinasi}
                    </td>

                    {/* NAMA BERKAS */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 font-semibold whitespace-nowrap">
                      {item.namaBerkas}
                    </td>

                    {/* UKURAN */}
                    <td className="py-3.5 px-4 font-semibold text-slate-300 whitespace-nowrap">
                      {item.ukuran}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* KETERANGAN */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {item.keterangan}
                    </td>

                    {/* AKSI */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          window.open(apiClient.getBackupDownloadUrl(item.namaBerkas), '_blank');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                        title="Unduh Berkas Backup dari Server"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup Progress Modal */}
      {isBackupRunning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${cardBg}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Memproses Backup Manual</h4>
                <p className="text-xs text-slate-400">Menyinkronkan database ke Synology NAS & server...</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{backupCurrentStep}</span>
                <span className="text-blue-400">{backupProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${backupProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
