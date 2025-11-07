"use client";

import Footer from "@/components/Footer";
import Header from "@/components/shared/PublicHeader";
import RichTextDisplay from "@/components/shared/RichTextDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IBlogPost } from "@/models/blogPost.model";
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Tag,
  User,
  BookmarkPlus,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentsSection } from "../../blogpost/CommentSection";
import { RelatedPosts } from "../../blogpost/RelatedPosts";
import { getCategoryName } from "@/lib/helper/clientHelperfunc";

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
  const relatedPosts = post?.relatedPosts || [];
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = post?.title;
    const text = post?.excerpt || "";

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`,
        "_blank"
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`,
        "_blank"
      );
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      setShowShareMenu(false);
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
    );
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 pt-24 pb-12 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-emerald-400 transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-slate-300">{post?.title}</span>
          </nav>

          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-4 py-1.5 text-sm font-semibold">
              {getCategoryName(post?.categories)}
            </Badge>
            {post?.isFeatured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-4 py-1.5 text-sm font-semibold flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {post?.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>
                {formatFullDate(post?.publishedAt || post?.createdAt)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>{post?.readingTime || "5 min read"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>{post?.views || 0} views</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-8">
            <div className="relative">
              <Button
                onClick={() => handleShare()}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              {showShareMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 min-w-[200px]">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-medium">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    <span className="text-sm font-medium">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">Copy Link</span>
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={handleBookmark}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
            >
              {isBookmarked ? (
                <Bookmark className="w-4 h-4 mr-2 fill-current" />
              ) : (
                <BookmarkPlus className="w-4 h-4 mr-2" />
              )}
              {isBookmarked ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Image */}
          {post?.featuredImage && (
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden mb-12 shadow-2xl border-4 border-white dark:border-slate-800">
              <Image
                src={post?.featuredImage}
                alt={post?.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Tags */}
          {post?.tags && post?.tags.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {post?.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-16 text-slate-700 dark:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-emerald-600 dark:prose-code:text-emerald-400">
            {post?.contentType === "blocks" && post?.contentBlocks ? (
              <RichTextDisplay content={JSON.stringify(post?.contentBlocks)} />
            ) : (
              <RichTextDisplay content={post?.content || ""} />
            )}
          </div>

          {/* Author Card */}
          {post?.authorName && (
            <Card className="mb-16 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 flex-shrink-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                      {post?.authorName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                      {post?.authorName}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Passionate educator sharing knowledge and insights to help
                      learners grow
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/author/${post?.author}`}>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        Follow
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />

          {/* Comments Section */}
          <CommentsSection
            postId={post?.id}
            comments={post?.comments}
            allowComments={post?.allowComments}
          />
        </div>
      </article>
    </>
  );
}
