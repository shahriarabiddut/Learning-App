"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useFetchPostCategoriesQuery } from "@/lib/redux-features/blogPost/blogPostApi";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  postCount?: number;
}

export default function Categories() {
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useFetchPostCategoriesQuery({
    page: 1,
    limit: 6,
    sortBy: "name-asc",
  });

  const categories: Category[] = categoriesData?.data || [];

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

  const getAccentGradient = (index: number) => {
    const accents = [
      "from-red-500 to-orange-600",
      "from-rose-500 to-red-600",
      "from-orange-500 to-amber-600",
      "from-pink-500 to-rose-600",
      "from-amber-500 to-orange-600",
      "from-red-600 to-rose-700",
    ];
    return accents[index % accents.length];
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        </div>
      </section>
    );
  }

  if (isError || categories.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            {isError
              ? "Unable to load categories"
              : "No categories available yet"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 dark:bg-teal-600/5 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Learning Categories</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Explore by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              Subject
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Dive deep into specialized topics curated by industry experts
          </p>
        </motion.div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {categories.map((category, index) => {
            // First item spans 2 columns on large screens
            const isLarge = index === 0;
            const isMedium = index === 1 || index === 2;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${isLarge ? "md:col-span-2 md:row-span-2" : ""} ${
                  isMedium ? "lg:row-span-1" : ""
                }`}
              >
                <Link href={`/category/${category.slug || category.id}`}>
                  <Card className="h-full group relative overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 bg-white dark:bg-slate-800/50 backdrop-blur-sm">
                    <CardContent className="p-0 relative h-full min-h-[280px] flex flex-col">
                      {/* Background image with overlay */}
                      <div className="absolute inset-0">
                        {category.image ? (
                          <Image
                            src={category.image}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent dark:from-slate-950/95 dark:via-slate-950/60"></div>
                      </div>

                      {/* Accent corner */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getAccentGradient(
                          index
                        )} opacity-20 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500`}
                      ></div>

                      {/* Content */}
                      <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                        {/* Icon */}
                        <div
                          className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${getCategoryGradient(
                            index
                          )} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-white text-2xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">
                          {category.name}
                        </h3>

                        {/* Stats and CTA */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-400/30">
                              {category.postCount || 0} courses
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              View All Categories
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
