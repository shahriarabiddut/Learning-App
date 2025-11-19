import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/blogPost.model";
import connectDB from "@/lib/connectDB";

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3");
    const category = searchParams.get("category");

    let query: any = {
      status: "published",
      isActive: true,
      isFeatured: true,
    };

    // Filter by category if provided
    if (category) {
      query.categories = category;
    }

    const featuredPosts = await BlogPost.find(query)
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

    const data = featuredPosts.map((post) => ({
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
      isFeatured: post.isFeatured,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Featured posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured posts" },
      { status: 500 }
    );
  }
}
