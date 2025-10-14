"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setTheme,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  syncWithSystem,
  resetThemeSettings,
  selectCurrentTheme,
  selectResolvedTheme,
  selectSystemPreference,
  selectSidebarCollapsed,
  selectIsDarkMode,
  selectIsLightMode,
  selectIsSystemMode,
  type Theme,
} from "@/lib/redux-features/theme/theme-slice";

export function useTheme() {
  const dispatch = useAppDispatch();

  // Selectors
  const theme = useAppSelector(selectCurrentTheme);
  const resolvedTheme = useAppSelector(selectResolvedTheme);
  const systemPreference = useAppSelector(selectSystemPreference);
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const isDarkMode = useAppSelector(selectIsDarkMode);
  const isLightMode = useAppSelector(selectIsLightMode);
  const isSystemMode = useAppSelector(selectIsSystemMode);

  // Actions
  const changeTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setTheme(newTheme));
    },
    [dispatch]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    dispatch(setTheme(nextTheme));
  }, [dispatch, resolvedTheme]);

  const setSystemTheme = useCallback(() => {
    dispatch(setTheme("system"));
  }, [dispatch]);

  const setLightTheme = useCallback(() => {
    dispatch(setTheme("light"));
  }, [dispatch]);

  const setDarkTheme = useCallback(() => {
    dispatch(setTheme("dark"));
  }, [dispatch]);

  const toggleSidebar = useCallback(() => {
    dispatch(toggleSidebarCollapsed());
  }, [dispatch]);

  const setSidebar = useCallback(
    (collapsed: boolean) => {
      dispatch(setSidebarCollapsed(collapsed));
    },
    [dispatch]
  );

  const syncWithSystemPreference = useCallback(() => {
    dispatch(syncWithSystem());
  }, [dispatch]);

  const resetSettings = useCallback(() => {
    dispatch(resetThemeSettings());
  }, [dispatch]);

  return {
    // Current state
    theme,
    currentTheme: theme, // Add this alias for compatibility
    resolvedTheme,
    systemPreference,
    sidebarCollapsed,

    // Computed state
    isDarkMode,
    isLightMode,
    isSystemMode,

    // Actions
    setTheme: changeTheme,
    toggleTheme,
    setSystemTheme,
    setLightTheme,
    setDarkTheme,
    toggleSidebar,
    setSidebar,
    syncWithSystemPreference,
    resetSettings,
  };
}
