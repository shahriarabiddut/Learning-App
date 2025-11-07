"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/helper/clientHelperfunc";
import { useFetchPublicBlogPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LatestPosts() {
  const { data, isLoading, isError } = useFetchPublicBlogPostsQuery({
    page: 1,
    limit: 6,
    sortBy: "createdAt-desc",
  });

  if (isError) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            Failed to load articles. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full mb-4">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-semibold">Fresh Content</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                Latest{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                  Articles
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Recently published insights and tutorials
              </p>
            </div>
            <Link href="/posts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 cursor-pointer"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden border-2 border-slate-200 dark:border-slate-800 p-0"
              >
                <Skeleton className="h-56 w-full" />
                <CardHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((post, index) => (
              <motion.div
                key={post?.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Link
                  href={`/post/${post?.slug || post?.id}`}
                  className="block h-full"
                >
                  <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer overflow-hidden group border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50 backdrop-blur-sm p-0">
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex-shrink-0">
                      <Image
                        src={post?.featuredImage || "/placeholder.svg"}
                        alt={post?.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className="inline-block text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                          {post?.categories?.[0]?.name || "General"}
                        </span>
                      </div>
                    </div>

                    {/* Content Section - Grows to fill space */}
                    <div className="flex flex-col flex-grow">
                      <CardHeader className="space-y-3 flex-grow">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {post?.readingTime || "5 min"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {post?.publishedAt &&
                              formatDate(post?.publishedAt, true)}
                          </span>
                        </div>

                        <CardTitle className="line-clamp-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                          {post?.title}
                        </CardTitle>

                        <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                          {post?.excerpt}
                        </CardDescription>
                      </CardHeader>

                      {/* Author Section - Always at bottom */}
                      <CardContent className="pb-6 mt-auto">
                        <div className="flex items-center justify-between pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {post?.authorName?.charAt(0) || "A"}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {post?.authorName || "Anonymous"}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="text-center text-slate-600 dark:text-slate-400 py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              No articles found. Check back soon for new content!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
