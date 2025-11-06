"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetCategoryByIdQuery } from "@/lib/redux-features/categories/categoriesApi";
import { useFetchPublicBlogPostsQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import {
  BookOpen,
  Clock,
  Eye,
  User,
  Calendar,
  ArrowRight,
  Loader2,
  Filter,
  Grid3x3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface CategoryPageProps {
  categoryId: string;
}

export default function SingleCategoryPage({ categoryId }: CategoryPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "title">(
    "latest"
  );
  const postsPerPage = 12;

  // Fetch category details
  const { data: category, isLoading: categoryLoading } =
    useGetCategoryByIdQuery(categoryId);

  // Fetch posts for this category
  const { data: postsData, isLoading: postsLoading } =
    useFetchPublicBlogPostsQuery({
      page: currentPage,
      limit: postsPerPage,
      sortBy:
        sortBy === "latest"
          ? "createdAt-desc"
          : sortBy === "popular"
          ? "views-desc"
          : "title-asc",
      // Add category filter in your API
    });

  const posts = postsData?.data || [];
  const totalPosts = postsData?.total || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Calculate reading time
  const calculateReadTime = (content: string = ""): string => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!category) {
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
        {category.imageUrl && (
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
            <span className="text-slate-300">{category.name}</span>
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
                {category.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Category Name */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {category.name}
              </h1>

              {/* Description */}
              {category.description && (
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
                    <p className="text-sm text-slate-400">Courses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-500/20 backdrop-blur-sm rounded-lg">
                    <User className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">12+</p>
                    <p className="text-sm text-slate-400">Instructors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/20 backdrop-blur-sm rounded-lg">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">~5h</p>
                    <p className="text-sm text-slate-400">Avg. Duration</p>
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
              All Courses
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {totalPosts} {totalPosts === 1 ? "course" : "courses"} available
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <div className="flex gap-2">
              <Button
                variant={sortBy === "latest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("latest")}
                className={
                  sortBy === "latest"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : ""
                }
              >
                Latest
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popular")}
                className={
                  sortBy === "popular"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : ""
                }
              >
                Popular
              </Button>
              <Button
                variant={sortBy === "title" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("title")}
                className={
                  sortBy === "title"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : ""
                }
              >
                A-Z
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {postsLoading ? (
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
                  transition={{ duration: 0.5, delay: 0.1 * (index % 9) }}
                >
                  <Link href={`/post/${post.slug || post.id}`}>
                    <Card className="h-full group cursor-pointer border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50">
                      {/* Image */}
                      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                        <Image
                          src={post.featuredImage || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                        {/* Reading time */}
                        <div className="absolute top-4 right-4">
                          <span className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                            <Clock className="w-3 h-3" />
                            {post.readingTime ||
                              calculateReadTime(post.content)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Author and Date */}
                        <div className="flex items-center justify-between pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {post.authorName?.charAt(0) || "A"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {post.authorName || "Anonymous"}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(post.publishedAt || post.createdAt)}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-emerald-200 dark:border-emerald-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            : "border-emerald-200 dark:border-emerald-800"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2">...</span>}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-emerald-200 dark:border-emerald-800"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No courses yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Check back soon for new content in this category
              </p>
              <Link href="/categories">
                <Button variant="outline">Browse Other Categories</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
