import { UserRole } from "@/lib/middle/roles";

export const PERMISSIONS = {
  VIEW_USERS: "VIEW_USERS",
  MANAGE_USERS: "MANAGE_USERS",
} as const;

// Define The Type Of Permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    // PERMISSIONS.MANAGE_SETTINGS,
  ],
  [UserRole.AUTHOR]: [PERMISSIONS.VIEW_USERS],
  [UserRole.USER]: [PERMISSIONS.VIEW_USERS],
  [UserRole.SUBSCRIBER]: [PERMISSIONS.VIEW_USERS],
};

// Check permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
