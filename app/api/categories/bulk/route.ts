import { PERMISSIONS } from "@/lib/middle/permissions";
import Category from "@/models/categories.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const ids = body?.ids;

  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_CATEGORIES,
    checkValidId: true,
    IDtoCheck: ids,
  });
  if (user instanceof NextResponse) return user;

  // If any item is demo and the user is not super admin, block deletion
  const superAdmin = isSuperAdmin(user);
  const items = await Category.find({ _id: { $in: ids } });
  const hasDemoItem = items.some((item) => item.demo);
  if (hasDemoItem && !superAdmin) {
    return NextResponse.json(
      { error: "Demo data can't be deleted!" },
      { status: 403 }
    );
  }

  const result = await Category.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({
    success: true,
    deletedCount: result.deletedCount,
  });
}
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { ids, property, value } = body;

  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.UPDATE_CATEGORIES,
    checkValidId: true,
    IDtoCheck: ids,
  });
  if (user instanceof NextResponse) return user;

  if (typeof value !== "boolean") {
    return NextResponse.json(
      { error: "Value must be a boolean" },
      { status: 400 }
    );
  }

  // If any item is demo and the user is not super admin, block modofication
  const superAdmin = isSuperAdmin(user);
  const categories = await Category.find({ _id: { $in: ids } });
  const hasDemoItem = categories.some((item) => item.demo);
  if (hasDemoItem && !superAdmin) {
    return NextResponse.json(
      { error: "Demo data can't be modified!" },
      { status: 403 }
    );
  }
  const result =
    property === "isActive"
      ? await Category.updateMany({ _id: { $in: ids } }, { isActive: value })
      : await Category.updateMany({ _id: { $in: ids } }, { featured: value });
  // console.log("Bulk update result:", result);
  return NextResponse.json({
    success: true,
    modifiedCount: result.modifiedCount,
  });
}
