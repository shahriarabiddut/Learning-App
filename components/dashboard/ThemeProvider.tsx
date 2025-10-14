"use client";

import {
  selectResolvedTheme,
  updateSystemPreference,
} from "@/lib/redux-features/theme/theme-slice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useRef } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const resolvedTheme = useAppSelector(selectResolvedTheme);
  const mediaQueryRef = useRef<MediaQueryList | null>(null);
  const isFirstRender = useRef(true);

  // Apply theme to DOM when resolved theme changes (but not on first render)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip DOM manipulation on first render since blocking script already applied it
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Just verify the theme is correctly applied
      const { documentElement } = document;
      const currentClass = documentElement.classList.contains("dark")
        ? "dark"
        : "light";

      // Only update if there's a mismatch
      if (currentClass !== resolvedTheme) {
        documentElement.classList.remove("light", "dark");
        documentElement.classList.add(resolvedTheme);
        documentElement.setAttribute("data-theme", resolvedTheme);
      }
      return;
    }

    // Apply theme changes after first render
    const { documentElement } = document;
    documentElement.classList.remove("light", "dark");
    documentElement.classList.add(resolvedTheme);
    documentElement.setAttribute("data-theme", resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = resolvedTheme === "dark" ? "#0f172a" : "#ffffff";
      metaThemeColor.setAttribute("content", color);
    }

    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent("theme-changed", {
        detail: { theme: resolvedTheme },
      })
    );
  }, [resolvedTheme]);

  // Set up system preference listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryRef.current = mediaQuery;

    const handleSystemThemeChange = () => {
      dispatch(updateSystemPreference());
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore
      mediaQuery.addListener?.(handleSystemThemeChange);
    }

    return () => {
      if (mediaQueryRef.current) {
        if (mediaQueryRef.current.removeEventListener) {
          mediaQueryRef.current.removeEventListener(
            "change",
            handleSystemThemeChange
          );
        } else {
          // @ts-ignore
          mediaQueryRef.current.removeListener?.(handleSystemThemeChange);
        }
      }
    };
  }, [dispatch]);

  return <>{children}</>;
}
