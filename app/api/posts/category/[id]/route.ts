import { NextRequest, NextResponse } from "next/server";
import BlogPost from "@/models/blogPost.model";
import Category from "@/models/categories.model";
import connectDB from "@/lib/connectDB";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "12"), 1),
      100
    );
    const sortByParam = searchParams.get("sortBy") || "createdAt-desc";
    const { id } = await params;

    // Parse sort parameter
    const [sortField, sortOrder] = sortByParam.split("-");
    const sortObj: any = {};

    switch (sortField) {
      case "title":
        sortObj.title = sortOrder === "asc" ? 1 : -1;
        break;
      case "views":
        sortObj.views = sortOrder === "asc" ? 1 : -1;
        break;
      case "publishedAt":
        sortObj.publishedAt = sortOrder === "asc" ? 1 : -1;
        break;
      case "createdAt":
      default:
        sortObj.createdAt = sortOrder === "asc" ? 1 : -1;
        break;
    }

    const query = {
      categories: id,
      status: "published",
      isActive: true,
    };

    // Fetch category info and posts in parallel
    const [categoryInfo, posts, total] = await Promise.all([
      Category.findById(id)
        .select("name slug description imageUrl featured")
        .lean(),
      BlogPost.find(query)
        .populate({
          path: "author",
          select: "name email",
        })
        .populate({
          path: "categories",
          select: "name slug",
        })
        .sort(sortObj)
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
      authorName: post.author?.name || post.authorName || "Anonymous",
      categories:
        post.categories?.map((cat: any) => ({
          id: cat._id?.toString(),
          name: cat.name,
          slug: cat.slug,
        })) || [],
      tags: post.tags || [],
      featuredImage: post.featuredImage,
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      views: post.views || 0,
      isFeatured: post.isFeatured || false,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      data,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      limit,
      category: categoryInfo
        ? {
            id: categoryInfo._id?.toString(),
            name: categoryInfo.name,
            slug: categoryInfo.slug,
            description: categoryInfo.description,
            imageUrl: categoryInfo.imageUrl,
            featured: categoryInfo.featured,
            postCount: total,
          }
        : null,
    });
  } catch (error) {
    console.error("Category posts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category posts" },
      { status: 500 }
    );
  }
}
