import connectDB from "@/lib/connectDB";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import Comment from "@/models/comment.model"; // Import Comment model
import "@/models/users.model";
import { AuthenticatedorNot } from "@/services/dbAndPermission.service";
import { NextRequest, NextResponse } from "next/server";

// GET all comments for a post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    // Check if post exists
    const post = await BlogPost.findById(params.id)
      .select("allowComments")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Fetch comments from Comment collection
    const comments = await Comment.find({
      post: params.id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      comments: comments || [],
      allowComments: post.allowComments,
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST - Add a new comment (public endpoint)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  await connectDB();

  try {
    const body = await request.json();
    const { name, email, body: commentBody, parentComment } = body;

    if (!name || !commentBody) {
      return NextResponse.json(
        { error: "Name and comment body are required" },
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

    if (!post.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled for this post" },
        { status: 403 }
      );
    }

    // If replying to a comment, verify parent exists
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    // Create new comment document
    const newComment = await Comment.create({
      post: params.id,
      parentComment: parentComment || null,
      name,
      email: email || null,
      body: commentBody,
      status: "pending", // Pending approval by default
      isActive: true,
    });

    await BlogPost.findByIdAndUpdate(params.id, {
      $inc: { commentsCount: 1 },
    });

    return NextResponse.json({
      message: "Comment added successfully (pending approval)",
      comment: newComment,
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
