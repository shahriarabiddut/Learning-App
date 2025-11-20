import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import { AuthenticatedorNot } from "@/services/dbAndPermission.service";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// PUBLISH a blog post
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.PUBLISH_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;

    const post = await BlogPost.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already published
    if (post.status === "published") {
      return NextResponse.json(
        { error: "Post is already published" },
        { status: 400 }
      );
    }

    // Update post to published status
    post.status = "published";
    post.isActive = true;
    post.updatedBy = user.id;

    // Set publishedAt if not already set
    if (!post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    // Populate references for response
    const publishedPost = await BlogPost.findById(id)
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name",
      });

    revalidatePath("/dashboard/posts");
    revalidatePath("/blog");
    revalidatePath(`/blog/${publishedPost?.slug}`);

    return NextResponse.json(publishedPost);
  } catch (error) {
    console.error("Post publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish blog post" },
      { status: 500 }
    );
  }
}
