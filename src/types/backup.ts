export type BackupDestinationType = 'NAS' | 'GoogleDrive' | 'DualRedundant';

export type BackupStatus = 'Success' | 'Failed' | 'In-Progress' | 'Scheduled';

export type BackupType = 'Full System' | 'Master Assets' | 'Inspection Logs' | 'Topology Schema';

export interface NASConfig {
  host: string;
  sharePath: string;
  username: string;
  password?: string;
  protocol: 'SMB/CIFS' | 'NFS' | 'SFTP';
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
}
