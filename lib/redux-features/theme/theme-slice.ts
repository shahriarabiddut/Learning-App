import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/redux/store";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

export type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemPreference: ResolvedTheme;
  sidebarCollapsed: boolean;
  isInitialized: boolean; // Track if theme has been properly initialized
};

export const THEME_STORAGE_KEY = "theme";
export const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

// Utility functions for safer localStorage access
const getStoredValue = (key: string, fallback: string): string => {
  if (typeof window === "undefined") return fallback;

  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (error) {
    return fallback;
  }
};

const setStoredValue = (key: string, value: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, value);
  } catch (error) {}
};

const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch (error) {
    return "light";
  }
};

const isValidTheme = (value: string): value is Theme => {
  return ["light", "dark", "system"].includes(value);
};

const isValidBoolean = (value: string): boolean => {
  return value === "true" || value === "false";
};

// SSR-safe initialization
const initializeState = (): ThemeState => {
  let theme: Theme = "system";
  let resolvedTheme: ResolvedTheme = "light";
  let systemPreference: ResolvedTheme = "light";
  let sidebarCollapsed = false;
  let isInitialized = false;

  if (typeof window !== "undefined") {
    // Get saved theme with validation
    const savedTheme = getStoredValue(THEME_STORAGE_KEY, "system");
    if (isValidTheme(savedTheme)) {
      theme = savedTheme;
    }

    // Get sidebar state with validation
    const savedSidebarState = getStoredValue(SIDEBAR_STORAGE_KEY, "false");
    if (isValidBoolean(savedSidebarState)) {
      sidebarCollapsed = savedSidebarState === "true";
    }

    // Get system preference
    systemPreference = getSystemPreference();

    // Check if theme was pre-applied by the blocking script
    try {
      const preAppliedTheme = sessionStorage.getItem("initial-theme");
      if (preAppliedTheme === "light" || preAppliedTheme === "dark") {
        resolvedTheme = preAppliedTheme as ResolvedTheme;
        // Clean up the session storage
        sessionStorage.removeItem("initial-theme");
      } else {
        // Fallback to calculation
        resolvedTheme =
          theme === "system" ? systemPreference : (theme as ResolvedTheme);
      }
    } catch (error) {
      // Fallback to calculation
      resolvedTheme =
        theme === "system" ? systemPreference : (theme as ResolvedTheme);
    }

    isInitialized = true;
  }

  return {
    theme,
    resolvedTheme,
    systemPreference,
    sidebarCollapsed,
    isInitialized,
  };
};

// Apply theme to DOM
const applyThemeToDOM = (theme: ResolvedTheme): void => {
  if (typeof window === "undefined") return;

  const { documentElement } = document;

  // Remove existing theme classes
  documentElement.classList.remove("light", "dark");
  documentElement.classList.add(theme);

  // Update data attribute for CSS targeting
  documentElement.setAttribute("data-theme", theme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const color = theme === "dark" ? "#0f172a" : "#ffffff";
    metaThemeColor.setAttribute("content", color);
  }

  // Dispatch custom event for other components to listen
  window.dispatchEvent(
    new CustomEvent("theme-changed", {
      detail: { theme },
    })
  );
};

export const themeSlice = createSlice({
  name: "theme",
  initialState: initializeState(),
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      state.resolvedTheme =
        action.payload === "system"
          ? state.systemPreference
          : (action.payload as ResolvedTheme);

      // Save to localStorage
      setStoredValue(THEME_STORAGE_KEY, action.payload);

      // Apply to DOM
      applyThemeToDOM(state.resolvedTheme);
    },

    updateSystemPreference: (state, action?: PayloadAction<ResolvedTheme>) => {
      // Allow manual override or auto-detect
      const newPreference = action?.payload ?? getSystemPreference();
      state.systemPreference = newPreference;

      // Update resolved theme if currently using system
      if (state.theme === "system") {
        state.resolvedTheme = newPreference;
        applyThemeToDOM(state.resolvedTheme);
      }
    },

    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      setStoredValue(SIDEBAR_STORAGE_KEY, String(state.sidebarCollapsed));
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      setStoredValue(SIDEBAR_STORAGE_KEY, String(action.payload));
    },

    // Initialize theme after hydration (useful for SSR)
    initializeTheme: (state) => {
      if (!state.isInitialized) {
        const newState = initializeState();
        Object.assign(state, newState);
        applyThemeToDOM(state.resolvedTheme);
      }
    },

    // Force re-sync with system
    syncWithSystem: (state) => {
      state.systemPreference = getSystemPreference();
      if (state.theme === "system") {
        state.resolvedTheme = state.systemPreference;
        applyThemeToDOM(state.resolvedTheme);
      }
    },

    // Batch update for better performance
    updateThemeSettings: (
      state,
      action: PayloadAction<{
        theme?: Theme;
        sidebarCollapsed?: boolean;
      }>
    ) => {
      const { theme, sidebarCollapsed } = action.payload;

      if (theme !== undefined) {
        state.theme = theme;
        state.resolvedTheme =
          theme === "system"
            ? state.systemPreference
            : (theme as ResolvedTheme);
        setStoredValue(THEME_STORAGE_KEY, theme);
        applyThemeToDOM(state.resolvedTheme);
      }

      if (sidebarCollapsed !== undefined) {
        state.sidebarCollapsed = sidebarCollapsed;
        setStoredValue(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
      }
    },

    // Reset to defaults
    resetThemeSettings: (state) => {
      state.theme = "system";
      state.systemPreference = getSystemPreference();
      state.resolvedTheme = state.systemPreference;
      state.sidebarCollapsed = false;

      setStoredValue(THEME_STORAGE_KEY, "system");
      setStoredValue(SIDEBAR_STORAGE_KEY, "false");
      applyThemeToDOM(state.resolvedTheme);
    },
    setThemeFromExternal: (state, action: PayloadAction<ThemeState>) => {
      // overwrite with external state
      state.theme = action.payload.theme;
      state.resolvedTheme = action.payload.resolvedTheme;
      state.systemPreference = action.payload.systemPreference;
      state.sidebarCollapsed = action.payload.sidebarCollapsed;
      state.isInitialized = true;

      // apply DOM side-effects
      applyThemeToDOM(state.resolvedTheme);
    },
  },
});

// Enhanced selectors with memoization helpers
export const selectCurrentTheme = (state: RootState) => state.theme.theme;
export const selectResolvedTheme = (state: RootState) =>
  state.theme.resolvedTheme;
export const selectSystemPreference = (state: RootState) =>
  state.theme.systemPreference;
export const selectSidebarCollapsed = (state: RootState) =>
  state.theme.sidebarCollapsed;
export const selectIsInitialized = (state: RootState) =>
  state.theme.isInitialized;

// Computed selectors
export const selectIsDarkMode = (state: RootState) =>
  state.theme.resolvedTheme === "dark";
export const selectIsLightMode = (state: RootState) =>
  state.theme.resolvedTheme === "light";
export const selectIsSystemMode = (state: RootState) =>
  state.theme.theme === "system";

// Export utility for use in preloadedState
export const loadInitialThemeState = initializeState;

export const {
  setTheme,
  updateSystemPreference,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  initializeTheme,
  syncWithSystem,
  updateThemeSettings,
  resetThemeSettings,
  setThemeFromExternal,
} = themeSlice.actions;

export default themeSlice.reducer;
