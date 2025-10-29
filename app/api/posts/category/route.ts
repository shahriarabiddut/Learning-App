import { AuthenticatedorNot } from "@/app/api/server/route";
import { PERMISSIONS } from "@/lib/middle/permissions";
import Category from "@/models/categories.model";
import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_CATEGORIES,
  });
  if (user instanceof NextResponse) return user;

  try {
    let query: any = {};
    query.isActive = true; // Only fetch active categories
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt-desc";
    const featuredOnly = searchParams.get("featured") === "true";

    // Filter by featured if requested
    if (featuredOnly) {
      query.featured = true;
    }

    // Handle sorting
    const [field, order] = sortBy.split("-");
    let sort: Record<string, 1 | -1> = {};

    // Special handling for postCount sorting (will be done after aggregation)
    if (field !== "postCount") {
      sort[field] = order === "asc" ? 1 : -1;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      page = 1;
    }

    // Get all category IDs that match the query first
    const [rawData, total] = await Promise.all([
      Category.find(query)
        .populate({
          path: "parentCategory",
          select: "name",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .lean(), // Use lean() for better performance
      Category.countDocuments(query),
    ]);

    // Get category IDs for the current page
    const categoryIds = rawData.map((doc) => doc._id);

    // Aggregate post counts for all categories in one query
    const postCounts = await BlogPost.aggregate([
      {
        $match: {
          categories: { $in: categoryIds },
          status: "published",
          isActive: true,
        },
      },
      {
        $unwind: "$categories",
      },
      {
        $match: {
          categories: { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: "$categories",
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map of category ID to post count
    const postCountMap = new Map(
      postCounts.map((item) => [item._id.toString(), item.count])
    );

    // Map the data with post counts
    let data = rawData.map((doc: any) => {
      const categoryId = doc._id.toString();
      const postCount = postCountMap.get(categoryId) || 0;

      return {
        id: categoryId,
        name: doc.name,
        description: doc.description || "",
        imageUrl: doc.imageUrl || "",
        parentCategory: doc.parentCategory?._id?.toString() || null,
        parent: doc.parentCategory?.name || null,
        featured: doc.featured || false,
        isActive: doc.isActive,
        demo: doc.demo || false,
        postCount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    // Sort by postCount if requested
    if (field === "postCount") {
      data = data.sort((a, b) => {
        return order === "asc"
          ? a.postCount - b.postCount
          : b.postCount - a.postCount;
      });
    }

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Category fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
