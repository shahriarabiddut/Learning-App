"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  User,
  ArrowRight,
  Loader2,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFetchFeaturedPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  authorName?: string;
  publishedAt?: string;
  createdAt: string;
  content?: string;
  readingTime?: string;
  categories?: Array<{ name: string }>;
}

function formatDate(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "Recently";
  }
}

function getCategoryName(categories?: Array<{ name: string }>): string {
  if (!categories || categories.length === 0) return "General";
  return categories[0]?.name || "General";
}

function calculateReadTime(content: string = ""): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export default function FeaturedSection() {
  const {
    data: featuredPosts = [],
    isLoading,
    isError,
  } = useFetchFeaturedPostsQuery({
    limit: 4,
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading featured content...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !featuredPosts || featuredPosts.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              No featured content available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const mainPost = featuredPosts[0];
  const secondaryPosts = featuredPosts.slice(1, 4);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-red-400/10 dark:bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">Editor's Choice</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Learning Paths
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Curated premium content to accelerate your professional growth
          </p>
        </motion.div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large featured card - spans 8 columns */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <Link
              href={`/post/${mainPost.slug}`}
              className="group block h-full"
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-800/50 backdrop-blur-sm relative">
                <div className="relative h-[450px] md:h-[600px] w-full overflow-hidden">
                  <Image
                    src={mainPost.featuredImage || "/placeholder.svg"}
                    alt={mainPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent"></div>

                  {/* Featured badge */}
                  <div className="absolute top-6 left-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-xl font-bold text-sm">
                      <Award className="w-4 h-4" />
                      FEATURED
                    </div>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="inline-block text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full shadow-lg">
                        {getCategoryName(mainPost.categories)}
                      </span>
                      <span className="text-white/90 text-sm flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" />
                        {mainPost.readingTime ||
                          calculateReadTime(mainPost.content)}
                      </span>
                      <span className="text-white/90 text-sm flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <TrendingUp className="w-4 h-4" />
                        Popular
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white line-clamp-2 group-hover:text-emerald-300 transition-colors duration-300">
                      {mainPost.title}
                    </h3>

                    <p className="text-white/90 text-base md:text-lg mb-6 line-clamp-2 leading-relaxed">
                      {mainPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {mainPost.authorName || "Expert Instructor"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(
                            mainPost.publishedAt || mainPost.createdAt
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all duration-300">
                        <span>Start Learning</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Sidebar - spans 4 columns */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {secondaryPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <Link
                  href={`/post/${post.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-500 overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:translate-y-[-4px] bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="relative h-[180px] w-full overflow-hidden">
                      <Image
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full shadow-lg">
                            {getCategoryName(post.categories)}
                          </span>
                          <span className="text-white/80 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime ||
                              calculateReadTime(post.content)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors duration-300">
                          {post.title}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-white/70">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.authorName || "Expert"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
