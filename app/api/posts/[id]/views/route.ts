import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// INCREMENT POST VIEWS (public endpoint - no authentication required)
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

    // Atomically increment views
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, select: "views" }
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ views: post.views });
  } catch (error) {
    console.error("Failed to increment views:", error);
    return NextResponse.json(
      { error: "Failed to increment views" },
      { status: 500 }
    );
  }
}
