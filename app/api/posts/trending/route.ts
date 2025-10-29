import BlogPost from "@/models/blogPost.model";
import "@/models/categories.model";
import "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "4"), 1),
      20
    );
    const category = searchParams.get("category");
    const timeRange = searchParams.get("timeRange") || "week";

    const query: any = {
      isActive: true,
      status: "published",
    };

    if (category) {
      query.categories = category;
    }

    if (timeRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "day":
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      query.publishedAt = { $gte: startDate };
    }

    const posts = await BlogPost.find(query)
      .select(
        "title slug excerpt featuredImage categories tags views readingTime publishedAt authorName"
      )
      .populate({
        path: "categories",
        select: "name slug",
      })
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .lean();

    const data = posts.map((doc: any, index: number) => ({
      id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      featuredImage: doc.featuredImage,
      categories:
        doc.categories?.map((cat: any) => ({
          id: cat._id?.toString(),
          name: cat.name,
          slug: cat.slug,
        })) || [],
      tags: doc.tags || [],
      views: doc.views || 0,
      readingTime: doc.readingTime,
      publishedAt: doc.publishedAt,
      authorName: doc.authorName,
      rank: index + 1,
    }));

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Trending posts fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch trending posts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
