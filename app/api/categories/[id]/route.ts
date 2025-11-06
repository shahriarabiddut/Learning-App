import {
  AuthenticatedorNot,
  includeIfPermitted,
  isSuperAdmin,
  populateIfPermitted,
} from "@/services/dbAndPermission.service";
import { PERMISSIONS } from "@/lib/middle/permissions";
import Category from "@/models/categories.model";
import { categorySchema } from "@/schemas/categorySchema";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// GET a single category
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_CATEGORIES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    // Build the base query
    const baseQuery = Category.findById(params.id);
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
    const category = await baseQuery;
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Transform the single category document
    const transformedCategory = {
      id: params.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      parentCategory: category.parentCategory
        ? category.parentCategory.id || category.parentCategory._id
        : null,
      parent: category.parentCategory ? category.parentCategory.name : null,
      isActive: category.isActive,
      featured: category.featured,
      ...includeIfPermitted(user, PERMISSIONS.ADMIN_CONTROLLED_DATA, {
        addedBy:
          category.addedBy?._id || category.addedBy?.id || category.addedBy,
        userName: category.addedBy?.name,
        updatedBy: category.updatedBy,
        updatedAt: category.updatedAt,
      }),
      createdAt: category.createdAt,
    };

    return NextResponse.json(transformedCategory);
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.UPDATE_CATEGORIES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;

    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // Last Check
    const itemData = await Category.findById(id);
    // Doesnot Exist
    if (!itemData) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
    // Doesnot Exist
    if (itemData.addedBy.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Not Enough Access!" },
        { status: 404 }
      );
    }
    // SuperAdmin Can Update Demo Data , others Can't
    if (itemData.demo) {
      const superAdmin = isSuperAdmin(user);
      if (!superAdmin) {
        return NextResponse.json(
          { error: "Demo data can't be updated!" },
          { status: 403 }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...validation.data, updatedBy: user.id },
      {
        new: true,
      }
    );
    // console.log("Updated Category:", updatedCategory);
    if (!updatedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    revalidatePath("/dashboard/categories");
    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate Category Not Allowed!",
          // "Duplicate Category Not Allowed - A category with this name already ",
        },
        { status: 409 } // 409 Conflict is appropriate for duplicate resource requests
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_CATEGORIES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;
    // Last Check
    const itemData = await Category.findById(id);
    // Doesnot Exist
    if (!itemData) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
    if (itemData.demo) {
      const superAdmin = isSuperAdmin(user);
      // SuperAdmin Can Delete Demo Data , others Can't
      if (!superAdmin) {
        return NextResponse.json(
          { error: "Demo data can't be deleted!" },
          { status: 403 }
        );
      }
    }
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    revalidatePath("/categories");
    revalidatePath("/dashboard/categories");

    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
