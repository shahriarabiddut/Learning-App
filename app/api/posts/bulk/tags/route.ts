import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedorNot, isSuperAdmin } from "@/app/api/server/route";

// BULK ADD TAGS
export async function POST(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { ids, tags } = body;

    if (!Array.isArray(ids) || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "'ids' and 'tags' must be arrays" },
        { status: 400 }
      );
    }

    if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
      return NextResponse.json(
        { error: "All post IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    if (tags.some((tag) => typeof tag !== "string" || tag.trim() === "")) {
      return NextResponse.json(
        { error: "All tags must be non-empty strings" },
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

    // Add tags to posts (avoiding duplicates)
    const result = await BlogPost.updateMany(
      { _id: { $in: ids } },
      {
        $addToSet: { tags: { $each: tags } },
        updatedBy: user.id,
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk add tags error:", error);
    return NextResponse.json({ error: "Failed to add tags" }, { status: 500 });
  }
}

// BULK REMOVE TAGS
export async function DELETE(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { ids, tags } = body;

    if (!Array.isArray(ids) || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "'ids' and 'tags' must be arrays" },
        { status: 400 }
      );
    }

    if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
      return NextResponse.json(
        { error: "All post IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    if (tags.some((tag) => typeof tag !== "string" || tag.trim() === "")) {
      return NextResponse.json(
        { error: "All tags must be non-empty strings" },
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

    // Remove tags from posts
    const result = await BlogPost.updateMany(
      { _id: { $in: ids } },
      {
        $pull: { tags: { $in: tags } },
        updatedBy: user.id,
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk remove tags error:", error);
    return NextResponse.json(
      { error: "Failed to remove tags" },
      { status: 500 }
    );
  }
}
