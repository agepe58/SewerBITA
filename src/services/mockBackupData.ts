import { NASConfig, GoogleDriveConfig, BackupHistoryRecord } from '../types/backup';

export const INITIAL_NAS_CONFIG: NASConfig = {
  host: '192.168.10.250',
  sharePath: '/volume1/SewerBITA_Backups',
  username: 'nas_admin_bita',
  protocol: 'SMB/CIFS',
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

export const INITIAL_BACKUP_HISTORY: BackupHistoryRecord[] = [
  {
    id: 'bak-20260829-020000',
    filename: 'sewerbita_full_backup_20260829_0200.sql.gz',
    timestamp: '2026-08-29 02:00 WIB',
    sizeMb: 14.8,
    destination: 'DualRedundant',
    type: 'Full System',
    status: 'Success',
    md5Hash: 'e99a18c428cb38d5f260853678922e03',
    durationSeconds: 12,
    totalRecords: 1420,
    triggeredBy: 'Automated Cron (Daily 02:00)',
    notes: 'Otomatik backup harian ke NAS Synology & Google Drive'
  },
  {
    id: 'bak-20260828-020000',
    filename: 'sewerbita_full_backup_20260828_0200.sql.gz',
    timestamp: '2026-08-28 02:00 WIB',
    sizeMb: 14.5,
    destination: 'DualRedundant',
    type: 'Full System',
    status: 'Success',
    md5Hash: '7c8d92a11b0e34c229f018a74b3359d1',
    durationSeconds: 11,
    totalRecords: 1405,
    triggeredBy: 'Automated Cron (Daily 02:00)'
  },
  {
    id: 'bak-20260827-143012',
    filename: 'sewerbita_assets_dump_20260827_1430.json',
    timestamp: '2026-08-27 14:30 WIB',
    sizeMb: 4.2,
    destination: 'NAS',
    type: 'Master Assets',
    status: 'Success',
    md5Hash: '3a11b402e69784fa711099238bc0195e',
    durationSeconds: 4,
    totalRecords: 850,
    triggeredBy: 'Deni Ardiansyah (Admin)',
    notes: 'Manual snapshot sebelum penambahan Manhole Sektor Sudirman'
  },
  {
    id: 'bak-20260826-020000',
    filename: 'sewerbita_full_backup_20260826_0200.sql.gz',
    timestamp: '2026-08-26 02:00 WIB',
    sizeMb: 14.1,
    destination: 'GoogleDrive',
    type: 'Full System',
    status: 'Success',
    md5Hash: '99bf21a704e389c1055781a2098b111a',
    durationSeconds: 15,
    totalRecords: 1390,
    triggeredBy: 'Automated Cron (Daily 02:00)'
  },
  {
    id: 'bak-20260825-111500',
    filename: 'sewerbita_inspections_20260825_1115.sql.gz',
    timestamp: '2026-08-25 11:15 WIB',
    sizeMb: 8.6,
    destination: 'NAS',
    type: 'Inspection Logs',
    status: 'Success',
    md5Hash: '11a098bc54711f92e03947b198c40212',
    durationSeconds: 6,
    totalRecords: 540,
    triggeredBy: 'Deni Ardiansyah (Admin)'
  }
];
