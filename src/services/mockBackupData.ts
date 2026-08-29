import { NASConfig, GoogleDriveConfig, BackupHistoryRecord, BackupRetentionPolicy } from '../types/backup';

export const INITIAL_NAS_CONFIG: NASConfig = {
  host: '192.168.10.250',
  sharePath: '/volume1/SewerBITA_Backups',
  username: 'nas_admin_bita',
  protocol: 'Synology WebDAV (HTTPS)',
  webdavPort: 5006,
  useSSL: true,
  autoSync: true,
  syncInterval: 'Daily',
  status: 'Connected',
  lastSync: '2026-08-29 02:00 WIB'
};

export const INITIAL_GDRIVE_CONFIG: GoogleDriveConfig = {
  serviceAccountEmail: 'backup-bot@sewerbita-prod.iam.gserviceaccount.com',
  folderId: '18xK9zLpQ2mN7vW4uY6tR3sA9z',
  folderName: 'BITA_SewerNetwork_Backups',
  quotaUsed: '1.42 GB',
  quotaTotal: '15.00 GB',
  autoBackupEnabled: true,
  status: 'Connected',
  lastSync: '2026-08-29 02:00 WIB'
};

export const INITIAL_RETENTION_POLICY: BackupRetentionPolicy = {
  retentionDays: 30,
  maxFileCount: 30,
  autoPurgeEnabled: true,
  purgeStrategy: 'DeleteOldest',
  lastPurgeDate: '2026-08-29 03:00 WIB',
  purgedCountTotal: 12
};

export const INITIAL_BACKUP_HISTORY: BackupHistoryRecord[] = [
  {
    id: 'bak-20260829-160000',
    filename: 'sewerbita_inc_delta_02_20260829_1600.sql.gz',
    timestamp: '2026-08-29 16:00 WIB',
    sizeMb: 1.2,
    destination: 'DualRedundant',
    type: 'Incremental Backup',
    status: 'Success',
    md5Hash: 'f48c12a88e9903b12740921820bc011f',
    durationSeconds: 3,
    totalRecords: 14,
    triggeredBy: 'Automated Cron (Hourly Delta #02)',
    notes: 'Perubahan Delta: 2 inspeksi baru & 1 pembaruan status Manhole',
    parentBackupId: 'bak-20260829-020000',
    deltaSequence: 2,
    changedRecordsCount: 14
  },
  {
    id: 'bak-20260829-090000',
    filename: 'sewerbita_inc_delta_01_20260829_0900.sql.gz',
    timestamp: '2026-08-29 09:00 WIB',
    sizeMb: 0.8,
    destination: 'DualRedundant',
    type: 'Incremental Backup',
    status: 'Success',
    md5Hash: '3b901a4729c445100a8761298451bcaa',
    durationSeconds: 2,
    totalRecords: 6,
    triggeredBy: 'Automated Cron (Hourly Delta #01)',
    notes: 'Perubahan Delta: 1 pengguna baru terdaftar & 1 foto inspeksi',
    parentBackupId: 'bak-20260829-020000',
    deltaSequence: 1,
    changedRecordsCount: 6
  },
  {
    id: 'bak-20260829-020000',
    filename: 'sewerbita_full_backup_20260829_0200.sql.gz',
    timestamp: '2026-08-29 02:00 WIB',
    sizeMb: 14.8,
    destination: 'DualRedundant',
    type: 'Full Backup',
    status: 'Success',
    md5Hash: 'e99a18c428cb38d5f260853678922e03',
    durationSeconds: 12,
    totalRecords: 1420,
    triggeredBy: 'Automated Cron (Daily Baseline Full Backup)',
    notes: 'Base Full Backup harian lengkap (Parent Baseline)'
  },
  {
    id: 'bak-20260828-143012',
    filename: 'sewerbita_diff_backup_20260828_1430.sql.gz',
    timestamp: '2026-08-28 14:30 WIB',
    sizeMb: 3.4,
    destination: 'NAS',
    type: 'Differential Backup',
    status: 'Success',
    md5Hash: '3a11b402e69784fa711099238bc0195e',
    durationSeconds: 5,
    totalRecords: 45,
    triggeredBy: 'Deni Ardiansyah (Admin Manual Trigger)',
    notes: 'Differential backup sejak Full Backup 28-Aug-2026 02:00 WIB',
    parentBackupId: 'bak-20260828-020000',
    changedRecordsCount: 45
  },
  {
    id: 'bak-20260828-020000',
    filename: 'sewerbita_full_backup_20260828_0200.sql.gz',
    timestamp: '2026-08-28 02:00 WIB',
    sizeMb: 14.5,
    destination: 'DualRedundant',
    type: 'Full Backup',
    status: 'Success',
    md5Hash: '7c8d92a11b0e34c229f018a74b3359d1',
    durationSeconds: 11,
    totalRecords: 1405,
    triggeredBy: 'Automated Cron (Daily Baseline Full Backup)'
  },
  {
    id: 'bak-20260827-020000',
    filename: 'sewerbita_full_backup_20260827_0200.sql.gz',
    timestamp: '2026-08-27 02:00 WIB',
    sizeMb: 14.1,
    destination: 'GoogleDrive',
    type: 'Full Backup',
    status: 'Success',
    md5Hash: '99bf21a704e389c1055781a2098b111a',
    durationSeconds: 15,
    totalRecords: 1390,
    triggeredBy: 'Automated Cron (Daily Baseline Full Backup)'
  }
];
