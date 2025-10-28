"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useFetchFeaturedPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";

const categoryColors: Record<string, string> = {
  Lifestyle: "from-green-500 to-emerald-600",
  Technology: "from-blue-500 to-indigo-600",
  Home: "from-amber-500 to-orange-600",
  Travel: "from-purple-500 to-pink-600",
  Fashion: "from-pink-500 to-rose-600",
  Food: "from-red-500 to-orange-600",
};

function formatDate(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "Recently";
  }
}

function getCategoryColor(categories: any[]): string {
  if (!categories || categories.length === 0) return categoryColors.Lifestyle;
  const categoryName = categories[0]?.name || "";
  return categoryColors[categoryName] || categoryColors.Lifestyle;
}

function getCategoryName(categories: any[]): string {
  if (!categories || categories.length === 0) return "Uncategorized";
  return categories[0]?.name || "Uncategorized";
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
    limit: 3,
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/20 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Loading featured stories...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError || !featuredPosts || featuredPosts.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/20 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No featured posts available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const mainPost = featuredPosts[0];
  const sidebarPosts = featuredPosts.slice(1);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/20 via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Featured Stories
            </h2>
            <p className="text-muted-foreground text-lg">
              Handpicked articles you shouldn't miss
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Large featured card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link href={`/post/${mainPost.slug}`} className="group">
              <Card className="h-full hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg relative p-0">
                <div className="relative h-[350px] md:h-[520px] w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
                  <Image
                    src={mainPost.featuredImage || "/placeholder.svg"}
                    alt={mainPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Featured badge */}
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 rounded-full shadow-lg">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      FEATURED
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`inline-block text-xs font-bold bg-gradient-to-r ${getCategoryColor(
                          mainPost.categories
                        )} text-white px-4 py-1.5 rounded-full shadow-lg`}
                      >
                        {getCategoryName(mainPost.categories)}
                      </span>
                      <span className="text-white/80 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {mainPost.readingTime ||
                          calculateReadTime(mainPost.content)}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">
                      {mainPost.title}
                    </h3>

                    <p className="text-white/90 text-sm md:text-base mb-4 line-clamp-2">
                      {mainPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-white/80">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {mainPost.authorName || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(
                            mainPost.publishedAt || mainPost.createdAt
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all duration-300">
                        <span className="font-semibold">Read More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Sidebar featured cards */}
          <div className="flex flex-col gap-6">
            {sidebarPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/post/${post.slug}`} className="group block">
                  <Card className="hover:shadow-xl transition-all duration-500 overflow-hidden border-0 shadow-md hover:translate-y-[-4px] p-0">
                    <div className="relative h-[200px] md:h-[247px] w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
                      <Image
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      <div className="absolute inset-0 p-5 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-block text-xs font-bold bg-gradient-to-r ${getCategoryColor(
                              post.categories
                            )} text-white px-3 py-1 rounded-full shadow-lg`}
                          >
                            {getCategoryName(post.categories)}
                          </span>
                          <span className="text-white/80 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime ||
                              calculateReadTime(post.content)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">
                          {post.title}
                        </h3>

                        <p className="text-white/90 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-white/80">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.authorName || "Anonymous"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                          </div>

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
