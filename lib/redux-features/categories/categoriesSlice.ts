import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Categoriestate {
  viewMode: "grid" | "table";
  itemsPerPage: number;
  searchQuery: string;
  sortBy: string;
  currentPage: number;
  canUpdateCategories: boolean;
  canViewCategories: boolean;
  canAddCategory: boolean;
  canViewAllData: boolean;
  canDeleteCategories: boolean;
  userRole: string | null;
  lastUserRoleUpdate: number;
}

const initialState: Categoriestate = {
  viewMode: "grid",
  itemsPerPage: 12,
  searchQuery: "",
  sortBy: "createdAt-desc",
  currentPage: 1,
  canUpdateCategories: false,
  canAddCategory: false,
  canViewCategories: false,
  canViewAllData: false,
  canDeleteCategories: false,
  userRole: null,
  lastUserRoleUpdate: 0,
};

// Utility to safely access localStorage with error handling
const getStoredUISettings = (): Partial<Categoriestate> => {
  if (typeof window === "undefined") return {};

  try {
    const savedUI = localStorage.getItem("categories-ui");
    if (!savedUI) return {};

    const parsed = JSON.parse(savedUI);

    // Validate the stored data structure
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    // Type validation for critical fields
    const validated: Partial<Categoriestate> = {};

    if (parsed.viewMode === "grid" || parsed.viewMode === "table") {
      validated.viewMode = parsed.viewMode;
    }

    if (
      typeof parsed.itemsPerPage === "number" &&
      parsed.itemsPerPage > 0 &&
      parsed.itemsPerPage <= 241
    ) {
      validated.itemsPerPage = parsed.itemsPerPage;
    }

    if (typeof parsed.sortBy === "string") {
      validated.sortBy = parsed.sortBy;
    }

    if (typeof parsed.currentPage === "number" && parsed.currentPage > 0) {
      validated.currentPage = parsed.currentPage;
    }

    return validated;
  } catch (error) {
    console.warn("Failed to parse stored category UI settings:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem("categories-ui");
    } catch {}
    return {};
  }
};

// Utility to safely save to localStorage with throttling
let saveTimeout: NodeJS.Timeout | null = null;
const saveUISettings = (settings: Partial<Categoriestate>) => {
  if (typeof window === "undefined") return;

  // Throttle saves to prevent excessive localStorage writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    try {
      const existing = getStoredUISettings();
      const updated = { ...existing, ...settings };

      // Only save UI-related settings, not permissions
      const sanitized = {
        viewMode: updated.viewMode,
        itemsPerPage: updated.itemsPerPage,
        sortBy: updated.sortBy,
        currentPage: updated.currentPage,
      };

      localStorage.setItem("categories-ui", JSON.stringify(sanitized));
    } catch (error) {
      console.warn("Failed to save categories UI settings:", error);
    }
  }, 200); // 200ms throttle
};

// Helper function to calculate permissions
const calculatePermissions = (userRole: string | null | undefined) => {
  const role = userRole || null;
  return {
    canUpdateCategories: hasPermission(
      role as UserRole,
      PERMISSIONS.UPDATE_CATEGORIES
    ),
    canViewCategories: hasPermission(
      role as UserRole,
      PERMISSIONS.VIEW_CATEGORIES
    ),
    canAddCategory: hasPermission(role as UserRole, PERMISSIONS.ADD_CATEGORIES),

    canDeleteCategories: hasPermission(
      role as UserRole,
      PERMISSIONS.DELETE_CATEGORIES
    ),
    canViewAllData: hasPermission(
      role as UserRole,
      PERMISSIONS.ADMIN_CONTROLLED_DATA
    ),
  };
};

const categorieslice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<"grid" | "table">) {
      state.viewMode = action.payload;
      saveUISettings({ viewMode: action.payload });
    },
    setItemsPerPage(state, action: PayloadAction<number>) {
      // Validate items per page
      const value = Math.min(Math.max(action.payload, 1), 241);
      state.itemsPerPage = value;
      saveUISettings({ itemsPerPage: value });
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      // Don't persist search query
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
      saveUISettings({ sortBy: action.payload });
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      // Validate page number
      const value = Math.max(action.payload, 1);
      state.currentPage = value;
      // Don't persist current page for better UX
    },
    // NEW: Action to update user permissions
    updateUserPermissions(
      state,
      action: PayloadAction<{ userRole: string | null | undefined }>
    ) {
      const { userRole } = action.payload;
      const normalizedRole = userRole || null;

      // Only update if the role actually changed
      if (state.userRole !== normalizedRole) {
        state.userRole = normalizedRole;
        state.lastUserRoleUpdate = Date.now();

        // Recalculate permissions
        const permissions = calculatePermissions(normalizedRole);
        state.canUpdateCategories = permissions.canUpdateCategories;
        state.canAddCategory = permissions.canAddCategory;
        state.canViewCategories = permissions.canViewCategories;
        state.canViewAllData = permissions.canViewAllData;
        state.canDeleteCategories = permissions.canDeleteCategories;
      }
    },
    // Batch update for better performance
    setUISettings(state, action: PayloadAction<Partial<Categoriestate>>) {
      const updates = action.payload;

      // Validate and apply updates
      if (
        updates.viewMode &&
        (updates.viewMode === "grid" || updates.viewMode === "table")
      ) {
        state.viewMode = updates.viewMode;
      }

      if (typeof updates.itemsPerPage === "number") {
        state.itemsPerPage = Math.min(Math.max(updates.itemsPerPage, 1), 240);
      }

      if (typeof updates.searchQuery === "string") {
        state.searchQuery = updates.searchQuery;
      }

      if (typeof updates.sortBy === "string") {
        state.sortBy = updates.sortBy;
      }

      if (typeof updates.currentPage === "number") {
        state.currentPage = Math.max(updates.currentPage, 1);
      }

      // Save only persistent settings
      saveUISettings({
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        sortBy: state.sortBy,
      });
    },
    // Reset to initial state
    resetCategoriestate(state) {
      Object.assign(state, initialState);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("categories-ui");
        }
      } catch (error) {
        console.warn("Failed to clear categories UI settings:", error);
      }
    },
  },
});

export const {
  setViewMode,
  setItemsPerPage,
  setSearchQuery,
  setSortBy,
  setCurrentPage,
  setUISettings,
  resetCategoriestate,
  updateUserPermissions, // Export the new action
} = categorieslice.actions;

// Optimized initial state loader with better error handling
export const loadInitialCategoryUIState = (): Categoriestate => {
  const stored = typeof window !== "undefined" ? getStoredUISettings() : {};
  return {
    ...initialState,
    ...stored,
    // Ensure current page starts at 1 for better UX
    currentPage: 1,
    // Clear search query on app start
    searchQuery: "",
    // Permissions will be set when user data loads
    canUpdateCategories: false,
    canAddCategory: false,
    canViewCategories: false,
    canViewAllData: false,
    canDeleteCategories: false,
    userRole: null,
    lastUserRoleUpdate: 0,
  };
};

// Enhanced selector helpers for better performance
export const selectCategoryViewMode = (state: { categories: Categoriestate }) =>
  state.categories.viewMode;

export const selectCategoriesearchQuery = (state: {
  categories: Categoriestate;
}) => state.categories.searchQuery;

export const selectCategoryPagination = (state: {
  categories: Categoriestate;
}) => ({
  currentPage: state.categories.currentPage,
  itemsPerPage: state.categories.itemsPerPage,
});

export const selectCategoriesortBy = (state: { categories: Categoriestate }) =>
  state.categories.sortBy;

// Permission selectors
export const selectCategoryPermissions = (state: {
  categories: Categoriestate;
}) => ({
  canUpdateCategories: state.categories.canUpdateCategories,
  canAddCategory: state.categories.canAddCategory,
  canViewCategories: state.categories.canViewCategories,
  canViewAllData: state.categories.canViewAllData,
  canDeleteCategories: state.categories.canDeleteCategories,
  userRole: state.categories.userRole,
  lastUpdated: state.categories.lastUserRoleUpdate,
});

export const selectCanUpdateCategories = (state: {
  categories: Categoriestate;
}) => state.categories.canUpdateCategories;
export const selectCanAddCategory = (state: { categories: Categoriestate }) =>
  state.categories.canAddCategory;
export const selectCanViewCategories = (state: {
  categories: Categoriestate;
}) => state.categories.canViewCategories;
export const selectCanViewAllData = (state: { categories: Categoriestate }) =>
  state.categories.canViewAllData;
export const selectCanDeleteCategories = (state: {
  categories: Categoriestate;
}) => state.categories.canDeleteCategories;

export default categorieslice.reducer;
