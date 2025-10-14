"use client";

import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import {
  setThemeFromExternal,
  type ThemeState,
  THEME_STORAGE_KEY,
  SIDEBAR_STORAGE_KEY,
} from "@/lib/redux-features/theme/theme-slice";

export default function SyncManager() {
  const dispatch = useDispatch();

  // Helper function to get system preference
  const getSystemPreference = useCallback(() => {
    if (typeof window === "undefined") return "light";
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  }, []);

  // Helper function to validate theme value
  const isValidTheme = useCallback((value: string | null): boolean => {
    return value !== null && ["light", "dark", "system"].includes(value);
  }, []);

  // Helper function to build theme state
  const buildThemeState = useCallback(
    (themeValue: string, sidebarValue: string): ThemeState => {
      const systemPref = getSystemPreference();
      const validTheme = isValidTheme(themeValue) ? themeValue : "system";
      const resolvedTheme = validTheme === "system" ? systemPref : validTheme;

      return {
        theme: validTheme as any,
        resolvedTheme: resolvedTheme as any,
        systemPreference: systemPref as any,
        sidebarCollapsed: sidebarValue === "true",
        isInitialized: true,
      };
    },
    [getSystemPreference, isValidTheme]
  );

  // Helper function to sync theme from localStorage
  const syncThemeFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const storedSidebar = localStorage.getItem(SIDEBAR_STORAGE_KEY);

      // Get initial theme from sessionStorage if available (from layout script)
      const initialTheme = sessionStorage.getItem("initial-theme");

      // Use stored theme, or fall back to initial theme, or default to 'system'
      const theme =
        storedTheme ||
        (initialTheme
          ? initialTheme === "dark" || initialTheme === "light"
            ? initialTheme
            : "system"
          : "system");
      const sidebar = storedSidebar || "false";

      const newState = buildThemeState(theme, sidebar);
      dispatch(setThemeFromExternal(newState));

      // Apply theme to DOM immediately to prevent flashing
      const { documentElement } = document;
      documentElement.classList.remove("light", "dark");
      documentElement.classList.add(newState.resolvedTheme);
      documentElement.setAttribute("data-theme", newState.resolvedTheme);

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        const color = newState.resolvedTheme === "dark" ? "#0f172a" : "#ffffff";
        metaThemeColor.setAttribute("content", color);
      }
    } catch (error) {
      // Fallback to system theme
      const fallbackState = buildThemeState("system", "false");
      dispatch(setThemeFromExternal(fallbackState));
    }
  }, [dispatch, buildThemeState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial sync - do this immediately
    syncThemeFromStorage();

    // -------------------- BROADCAST CHANNEL --------------------
    let bcTheme: BroadcastChannel | null = null;

    try {
      if ("BroadcastChannel" in window) {
        bcTheme = new BroadcastChannel("theme_channel");
        bcTheme.onmessage = (ev) => {
          const payload = ev.data;
          if (payload?.type === "theme_updated" && payload.theme) {
            dispatch(setThemeFromExternal(payload.theme as ThemeState));

            // Apply theme to DOM immediately
            const { documentElement } = document;
            const resolvedTheme = payload.theme.resolvedTheme;
            documentElement.classList.remove("light", "dark");
            documentElement.classList.add(resolvedTheme);
            documentElement.setAttribute("data-theme", resolvedTheme);
          }
        };
      }
    } catch (error) {
      bcTheme = null;
    }

    // -------------------- STORAGE EVENT FALLBACK --------------------
    const onStorage = (e: StorageEvent) => {
      try {
        // Theme / Sidebar
        if (
          (e.key === THEME_STORAGE_KEY || e.key === SIDEBAR_STORAGE_KEY) &&
          e.newValue !== e.oldValue
        ) {
          // Small delay to ensure both localStorage updates complete
          setTimeout(() => {
            syncThemeFromStorage();
          }, 50);
        }
      } catch (error) {}
    };

    // -------------------- SYSTEM THEME CHANGE LISTENER --------------------
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = () => {
      // Re-sync theme when system preference changes
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (currentTheme === "system" || !currentTheme) {
        syncThemeFromStorage();
      }
    };

    // -------------------- FOCUS/VISIBILITY SYNC --------------------
    const onVisibilityChange = () => {
      if (!document.hidden) {
        // Re-sync when tab becomes visible
        syncThemeFromStorage();
      }
    };

    const onFocus = () => {
      // Re-sync when window gains focus
      syncThemeFromStorage();
    };

    // Add all event listeners
    window.addEventListener("storage", onStorage);
    mediaQuery.addEventListener("change", onSystemThemeChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    // -------------------- CLEANUP --------------------
    return () => {
      window.removeEventListener("storage", onStorage);
      mediaQuery.removeEventListener("change", onSystemThemeChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      bcTheme?.close();
    };
  }, [dispatch, syncThemeFromStorage]);

  return null; // renders nothing
}
