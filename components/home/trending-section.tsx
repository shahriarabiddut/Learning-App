"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchTrendingPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";

// Helper function to format view counts
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
    return null; // Optionally render nothing or a minimal error state
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Trending Now
            </h2>
          </div>
          <p className="text-muted-foreground">
            Most viewed articles this week
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-full overflow-hidden p-0">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-20 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug || post.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer p-0">
                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                      <Image
                        src={post.featuredImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                        #{index + 1}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {post.categories?.[0]?.name || "Uncategorized"}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-3 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatViews(post.views || 0)} views
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center text-muted-foreground py-12">
            No trending posts available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
