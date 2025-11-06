"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client is mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="w-5 h-5 bg-slate-300 dark:bg-slate-700 rounded animate-pulse" />
      </button>
    );
  }

  const isDark =
    currentTheme === "dark" ||
    (currentTheme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = () => {
    // Toggle between light and dark, ignoring system
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </motion.button>
  );
}
