import { PERMISSIONS } from "@/lib/middle/permissions";
import { User } from "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedorNot, isSuperAdmin } from "@/app/api/server/route";

export async function DELETE(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const ids = body?.ids;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json(
      { error: "Request must include an 'ids' array" },
      { status: 400 }
    );
  }

  if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
    return NextResponse.json(
      { error: "All user IDs must be non-empty strings" },
      { status: 400 }
    );
  }
  // Is SuperAdmin
  const superAdmin = isSuperAdmin(user);
  if (!superAdmin) {
    const usersToDelete = await User.find({ _id: { $in: ids } });

    const hasAdmins = usersToDelete.some(
      (userToDelete) => userToDelete.role === "admin"
    );

    if (hasAdmins) {
      return NextResponse.json(
        { error: "Unauthorized to delete users!" },
        { status: 403 }
      );
    }
  }

  const result = await User.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({
    success: true,
    deletedCount: result.deletedCount,
  });
}
export async function PATCH(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const { ids, isActive } = body;

  if (!Array.isArray(ids) || typeof isActive !== "boolean") {
    return NextResponse.json(
      { error: "'ids' must be an array and 'isActive' must be a boolean" },
      { status: 400 }
    );
  }

  if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
    return NextResponse.json(
      { error: "All user IDs must be non-empty strings" },
      { status: 400 }
    );
  }

  // Is SuperAdmin
  const superAdmin = isSuperAdmin(user);
  if (!superAdmin) {
    const usersToToggle = await User.find({ _id: { $in: ids } });

    const hasAdmins = usersToToggle.some(
      (userToToggle) => userToToggle.role !== "admin"
    );

    if (hasAdmins) {
      return NextResponse.json(
        { error: "Unauthorized to Toggle users!" },
        { status: 403 }
      );
    }
  }

  const result = await User.updateMany({ _id: { $in: ids } }, { isActive });

  return NextResponse.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
}
