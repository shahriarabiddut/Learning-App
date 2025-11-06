"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Flame, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchTrendingPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";

interface TrendingPost {
  id: string;
  slug: string;
  title: string;
  featuredImage?: string;
  views?: number;
  categories?: Array<{ name: string }>;
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

export default function TrendingSection() {
  const { data, isLoading, isError } = useFetchTrendingPostsQuery({
    limit: 4,
    timeRange: "week",
  });

  if (isError) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/30 dark:from-slate-900 dark:via-orange-950/20 dark:to-red-950/20 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-400/10 dark:bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/10 dark:bg-orange-600/5 rounded-full blur-3xl"></div>
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
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full mb-4">
                <Flame className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">Hot This Week</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400">
                  Now
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Most popular content based on views and engagement
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="h-full overflow-hidden border-2 border-slate-200 dark:border-slate-800"
              >
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-16 mb-4" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.map((post: TrendingPost, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/post/${post.slug || post.id}`}>
                  <Card className="h-full hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden group cursor-pointer border-2 border-orange-100 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
                      <Image
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                      {/* Trending rank badge */}
                      <div className="absolute top-4 left-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xl ${
                            index === 0
                              ? "bg-gradient-to-br from-red-500 to-orange-600 text-white"
                              : index === 1
                              ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white"
                              : "bg-gradient-to-br from-amber-500 to-yellow-600 text-white"
                          }`}
                        >
                          #{index + 1}
                        </div>
                      </div>

                      {/* Flame indicator */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-full">
                          <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 fill-current" />
                        </div>
                      </div>

                      {/* Category badge */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                          {post.categories?.[0]?.name || "General"}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 min-h-[3.5rem]">
                        {post.title}
                      </h3>

                      <div className="flex items-center justify-between pt-4 border-t border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="font-semibold">
                            {formatViews(post.views || 0)} views
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center text-slate-600 dark:text-slate-400 py-20">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              No trending content available at the moment.
            </p>
          </div>
        )}

        {/* Additional trending info */}
        {!isLoading && data && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-orange-900/30 px-6 py-3 rounded-2xl shadow-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                Updated every hour based on real-time engagement
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
