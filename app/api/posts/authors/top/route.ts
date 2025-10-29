import BlogPost from "@/models/blogPost.model";
import "@/models/users.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "4"), 1),
      20
    );
    const sortBy = searchParams.get("sortBy") || "views";

    const authorStats = await BlogPost.aggregate([
      {
        $match: {
          status: "published",
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$author",
          totalPosts: { $sum: 1 },
          totalViews: { $sum: "$views" },
          lastPublished: { $max: "$publishedAt" },
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "_id",
          as: "authorData",
        },
      },
      {
        $unwind: {
          path: "$authorData",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          "authorData.isActive": true,
        },
      },
      {
        $project: {
          _id: 1,
          authorId: "$_id",
          name: "$authorData.name",
          email: "$authorData.email",
          image: "$authorData.image",
          totalPosts: 1,
          totalViews: 1,
          lastPublished: 1,
          createdAt: "$authorData.createdAt",
        },
      },
      {
        $sort:
          sortBy === "posts"
            ? { totalPosts: -1, totalViews: -1 }
            : sortBy === "followers"
            ? { totalViews: -1, totalPosts: -1 }
            : { totalViews: -1, totalPosts: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    const data = authorStats.map((author, index) => ({
      id: author.authorId.toString(),
      name: author.name,
      email: author.email,
      image: author.image || null,
      role: author.role,
      userType: author.userType,
      bio: `Published ${author.totalPosts} article${
        author.totalPosts !== 1 ? "s" : ""
      } with ${formatViews(author.totalViews)} total views`,
      posts: author.totalPosts,
      views: author.totalViews,
      followers: Math.floor(author.totalViews / 10), // For now fake followers
      lastPublished: author.lastPublished,
      rank: index + 1,
    }));

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("Top authors fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch top authors",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}
