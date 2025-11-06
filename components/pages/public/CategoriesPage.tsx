"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import {
  Search,
  Grid3x3,
  BookOpen,
  Filter,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: string | null;
  isActive: boolean;
  featured: boolean;
  postCount?: number;
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "posts" | "featured">("name");

  const { data: categoriesData, isLoading } = useFetchCategoriesQuery({
    page: 1,
    limit: 100,
    sortBy: "name-asc",
  });

  // Process categories
  const { parentCategories, featuredCategories } = useMemo(() => {
    if (!categoriesData?.data)
      return { parentCategories: [], featuredCategories: [] };

    const active = categoriesData.data.filter((cat) => cat.isActive);
    const parents = active.filter((cat) => !cat.parentCategory);
    const featured = active.filter((cat) => cat.featured);

    return { parentCategories: parents, featuredCategories: featured };
  }, [categoriesData]);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = [...parentCategories];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "posts") {
        return (b.postCount || 0) - (a.postCount || 0);
      } else if (sortBy === "featured") {
        return b.featured === a.featured ? 0 : b.featured ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [parentCategories, searchQuery, sortBy]);

  const getCategoryGradient = (index: number) => {
    const gradients = [
      "from-emerald-500 to-teal-600",
      "from-teal-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-cyan-500 to-blue-600",
      "from-lime-500 to-green-600",
      "from-emerald-600 to-green-700",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950/30">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 py-20 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-300">Categories</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm text-emerald-300 px-4 py-2 rounded-full mb-6 border border-emerald-500/30">
                <Grid3x3 className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Explore Learning Paths
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Browse by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Category
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8">
                Discover courses and articles organized by topic. Find exactly
                what you need to advance your learning journey.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 rounded-2xl border-2 border-emerald-500/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {parentCategories.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Categories
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {featuredCategories.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Featured
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {parentCategories.reduce(
                  (sum, cat) => sum + (cat.postCount || 0),
                  0
                )}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Courses
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {filteredCategories.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Featured Categories
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Most popular learning paths
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.slice(0, 3).map((category, index) => (
                <Link key={category.id} href={`/category/${category.id}`}>
                  <Card className="h-full group cursor-pointer border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:translate-y-[-8px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
                    <CardContent className="p-0 relative h-64">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-20"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                      <div className="absolute top-4 right-4">
                        <div className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          FEATURED
                        </div>
                      </div>

                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div
                          className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${getCategoryGradient(
                            index
                          )} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-white text-2xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                          {category.name}
                        </h3>

                        {category.description && (
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {category.postCount || 0} courses
                          </span>
                          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            All Categories
          </h2>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              onClick={() => setSortBy("name")}
              className={
                sortBy === "name"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  : ""
              }
            >
              Name
            </Button>
            <Button
              variant={sortBy === "posts" ? "default" : "outline"}
              onClick={() => setSortBy("posts")}
              className={
                sortBy === "posts"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  : ""
              }
            >
              Most Courses
            </Button>
            <Button
              variant={sortBy === "featured" ? "default" : "outline"}
              onClick={() => setSortBy("featured")}
              className={
                sortBy === "featured"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  : ""
              }
            >
              Featured
            </Button>
          </div>
        </div>

        {/* All Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : filteredCategories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index % 8) }}
              >
                <Link href={`/category/${category.id}`}>
                  <Card className="h-full group cursor-pointer border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:translate-y-[-8px] bg-white dark:bg-slate-800/50">
                    <CardContent className="p-0 relative h-56">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(
                            index
                          )} opacity-20`}
                        ></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div
                          className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-br ${getCategoryGradient(
                            index
                          )} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-white text-xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {category.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 backdrop-blur-sm px-3 py-1 rounded-full">
                            {category.postCount || 0} courses
                          </span>
                          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
            <CardContent className="p-12 text-center">
              <Grid3x3 className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No categories found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Try adjusting your search or filters
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
