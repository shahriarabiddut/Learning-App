"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
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

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Related Articles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((relatedPost) => (
          <Link
            key={relatedPost.id}
            href={`/blog/${relatedPost.slug}`}
            className="group"
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 shadow-md group-hover:translate-y-[-4px]">
              <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900">
                <Image
                  src={relatedPost.featuredImage || "/placeholder.svg"}
                  alt={relatedPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="pt-4">
                {relatedPost.categories &&
                  relatedPost.categories.length > 0 && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {relatedPost.categories[0]?.name || ""}
                    </Badge>
                  )}
                <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {relatedPost.title}
                </h3>
                {relatedPost.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {relatedPost.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{relatedPost.authorName || "Anonymous"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {relatedPost.readingTime || "5 min"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
