import { UserRole } from "@/lib/middle/roles";

export const PERMISSIONS = {
  MANAGE_USERS: "MANAGE_USERS",
} as const;

// Define The Type Of Permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    // PERMISSIONS.MANAGE_SETTINGS,
  ],
  [UserRole.AUTHOR]: [],
  [UserRole.USER]: [],
  [UserRole.SUBSCRIBER]: [],
};

// Check permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
