import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/blogPost.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categoryId = params.categoryId;

    const query = {
      categories: categoryId,
      status: "published",
      isActive: true,
    };

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .populate({
          path: "author",
          select: "name email",
        })
        .populate({
          path: "categories",
          select: "name slug",
        })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    const data = posts.map((post) => ({
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

    return NextResponse.json({
      data,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Category posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category posts" },
      { status: 500 }
    );
  }
}
