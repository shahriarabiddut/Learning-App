import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import Comment, { CommentStatus } from "@/models/comment.model"; // Import Comment model
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { NextRequest, NextResponse } from "next/server";

// PATCH - Bulk approve/reject comments
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { commentIds, status } = body;

    if (!Array.isArray(commentIds)) {
      return NextResponse.json(
        { error: "commentIds must be an array" },
        { status: 400 }
      );
    }

    if (!["approved", "pending", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, approved, or rejected" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && post.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to manage comments on this post" },
        { status: 403 }
      );
    }

    // Bulk update comments in Comment collection
    const result = await Comment.updateMany(
      {
        _id: { $in: commentIds },
        post: params.id, // Ensure comments belong to this post
      },
      {
        $set: { status },
      }
    );

    if (result.modifiedCount > 0) {
      // Update post's updatedBy field
      await BlogPost.findByIdAndUpdate(params.id, {
        updatedBy: user.id,
      });
    }

    return NextResponse.json({
      message: `${result.modifiedCount} comment(s) updated to ${status}`,
      updatedCount: result.modifiedCount,
      status, // Include the status that was set
    });
  } catch (error) {
    console.error("Failed to bulk update comments:", error);
    return NextResponse.json(
      { error: "Failed to bulk update comments" },
      { status: 500 }
    );
  }
}

// DELETE - Bulk delete comments
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { commentIds } = body;

    if (!Array.isArray(commentIds)) {
      return NextResponse.json(
        { error: "commentIds must be an array" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && post.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete comments on this post" },
        { status: 403 }
      );
    }

    // Bulk delete comments from Comment collection
    const result = await Comment.deleteMany({
      _id: { $in: commentIds },
      post: params.id, // Ensure comments belong to this post
    });

    const deletedCount = result.deletedCount || 0;

    if (deletedCount > 0) {
      // Decrement commentsCount in BlogPost
      await BlogPost.findByIdAndUpdate(params.id, {
        $inc: { commentsCount: -deletedCount },
        updatedBy: user.id,
      });
    }

    return NextResponse.json({
      message: `${deletedCount} comment(s) deleted`,
      deletedCount,
    });
  } catch (error) {
    console.error("Failed to bulk delete comments:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete comments" },
      { status: 500 }
    );
  }
}
