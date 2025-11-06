import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";

// BULK DELETE
export async function DELETE(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_POSTS,
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
        { error: "All post IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    const superAdmin = isSuperAdmin(user);
    const posts = await BlogPost.find({ _id: { $in: ids } });

    // Check if any post is demo data
    const hasDemoItem = posts.some((post) => post.demo);
    if (hasDemoItem && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be deleted!" },
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
          { error: "You don't have permission to delete some of these posts" },
          { status: 403 }
        );
      }
    }

    const result = await BlogPost.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog posts" },
      { status: 500 }
    );
  }
}

// BULK TOGGLE PROPERTY (isActive, isFeatured, allowComments)
export async function PATCH(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
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
        { error: "All post IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    if (!["isActive", "isFeatured", "allowComments"].includes(property)) {
      return NextResponse.json(
        {
          error:
            "Invalid property. Must be 'isActive', 'isFeatured', or 'allowComments'",
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

    const result = await BlogPost.updateMany(
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
      { error: "Failed to update blog posts" },
      { status: 500 }
    );
  }
}
