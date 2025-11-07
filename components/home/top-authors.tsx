"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchTopAuthorsQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TopAuthors() {
  const { data, isLoading, isError } = useFetchTopAuthorsQuery({
    limit: 4,
    sortBy: "views",
  });

  if (isError) {
    return null;
  }

  return (
    <section
      id="authors"
      className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-teal-950/30 dark:to-emerald-950/30 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-red-400/10 dark:bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-emerald-100 dark:from-cyan-900/30 dark:to-emerald-900/30 text-cyan-700 dark:text-cyan-400 px-4 py-2 rounded-full mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">Expert Instructors</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Meet Our Top{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Educators
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Learn from industry leaders and passionate instructors
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden border-2 border-slate-200 dark:border-slate-800"
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="w-28 h-28 rounded-full" />
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
            {data?.map((author, index) => (
              <motion.div
                key={author.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group relative overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50 backdrop-blur-sm h-full">
                  {/* Rank badge */}
                  {author.rank <= 3 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-xl ${
                          author.rank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900"
                            : author.rank === 2
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
                            : "bg-gradient-to-br from-amber-600 to-orange-700 text-amber-100"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

                  <CardHeader className="text-center pt-8">
                    <div className="flex justify-center mb-6 relative">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                          <Image
                            src={author.image || "/placeholder.svg"}
                            alt={author.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        {/* Status indicator */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-700 rounded-full"></div>
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {author.name}
                    </CardTitle>

                    <CardDescription className="text-sm line-clamp-2 h-10 text-slate-600 dark:text-slate-400">
                      {author.bio}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center pb-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl">
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            {author.posts}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Lessons
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            {author.followers >= 1000
                              ? `${(author.followers / 1000).toFixed(1)}K`
                              : author.followers}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Students
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/author/${author.id}`}
                      className="mt-auto block"
                    >
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
                        <span>View Profile</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center text-slate-600 dark:text-slate-400 py-20">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              No featured instructors available at the moment.
            </p>
          </div>
        )}

        {/* CTA Section */}
        {!isLoading && data && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/authors">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 px-8 py-4 rounded-2xl font-semibold shadow-xl transition-all duration-300"
              >
                View All Instructors
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
