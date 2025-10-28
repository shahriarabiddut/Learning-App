// app/blog/[slug]/BlogPostView.tsx (or your file location)
"use client";

import Footer from "@/components/Footer";
import Header from "@/components/home/header";
import RichTextDisplay from "@/components/shared/RichTextDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIncrementPostViewsMutation } from "@/lib/redux-features/blogPost/blogPostApi";
import { IBlogPost } from "@/models/blogPost.model";
import { Calendar, Clock, Eye, Share2, Tag, User } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";
import { CommentsSection } from "../blogpost/CommentSection";
import { RelatedPosts } from "../blogpost/RelatedPosts";

interface BlogPostViewProps {
  initialPost: IBlogPost & {
    relatedPosts?: Array<{
      id: string;
      title: string;
      slug: string;
      excerpt?: string;
      authorName?: string;
      categories?: Array<{ id: string; name: string; slug: string }>;
      tags?: string[];
      featuredImage?: string;
      publishedAt?: string;
      readingTime?: string;
      views?: number;
      createdAt?: string;
    }>;
  };
}

function formatFullDate(date: string | Date | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export function BlogPostView({ initialPost }: BlogPostViewProps) {
  const post = initialPost;
  const relatedPosts = post.relatedPosts || [];

  // Increment views
  const [incrementViews] = useIncrementPostViewsMutation();

  // Increment view count when post loads
  useEffect(() => {
    if (post.id) {
      incrementViews(post.id);
    }
  }, [post.id, incrementViews]);

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const categoryColors: Record<string, string> = {
    Lifestyle: "from-green-500 to-emerald-600",
    Technology: "from-blue-500 to-indigo-600",
    Home: "from-amber-500 to-orange-600",
    Travel: "from-purple-500 to-pink-600",
    Fashion: "from-pink-500 to-rose-600",
    Food: "from-red-500 to-orange-600",
  };

  const getCategoryName = () => {
    if (!post.categories || post.categories.length === 0)
      return "Uncategorized";
    return typeof post.categories[0] === "string"
      ? post.categories[0]
      : post.categories[0]?.name || "Uncategorized";
  };

  const getCategoryColor = () => {
    const categoryName = getCategoryName();
    return categoryColors[categoryName] || categoryColors.Lifestyle;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Image */}
        {post.featuredImage && (
          <div className="relative h-96 w-full rounded-xl overflow-hidden mb-8 shadow-xl">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge
              className={`text-sm font-semibold bg-gradient-to-r ${getCategoryColor()} text-white border-0`}
            >
              {getCategoryName()}
            </Badge>

            {post.isFeatured && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </Badge>
            )}

            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readingTime || "5 min read"}
            </span>

            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views || 0} views
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-6 italic">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <User className="w-4 h-4" />
                  {post.authorName || "Anonymous"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatFullDate(post.publishedAt || post.createdAt)}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary/10 bg-transparent"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12 text-foreground dark:prose-invert">
          {post.contentType === "blocks" && post.contentBlocks ? (
            <RichTextDisplay content={JSON.stringify(post.contentBlocks)} />
          ) : (
            <RichTextDisplay content={post.content || ""} />
          )}
        </div>

        {/* Author Card */}
        {post.authorName && (
          <Card className="mb-12 bg-secondary/30 border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10">
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">
                    {post.authorName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Passionate writer sharing insights and stories
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />
        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          comments={post.comments}
          allowComments={post.allowComments}
        />
      </article>

      <Footer />
    </div>
  );
}
