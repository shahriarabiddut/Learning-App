import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPage from "@/models/blogPage.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";

// BULK DELETE
export async function DELETE(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_PAGES,
  });
  if (user instanceof NextResponse) return user;

  try {
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
        { error: "All page IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    const superAdmin = isSuperAdmin(user);
    const pages = await BlogPage.find({ _id: { $in: ids } });

    // Check if any page is demo data
    const hasDemoItem = pages.some((page) => page.demo);
    if (hasDemoItem && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be deleted!" },
        { status: 403 }
      );
    }

    // Check if user owns all pages or is super admin
    if (!superAdmin) {
      const unauthorizedPage = pages.find(
        (page) => page.author?.toString() !== user.id
      );
      if (unauthorizedPage) {
        return NextResponse.json(
          { error: "You don't have permission to delete some of these pages" },
          { status: 403 }
        );
      }
    }

    const result = await BlogPage.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog pages" },
      { status: 500 }
    );
  }
}

// BULK TOGGLE PROPERTY (isActive, isFeatured, allowComments)
export async function PATCH(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_PAGES,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { ids, property, value } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "'ids' must be an array" },
        { status: 400 }
      );
    }

    if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
      return NextResponse.json(
        { error: "All page IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    if (!["isActive", "isFeatured"].includes(property)) {
      return NextResponse.json(
        {
          error: "Invalid property.",
        },
        { status: 400 }
      );
    }

    if (typeof value !== "boolean") {
      return NextResponse.json(
        { error: "Value must be a boolean" },
        { status: 400 }
      );
    }

    const superAdmin = isSuperAdmin(user);
    const pages = await BlogPage.find({ _id: { $in: ids } });

    // Check if any page is demo data
    const hasDemoItem = pages.some((page) => page.demo);
    if (hasDemoItem && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be modified!" },
        { status: 403 }
      );
    }

    // Check if user owns all pages or is super admin
    if (!superAdmin) {
      const unauthorizedPage = pages.find(
        (page) => page.author?.toString() !== user.id
      );
      if (unauthorizedPage) {
        return NextResponse.json(
          { error: "You don't have permission to modify some of these pages" },
          { status: 403 }
        );
      }
    }

    const result = await BlogPage.updateMany(
      { _id: { $in: ids } },
      {
        [property]: value,
        updatedBy: user.id,
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Failed to update blog pages" },
      { status: 500 }
    );
  }
}
