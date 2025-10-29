"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useFetchTopAuthorsQuery } from "@/lib/redux-features/blogPost/blogPostApi";

export default function TopAuthors() {
  const { data, isLoading, isError } = useFetchTopAuthorsQuery({
    limit: 4,
    sortBy: "views",
  });

  if (isError) {
    return null; // Optionally render nothing or a minimal error state
  }

  return (
    <section id="authors" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Authors
            </h2>
          </div>
          <p className="text-muted-foreground">
            Meet the talented writers behind our best content
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.map((author) => (
              <Card
                key={author?.id}
                className="hover:shadow-lg transition-shadow relative"
              >
                {author?.rank <= 3 && (
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        author?.rank === 1
                          ? "bg-yellow-400 text-yellow-900"
                          : author?.rank === 2
                          ? "bg-gray-300 text-gray-700"
                          : "bg-amber-600 text-amber-100"
                      }`}
                    >
                      #{author?.rank}
                    </div>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                      <Image
                        src={author?.image || "/placeholder.svg"}
                        alt={author?.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <CardTitle className="text-foreground">
                    {author?.name}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2 h-10">
                    {author?.bio}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {author?.posts}
                      </p>
                      <p className="text-xs text-muted-foreground">Articles</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {author?.followers?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Followers
                      </p>
                    </div>
                  </div>
                  <Link href={`/author/${author?.id}`} className="mt-auto">
                    <Button
                      variant="outline"
                      className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent"
                    >
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center text-muted-foreground py-12">
            No featured authors available at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
