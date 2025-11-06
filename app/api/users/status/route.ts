import { PERMISSIONS } from "@/lib/middle/permissions";
import { User } from "@/models/users.model";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.UPDATE_USERS,
    checkValidId: true,
    IDtoCheck: id,
  });
  if (user instanceof NextResponse) return user;

  try {
    // Validate request body
    const body = await request.json();
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }
    // Check if user exists and has permission to update
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (existingUser.role === "admin") {
      const superAdmin = isSuperAdmin(user);
      // If not SuperAdmin Then UnAutorized
      if (!superAdmin) {
        return NextResponse.json(
          { error: "Unauthorized to Update this Data!" },
          { status: 403 }
        );
      }
    }

    // Update status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: body.isActive, updatedBy: user.id },
      { new: true }
    );

    // Revalidate cache
    revalidatePath("/dashboard/users");

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
