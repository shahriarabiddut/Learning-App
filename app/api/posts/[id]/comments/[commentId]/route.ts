import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import Comment, { CommentStatus } from "@/models/comment.model"; // Import Comment model
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import "@/models/users.model";
import "@/models/categories.model";

// UPDATE COMMENT STATUS (approve/reject)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
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
    const { id, commentId } = params;

    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["approved", "pending", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: pending, approved, or rejected" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && post.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to manage comments on this post" },
        { status: 403 }
      );
    }

    // Find and update comment in Comment collection
    const comment = await Comment.findOne({
      _id: commentId,
      post: id,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    comment.status = status;
    await comment.save();

    // Update post's updatedBy field
    await BlogPost.findByIdAndUpdate(id, {
      updatedBy: user.id,
    });

    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Failed to update comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE COMMENT
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
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
    const { id, commentId } = params;

    // Validate commentId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: "Invalid comment ID format" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && post.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete comments on this post" },
        { status: 403 }
      );
    }

    // Find and verify comment exists and belongs to this post
    const comment = await Comment.findOne({
      _id: commentId,
      post: id,
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Decrement commentsCount in BlogPost
    await BlogPost.findByIdAndUpdate(id, {
      $inc: { commentsCount: -1 },
      updatedBy: user.id,
    });

    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({
      message: "Comment deleted successfully",
      commentId,
    });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
