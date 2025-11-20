import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BlogPageState {
  viewMode: "grid" | "table";
  itemsPerPage: number;
  searchQuery: string;
  sortBy: string;
  currentPage: number;
  filterStatus: "all" | "draft" | "published" | "archived";
  filterAuthor: string | null;
  filterTags: string[];
  showFeaturedOnly: boolean;
  canManagePages: boolean;
  canViewPages: boolean;
  canPublishPages: boolean;
  canDeletePages: boolean;
  userRole: string | null;
  lastUserRoleUpdate: number;
}

const initialState: BlogPageState = {
  viewMode: "grid",
  itemsPerPage: 12,
  searchQuery: "",
  sortBy: "createdAt-desc",
  currentPage: 1,
  filterStatus: "all",
  filterAuthor: null,
  filterTags: [],
  showFeaturedOnly: false,
  canManagePages: false,
  canViewPages: false,
  canPublishPages: false,
  canDeletePages: false,
  userRole: null,
  lastUserRoleUpdate: 0,
};

// Utility to safely access localStorage with error handling
const getStoredUISettings = (): Partial<BlogPageState> => {
  if (typeof window === "undefined") return {};

  try {
    const savedUI = localStorage.getItem("blog-pages-ui");
    if (!savedUI) return {};

    const parsed = JSON.parse(savedUI);

    // Validate the stored data structure
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    // Type validation for critical fields
    const validated: Partial<BlogPageState> = {};

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

    if (
      ["all", "draft", "published", "revision", "pending"].includes(
        parsed.filterStatus
      )
    ) {
      validated.filterStatus = parsed.filterStatus;
    }

    if (typeof parsed.showFeaturedOnly === "boolean") {
      validated.showFeaturedOnly = parsed.showFeaturedOnly;
    }

    return validated;
  } catch (error) {
    console.warn("Failed to parse stored blog page UI settings:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem("blog-pages-ui");
    } catch {}
    return {};
  }
};

// Utility to safely save to localStorage with throttling
let saveTimeout: NodeJS.Timeout | null = null;
const saveUISettings = (settings: Partial<BlogPageState>) => {
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
        filterStatus: updated.filterStatus,
        showFeaturedOnly: updated.showFeaturedOnly,
      };

      localStorage.setItem("blog-pages-ui", JSON.stringify(sanitized));
    } catch (error) {
      console.warn("Failed to save blog page UI settings:", error);
    }
  }, 200); // 200ms throttle
};

// Helper function to calculate permissions
const calculatePermissions = (userRole: string | null | undefined) => {
  const role = userRole || null;
  return {
    canManagePages: hasPermission(role as UserRole, PERMISSIONS.MANAGE_PAGES),
    canViewPages: hasPermission(role as UserRole, PERMISSIONS.VIEW_PAGES),
    canPublishPages: hasPermission(role as UserRole, PERMISSIONS.PUBLISH_PAGES),
    canDeletePages: hasPermission(role as UserRole, PERMISSIONS.DELETE_PAGES),
  };
};

const blogPageSlice = createSlice({
  name: "blogPages",
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
    setFilterStatus(
      state,
      action: PayloadAction<"all" | "draft" | "published" | "archived">
    ) {
      state.filterStatus = action.payload;
      state.currentPage = 1; // Reset to first page on filter change
      saveUISettings({ filterStatus: action.payload });
    },
    setFilterAuthor(state, action: PayloadAction<string | null>) {
      state.filterAuthor = action.payload;
      state.currentPage = 1; // Reset to first page on filter change
    },
    setFilterTags(state, action: PayloadAction<string[]>) {
      state.filterTags = action.payload;
      state.currentPage = 1; // Reset to first page on filter change
    },
    toggleFeaturedFilter(state) {
      state.showFeaturedOnly = !state.showFeaturedOnly;
      state.currentPage = 1; // Reset to first page on filter change
      saveUISettings({ showFeaturedOnly: state.showFeaturedOnly });
    },
    setShowFeaturedOnly(state, action: PayloadAction<boolean>) {
      state.showFeaturedOnly = action.payload;
      state.currentPage = 1; // Reset to first page on filter change
      saveUISettings({ showFeaturedOnly: action.payload });
    },
    clearAllFilters(state) {
      state.filterStatus = "all";
      state.filterAuthor = null;
      state.filterTags = [];
      state.showFeaturedOnly = false;
      state.searchQuery = "";
      state.currentPage = 1;
      saveUISettings({
        filterStatus: "all",
        showFeaturedOnly: false,
      });
    },
    // Action to update user permissions
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
        state.canManagePages = permissions.canManagePages;
        state.canViewPages = permissions.canViewPages;
        state.canPublishPages = permissions.canPublishPages;
        state.canDeletePages = permissions.canDeletePages;
      }
    },
    // Batch update for better performance
    setUISettings(state, action: PayloadAction<Partial<BlogPageState>>) {
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

      if (updates.filterStatus) {
        state.filterStatus = updates.filterStatus;
      }

      if (typeof updates.showFeaturedOnly === "boolean") {
        state.showFeaturedOnly = updates.showFeaturedOnly;
      }

      // Save only persistent settings
      saveUISettings({
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        sortBy: state.sortBy,
        filterStatus: state.filterStatus,
        showFeaturedOnly: state.showFeaturedOnly,
      });
    },
    // Reset to initial state
    resetBlogPageState(state) {
      Object.assign(state, initialState);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("blog-pages-ui");
        }
      } catch (error) {
        console.warn("Failed to clear blog page UI settings:", error);
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
  setFilterStatus,
  setFilterAuthor,
  setFilterTags,
  toggleFeaturedFilter,
  setShowFeaturedOnly,
  clearAllFilters,
  setUISettings,
  resetBlogPageState,
  updateUserPermissions,
} = blogPageSlice.actions;

// Optimized initial state loader with better error handling
export const loadInitialBlogPageUIState = (): BlogPageState => {
  const stored = typeof window !== "undefined" ? getStoredUISettings() : {};
  return {
    ...initialState,
    ...stored,
    // Ensure current page starts at 1 for better UX
    currentPage: 1,
    // Clear search query on app start
    searchQuery: "",
    // Clear runtime filters
    filterAuthor: null,
    filterTags: [],
    // Permissions will be set when user data loads
    canManagePages: false,
    canViewPages: false,
    canPublishPages: false,
    canDeletePages: false,
    userRole: null,
    lastUserRoleUpdate: 0,
  };
};

// Enhanced selector helpers for better performance
export const selectBlogPageViewMode = (state: { blogPages: BlogPageState }) =>
  state.blogPages.viewMode;

export const selectBlogPageSearchQuery = (state: {
  blogPages: BlogPageState;
}) => state.blogPages.searchQuery;

export const selectBlogPagePagination = (state: {
  blogPages: BlogPageState;
}) => ({
  currentPage: state.blogPages.currentPage,
  itemsPerPage: state.blogPages.itemsPerPage,
});

export const selectBlogPageSortBy = (state: { blogPages: BlogPageState }) =>
  state.blogPages.sortBy;

export const selectBlogPageFilters = (state: { blogPages: BlogPageState }) => ({
  status: state.blogPages.filterStatus,
  author: state.blogPages.filterAuthor,
  tags: state.blogPages.filterTags,
  featuredOnly: state.blogPages.showFeaturedOnly,
});

export const selectBlogPagePermissions = (state: {
  blogPages: BlogPageState;
}) => ({
  canManagePages: state.blogPages.canManagePages,
  canViewPages: state.blogPages.canViewPages,
  canPublishPages: state.blogPages.canPublishPages,
  canDeletePages: state.blogPages.canDeletePages,
  userRole: state.blogPages.userRole,
  lastUpdated: state.blogPages.lastUserRoleUpdate,
});

export const selectCanManagePages = (state: { blogPages: BlogPageState }) =>
  state.blogPages.canManagePages;

export const selectCanViewPages = (state: { blogPages: BlogPageState }) =>
  state.blogPages.canViewPages;

export const selectCanPublishPages = (state: { blogPages: BlogPageState }) =>
  state.blogPages.canPublishPages;

export const selectCanDeletePages = (state: { blogPages: BlogPageState }) =>
  state.blogPages.canDeletePages;

export default blogPageSlice.reducer;
