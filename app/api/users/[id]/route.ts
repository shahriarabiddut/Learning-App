import {
  AuthenticatedorNot,
  includeIfPermitted,
  isSuperAdmin,
  populateIfPermitted,
} from "@/services/dbAndPermission.service";
import { PERMISSIONS } from "@/lib/middle/permissions";
import Accounts from "@/models/accounts.model";
import { User } from "@/models/users.model";
import { userUpdateSchema } from "@/schemas/userSchema";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Authenticate and check permission
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_USERS,
    checkValidId: true,
    IDtoCheck: id,
  });
  if (user instanceof NextResponse) return user;

  try {
    // Base query
    let query: any = { _id: id };

    const baseQuery = User.findOne(query).select("-password");

    // Conditionally populate based on permission
    populateIfPermitted(baseQuery, user, PERMISSIONS.ADMIN_CONTROLLED_DATA, [
      {
        path: "updatedBy",
        select: "name",
      },
      {
        path: "addedBy",
        select: "name",
      },
    ]);

    const userData = await baseQuery.lean();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent non-admins from viewing admin data
    if (user.role !== "admin" && userData.role === "admin") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build formatted response (same shape as list)
    const formattedUser = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      userType: userData.userType,
      isActive: userData.isActive,
      emailVerified: userData.emailVerified,
      image: userData.image,
      ...includeIfPermitted(user, PERMISSIONS.ADMIN_CONTROLLED_DATA, {
        addedBy:
          userData.addedBy?._id || userData.addedBy?.id || userData.addedBy,
        userName: userData.addedBy?.name,
        updatedBy:
          userData.updatedBy?._id ||
          userData.updatedBy?.id ||
          userData.updatedBy,
        updatedByUser: userData.updatedBy?.name,
        updatedAt: userData.updatedAt,
      }),
      createdAt: userData.createdAt,
    };

    return NextResponse.json(formattedUser);
  } catch (err) {
    console.error("Failed to fetch User:", err);
    return NextResponse.json(
      { error: "Failed to fetch User" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.UPDATE_USERS,
    checkValidId: true,
    IDtoCheck: id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }
    // If you're not a SuperAdmin , You can't create One
    const superAdmin = isSuperAdmin(user);
    if (
      !superAdmin &&
      (validation.data.userType == "superadmin" ||
        validation.data.userType == "admin")
    ) {
      return NextResponse.json({ error: "Wrong Command" }, { status: 400 });
    }
    // Check if user exists and has permission to update
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.role === "admin" && !superAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to Update this Data!" },
        { status: 403 }
      );
    }
    // If email is being changed, check if new email is available
    if (validation.data.email && validation.data.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: validation.data.email });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Don't update password if it's not provided
    const updateData = { ...validation.data, updatedBy: user.id };

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    revalidatePath("/dashboard/users");
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_USERS,
    checkValidId: true,
    IDtoCheck: id,
  });
  if (user instanceof NextResponse) return user;

  // Start a session for the transaction
  const session = await mongoose.startSession();

  try {
    // Start the transaction
    await session.startTransaction();

    // Check if user exists and has permission to update
    const existingUser = await User.findById(id).session(session);
    if (!existingUser) {
      await session.abortTransaction();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.role === "admin") {
      const superAdmin = isSuperAdmin(user);
      // If not SuperAdmin Then Unauthorized
      if (!superAdmin) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: "Unauthorized to Delete this Data!" },
          { status: 403 }
        );
      }
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id).session(session);
    if (!deletedUser) {
      await session.abortTransaction();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete associated account(s)
    await Accounts.deleteMany({
      userId: new mongoose.Types.ObjectId(id),
    }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    // Trigger ISR revalidation
    revalidatePath("/dashboard/users");

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  } finally {
    // End the session
    await session.endSession();
  }
}
