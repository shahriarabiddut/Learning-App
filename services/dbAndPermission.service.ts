import { getServerSession } from "@/lib/better-auth-client-and-actions/authAction";
import connectDB from "@/lib/connectDB";
import { hasPermission } from "@/lib/middle/permissions";
import { UserRole, UserType } from "@/lib/middle/roles";
import { ServerUser } from "@/lib/types";
import mongoose, { Query } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface AuthOptions {
  checkRole?: boolean;
  role?: UserRole | UserRole[];
  checkPermission?: boolean;
  Permission?: string;
  checkValidId?: boolean;
  IDtoCheck?: string | null;
  requireDB?: boolean;
}

interface PopulateOptions {
  path: string;
  select?: string;
  populate?: any;
  model?: string;
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
    checkValidId = false,
    IDtoCheck = "",
    requireDB = true,
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

  const user = session.user as ServerUser;

  // Check Role
  if (checkRole) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role as UserRole)) {
      return NextResponse.json(
        { error: "User not Allowed To Perform This Action!" },
        { status: 403 }
      );
    }
  }

  // Check Permission
  if (checkPermission && Permission) {
    if (!hasPermission(user.role as UserRole, Permission)) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }
  }

  // Validate Mongo ObjectId or ObjectId
  if (checkValidId) {
    if (!IDtoCheck || (Array.isArray(IDtoCheck) && IDtoCheck.length === 0)) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (Array.isArray(IDtoCheck)) {
      const allValid = IDtoCheck.every(
        (id) =>
          typeof id === "string" &&
          id.trim() !== "" &&
          mongoose.Types.ObjectId.isValid(id)
      );

      if (!allValid) {
        return NextResponse.json({ error: "Invalid ID(s)" }, { status: 400 });
      }
    } else {
      if (
        typeof IDtoCheck !== "string" ||
        IDtoCheck.trim() === "" ||
        !mongoose.Types.ObjectId.isValid(IDtoCheck)
      ) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      }
    }
  }

  // Connect to DB only if required
  if (requireDB) {
    await connectDB();
  }

  return user;
}

export function isSuperAdmin(user: ServerUser): boolean {
  return user.role === UserRole.ADMIN && user.userType === UserType.SUPER_ADMIN;
}

export function populateIfPermitted<T>(
  query: Query<T, any>,
  user: ServerUser,
  permission: string,
  populateOptions: PopulateOptions | PopulateOptions[]
): Query<T, any> {
  if (hasPermission(user.role as UserRole, permission)) {
    if (Array.isArray(populateOptions)) {
      // Handle multiple populate options
      populateOptions.forEach((option) => {
        query.populate(option);
      });
    } else {
      // Handle single populate option
      query.populate(populateOptions);
    }
  }

  return query;
}

export function userCan(user: ServerUser, permission: string): boolean {
  return hasPermission(user.role as UserRole, permission);
}

export function includeIfPermitted<T extends Record<string, any>>(
  user: ServerUser,
  permission: string,
  fields: T
): Partial<T> | {} {
  return hasPermission(user.role as UserRole, permission) ? fields : {};
}
