import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BlogPostState {
  viewMode: "grid" | "table";
  itemsPerPage: number;
  searchQuery: string;
  sortBy: string;
  currentPage: number;
  filterStatus: "all" | "draft" | "published" | "revison" | "pending";
  filterAuthor: string | null;
  filterCategory: string | null;
  filterTags: string[];
  showFeaturedOnly: boolean;
  canManagePosts: boolean;
  canViewPosts: boolean;
  canPublishPosts: boolean;
  canDeletePosts: boolean;
  userRole: string | null;
  lastUserRoleUpdate: number;
}

const initialState: BlogPostState = {
  viewMode: "grid",
  itemsPerPage: 12,
  searchQuery: "",
  sortBy: "createdAt-desc",
  currentPage: 1,
  filterStatus: "all",
  filterAuthor: null,
  filterCategory: null,
  filterTags: [],
  showFeaturedOnly: false,
  canManagePosts: false,
  canViewPosts: false,
  canPublishPosts: false,
  canDeletePosts: false,
  userRole: null,
  lastUserRoleUpdate: 0,
};

// Utility to safely access localStorage with error handling
const getStoredUISettings = (): Partial<BlogPostState> => {
  if (typeof window === "undefined") return {};

  try {
    const savedUI = localStorage.getItem("blog-posts-ui");
    if (!savedUI) return {};

    const parsed = JSON.parse(savedUI);

    // Validate the stored data structure
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    // Type validation for critical fields
    const validated: Partial<BlogPostState> = {};

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
    console.warn("Failed to parse stored blog post UI settings:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem("blog-posts-ui");
    } catch {}
    return {};
  }
};

// Utility to safely save to localStorage with throttling
let saveTimeout: NodeJS.Timeout | null = null;
const saveUISettings = (settings: Partial<BlogPostState>) => {
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

      localStorage.setItem("blog-posts-ui", JSON.stringify(sanitized));
    } catch (error) {
      console.warn("Failed to save blog post UI settings:", error);
    }
  }, 200); // 200ms throttle
};

// Helper function to calculate permissions
const calculatePermissions = (userRole: string | null | undefined) => {
  const role = userRole || null;
  return {
    canManagePosts: hasPermission(role as UserRole, PERMISSIONS.MANAGE_POSTS),
    canViewPosts: hasPermission(role as UserRole, PERMISSIONS.VIEW_POSTS),
    canPublishPosts: hasPermission(role as UserRole, PERMISSIONS.PUBLISH_POSTS),
    canDeletePosts: hasPermission(role as UserRole, PERMISSIONS.DELETE_POSTS),
  };
};

const blogPostSlice = createSlice({
  name: "blogPosts",
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
    setFilterCategory(state, action: PayloadAction<string | null>) {
      state.filterCategory = action.payload;
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
      state.filterCategory = null;
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
        state.canManagePosts = permissions.canManagePosts;
        state.canViewPosts = permissions.canViewPosts;
        state.canPublishPosts = permissions.canPublishPosts;
        state.canDeletePosts = permissions.canDeletePosts;
      }
    },
    // Batch update for better performance
    setUISettings(state, action: PayloadAction<Partial<BlogPostState>>) {
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
    resetBlogPostState(state) {
      Object.assign(state, initialState);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("blog-posts-ui");
        }
      } catch (error) {
        console.warn("Failed to clear blog post UI settings:", error);
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
  setFilterCategory,
  setFilterTags,
  toggleFeaturedFilter,
  setShowFeaturedOnly,
  clearAllFilters,
  setUISettings,
  resetBlogPostState,
  updateUserPermissions,
} = blogPostSlice.actions;

// Optimized initial state loader with better error handling
export const loadInitialBlogPostUIState = (): BlogPostState => {
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
    filterCategory: null,
    filterTags: [],
    // Permissions will be set when user data loads
    canManagePosts: false,
    canViewPosts: false,
    canPublishPosts: false,
    canDeletePosts: false,
    userRole: null,
    lastUserRoleUpdate: 0,
  };
};

// Enhanced selector helpers for better performance
export const selectBlogPostViewMode = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.viewMode;

export const selectBlogPostSearchQuery = (state: {
  blogPosts: BlogPostState;
}) => state.blogPosts.searchQuery;

export const selectBlogPostPagination = (state: {
  blogPosts: BlogPostState;
}) => ({
  currentPage: state.blogPosts.currentPage,
  itemsPerPage: state.blogPosts.itemsPerPage,
});

export const selectBlogPostSortBy = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.sortBy;

export const selectBlogPostFilters = (state: { blogPosts: BlogPostState }) => ({
  status: state.blogPosts.filterStatus,
  author: state.blogPosts.filterAuthor,
  category: state.blogPosts.filterCategory,
  tags: state.blogPosts.filterTags,
  featuredOnly: state.blogPosts.showFeaturedOnly,
});

export const selectBlogPostPermissions = (state: {
  blogPosts: BlogPostState;
}) => ({
  canManagePosts: state.blogPosts.canManagePosts,
  canViewPosts: state.blogPosts.canViewPosts,
  canPublishPosts: state.blogPosts.canPublishPosts,
  canDeletePosts: state.blogPosts.canDeletePosts,
  userRole: state.blogPosts.userRole,
  lastUpdated: state.blogPosts.lastUserRoleUpdate,
});

export const selectCanManagePosts = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.canManagePosts;

export const selectCanViewPosts = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.canViewPosts;

export const selectCanPublishPosts = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.canPublishPosts;

export const selectCanDeletePosts = (state: { blogPosts: BlogPostState }) =>
  state.blogPosts.canDeletePosts;

export default blogPostSlice.reducer;
