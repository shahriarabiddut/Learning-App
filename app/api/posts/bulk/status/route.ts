import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
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
    Permission: PERMISSIONS.MANAGE_POSTS,
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
        { error: "All post IDs must be non-empty strings" },
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
        PERMISSIONS.PUBLISH_POSTS
      );
      if (!canPublish && !isSuperAdmin(user)) {
        return NextResponse.json(
          { error: "You don't have permission to publish posts" },
          { status: 403 }
        );
      }
    }

    const superAdmin = isSuperAdmin(user);
    const posts = await BlogPost.find({ _id: { $in: ids } });

    // Check if any post is demo data
    const hasDemoItem = posts.some((post) => post.demo);
    if (hasDemoItem && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be modified!" },
        { status: 403 }
      );
    }

    // Check if user owns all posts or is super admin
    if (!superAdmin) {
      const unauthorizedPost = posts.find(
        (post) => post.author?.toString() !== user.id
      );
      if (unauthorizedPost) {
        return NextResponse.json(
          { error: "You don't have permission to modify some of these posts" },
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

    const result = await BlogPost.updateMany({ _id: { $in: ids } }, updateData);

    // For published posts, also update those without publishedAt
    if (status === "published") {
      await BlogPost.updateMany(
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
      { error: "Failed to update post status" },
      { status: 500 }
    );
  }
}
