import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import mongoose from "mongoose";

// BULK ASSIGN CATEGORY
export async function PATCH(request: NextRequest) {
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
  });
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const { ids, categoryId } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { error: "'ids' must be an array" },
        { status: 400 }
      );
    }

    if (ids.some((id) => typeof id !== "string" || id.trim() === "")) {
      return NextResponse.json(
        { error: "All post IDs must be non-empty strings" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "Valid category ID is required" },
        { status: 400 }
      );
    }

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 }
      );
    }

    const superAdmin = isSuperAdmin(user);
    const posts = await BlogPost.find({ _id: { $in: ids } });

    // Check if any post is demo data
    const hasDemoItem = posts.some((post) => post.demo);
    if (hasDemoItem && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be modified!" },
        { status: 403 }
      );
    }

    // Check if user owns all posts or is super admin
    if (!superAdmin) {
      const unauthorizedPost = posts.find(
        (post) => post.author?.toString() !== user.id
      );
      if (unauthorizedPost) {
        return NextResponse.json(
          { error: "You don't have permission to modify some of these posts" },
          { status: 403 }
        );
      }
    }

    // Add category to posts (avoiding duplicates)
    const result = await BlogPost.updateMany(
      { _id: { $in: ids } },
      {
        $addToSet: { categories: categoryId },
        updatedBy: user.id,
      }
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk assign category error:", error);
    return NextResponse.json(
      { error: "Failed to assign category" },
      { status: 500 }
    );
  }
}
