"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, GraduationCap, Trophy, Users, FileText, FolderOpen, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useFetchPublicBlogPostsQuery, useFetchPostCategoriesQuery } from "@/lib/redux-features/blogPost/blogPostApi";

// Search configuration 
const SEARCH_CONFIG = {
  searchBlogPosts: true,
  searchCategories: true,
  searchlessons: false, 
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 dark:border-emerald-900/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      </div>
    </div>
  </motion.div>
);

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const shouldSearch = debouncedQuery.length >= 2;

  // Fetch blog posts (only if enabled and query exists)
  const { data: blogPosts, isLoading: loadingPosts } = useFetchPublicBlogPostsQuery(
    { search: debouncedQuery, limit: 5 },
    { skip: !SEARCH_CONFIG.searchBlogPosts || !shouldSearch }
  );

  // Fetch categories (only if enabled and query exists)
  const { data: categories, isLoading: loadingCategories } = useFetchPostCategoriesQuery(
    { search: debouncedQuery, limit: 5 },
    { skip: !SEARCH_CONFIG.searchCategories || !shouldSearch }
  );

  const isLoading = loadingPosts || loadingCategories;
  const hasResults = (blogPosts?.data?.length ?? 0) > 0 || (categories?.data?.length ?? 0) > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Navigate to search results page or perform action
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 py-20 md:py-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 dark:bg-red-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left content - Takes 7 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Your Learning Journey Starts Here
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Learn, Grow,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                Excel
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Access expert-curated lessons, insightful articles, and practical
              tutorials designed to accelerate your learning and professional
              development.
            </p>

            {/* Search bar */}
            <div className="mb-8">
              <div ref={searchRef} className="relative max-w-2xl mx-auto lg:mx-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search lessons, tutorials, articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-600 transition-all shadow-lg"
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-xl shadow-lg z-10"
                >
                  Search
                </Button>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {showResults && shouldSearch && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-emerald-200 dark:border-emerald-800 max-h-96 overflow-y-auto z-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                          <span className="ml-2 text-slate-600 dark:text-slate-400">Searching...</span>
                        </div>
                      ) : hasResults ? (
                        <div className="p-4">
                          {/* Blog Posts Results */}
                          {SEARCH_CONFIG.searchBlogPosts && blogPosts?.data && blogPosts.data.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2 px-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Articles</h3>
                              </div>
                              <div className="space-y-1">
                                {blogPosts.data.slice(0, 5).map((post) => (
                                  <button
                                    key={post.id}
                                    onClick={() => {
                                      console.log("Navigate to post:", post.id);
                                      setShowResults(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                                  >
                                    <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                                      {post.title}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Categories Results */}
                          {SEARCH_CONFIG.searchCategories && categories?.data && categories.data.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2 px-2">
                                <FolderOpen className="w-4 h-4 text-teal-600" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categories</h3>
                              </div>
                              <div className="space-y-1">
                                {categories.data.slice(0, 5).map((category) => (
                                  <button
                                    key={category.id}
                                    onClick={() => {
                                      console.log("Navigate to category:", category.id);
                                      setShowResults(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
                                  >
                                    <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                                      {category.name}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* lessons Results - Placeholder */}
                          {SEARCH_CONFIG.searchlessons && (
                            <div>
                              <div className="flex items-center gap-2 mb-2 px-2">
                                <BookOpen className="w-4 h-4 text-cyan-600" />
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">lessons</h3>
                              </div>
                              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 italic">
                                Course search coming soon...
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-slate-600 dark:text-slate-400">No results found for "{debouncedQuery}"</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse lessons
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 px-8 py-6 text-lg rounded-2xl shadow-lg bg-white dark:bg-slate-800"
                >
                  Explore Articles
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right content - Stats bento grid - Takes 5 columns on large screens */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={<BookOpen className="w-6 h-6 text-white" />}
              value="500+"
              label="lessons"
              delay={0.2}
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-white" />}
              value="50K+"
              label="Active Learners"
              delay={0.3}
            />
            <StatCard
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              value="200+"
              label="Expert Instructors"
              delay={0.4}
            />
            <StatCard
              icon={<Trophy className="w-6 h-6 text-white" />}
              value="98%"
              label="Success Rate"
              delay={0.5}
            />
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-emerald-200 dark:border-emerald-800"
        >
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">
            Developed by learners from leading organizations and learning
            platforms and professional Developers!
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-slate-400 font-semibold">Coursera</div>
            <div className="text-slate-400 font-semibold">Udemy</div>
            <div className="text-slate-400 font-semibold">edX</div>
            <div className="text-slate-400 font-semibold">freeCodeCamp</div>
            <div className="text-slate-400 font-semibold">Pluralsight</div>
          </div>
        </motion.div>
      </div>
    </section>
  );