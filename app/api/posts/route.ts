import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import "@/models/users.model";
import "@/models/categories.model";
import { blogPostSchema } from "@/schemas/blogPostSchema";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedorNot, isSuperAdmin } from "../server/route";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_POSTS,
  });
  if (user instanceof NextResponse) return user;

  try {
    let query: any = {};
    const superAdmin = isSuperAdmin(user);

    // Non-super admins can only see their own posts or posts from their store
    if (user && !superAdmin) {
      query.$or = [{ author: user.id }, { store: user.store }];
    }

    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt-desc";

    // Additional filters
    const status = searchParams.get("status");
    const author = searchParams.get("author");
    const category = searchParams.get("category");
    const tags = searchParams.get("tags");
    const isFeatured = searchParams.get("isFeatured");
    const isActive = searchParams.get("isActive");

    // Handle sorting
    const [field, order] = sortBy.split("-");
    const sort: Record<string, 1 | -1> = {
      [field]: order === "asc" ? 1 : -1,
    };

    // Add search functionality
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { excerpt: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      });
      page = 1;
    }

    // Apply filters
    if (status && status !== "all") {
      query.status = status;
    }
    if (author) {
      query.author = author;
    }
    if (category) {
      query.categories = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(",") };
    }
    if (isFeatured === "true") {
      query.isFeatured = true;
    }
    // query.isActive = isActive === "true";

    const [rawData, total] = await Promise.all([
      BlogPost.find(query)
        .populate({
          path: "author",
          select: "name email",
        })
        .populate({
          path: "categories",
          select: "name",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort),
      BlogPost.countDocuments(query),
    ]);

    const data = await Promise.all(
      rawData.map(async (doc) => {
        const obj = doc.toObject();

        return {
          id: obj._id || obj.id,
          title: obj.title,
          slug: obj.slug,
          excerpt: obj.excerpt,
          content: obj.content,
          contentBlocks: obj.contentBlocks,
          contentType: obj.contentType,
          author: obj.author?._id?.toString() || obj.author,
          authorName: obj.author?.name || obj.authorName,
          categories:
            obj.categories?.map((cat: any) => ({
              id: cat._id?.toString(),
              name: cat.name,
            })) || [],
          tags: obj.tags,
          featuredImage: obj.featuredImage,
          status: obj.status,
          isActive: obj.isActive,
          isFeatured: obj.isFeatured,
          publishedAt: obj.publishedAt,
          seo: obj.seo,
          allowComments: obj.allowComments,
          comments: obj.comments,
          views: obj.views,
          readingTime: obj.readingTime,
          createdBy: obj.createdBy,
          updatedBy: obj.updatedBy,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
        };
      })
    );

    return NextResponse.json({
      data,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Blog post fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const validation = blogPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const newPost = await BlogPost.create({
      ...validation.data,
      author: user.id,
      authorName: user.name,
      createdBy: user.id,
    });

    revalidatePath("/dashboard/posts");
    revalidatePath("/blog");

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    // Check if this is a duplicate slug error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate slug - A post with this slug already exists",
        },
        { status: 409 }
      );
    }
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post!" },
      { status: 500 }
    );
  }
}
