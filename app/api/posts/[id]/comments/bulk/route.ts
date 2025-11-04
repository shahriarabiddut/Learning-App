import { AuthenticatedorNot } from "@/app/api/server/route";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
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
    const { commentIds, approved } = body;

    if (!Array.isArray(commentIds) || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body" },
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

    let updatedCount = 0;
    commentIds.forEach((commentId) => {
      const comment = post.comments.id(commentId);
      if (comment) {
        comment.approved = approved;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      post.updatedBy = user.userId;
      await post.save();
    }

    return NextResponse.json({
      message: `${updatedCount} comment(s) ${
        approved ? "approved" : "rejected"
      }`,
      updatedCount,
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

    const originalLength = post.comments.length;
    post.comments = post.comments.filter(
      (c: any) => !commentIds.includes(c._id.toString())
    );

    const deletedCount = originalLength - post.comments.length;

    if (deletedCount > 0) {
      post.updatedBy = user.userId;
      await post.save();
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
