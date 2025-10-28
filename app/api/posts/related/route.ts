import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4");
    const postId = params.id;

    // First, get the current post to find its categories and tags
    const currentPost = await BlogPost.findById(postId)
      .select("categories tags")
      .lean();

    if (!currentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Build query to find related posts
    const query: any = {
      _id: { $ne: postId }, // Exclude current post
      status: "published",
      isActive: true,
    };

    // Find posts with matching categories or tags
    const matchConditions: any[] = [];

    if (currentPost.categories && currentPost.categories.length > 0) {
      matchConditions.push({
        categories: { $in: currentPost.categories },
      });
    }

    if (currentPost.tags && currentPost.tags.length > 0) {
      matchConditions.push({
        tags: { $in: currentPost.tags },
      });
    }

    if (matchConditions.length > 0) {
      query.$or = matchConditions;
    }

    const relatedPosts = await BlogPost.find(query)
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name slug",
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    const data = relatedPosts.map((post) => ({
      id: post._id?.toString() || post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      author: post.author?._id?.toString() || post.author,
      authorName: post.author?.name || post.authorName,
      categories:
        post.categories?.map((cat: any) => ({
          id: cat._id?.toString(),
          name: cat.name,
          slug: cat.slug,
        })) || [],
      tags: post.tags,
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      views: post.views,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Related posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related posts" },
      { status: 500 }
    );
  }
}
