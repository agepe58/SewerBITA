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

export const INITIAL_BACKUP_HISTORY: BackupHistoryRecord[] = [];
