"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/helper/clientHelperfunc";
import { useFetchCategoryPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Grid3x3,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CategoryPageProps {
  categoryId: string;
}

export default function SingleCategoryPage({ categoryId }: CategoryPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "title">(
    "latest"
  );
  const postsPerPage = 12;

  // Fetch posts for this category (includes category info in response)
  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching,
  } = useFetchCategoryPostsQuery({
    categoryId,
    page: currentPage,
    limit: postsPerPage,
    sortBy:
      sortBy === "latest"
        ? "createdAt-desc"
        : sortBy === "popular"
        ? "views-desc"
        : "title-asc",
  });

  const posts = postsData?.data || [];
  const totalPosts = postsData?.total || 0;
  const totalPages = postsData?.totalPages || 0;
  const category = postsData?.category || null;

  const showLoader = postsLoading;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");

    if (totalPages === 0) return [];
    if (totalPages === 1) return [1];
    return [1, ...range, totalPages].filter((v, i, a) => a.indexOf(v) === i);
  };

  if (postsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!category && !postsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Category Not Found
          </h1>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
        </div>

        {/* Background Image */}
        {category?.imageUrl && (
          <>
            <div className="absolute inset-0">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover opacity-20"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
          </>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/categories"
              className="hover:text-emerald-400 transition-colors"
            >
              Categories
            </Link>
            <span>/</span>
            <span className="text-slate-300 capitalize">
              {category?.name || "Category"}
            </span>
          </nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Badge */}
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Category
                </Badge>
                {category?.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Category Name */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight capitalize">
                {category?.name || "Category"}
              </h1>

              {/* Description */}
              {category?.description && (
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  {category.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-lg">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {totalPosts}
                    </p>
                    <p className="text-sm text-slate-400">
                      {totalPosts === 1 ? "Lesson" : "Lessons"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter and Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              All Lessons
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {totalPosts} {totalPosts === 1 ? "lesson" : "lessons"} available
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg border-2 border-emerald-200 dark:border-emerald-900/30">
              <Button
                variant={sortBy === "latest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("latest")}
                disabled={showLoader}
                className={
                  sortBy === "latest"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "hover:bg-emerald-50 dark:hover:bg-slate-700/50"
                }
              >
                Latest
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("popular")}
                disabled={showLoader}
                className={
                  sortBy === "popular"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "hover:bg-emerald-50 dark:hover:bg-slate-700/50"
                }
              >
                Popular
              </Button>
              <Button
                variant={sortBy === "title" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("title")}
                disabled={showLoader}
                className={
                  sortBy === "title"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "hover:bg-emerald-50 dark:hover:bg-slate-700/50"
                }
              >
                A-Z
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {showLoader && posts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : posts.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * (index % 12) }}
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
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-emerald-900/30">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || isFetching}
                    className={`
                      px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                      ${
                        currentPage === 1 || isFetching
                          ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                      }
                    `}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-semibold text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(Number(page))}
                        disabled={isFetching}
                        className={`
                          px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                          ${
                            currentPage === page
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                              : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }
                          ${isFetching ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || isFetching}
                    className={`
                      px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                      ${
                        currentPage === totalPages || isFetching
                          ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Lessons Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Check back soon for new content in this category
              </p>
              <Link href="/categories">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Browse Other Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay during fetching */}
        {isFetching && posts.length > 0 && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
