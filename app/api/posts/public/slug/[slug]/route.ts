import BlogPost from "@/models/blogPost.model";
import Comment from "@/models/comment.model";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import "@/models/categories.model";
import connectDB from "@/lib/connectDB";

// GET blog post by slug (public access)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  await connectDB();
  try {
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const relatedLimit = parseInt(searchParams.get("relatedLimit") || "4");

    const post = await BlogPost.findOne({
      slug: params.slug,
      status: "published", // Only published posts
      isActive: true,
    })
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "categories",
        select: "name description imageUrl slug",
      })
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Increment views atomically - async/non-blocking
    const viewIncrementPromise = (async () => {
      try {
        const updatedPost = await BlogPost.findByIdAndUpdate(
          post.id || post._id,
          { $inc: { views: 1 } },
          { new: true, select: "views" }
        ).lean();
        return updatedPost;
      } catch (error) {
        console.error("Failed to increment views:", error);
        return null;
      }
    })();

    // Fetch approved comments asynchronously
    const commentsPromise = (async () => {
      try {
        const comments = await Comment.find({
          post: post._id,
          status: "approved",
          isActive: true,
        })
          .sort({ createdAt: -1 })
          .lean();

        return comments.map((comment) => ({
          id: comment._id?.toString(),
          name: comment.name,
          email: comment.email,
          body: comment.body,
          status: comment.status,
          parentComment: comment.parentComment?.toString() || null,
          createdAt: comment.createdAt,
        }));
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        return [];
      }
    })();

    // Fetch related posts asynchronously
    const relatedPostsPromise = (async () => {
      try {
        // Build query to find related posts
        const query: any = {
          _id: { $ne: post._id }, // Exclude current post
          slug: { $ne: post.slug }, // Extra safety to exclude current post by slug
          status: "published",
          isActive: true,
        };

        // Find posts with matching categories or tags
        const matchConditions: any[] = [];

        if (post.categories && post.categories.length > 0) {
          matchConditions.push({
            categories: { $in: post.categories.map((cat: any) => cat._id) },
          });
        }

        if (post.tags && post.tags.length > 0) {
          matchConditions.push({
            tags: { $in: post.tags },
          });
        }

        if (matchConditions.length > 0) {
          query.$or = matchConditions;
        }

        const relatedPosts = await BlogPost.find(query)
          .populate({
            path: "author",
            select: "name email",
          })
          .populate({
            path: "categories",
            select: "name slug",
          })
          .sort({ publishedAt: -1 })
          .limit(relatedLimit)
          .lean();

        return relatedPosts.map((relatedPost) => ({
          id: relatedPost._id?.toString(),
          title: relatedPost.title,
          slug: relatedPost.slug,
          excerpt: relatedPost.excerpt,
          author: relatedPost.author?._id?.toString(),
          authorName: relatedPost.author?.name || relatedPost.authorName,
          categories:
            relatedPost.categories?.map((cat: any) => ({
              id: cat._id?.toString(),
              name: cat.name,
              slug: cat.slug,
            })) || [],
          tags: relatedPost.tags,
          featuredImage: relatedPost.featuredImage,
          publishedAt: relatedPost.publishedAt,
          readingTime: relatedPost.readingTime,
          views: relatedPost.views,
          createdAt: relatedPost.createdAt,
        }));
      } catch (error) {
        console.error("Failed to fetch related posts:", error);
        return [];
      }
    })();

    // Wait for all operations to complete
    const [updatedViewCount, comments, relatedPosts] = await Promise.all([
      viewIncrementPromise,
      commentsPromise,
      relatedPostsPromise,
    ]);

    // Use the updated view count if increment was performed
    const currentViews = updatedViewCount?.views ?? post.views;

    const transformedPost = {
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentBlocks: post.contentBlocks,
      contentType: post.contentType,
      author: post.author?._id?.toString(),
      authorName: post.author?.name || post.authorName,
      categories: post.categories?.map((cat: any) => ({
        id: cat._id?.toString(),
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        slug: cat.slug,
      })),
      tags: post.tags,
      featuredImage: post.featuredImage,
      status: post.status,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt,
      seo: post.seo,
      allowComments: post.allowComments,
      comments, // Approved comments from Comment collection
      commentsCount: post.commentsCount, // Total comments count
      views: currentViews, // Return the incremented view count
      readingTime: post.readingTime,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      relatedPosts, // Include related posts in response
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Failed to fetch blog post by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}
