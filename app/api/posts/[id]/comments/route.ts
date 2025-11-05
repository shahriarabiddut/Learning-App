import { AuthenticatedorNot } from "@/app/api/server/route";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import connectDB from "@/lib/connectDB";

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
    const post = await BlogPost.findById(params.id)
      .select("comments allowComments")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      comments: post.comments || [],
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
    const { name, email, body: commentBody } = body;

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

    const newComment = {
      name,
      email: email || undefined,
      body: commentBody,
      approved: null,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    return NextResponse.json({
      message: "Comment added successfully (pending approval)",
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
