import { PERMISSIONS } from "@/lib/middle/permissions";
import { User } from "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { revalidatePath } from "next/cache";
import Accounts from "@/models/accounts.model";
import mongoose from "mongoose";

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const ids = body?.ids;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_USERS,
    checkValidId: true,
    IDtoCheck: ids,
  });
  if (user instanceof NextResponse) return user;

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Start the transaction
    await session.startTransaction();

    // Is SuperAdmin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin) {
      const usersToDelete = await User.find({ _id: { $in: ids } }).session(
        session
      );

      const hasAdmins = usersToDelete.some(
        (userToDelete) => userToDelete.role === "admin"
      );

      if (hasAdmins) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Unauthorized to delete users!" },
          { status: 403 }
        );
      }
    }

    // Delete users
    const result = await User.deleteMany({ _id: { $in: ids } }).session(
      session
    );

    // Delete associated accounts for all users
    await Accounts.deleteMany({ userId: { $in: ids } }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Trigger ISR revalidation
    revalidatePath("/dashboard/users");

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 }
    );
  } finally {
    // End the session
    await session.endSession();
  }
}
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { ids, isActive } = body;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.UPDATE_USERS,
    checkValidId: true,
    IDtoCheck: ids,
  });
  if (user instanceof NextResponse) return user;

  // Is SuperAdmin
  const superAdmin = isSuperAdmin(user);
  if (!superAdmin) {
    const usersToToggle = await User.find({ _id: { $in: ids } });

    const hasAdmins = usersToToggle.some(
      (userToToggle) => userToToggle.role === "admin"
    );

    if (hasAdmins) {
      return NextResponse.json(
        { error: "Unauthorized to Toggle users!" },
        { status: 403 }
      );
    }
  }

  const result = await User.updateMany(
    { _id: { $in: ids } },
    { isActive, updatedBy: user.id }
  );

  return NextResponse.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
}
