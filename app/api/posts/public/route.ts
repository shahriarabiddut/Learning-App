import BlogPost from "@/models/blogPost.model";
import "@/models/categories.model";
import "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10"), 1),
      100
    );
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "createdAt-desc";

    // Additional filters
    const author = searchParams.get("author");
    const category = searchParams.get("category");
    const tags = searchParams.get("tags");
    const isFeatured = searchParams.get("isFeatured");

    // Build query object
    const query: any = {
      isActive: true,
      status: "published",
    };

    // Handle sorting
    const [field, order] = sortBy.split("-");
    const sort: Record<string, 1 | -1> = {
      [field]: order === "asc" ? 1 : -1,
    };

    // Add search functionality
    if (search && search.length >= 2) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
      page = 1; // Reset to first page on search
    }

    // Apply filters
    if (author) {
      query.author = author;
    }
    if (category) {
      query.categories = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(",").map((t) => t.trim()) };
    }
    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [rawData, total] = await Promise.all([
      BlogPost.find(query)
        .populate({
          path: "author",
          select: "name email",
        })
        .populate({
          path: "categories",
          select: "name slug",
        })
        .select("-content -contentBlocks") // Exclude heavy fields for list view
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(), // Use lean() for better performance
      BlogPost.countDocuments(query),
    ]);

    // Transform data efficiently
    const data = rawData.map((doc: any) => ({
      id: doc._id?.toString() || doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      contentType: doc.contentType,
      author: doc.author?._id?.toString() || doc.author,
      authorName: doc.author?.name || doc.authorName || "Unknown Author",
      categories:
        doc.categories?.map((cat: any) => ({
          id: cat._id?.toString(),
          name: cat.name,
          slug: cat.slug,
        })) || [],
      tags: doc.tags || [],
      featuredImage: doc.featuredImage,
      status: doc.status,
      isActive: doc.isActive,
      isFeatured: doc.isFeatured,
      publishedAt: doc.publishedAt,
      seo: doc.seo,
      allowComments: doc.allowComments,
      views: doc.views || 0,
      readingTime: doc.readingTime,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      page,
      total,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Blog post fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch blog posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
