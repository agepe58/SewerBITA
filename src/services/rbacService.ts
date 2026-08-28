import { UserRole, PermissionAction, ROLE_PERMISSIONS } from '../types/rbac';

export class RBACService {
  public static hasPermission(role: UserRole, action: PermissionAction): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(action);
  }

  public static getRolePermissions(role: UserRole): PermissionAction[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}
