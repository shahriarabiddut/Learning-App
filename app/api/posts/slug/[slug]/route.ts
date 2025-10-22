import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import "@/models/categories.model";

// GET blog post by slug (public access)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;

    const post = await BlogPost.findOne({
      slug: params.slug,
      status: "published", // Only published posts
      isActive: true,
    })
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name description imageUrl",
      })
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const transformedPost = {
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentBlocks: post.contentBlocks,
      contentType: post.contentType,
      author: post.author?._id?.toString(),
      authorName: post.author?.name || post.authorName,
      categories: post.categories?.map((cat: any) => ({
        id: cat._id?.toString(),
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
      })),
      tags: post.tags,
      featuredImage: post.featuredImage,
      status: post.status,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt,
      seo: post.seo,
      allowComments: post.allowComments,
      comments: post.comments?.filter((comment: any) => comment.approved), // Only approved comments
      views: post.views,
      readingTime: post.readingTime,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Failed to fetch blog post by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
