import {
  AuthenticatedorNot,
  isSuperAdmin,
} from "@/services/dbAndPermission.service";
import { PERMISSIONS } from "@/lib/middle/permissions";
import BlogPost from "@/models/blogPost.model";
import Comment from "@/models/comment.model"; // Import Comment model
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import "@/models/categories.model";

// GET a single blog post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.VIEW_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const post = await BlogPost.findById(params.id)
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name description",
      })
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const transformedPost = {
      id: params.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentBlocks: post.contentBlocks,
      contentType: post.contentType,
      author: post.author?._id?.toString(),
      authorName: post.author?.name,
      categories: post.categories?.map((cat: any) => ({
        id: cat._id?.toString(),
        name: cat.name,
        description: cat.description,
      })),
      tags: post.tags,
      featuredImage: post.featuredImage,
      status: post.status,
      isActive: post.isActive,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt,
      seo: post.seo,
      allowComments: post.allowComments,
      commentsCount: post.commentsCount,
      views: post.views,
      readingTime: post.readingTime,
      createdBy: post.createdBy,
      updatedBy: post.updatedBy,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

// PATCH - Update a blog post
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.MANAGE_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;
    const body = await request.json();

    // Last Check
    const postData = await BlogPost.findById(id);

    if (!postData) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && postData.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to edit this post" },
        { status: 403 }
      );
    }

    // SuperAdmin Can Update Demo Data, others Can't
    if (postData.demo && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be updated!" },
        { status: 403 }
      );
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
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

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    revalidatePath("/dashboard/posts");
    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.slug}`);

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate slug - A post with this slug already exists",
        },
        { status: 409 }
      );
    }
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE a blog post
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const user = await AuthenticatedorNot(request, {
    checkPermission: true,
    Permission: PERMISSIONS.DELETE_POSTS,
    checkValidId: true,
    IDtoCheck: params.id,
  });
  if (user instanceof NextResponse) return user;

  try {
    const id = params.id;

    // Last Check
    const postData = await BlogPost.findById(id);

    if (!postData) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user owns the post or is super admin
    const superAdmin = isSuperAdmin(user);
    if (!superAdmin && postData.author?.toString() !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    // SuperAdmin Can Delete Demo Data, others Can't
    if (postData.demo && !superAdmin) {
      return NextResponse.json(
        { error: "Demo data can't be deleted!" },
        { status: 403 }
      );
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: id });

    const deletedPost = await BlogPost.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    revalidatePath("/blog");
    revalidatePath("/dashboard/posts");

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Post deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
