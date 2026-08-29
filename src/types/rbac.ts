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
  status?: 'Active' | 'Inactive';
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
  | 'manage_users';

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
