import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import BlogPage from "@/models/blogPage.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { UserRole } from "@/lib/middle/roles";

// BULK UPDATE STATUS
export async function PATCH(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_PAGES,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { ids, status } = body;

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

    if (!["draft", "published", "revision", "pending"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status.",
        },
        { status: 400 }
      );
    }

    // Check if user has permission to publish
    if (status === "published") {
      const canPublish = hasPermission(
        user.role as UserRole,
        PERMISSIONS.PUBLISH_PAGES
      );
      if (!canPublish && !isSuperAdmin(user)) {
        return NextResponse.json(
          { error: "You don't have permission to publish pages" },
          { status: 403 }
        );
      }
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

    const updateData: any = {
      status,
      updatedBy: user.id,
    };

    // Set publishedAt and isActive when publishing
    if (status === "published") {
      updateData.isActive = true;
      // Only set publishedAt if not already set
      updateData.$setOnInsert = { publishedAt: new Date() };
    }

    const result = await BlogPage.updateMany({ _id: { $in: ids } }, updateData);

    // For published pages, also update those without publishedAt
    if (status === "published") {
      await BlogPage.updateMany(
        { _id: { $in: ids }, publishedAt: null },
        { publishedAt: new Date() }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    return NextResponse.json(
      { error: "Failed to update page status" },
      { status: 500 }
    );
  }
}
