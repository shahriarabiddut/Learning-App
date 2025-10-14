import { getServerSession } from "@/lib/better-auth-client-and-actions/authAction";
import connectDB from "@/lib/connectDB";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole, UserType } from "@/lib/middle/roles";
import { ServerUser } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface AuthOptions {
  checkRole?: boolean;
  role?: UserRole | UserRole[];
  checkPermission?: boolean;
  Permission?: string;
}
export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request);
  if (user instanceof NextResponse) return user;
  const isSuperAdmin = user.role === "admin" && user.userType === "superadmin";
  return NextResponse.json({ status: isSuperAdmin });
}

export async function AuthenticatedorNot(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<ServerUser | NextResponse> {
  const {
    checkRole = false,
    role = UserRole.ADMIN,
    checkPermission = false,
    Permission,
  } = options;

  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Session not Found" }, { status: 403 });
  }

  if (!session.user) {
    return NextResponse.json(
      { error: "User not Authenticated" },
      { status: 401 }
    );
  }

  if (!session.user.isActive) {
    return NextResponse.json(
      { error: "User not Allowed To Perform Any Actions!" },
      { status: 401 }
    );
  }

  await connectDB();

  const user = session.user as ServerUser;

  if (checkRole) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user?.role)) {
      return NextResponse.json(
        { error: "User not Allowed To Perform This Action!" },
        { status: 403 }
      );
    }
  }

  if (checkPermission && Permission) {
    if (!hasPermission(user.role as UserRole, Permission)) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
  }

  return user;
}

export function isSuperAdmin(user: ServerUser): boolean {
  return user.role === UserRole.ADMIN && user.userType === UserType.SUPER_ADMIN;
}
