import { AuthenticatedorNot, isSuperAdmin } from "@/app/api/server/route";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
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
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "approved must be a boolean" },
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

    // Find and update comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    comment.approved = approved;
    post.updatedBy = user.id;

    await post.save();

    const updatedPost = await BlogPost.findById(id)
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name",
      });

    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json(updatedPost);
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

    // Find and remove comment
    const comment = post.comments.id(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Remove the comment
    post.comments.pull(commentId);
    post.updatedBy = user.id;

    await post.save();

    const updatedPost = await BlogPost.findById(id)
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name",
      });

    revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
