export type UserRole = 'Admin' | 'Engineer' | 'Technician' | 'Management';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  password?: string;
  phone?: string;
  status?: 'Active' | 'Inactive' | 'Pending' | 'Pending Approval';
}

export type PermissionAction =
  | 'view_dashboard'
  | 'view_map'
  | 'view_assets'
  | 'add_asset'
  | 'edit_asset'
  | 'delete_asset'
  | 'edit_topology'
  | 'create_inspection'
  | 'export_data'
  | 'import_data'
  | 'manage_users'
  | 'manage_backups';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Admin: [
    'view_dashboard',
    'view_map',
    'view_assets',
    'add_asset',
    'edit_asset',
    'delete_asset',
    'edit_topology',
    'create_inspection',
    'export_data',
    'import_data',
    'manage_users',
    'manage_backups',
  ],
  Engineer: [
    'view_dashboard',
    'view_map',
    'view_assets',
    'add_asset',
    'edit_asset',
    'edit_topology',
    'create_inspection',
    'export_data',
    'import_data',
  ],
  Technician: [
    'view_dashboard',
    'view_map',
    'view_assets',
    'create_inspection',
  ],
  Management: [
    'view_dashboard',
    'view_map',
    'view_assets',
    'export_data',
  ],
};

export const TAB_REQUIRED_PERMISSION: Record<string, PermissionAction> = {
  dashboard: 'view_dashboard',
  map: 'view_map',
  topology: 'edit_topology',
  assets: 'view_assets',
  areas: 'add_asset',
  inspections: 'create_inspection',
  qr_scanner: 'view_assets',
  data: 'export_data',
  users: 'manage_users',
  backup: 'manage_backups',
  profile: 'view_dashboard',
};

export const isTabAllowed = (tab: string, role: UserRole): boolean => {
  if (tab === 'profile' || tab === 'dashboard') return true;
  const required = TAB_REQUIRED_PERMISSION[tab];
  if (!required) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(required);
};

export const hasPermission = (role: UserRole, action: PermissionAction): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(action);
};
