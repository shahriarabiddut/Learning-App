"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Grid3x3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useCallback, memo } from "react";
import { UserNav } from "../dashboard/UserNav";
import { ThemeToggle } from "../ThemeToggle";
import { SITE_DEFAULTS } from "@/lib/constants/env";
import { useFetchPostCategoriesQuery } from "@/lib/redux-features/blogPost/blogPostApi";

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategory?: string | null;
  isActive: boolean;
  featured: boolean;
}

interface NestedCategory extends Category {
  children?: NestedCategory[];
}

// Memoized Desktop Category Menu Component
const DesktopCategoryMenu = memo(
  ({ categories }: { categories: NestedCategory[] }) => {
    return (
      <div className="fixed left-0 right-0 top-16 bg-white dark:bg-slate-800 border-b border-emerald-200 dark:border-emerald-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              All Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  {/* Parent Category */}
                  <Link
                    href={`/category/${category.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 group/item"
                  >
                    {category.imageUrl ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-emerald-100 dark:ring-emerald-900 relative">
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-sm">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors leading-tight">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Child Categories */}
                  {category.children && category.children.length > 0 && (
                    <div className="pl-3 space-y-1 border-l-2 border-emerald-200 dark:border-emerald-800">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.id}`}
                          className="block px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-8 pt-6 border-t border-emerald-200 dark:border-emerald-800 flex justify-center">
              <Link href="/categories">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8 py-2.5">
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DesktopCategoryMenu.displayName = "DesktopCategoryMenu";

// Memoized Mobile Category Menu Component
const MobileCategoryMenu = memo(
  ({
    categories,
    isOpen,
    onClose,
  }: {
    categories: NestedCategory[];
    isOpen: boolean;
    onClose: () => void;
  }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-4 space-y-2 mt-2 border-l-2 border-emerald-500/30 max-h-96 overflow-y-auto"
          >
            {categories.map((category) => (
              <div key={category.id}>
                <Link
                  href={`/category/${category.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                >
                  {category.imageUrl ? (
                    <div className="w-6 h-6 rounded overflow-hidden relative flex-shrink-0">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-medium">{category.name}</span>
                </Link>
                {category.children && category.children.length > 0 && (
                  <div className="pl-6 space-y-1 mt-1">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.id}`}
                        onClick={onClose}
                        className="block px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

MobileCategoryMenu.displayName = "MobileCategoryMenu";

// Memoized Logo Component
const Logo = memo(() => (
  <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
      <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
        <GraduationCap className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="hidden sm:block">
      <span className="font-bold text-xl text-slate-900 dark:text-white">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
          {SITE_DEFAULTS.title}
        </span>
      </span>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
        EKnowledge Hub
      </p>
    </div>
  </Link>
));

Logo.displayName = "Logo";

// Memoized Auth Buttons
const AuthButtons = memo(({ session }: { session: any }) => {
  if (session?.user) {
    return (
      <div className="hidden sm:block">
        <UserNav dashboard={true} />
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Link href="/sign-in">
        <Button
          variant="ghost"
          className="text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
        >
          Login
        </Button>
      </Link>
      <Link href="/sign-up">
        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg font-medium">
          Sign Up
        </Button>
      </Link>
    </div>
  );
});

AuthButtons.displayName = "AuthButtons";

// Main Header Component
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  const { data: session } = useSession();

  const { data: categoriesData } = useFetchPostCategoriesQuery(
    {
      page: 1,
      limit: 100,
      sortBy: "name-asc",
    },
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    }
  );

  // Memoized menu items
  const menuItems = useMemo(
    () => [
      {
        label: "Home",
        href: "/",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        label: "Lessons",
        href: "/lessons",
        icon: <GraduationCap className="w-4 h-4" />,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: <Grid3x3 className="w-4 h-4" />,
        hasSubmenu: true,
      },
    ],
    []
  );

  // Build nested category structure - memoized
  const nestedCategories = useMemo(() => {
    if (!categoriesData?.data) return [];

    const categories = categoriesData.data.filter((cat) => cat.isActive);
    const categoryMap = new Map<string, NestedCategory>();
    const rootCategories: NestedCategory[] = [];

    // First pass: create map of all categories
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id);
      if (!category) return;

      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        } else {
          rootCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }, [categoriesData?.data]);

  // Memoized callbacks
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMobileDropdown = useCallback((label: string) => {
    setOpenMobileDropdown((prev) => (prev === label ? null : label));
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-emerald-100 dark:border-emerald-900/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 font-medium text-sm"
                >
                  {item.icon}
                  {item.label}
                  {item.hasSubmenu && (
                    <ChevronDown className="w-4 h-4 ml-0.5" />
                  )}
                </Link>

                {item.hasSubmenu && item.label === "Categories" && (
                  <DesktopCategoryMenu categories={nestedCategories} />
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth buttons - Desktop */}
            <AuthButtons session={session} />

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-900"
            >
              <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Mobile menu items */}
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div key={item.label}>
                      {item.hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleMobileDropdown(item.label)}
                            className="flex items-center justify-between w-full px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors font-medium"
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              {item.label}
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                openMobileDropdown === item.label
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                          {item.label === "Categories" && (
                            <MobileCategoryMenu
                              categories={nestedCategories}
                              isOpen={openMobileDropdown === "Categories"}
                              onClose={closeMenu}
                            />
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors font-medium"
                          onClick={closeMenu}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Auth section */}
                <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
                  {session?.user ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {session.user.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/sign-in" onClick={closeMenu}>
                        <Button
                          variant="outline"
                          className="w-full border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/sign-up" onClick={closeMenu}>
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg font-medium">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
