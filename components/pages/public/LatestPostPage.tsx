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
import { useFetchPublicBlogPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LatestPostsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "title">(
    "latest"
  );
  const postsPerPage = 12;

  // Fetch posts
  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching,
  } = useFetchPublicBlogPostsQuery({
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
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/20 to-cyan-50/20 dark:from-slate-900 dark:via-teal-950/20 dark:to-cyan-950/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-900 via-cyan-950 to-slate-900 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 py-24 overflow-hidden">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-teal-400 rotate-45"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-cyan-400 rounded-full"></div>
          <div className="absolute top-1/2 right-20 w-24 h-24 border-4 border-teal-300"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-teal-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-300">Latest Posts</span>
          </nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-0 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-teal-500/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fresh Content
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-purple-500/30">
                  <Layers className="w-4 h-4 mr-2" />
                  All Categories
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">Latest </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
                  Articles
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                Discover our newest insights, tutorials, and stories. Stay
                updated with the latest content across all topics and
                categories.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/20 backdrop-blur-sm rounded-xl border border-teal-400/30">
                    <BookOpen className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {totalPosts}
                    </p>
                    <p className="text-sm text-slate-400">
                      Total {totalPosts === 1 ? "Article" : "Articles"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/20 backdrop-blur-sm rounded-xl border border-cyan-400/30">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {sortBy === "latest"
                        ? "Fresh"
                        : sortBy === "popular"
                        ? "Trending"
                        : "A-Z"}
                    </p>
                    <p className="text-sm text-slate-400">Current Filter</p>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Browse All Posts
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Showing{" "}
              {posts.length > 0 ? (currentPage - 1) * postsPerPage + 1 : 0} -{" "}
              {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts}{" "}
              {totalPosts === 1 ? "article" : "articles"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Sort by:</span>
            </div>
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl border-2 border-teal-200 dark:border-teal-900/30">
              <Button
                variant={sortBy === "latest" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSortBy("latest");
                  setCurrentPage(1);
                }}
                disabled={showLoader}
                className={
                  sortBy === "latest"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30"
                    : "hover:bg-teal-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Latest
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSortBy("popular");
                  setCurrentPage(1);
                }}
                disabled={showLoader}
                className={
                  sortBy === "popular"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30"
                    : "hover:bg-teal-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Popular
              </Button>
              <Button
                variant={sortBy === "title" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSortBy("title");
                  setCurrentPage(1);
                }}
                disabled={showLoader}
                className={
                  sortBy === "title"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30"
                    : "hover:bg-teal-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                }
              >
                <Layers className="w-4 h-4 mr-1.5" />
                A-Z
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {showLoader && posts.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
          </div>
        ) : posts.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 * (index % 12) }}
                >
                  <Link
                    href={`/post/${post?.slug || post?.id}`}
                    className="block h-full"
                  >
                    <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 cursor-pointer overflow-hidden group border-2 border-teal-100 dark:border-teal-900/30 hover:border-teal-300 dark:hover:border-teal-700 hover:translate-y-[-10px] bg-white dark:bg-slate-800/50 backdrop-blur-sm p-0">
                      {/* Image Section */}
                      <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 flex-shrink-0">
                        <Image
                          src={post?.featuredImage || "/placeholder.svg"}
                          alt={post?.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-block text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-full shadow-xl backdrop-blur-sm">
                            {post?.categories?.[0]?.name || "General"}
                          </span>
                        </div>

                        {/* Hover overlay content */}
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                          <div className="flex items-center gap-2 text-white text-sm">
                            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {post?.readingTime || "5 min"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-col flex-grow">
                        <CardHeader className="space-y-3 flex-grow pb-4">
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              {post?.publishedAt &&
                                formatDate(post?.publishedAt, true)}
                            </span>
                          </div>

                          <CardTitle className="line-clamp-2 text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 leading-snug">
                            {post?.title}
                          </CardTitle>

                          <CardDescription className="line-clamp-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                            {post?.excerpt}
                          </CardDescription>
                        </CardHeader>

                        {/* Author Section */}
                        <CardContent className="pb-6 mt-auto">
                          <div className="flex items-center justify-between pt-4 border-t-2 border-teal-100 dark:border-teal-900/30">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                                {post?.authorName?.charAt(0) || "A"}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                  {post?.authorName || "Anonymous"}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  Author
                                </span>
                              </div>
                            </div>
                            <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/30 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors duration-300">
                              <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                            </div>
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
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border-2 border-teal-200 dark:border-teal-900/30">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || isFetching}
                    className={`
                      px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                      ${
                        currentPage === 1 || isFetching
                          ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                      }
                    `}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-4 py-3 text-slate-600 dark:text-slate-400 font-semibold text-sm"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(Number(page))}
                        disabled={isFetching}
                        className={`
                          px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                          ${
                            currentPage === page
                              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-110"
                              : "text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400"
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
                      px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                      ${
                        currentPage === totalPages || isFetching
                          ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700/50 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                      }
                    `}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No Articles Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
                We couldn't find any articles at the moment. Check back soon for
                fresh content!
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay during fetching */}
        {isFetching && posts.length > 0 && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border-2 border-teal-200 dark:border-teal-900/30">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Loading posts...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
