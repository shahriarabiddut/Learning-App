import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import "@/models/users.model";
import "@/models/categories.model";
import { commentSchema } from "@/schemas/blogPostSchema";

// ADD COMMENT (public endpoint - no authentication required)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid post ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = commentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if comments are allowed
    if (!post.allowComments) {
      return NextResponse.json(
        { error: "Comments are not allowed on this post" },
        { status: 403 }
      );
    }

    // Check if post is published
    if (post.status !== "published") {
      return NextResponse.json(
        { error: "Cannot comment on unpublished posts" },
        { status: 403 }
      );
    }

    // Add comment
    post.comments.push({
      ...validation.data,
      approved: false, // Comments need approval by default
      createdAt: new Date(),
    } as any);

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

    return NextResponse.json(updatedPost, { status: 201 });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
