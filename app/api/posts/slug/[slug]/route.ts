import BlogPost from "@/models/blogPost.model";
import { NextRequest, NextResponse } from "next/server";
import "@/models/users.model";
import "@/models/categories.model";

// GET blog post by slug (public access)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
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

    // Fetch related posts asynchronously (non-blocking)
    const relatedPostsPromise = (async () => {
      try {
        // Build query to find related posts
        const query: any = {
          _id: { $ne: post._id }, // Exclude current post - IMPORTANT FIX
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

    // Wait for related posts to be fetched
    const relatedPosts = await relatedPostsPromise;

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
      comments: post.comments?.filter((comment: any) => comment.approved),
      views: post.views,
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
