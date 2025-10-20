import { AuthenticatedorNot, isSuperAdmin } from "@/app/api/server/route";
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
    // Find user by _id
    const userData = await User.findById(id);
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role != "admin" && userData.role == "admin") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(userData);
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
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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
    const updateData = { ...validation.data };

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
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_USERS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    // Check if user exists and has permission to update
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // If not Admin Then UnAutorized
    if (existingUser && user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized to Delete this Data!" },
        { status: 403 }
      );
    }
    if (existingUser.role === "admin") {
      const superAdmin = isSuperAdmin(user);
      // If not SuperAdmin Then UnAutorized
      if (!superAdmin) {
        return NextResponse.json(
          { error: "Unauthorized to Delete this Data!" },
          { status: 403 }
        );
      }
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete associated account(s)
    await Accounts.deleteMany({ userId: new mongoose.Types.ObjectId(id) });

    // Trigger ISR revalidation
    revalidatePath("/dashboard/users");

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
