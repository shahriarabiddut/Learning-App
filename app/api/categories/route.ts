import { PERMISSIONS } from "@/lib/middle/permissions";
import Category from "@/models/categories.model";
import "@/models/users.model";
import { categorySchema } from "@/schemas/categorySchema";
import {
  AuthenticatedorNot,
  includeIfPermitted,
  populateIfPermitted,
} from "@/services/dbAndPermission.service";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_CATEGORIES,
  });
  if (user instanceof NextResponse) return user;

  try {
    let query: any = {};

    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt-desc";

    // Handle sorting
    const [field, order] = sortBy.split("-");
    const sort: Record<string, 1 | -1> = {
      [field]: order === "asc" ? 1 : -1,
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      page = 1;
    }

    // Build the base query
    const baseQuery = Category.find(query)
      .populate({
        path: "parentCategory",
        select: "name",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort);
    // Conditionally populate based on permissions
    populateIfPermitted(baseQuery, user, PERMISSIONS.ADMIN_CONTROLLED_DATA, [
      {
        path: "updatedBy",
        select: "name",
      },
      {
        path: "addedBy",
        select: "name",
      },
    ]);
    const [rawData, total] = await Promise.all([
      baseQuery,
      Category.countDocuments(query),
    ]);

    const data = await Promise.all(
      rawData.map(async (doc) => {
        const obj = doc.toObject();

        return {
          id: obj._id,
          name: obj.name,
          description: obj.description,
          imageUrl: obj.imageUrl,
          parentCategory: obj.parentCategory?._id?.toString() || null,
          parent: obj.parentCategory?.name || null,
          isActive: obj.isActive,
          ...includeIfPermitted(user, PERMISSIONS.ADMIN_CONTROLLED_DATA, {
            addedBy: obj.addedBy?._id || obj.addedBy?.id || obj.addedBy,
            userName: obj.addedBy?.name,
            updatedBy: obj.updatedBy,
            updatedAt: obj.updatedAt,
          }),
          createdAt: obj.createdAt,
          featured: obj.featured,
        };
      })
    );

    return NextResponse.json({
      data,
      page,
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

export async function POST(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.ADD_CATEGORIES,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }
    const { parentCategory, ...rest } = validation.data;
    const newCategory = await Category.create({
      ...rest,
      parentCategory:
        !parentCategory || parentCategory === "0" ? null : parentCategory,
      addedBy: user.id,
    });

    revalidatePath("/dashboard/categories");
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    // Check if this is a duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate Category Not Allowed!",
          // "Duplicate Category Not Allowed ,
        },
        { status: 409 } // 409 Conflict is appropriate for duplicate resource requests
      );
    }
    return NextResponse.json(
      { error: "Failed to create Category!" },
      { status: 500 }
    );
  }
}
