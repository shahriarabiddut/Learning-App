"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, User, Calendar, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RelatedPost {
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
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

function formatDate(date: string | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Related Articles
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Continue reading with these related posts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((relatedPost, index) => (
          <Link
            key={relatedPost.id}
            href={`/blog/${relatedPost.slug}`}
            className="group block"
          >
            <Card className="h-full hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50 backdrop-blur-sm">
              {/* Image Section */}
              <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                <Image
                  src={relatedPost.featuredImage || "/placeholder.svg"}
                  alt={relatedPost.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  {relatedPost.categories &&
                    relatedPost.categories.length > 0 && (
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
                        {relatedPost.categories[0]?.name || ""}
                      </Badge>
                    )}
                </div>

                {/* Reading Stats */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-white text-sm">
                  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {relatedPost.readingTime || "5 min"}
                  </span>
                  {relatedPost.views !== undefined && (
                    <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Eye className="w-3 h-3" />
                      {relatedPost.views}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 leading-tight">
                  {relatedPost.title}
                </h3>

                {relatedPost.excerpt && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {relatedPost.excerpt}
                  </p>
                )}

                {/* Author and Date */}
                <div className="flex items-center justify-between pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {relatedPost.authorName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {relatedPost.authorName || "Anonymous"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(
                          relatedPost.publishedAt || relatedPost.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300" />
                </div>

                {/* Tags */}
                {relatedPost.tags && relatedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {relatedPost.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {relatedPost.tags.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                        +{relatedPost.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </Card>
          </Link>
        ))}
      </div>

      {/* View More Button */}
      {posts.length >= 2 && (
        <div className="text-center mt-8">
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Explore More Articles
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
