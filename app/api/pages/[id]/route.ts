import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPage from "@/models/blogPage.model";
import Comment from "@/models/comment.model"; // Import Comment model
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import "@/models/categories.model";

// GET a single blog page
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_PAGES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const page = await BlogPage.findById(params.id)
      .populate({
        path: "author",
        select: "name email",
      })
      .lean();

    if (!page) {
      return NextResponse.json(
        { error: "Blog page not found" },
        { status: 404 }
      );
    }

    const transformedPage = {
      id: params.id,
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt,
      content: page.content,
      contentBlocks: page.contentBlocks,
      contentType: page.contentType,
      author: page.author?._id?.toString(),
      authorName: page.author?.name,
      tags: page.tags,
      featuredImage: page.featuredImage,
      status: page.status,
      isActive: page.isActive,
      isFeatured: page.isFeatured,
      publishedAt: page.publishedAt,
      seo: page.seo,
      views: page.views,
      readingTime: page.readingTime,
      createdBy: page.createdBy,
      updatedBy: page.updatedBy,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    };

    return NextResponse.json(transformedPage);
  } catch (error) {
    console.error("Failed to fetch blog page:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog page" },
      { status: 500 }
    );
  }
}

// PATCH - Update a blog page
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_PAGES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;
    const body = await request.json();

    // Last Check
    const pageData = await BlogPage.findById(id);

    if (!pageData) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    const superAdmin = isSuperAdmin(user);

    // SuperAdmin Can Update Demo Data, others Can't
    if (pageData.demo && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be updated!" },
        { status: 403 }
      );
    }

    const updatedPage = await BlogPage.findByIdAndUpdate(
      id,
      { ...body, updatedBy: user.id },
      { new: true, runValidators: true }
    )
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name",
      });

    if (!updatedPage) {
      return NextResponse.json(
        { error: "Blog page not found" },
        { status: 404 }
      );
    }

    revalidatePath("/dashboard/pages");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPage.slug}`);

    return NextResponse.json(updatedPage);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate slug - A page with this slug already exists",
        },
        { status: 409 }
      );
    }
    console.error("Page update error:", error);
    return NextResponse.json(
      { error: "Failed to update blog page" },
      { status: 500 }
    );
  }
}

// DELETE a blog page
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_PAGES,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;

    // Last Check
    const pageData = await BlogPage.findById(id);

    if (!pageData) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const superAdmin = isSuperAdmin(user);

    // SuperAdmin Can Delete Demo Data, others Can't
    if (pageData.demo && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be deleted!" },
        { status: 403 }
      );
    }

    // Delete all comments associated with this page
    await Comment.deleteMany({ page: id });

    const deletedPage = await BlogPage.findByIdAndDelete(id);

    if (!deletedPage) {
      return NextResponse.json(
        { error: "Blog page not found" },
        { status: 404 }
      );
    }

    revalidatePath("/blog");
    revalidatePath("/dashboard/pages");

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Page deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog page" },
      { status: 500 }
    );
  }
}
