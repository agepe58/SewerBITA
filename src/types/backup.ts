export type BackupDestinationType = 'NAS' | 'GoogleDrive' | 'DualRedundant';

export type BackupStatus = 'Success' | 'Failed' | 'In-Progress' | 'Scheduled';

export type BackupType =
  | 'Full Backup'
  | 'Incremental Backup'
  | 'Differential Backup'
  | 'Master Assets Dump'
  | 'Inspection Logs Dump';

export type NASProtocol =
  | 'SMB/CIFS'
  | 'Synology WebDAV (HTTPS)'
  | 'Synology WebDAV (HTTP)'
  | 'NFS'
  | 'SFTP';

export interface NASConfig {
  host: string;
  sharePath: string;
  username: string;
  password?: string;
  protocol: NASProtocol;
  webdavPort?: number;
  useSSL?: boolean;
  autoSync: boolean;
  syncInterval: 'Hourly' | 'Daily' | 'Weekly';
  status: 'Connected' | 'Disconnected' | 'Testing';
  lastSync: string;
}

export interface GoogleDriveConfig {
  serviceAccountEmail: string;
  folderId: string;
  folderName: string;
  quotaUsed: string;
  quotaTotal: string;
  autoBackupEnabled: boolean;
  status: 'Connected' | 'Disconnected' | 'Testing';
  lastSync: string;
}

export interface BackupHistoryRecord {
  id: string;
  filename: string;
  timestamp: string;
  sizeMb: number;
  destination: BackupDestinationType;
  type: BackupType;
  status: BackupStatus;
  md5Hash: string;
  durationSeconds: number;
  totalRecords: number;
  triggeredBy: string;
  notes?: string;
  parentBackupId?: string;
  deltaSequence?: number;
  changedRecordsCount?: number;
}

export interface BackupRetentionPolicy {
  retentionDays: number;
  maxFileCount: number;
  autoPurgeEnabled: boolean;
  purgeStrategy: 'DeleteOldest' | 'ArchiveToColdStorage';
  lastPurgeDate?: string;
  purgedCountTotal?: number;
}
