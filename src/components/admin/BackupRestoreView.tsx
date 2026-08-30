import React, { useState } from 'react';
import {
  HardDriveDownload,
  Server,
  CloudUpload,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Trash2,
  RotateCcw,
  Zap,
  Lock,
  FileSpreadsheet,
  Check,
  X,
  Eye,
  EyeOff,
  Database,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';

import {
  BackupDestinationType,
  BackupStatus,
  BackupType,
  NASConfig,
  GoogleDriveConfig,
  BackupHistoryRecord,
  BackupRetentionPolicy
} from '../../types/backup';
import { INITIAL_NAS_CONFIG, INITIAL_GDRIVE_CONFIG, INITIAL_BACKUP_HISTORY, INITIAL_RETENTION_POLICY } from '../../services/mockBackupData';
import { UserRole } from '../../types/rbac';
import { RBACService } from '../../services/rbacService';

interface BackupRestoreViewProps {
  currentUserRole: UserRole;
  onRestoreDataToSystem?: (records: BackupHistoryRecord) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUserRole,
  onRestoreDataToSystem
}) => {
  // Check RBAC permission
  const hasAccess = RBACService.hasPermission(currentUserRole, 'manage_backups');

  // State configurations
  const [nasConfig, setNasConfig] = useState<NASConfig>(INITIAL_NAS_CONFIG);
  const [gdriveConfig, setGdriveConfig] = useState<GoogleDriveConfig>(INITIAL_GDRIVE_CONFIG);
  const [retentionPolicy, setRetentionPolicy] = useState<BackupRetentionPolicy>(INITIAL_RETENTION_POLICY);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryRecord[]>(INITIAL_BACKUP_HISTORY);

  // Connection Testing States
  const [isTestingNas, setIsTestingNas] = useState(false);
  const [nasTestStatus, setNasTestStatus] = useState<string | null>(null);
  const [isTestingGdrive, setIsTestingGdrive] = useState(false);
  const [gdriveTestStatus, setGdriveTestStatus] = useState<string | null>(null);
  const [showNasPassword, setShowNasPassword] = useState(false);

  // Instant Backup Form State
  const [selectedBackupType, setSelectedBackupType] = useState<BackupType>('Full Backup');
  const [selectedDestination, setSelectedDestination] = useState<BackupDestinationType>('DualRedundant');
  const [isEncryptBackup, setIsEncryptBackup] = useState(true);

  // Backup In-Progress Modal State
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgressPercent, setBackupProgressPercent] = useState(0);
  const [backupCurrentStep, setBackupCurrentStep] = useState('');

  // Restore Modal State
  const [restoreCandidate, setRestoreCandidate] = useState<BackupHistoryRecord | null>(null);
  const [restoreConfirmationText, setRestoreConfirmationText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgressPercent, setRestoreProgressPercent] = useState(0);
  const [restoreSuccessMessage, setRestoreSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');

  // Guard: If user is not Admin, display Access Denied Screen
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-sans text-center space-y-6 py-16">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
          <Lock className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Akses Dibatasi (RBAC Protected)</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            Halaman Manajemen Backup & Disaster Recovery hanya dapat diakses oleh pengguna dengan peran <strong>Admin</strong>. Peran Anda saat ini: <span className="text-[#2563EB] font-bold">{currentUserRole}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Handle Testing NAS Connection
  const handleTestNasConnection = () => {
    setIsTestingNas(true);
    setNasTestStatus(null);
    setTimeout(() => {
      setIsTestingNas(false);
      if (nasConfig.protocol.includes('WebDAV')) {
        setNasTestStatus(`Koneksi Synology WebDAV ${nasConfig.protocol.includes('HTTPS') ? 'HTTPS (Port 5006)' : 'HTTP (Port 5005)'} berhasil! SSL Certificate Verified • Latency: 3ms • Storage Tersedia: 480 GB`);
      } else {
        setNasTestStatus('Koneksi NAS SMB/CIFS Network Share (Windows / Synology) berhasil! Latency: 2ms • Storage Tersedia: 480 GB');
      }
    }, 1500);
  };

  // Handle Testing GDrive Connection
  const handleTestGdriveConnection = () => {
    setIsTestingGdrive(true);
    setGdriveTestStatus(null);
    setTimeout(() => {
      setIsTestingGdrive(false);
      setGdriveTestStatus('Otorisasi Google Drive API Aktif (Quota: 1.42 GB / 15 GB)');
    }, 1500);
  };

  // Handle Trigger Instant Manual Backup
  const handleRunManualBackup = () => {
    setIsBackupInProgress(true);
    setBackupProgressPercent(10);

    const isIncremental = selectedBackupType === 'Incremental Backup';
    const isDifferential = selectedBackupType === 'Differential Backup';

    if (isIncremental) {
      setBackupCurrentStep('Mengidentifikasi Delta WAL log sejak Full Backup terakhir (bak-20260829-020000)...');
    } else {
      setBackupCurrentStep('Memulai ekstraksi skema database & relasi topologi...');
    }

    setTimeout(() => {
      setBackupProgressPercent(35);
      if (isIncremental) {
        setBackupCurrentStep('Mengekstrak 14 rekaman baru/diubah (2 inspeksi baru, 1 status Manhole)...');
      } else if (isDifferential) {
        setBackupCurrentStep('Mengekstrak 45 rekaman terakumulasi sejak baseline Full Backup...');
      } else {
        setBackupCurrentStep('Mengekstrak seluruh 1420 rekaman database master & inspeksi...');
      }
    }, 1000);

    setTimeout(() => {
      setBackupProgressPercent(65);
      setBackupCurrentStep(`Melakukan kompresi GZIP & enkripsi AES-256...`);
    }, 2000);

    setTimeout(() => {
      setBackupProgressPercent(85);
      setBackupCurrentStep(`Mengunggah berkas ke target: ${selectedDestination}...`);
    }, 3000);

    setTimeout(() => {
      setBackupProgressPercent(100);
      setBackupCurrentStep('Pemeriksaan MD5 Checksum Lulus! Backup Selesai.');

      const newRecord: BackupHistoryRecord = {
        id: `bak-${Date.now()}`,
        filename: isIncremental
          ? `sewerbita_inc_delta_${Date.now().toString().slice(-4)}_${new Date().toISOString().slice(0, 10)}.sql.gz`
          : isDifferential
            ? `sewerbita_diff_${new Date().toISOString().slice(0, 10)}.sql.gz`
            : `sewerbita_full_backup_${new Date().toISOString().slice(0, 10)}.sql.gz`,
        timestamp: `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        sizeMb: isIncremental ? 1.2 : isDifferential ? 3.5 : 15.2,
        destination: selectedDestination,
        type: selectedBackupType,
        status: 'Success',
        md5Hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        durationSeconds: isIncremental ? 3 : 12,
        totalRecords: isIncremental ? 14 : isDifferential ? 45 : 1425,
        triggeredBy: 'Deni Ardiansyah (Admin Manual Trigger)',
        notes: isIncremental
          ? 'Incremental Delta snapshot (14 perubahandata baru)'
          : `Instant ${selectedBackupType} manual snapshot ke ${selectedDestination}`,
        parentBackupId: isIncremental || isDifferential ? 'bak-20260829-020000' : undefined,
        deltaSequence: isIncremental ? 3 : undefined,
        changedRecordsCount: isIncremental ? 14 : isDifferential ? 45 : undefined
      };

      setBackupHistory(prev => [newRecord, ...prev]);

      setTimeout(() => {
        setIsBackupInProgress(false);
      }, 1000);
    }, 4000);
  };

  // Handle Execute Database Restoration
  const handleExecuteRestore = () => {
    if (!restoreCandidate || restoreConfirmationText !== 'RESTORE') return;

    setIsRestoring(true);
    setRestoreProgressPercent(15);

    setTimeout(() => {
      setRestoreProgressPercent(45);
    }, 1200);

    setTimeout(() => {
      setRestoreProgressPercent(80);
    }, 2400);

    setTimeout(() => {
      setRestoreProgressPercent(100);
      setIsRestoring(false);
      setRestoreSuccessMessage(`Database berhasil dipulihkan dari cadangan '${restoreCandidate.filename}'!`);
      if (onRestoreDataToSystem) {
        onRestoreDataToSystem(restoreCandidate);
      }
      setTimeout(() => {
        setRestoreCandidate(null);
        setRestoreConfirmationText('');
        setRestoreSuccessMessage(null);
      }, 2500);
    }, 3500);
  };

  // Filtered History
  const filteredHistory = backupHistory.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.triggeredBy.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesDest = destinationFilter === 'All' || item.destination === destinationFilter;
    return matchesSearch && matchesDest;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1700px] mx-auto font-sans">
      {/* Workspace Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <HardDriveDownload className="w-8 h-8 text-[#2563EB]" />
            <span>Backup & Disaster Recovery System</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Fasilitas backup otomatis & manual database master aset, riwayat inspeksi, serta sinkronisasi ke NAS Lokal (SMB) & Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-blue-700 bg-blue-50 dark:bg-blue-950/80 dark:text-blue-300 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>RBAC Super Admin Access</span>
          </span>
        </div>
      </div>

      {/* Metric Cards Summary (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Status NAS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NAS Storage (SMB)</span>
            <Server className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{nasConfig.status}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium truncate">
            {nasConfig.host} • {nasConfig.sharePath}
          </div>
        </div>

        {/* 2. Status Google Drive */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Google Drive Cloud</span>
            <CloudUpload className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{gdriveConfig.status}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium truncate">
            Quota: {gdriveConfig.quotaUsed} / {gdriveConfig.quotaTotal}
          </div>
        </div>

        {/* 3. Cadangan Terakhir */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Snapshot Terakhir</span>
            <Clock className="w-5 h-5 text-[#059669]" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {backupHistory[0]?.sizeMb} MB
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {backupHistory[0]?.timestamp || 'Belum Ada'}
          </div>
        </div>

        {/* 4. Auto-Sync Schedule */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jadwal Auto-Sync</span>
            <RefreshCw className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
            Harian (02:00 WIB)
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            Retention Policy: Retain 30 Days
          </div>
        </div>
      </div>

      {/* Target Destination Settings Cards (2 Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* NAS Config Box */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-[#2563EB]" />
                <span>Konfigurasi NAS</span>
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                {nasConfig.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Protokol Akses NAS</label>
                <select
                  value={nasConfig.protocol}
                  onChange={e => setNasConfig({ ...nasConfig, protocol: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-extrabold cursor-pointer"
                >
                  <option value="SMB/CIFS">📁 SMB / CIFS (Windows / Synology Samba Share)</option>
                  <option value="Synology WebDAV (HTTPS)">🌩️ Synology WebDAV (HTTPS / Port 5006)</option>
                  <option value="Synology WebDAV (HTTP)">🌐 Synology WebDAV (HTTP / Port 5005)</option>
                  <option value="NFS">🐧 NFS (Linux Network File System)</option>
                  <option value="SFTP">🔒 SFTP / SSH Secure Storage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Server Host IP / Domain</label>
                <input
                  type="text"
                  value={nasConfig.host}
                  onChange={e => setNasConfig({ ...nasConfig, host: e.target.value })}
                  placeholder="e.g. 192.168.10.250"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Folder / Share Path</label>
                <input
                  type="text"
                  value={nasConfig.sharePath}
                  onChange={e => setNasConfig({ ...nasConfig, sharePath: e.target.value })}
                  placeholder="/volume1/SewerBITA_Backups"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">NAS Username</label>
                <input
                  type="text"
                  value={nasConfig.username}
                  onChange={e => setNasConfig({ ...nasConfig, username: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {nasTestStatus && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{nasTestStatus}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleTestNasConnection}
              disabled={isTestingNas}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingNas ? 'animate-spin' : ''}`} />
              <span>{isTestingNas ? 'Menguji NAS...' : 'Uji Koneksi NAS'}</span>
            </button>

            <button
              onClick={() => alert('Konfigurasi NAS berhasil diperbarui.')}
              className="text-xs bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              Simpan Konfigurasi NAS
            </button>
          </div>
        </div>

        {/* Google Drive Config Box */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-[#0284C7]" />
                <span>Integrasi Google Drive (Cloud Service Account)</span>
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                {gdriveConfig.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Service Account Email (GCP)</label>
                <input
                  type="text"
                  value={gdriveConfig.serviceAccountEmail}
                  onChange={e => setGdriveConfig({ ...gdriveConfig, serviceAccountEmail: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Target Folder ID Google Drive</label>
                <input
                  type="text"
                  value={gdriveConfig.folderId}
                  onChange={e => setGdriveConfig({ ...gdriveConfig, folderId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              {/* Progress Quota Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                  <span>Kapasitas Cloud Google Drive</span>
                  <span className="font-mono">{gdriveConfig.quotaUsed} dari {gdriveConfig.quotaTotal} (9.4% Digunakan)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700 p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#0284C7] to-[#2563EB] rounded-full w-[9.4%]"></div>
                </div>
              </div>
            </div>

            {gdriveTestStatus && (
              <div className="bg-sky-50 dark:bg-sky-950/60 p-3 rounded-xl border border-sky-200 dark:border-sky-800 text-xs text-sky-700 dark:text-sky-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{gdriveTestStatus}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleTestGdriveConnection}
              disabled={isTestingGdrive}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingGdrive ? 'animate-spin' : ''}`} />
              <span>{isTestingGdrive ? 'Menguji GDrive...' : 'Uji Otorisasi GDrive'}</span>
            </button>

            <button
              onClick={() => alert('Konfigurasi Google Drive berhasil disimpan.')}
              className="text-xs bg-[#0284C7] hover:bg-sky-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
            >
              Simpan Konfigurasi Drive
            </button>
          </div>
        </div>
      </div>

      {/* Kebijakan Retensi (Lama Penyimpanan & Batas Maksimal File Tersimpan) Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7C3AED]" />
              <span>Kebijakan Retensi: Lama Penyimpanan & Batas Jumlah Berkas Backup</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Atur batas waktu kedaluwarsa file cadangan dan batas jumlah arsip tersimpan untuk rotasi penyimpanan otomatis.
            </p>
          </div>

          <span className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-extrabold px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Auto-Purge Strategy Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          {/* Option 1: Masa Simpan */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Lama Masa Penyimpanan (Retention Days)</label>
            <select
              value={retentionPolicy.retentionDays}
              onChange={e => setRetentionPolicy({ ...retentionPolicy, retentionDays: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-900 dark:text-white font-extrabold cursor-pointer"
            >
              <option value={7}>7 Hari (Seminggu)</option>
              <option value={14}>14 Hari (2 Minggu)</option>
              <option value={30}>30 Hari (1 Bulan - Standard)</option>
              <option value={60}>60 Hari (2 Bulan)</option>
              <option value={90}>90 Hari (Triwulan / Audit)</option>
              <option value={180}>180 Hari (Setengah Tahun)</option>
              <option value={365}>365 Hari (1 Tahun Compliance)</option>
              <option value={0}>Simpan Selamanya (Tanpa Expiry)</option>
            </select>
            <p className="text-[11px] text-slate-400 font-medium">Batas umur file sebelum di-purge otomatis.</p>
          </div>

          {/* Option 2: Batas File */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Maksimum Jumlah File Tersimpan</label>
            <select
              value={retentionPolicy.maxFileCount}
              onChange={e => setRetentionPolicy({ ...retentionPolicy, maxFileCount: Number(e.target.value) })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-900 dark:text-white font-extrabold cursor-pointer"
            >
              <option value={5}>5 File Terbaru</option>
              <option value={10}>10 File Terbaru</option>
              <option value={20}>20 File Terbaru</option>
              <option value={30}>30 File Terbaru (Default)</option>
              <option value={50}>50 File Terbaru</option>
              <option value={100}>100 File Terbaru</option>
              <option value={0}>Tanpa Batas Jumlah File</option>
            </select>
            <p className="text-[11px] text-slate-400 font-medium">Batas maksimum jumlah berkas di NAS & Cloud.</p>
          </div>

          {/* Option 3: Strategi Purge */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Strategi Pembersihan (Purge Action)</label>
            <select
              value={retentionPolicy.purgeStrategy}
              onChange={e => setRetentionPolicy({ ...retentionPolicy, purgeStrategy: e.target.value as any })}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-900 dark:text-white font-extrabold cursor-pointer"
            >
              <option value="DeleteOldest">Hapus Permanen Berkas Terlama (Delete Oldest)</option>
              <option value="ArchiveToColdStorage">Pindahkan ke Cold Storage Archive</option>
            </select>
            <p className="text-[11px] text-slate-400 font-medium">Tindakan saat kuota retensi terpenuhi.</p>
          </div>

          {/* Option 4: Auto Purge Checkbox */}
          <div className="flex flex-col justify-between space-y-2 p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/60">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoPurgeCheck"
                checked={retentionPolicy.autoPurgeEnabled}
                onChange={e => setRetentionPolicy({ ...retentionPolicy, autoPurgeEnabled: e.target.checked })}
                className="w-4 h-4 text-[#7C3AED] rounded border-slate-300 cursor-pointer"
              />
              <label htmlFor="autoPurgeCheck" className="font-extrabold text-slate-900 dark:text-white cursor-pointer select-none">
                Aktifkan Auto-Purge
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              Pembersihan berkas otomatis dijadwalkan setiap hari pkl 03:00 WIB.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
            File Tersimpan Saat Ini: <strong className="text-slate-900 dark:text-white">{backupHistory.length} File</strong> • Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Dalam Batas Aman ({retentionPolicy.maxFileCount || '∞'} Max)</span>
          </div>

          <button
            onClick={() => alert(`Kebijakan retensi diperbarui: Masa simpan ${retentionPolicy.retentionDays} hari, Batas ${retentionPolicy.maxFileCount} file tersimpan.`)}
            className="text-xs bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Simpan Kebijakan Retensi
          </button>
        </div>
      </div>

      {/* Full Backup vs Incremental Backup Pipeline Strategy Explainer Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Strategi Pipa Pembackupan: Full Backup vs. Incremental Backup</span>
          </h2>
          <span className="text-xs bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            Automated Pipeline Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Card 1: Full Backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#2563EB]" />
                <span>1. Full Backup (Baseline Snapshot)</span>
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md font-bold">
                Daily 02:00 WIB
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Menyalin 100% skema database, tabel master Manhole, Pipa, Stasiun Pompa, dan log inspeksi. Digunakan sebagai pondasi dasar (*Baseline*) pemulihan bencana.
            </p>
            <div className="pt-1 font-mono font-bold text-slate-500 dark:text-slate-400">
              Rata-rata Ukuran: ~15 MB • Waktu: 12 Detik
            </div>
          </div>

          {/* Card 2: Incremental Backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>2. Incremental Backup (Delta Changes)</span>
              </span>
              <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-md font-bold">
                Hourly WAL Log
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Hanya mengekstrak data yang **berubah atau baru ditambahkan** sejak backup terakhir. Menghemat bandwidth jaringan & ruang penyimpanan NAS/Cloud hingga 90%.
            </p>
            <div className="pt-1 font-mono font-bold text-slate-500 dark:text-slate-400">
              Rata-rata Ukuran: ~1.2 MB • Waktu: 2 Detik
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Instant Manual Backup Box */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-xl border border-blue-800/60 text-white shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-800/60 pb-4">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Jalankan Manual Backup Darurat (Instant Snapshot)</span>
            </h2>
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              Pilih tipe Full Backup atau Incremental Delta Backup dan langsung unggah ke target storage.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-700/80 text-blue-200 self-start md:self-auto">
            Encryption: AES-256 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold text-blue-200">Jenis Tipe Backup</label>
            <select
              value={selectedBackupType}
              onChange={e => setSelectedBackupType(e.target.value as BackupType)}
              className="w-full bg-slate-900/90 border border-blue-700/80 p-3 rounded-xl text-white font-bold cursor-pointer"
            >
              <option value="Full Backup">📦 Full Backup (Salinan Baseline Lengkap Database)</option>
              <option value="Incremental Backup">⚡ Incremental Backup (Salinan Delta Perubahan Terakhir)</option>
              <option value="Differential Backup">📊 Differential Backup (Perubahan Sejak Full Terakhir)</option>
              <option value="Master Assets Dump">🏗️ Master Assets Dump Only (Manhole, Pipa, Stasiun Pompa)</option>
              <option value="Inspection Logs Dump">📋 Inspection Logs Dump Only (Catatan & Temuan Inspeksi)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-blue-200">Target Tujuan Penyimpanan</label>
            <select
              value={selectedDestination}
              onChange={e => setSelectedDestination(e.target.value as BackupDestinationType)}
              className="w-full bg-slate-900/90 border border-blue-700/80 p-3 rounded-xl text-white font-bold cursor-pointer"
            >
              <option value="DualRedundant">Dual Redundant (NAS Storage + Google Drive)</option>
              <option value="NAS">NAS Storage (SMB / Local Server Only)</option>
              <option value="GoogleDrive">Google Drive (Cloud Storage Only)</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleRunManualBackup}
              disabled={isBackupInProgress}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-black text-sm p-3 rounded-xl transition shadow-lg shadow-blue-600/40 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>⚡ Jalankan Backup Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup Archives & History Table Container */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#2563EB]" />
              <span>Riwayat Berkas Backup & Arsip Pemulihan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Daftar arsip cadangan tersimpan yang siap dipulihkan atau diunduh</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Cari nama file / pemicu..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-slate-900 dark:text-white font-medium"
            />

            <select
              value={destinationFilter}
              onChange={e => setDestinationFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
            >
              <option value="All">Semua Target Penyimpanan</option>
              <option value="DualRedundant">Dual Redundant</option>
              <option value="NAS">NAS Storage Only</option>
              <option value="GoogleDrive">Google Drive Only</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Nama Berkas Backup</th>
                <th className="py-3 px-3">Waktu Snapshot</th>
                <th className="py-3 px-3">Ukuran</th>
                <th className="py-3 px-3">Target Tujuan</th>
                <th className="py-3 px-3">Tipe Backup</th>
                <th className="py-3 px-3">Pemicu</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    Tidak ada arsip backup yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#2563EB] shrink-0" />
                        <div className="truncate max-w-[280px]" title={record.filename}>
                          {record.filename}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal font-mono truncate" title={`MD5: ${record.md5Hash}`}>
                        MD5: {record.md5Hash}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      {record.timestamp}
                    </td>

                    <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white font-mono">
                      {record.sizeMb} MB
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${record.destination === 'DualRedundant' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        record.destination === 'NAS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                        {record.destination === 'DualRedundant' ? 'Dual Redundant (NAS + GDrive)' : record.destination}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-lg font-extrabold text-[11px] inline-flex items-center gap-1 ${record.type === 'Full Backup'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : record.type === 'Incremental Backup'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : record.type === 'Differential Backup'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                        {record.type === 'Full Backup' && '📦 Full Baseline'}
                        {record.type === 'Incremental Backup' && `⚡ Incremental Delta #${record.deltaSequence || 1}`}
                        {record.type === 'Differential Backup' && '📊 Differential'}
                        {record.type !== 'Full Backup' && record.type !== 'Incremental Backup' && record.type !== 'Differential Backup' && record.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-medium">
                      {record.triggeredBy}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Restore Button */}
                        <button
                          onClick={() => setRestoreCandidate(record)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 font-bold rounded-lg border border-amber-200 dark:border-amber-800 transition cursor-pointer flex items-center gap-1"
                          title="Pulihkan Database dari Snapshot Ini"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        {/* Download File */}
                        <button
                          onClick={() => alert(`Mengunduh berkas '${record.filename}'...`)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition cursor-pointer"
                          title="Unduh Berkas SQL/JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Archive */}
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus arsip '${record.filename}'?`)) {
                              setBackupHistory(prev => prev.filter(r => r.id !== record.id));
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-lg transition cursor-pointer"
                          title="Hapus Arsip Backup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Live Manual Backup Progress Bar */}
      {isBackupInProgress && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
              <Zap className="w-8 h-8 text-[#2563EB] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Proses Backup Sedang Berjalan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mohon tunggu, sistem sedang membuat cadangan database & mengunggah ke target storage.</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                <div
                  style={{ width: `${backupProgressPercent}%` }}
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#0284C7] rounded-full transition-all duration-300"
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                <span>{backupProgressPercent}%</span>
                <span>Target: {selectedDestination}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono text-left truncate">
              ⚙️ {backupCurrentStep}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Safeguard Interactive Database Restore Confirmation Modal */}
      {restoreCandidate && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-rose-200 dark:border-rose-900 shadow-2xl max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Konfirmasi Pemulihan Database (Restore Danger Zone)</span>
              </h3>
              <button onClick={() => setRestoreCandidate(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <p className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 leading-relaxed font-bold">
                ⚠️ PERINGATAN KEBUTUHAN UTAMA: Pemulihan ini akan menimpa seluruh data master Manhole, Pipa, Stasiun Pompa, dan Log Inspeksi saat ini dengan snapshot terpilih.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 font-mono">
                <div><strong>File Backup Target:</strong> {restoreCandidate.filename}</div>
                <div><strong>Waktu Snapshot:</strong> {restoreCandidate.timestamp}</div>
                <div><strong>Ukuran:</strong> {restoreCandidate.sizeMb} MB</div>
                <div><strong>Checksum MD5:</strong> {restoreCandidate.md5Hash}</div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-extrabold text-slate-800 dark:text-slate-200">
                  Ketik kata <span className="text-rose-600 font-mono font-black">RESTORE</span> untuk mengonfirmasi:
                </label>
                <input
                  type="text"
                  value={restoreConfirmationText}
                  onChange={e => setRestoreConfirmationText(e.target.value)}
                  placeholder="Ketik RESTORE di sini..."
                  className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 font-mono font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm bg-white dark:bg-slate-800"
                />
              </div>

              {restoreSuccessMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{restoreSuccessMessage}</span>
                </div>
              )}

              {isRestoring && (
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                    <div style={{ width: `${restoreProgressPercent}%` }} className="h-full bg-amber-500 rounded-full transition-all"></div>
                  </div>
                  <div className="text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    Memulihkan Database Schema & Rekaman... ({restoreProgressPercent}%)
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setRestoreCandidate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={handleExecuteRestore}
                disabled={restoreConfirmationText !== 'RESTORE' || isRestoring}
                className="px-5 py-2.5 text-xs font-black bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-md flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                <span>{isRestoring ? 'Memulihkan System...' : 'Eksekusi Restore Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
