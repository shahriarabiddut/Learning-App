"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null
  );

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const menuItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Categories",
      href: "#categories",
      submenu: [
        { label: "Lifestyle", href: "/category/lifestyle" },
        { label: "Technology", href: "/category/technology" },
        { label: "Home & Design", href: "/category/home" },
        { label: "Travel", href: "/category/travel" },
      ],
    },
    {
      label: "Resources",
      href: "#",
      submenu: [
        {
          label: "Guides",
          href: "/guides",
          submenu: [
            { label: "Beginner's Guide", href: "/guides/beginner" },
            { label: "Advanced Tips", href: "/guides/advanced" },
          ],
        },
        { label: "Tutorials", href: "/tutorials" },
        { label: "Tools", href: "/tools" },
      ],
    },
    {
      label: "Community",
      href: "#",
      submenu: [
        { label: "Authors", href: "#authors" },
        { label: "Forum", href: "/forum" },
        { label: "Events", href: "/events" },
      ],
    },
    {
      label: "About",
      href: "/about",
    },
  ];

  const DropdownMenu = ({
    items,
    isMobile = false,
  }: {
    items: typeof menuItems;
    isMobile?: boolean;
  }) => (
    <div className={isMobile ? "space-y-2" : "flex items-center gap-1"}>
      {items.map((item) => (
        <div key={item.label} className="relative group">
          <button
            onClick={() => {
              if (isMobile) {
                setOpenMobileDropdown(
                  openMobileDropdown === item.label ? null : item.label
                );
              }
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
              isMobile
                ? "w-full text-left text-foreground hover:bg-secondary"
                : "text-foreground hover:text-primary hover:bg-secondary/50"
            }`}
          >
            <Link href={item.href} className="flex items-center gap-1">
              {item.label}
              {item.submenu && <ChevronDown className="w-4 h-4" />}
            </Link>
          </button>

          {/* Desktop dropdown */}
          {item.submenu && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
            >
              <div className="py-2">
                {item.submenu.map((subitem) => (
                  <div key={subitem.label} className="relative group/sub">
                    <Link
                      href={subitem.href}
                      className="flex items-center justify-between px-4 py-2 text-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
                    >
                      <span>{subitem.label}</span>
                      {subitem.submenu && <ChevronDown className="w-3 h-3" />}
                    </Link>

                    {/* Nested submenu */}
                    {subitem.submenu && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-full top-0 ml-0 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200"
                      >
                        <div className="py-2">
                          {subitem.submenu.map((nestedItem) => (
                            <Link
                              key={nestedItem.label}
                              href={nestedItem.href}
                              className="block px-4 py-2 text-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
                            >
                              {nestedItem.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Mobile dropdown */}
          {item.submenu && isMobile && (
            <AnimatePresence>
              {openMobileDropdown === item.label && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 space-y-2 mt-2 border-l-2 border-primary/30"
                >
                  {item.submenu.map((subitem) => (
                    <div key={subitem.label}>
                      <Link
                        href={subitem.href}
                        className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                      >
                        {subitem.label}
                      </Link>
                      {subitem.submenu && (
                        <div className="pl-4 space-y-2 mt-2 border-l border-primary/20">
                          {subitem.submenu.map((nestedItem) => (
                            <Link
                              key={nestedItem.label}
                              href={nestedItem.href}
                              className="block px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                            >
                              {nestedItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border dark:border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                B
              </span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">
              Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <DropdownMenu items={menuItems} />
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Auth buttons - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-foreground hover:bg-secondary"
              >
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
              className="lg:hidden border-t border-border bg-card/50 backdrop-blur-sm"
            >
              <div className="px-4 py-4 space-y-4">
                <DropdownMenu items={menuItems} isMobile={true} />

                {/* Mobile Auth buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full text-foreground border-border hover:bg-secondary bg-transparent"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
