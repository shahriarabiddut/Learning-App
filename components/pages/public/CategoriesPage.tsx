"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFetchPostCategoriesQuery } from "@/lib/redux-features/blogPost/blogPostApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownAZ,
  ArrowDownZA,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Filter,
  Grid3x3,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SortOption = "name-asc" | "name-desc" | "postCount-desc" | "featured";

const SORT_OPTIONS = [
  { value: "name-asc" as const, label: "A to Z", icon: ArrowDownAZ },
  { value: "name-desc" as const, label: "Z to A", icon: ArrowDownZA },
  { value: "postCount-desc" as const, label: "Most Lessons", icon: TrendingUp },
];

interface CategoryCardProps {
  category: any;
  index: number;
  isFeatured?: boolean;
}

function CategoryCard({
  category,
  index,
  isFeatured = false,
}: CategoryCardProps) {
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

  const gradient = getCategoryGradient(index);
  const cardBg = isFeatured
    ? "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30"
    : "bg-white dark:bg-slate-800/50";
  const border = isFeatured
    ? "border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600"
    : "border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700";
  const shadowHover = isFeatured
    ? "hover:shadow-orange-500/20"
    : "hover:shadow-emerald-500/20";
  const noImageBg = isFeatured
    ? "bg-gradient-to-br from-orange-500 to-red-600 opacity-20"
    : `bg-gradient-to-br ${gradient} opacity-20`;
  const titleSize = isFeatured ? "text-2xl" : "text-xl";
  const iconSize = isFeatured
    ? "w-14 h-14 text-2xl mb-4 rounded-2xl"
    : "w-12 h-12 text-xl mb-3 rounded-xl";
  const hoverTitle = isFeatured
    ? "group-hover:text-amber-300"
    : "group-hover:text-emerald-300";
  const arrowSize = isFeatured ? "w-5 h-5" : "w-4 h-4";
  const height = isFeatured ? "h-72" : "h-56";

  const hasParent = category.parentCategory;
  const parentName = hasParent
    ? category.parent || category.parentCategory
    : null;

  // Determine badges to show
  const badges = [];
  if (isFeatured || category.featured) {
    badges.push({
      text: "FEATURED",
      bg: "bg-amber-500",
      px: isFeatured ? "px-3" : "px-2",
      py: isFeatured ? "py-1.5" : "py-1",
    });
  }
  if (hasParent && parentName) {
    badges.push({
      text: parentName,
      bg: "bg-blue-500/90 backdrop-blur-sm",
      px: "px-2",
      py: "py-1",
    });
  }

  const description =
    isFeatured && category.description ? (
      <p className="text-white/90 text-sm mb-3 line-clamp-2">
        {category.description}
      </p>
    ) : null;

  return (
    <Link href={`/category/${category.id}`}>
      <Card
        className={`h-full group cursor-pointer border-2 ${border} transition-all duration-300 hover:shadow-2xl ${shadowHover} hover:translate-y-[-8px] ${cardBg} p-0 overflow-hidden`}
      >
        <CardContent className={`p-0 relative ${height} rounded-2xl`}>
          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className={`absolute inset-0 ${noImageBg}`}></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`${badge.bg} text-white ${badge.px} ${badge.py} rounded-full text-xs font-bold shadow-lg capitalize`}
                >
                  {badge.text}
                </div>
              ))}
            </div>
          )}

          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div
              className={`${iconSize} bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <span className="text-white font-bold capitalize">
                {category.name.charAt(0)}
              </span>
            </div>

            <h3
              className={`${titleSize} font-bold text-white mb-2 ${hoverTitle} transition-colors capitalize`}
            >
              {category.name}
            </h3>

            {description}

            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {category.postCount || 0} lessons
              </span>
              <ArrowRight
                className={`${arrowSize} text-white group-hover:translate-x-2 transition-transform duration-300`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy]);

  const {
    data: categoriesData,
    isLoading,
    isFetching,
  } = useFetchPostCategoriesQuery({
    page: currentPage,
    limit: perPage,
    sortBy: sortBy,
    search: debouncedSearch,
  });

  // Fetch featured categories separately (for display at top)
  const { data: featuredData } = useFetchPostCategoriesQuery({
    page: 1,
    limit: 3,
    featured: "true",
  });

  // Process categories
  const { allCategories, featuredCategories, totalPosts } = useMemo(() => {
    if (!categoriesData?.data)
      return { allCategories: [], featuredCategories: [], totalPosts: 0 };

    const active = categoriesData.data.filter((cat) => cat.isActive);

    const featured = featuredData?.data
      ? featuredData.data
          .filter((cat) => cat.isActive && cat.featured)
          .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
      : [];

    const total = active.reduce((sum, cat) => sum + (cat.postCount || 0), 0);

    return {
      allCategories: active,
      featuredCategories: featured,
      totalPosts: total,
    };
  }, [categoriesData, featuredData]);

  // Get pagination info from API response
  const totalPages = categoriesData?.totalPages || 0;
  const totalItems = categoriesData?.total || 0;

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

  const showLoader = isLoading || isFetching;

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
              Discover lessons and articles organized by topic. Find exactly
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {totalItems}
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
                {totalPosts}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Lessons
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800/50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {allCategories.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && !debouncedSearch && (
          <div className="mb-16">
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
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  isFeatured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            All Categories
          </h2>
          <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-emerald-900/30">
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  disabled={showLoader}
                  className={`
                    relative px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                    ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }
                    ${
                      showLoader
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Categories Grid */}
        {showLoader ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : allCategories.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + sortBy + debouncedSearch}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {allCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
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

        {/* Pagination */}
        {totalPages > 1 && !showLoader && (
          <div className="flex justify-center mt-12">
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-emerald-900/30">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || showLoader}
                className={`
                  px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                  ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  }
                `}
              >
                <ArrowLeft className="w-4 h-4" />
                Prev
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
                    disabled={showLoader}
                    className={`
                      px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300
                      ${
                        currentPage === page
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                          : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }
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
                disabled={currentPage === totalPages || showLoader}
                className={`
                  px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                  ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed text-slate-600 dark:text-slate-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-700/50 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  }
                `}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
