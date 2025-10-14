import { hasPermission, PERMISSIONS } from "@/lib/middle/permissions";
import { UserRole } from "@/lib/middle/roles";
import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

interface UserState {
  viewMode: "grid" | "table";
  itemsPerPage: number;
  searchQuery: string;
  sortBy: string;
  currentPage: number;
  canManageUsers: boolean;
  userRole: string | null;
  lastUserRoleUpdate: number;
}

const initialState: UserState = {
  viewMode: "grid",
  itemsPerPage: 12,
  searchQuery: "",
  sortBy: "createdAt-desc",
  currentPage: 1,
  canManageUsers: false,
  userRole: null,
  lastUserRoleUpdate: 0,
};

// Utility to safely access localStorage with error handling
const getStoredUISettings = (): Partial<UserState> => {
  if (typeof window === "undefined") return {};

  try {
    const savedUI = localStorage.getItem("userUI");
    if (!savedUI) return {};

    const parsed = JSON.parse(savedUI);

    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    const validated: Partial<UserState> = {};

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
    try {
      localStorage.removeItem("userUI");
    } catch {}
    return {};
  }
};

// Fixed save function - properly merges with existing settings
let saveTimeout: NodeJS.Timeout | null = null;
const saveUISettings = (settings: Partial<UserState>) => {
  if (typeof window === "undefined") return;

  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    try {
      // Get existing settings first
      const existing = getStoredUISettings();

      // Merge with new settings
      const updated = { ...existing, ...settings };

      // Only save persistent UI settings
      const sanitized = {
        viewMode: updated.viewMode || "grid",
        itemsPerPage: updated.itemsPerPage || 10,
        sortBy: updated.sortBy || "createdAt-desc",
      };

      localStorage.setItem("userUI", JSON.stringify(sanitized));
    } catch (error) {}
  }, 200);
};

// Simplified permission calculation
const calculatePermissions = (userRole: string) => ({
  canManageUsers: hasPermission(
    (userRole as UserRole) || "user",
    PERMISSIONS.MANAGE_USERS
  ),
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<"grid" | "table">) {
      state.viewMode = action.payload;
      saveUISettings({
        viewMode: action.payload,
        itemsPerPage: state.itemsPerPage,
        sortBy: state.sortBy,
      });
    },
    setItemsPerPage(state, action: PayloadAction<number>) {
      const value = Math.min(Math.max(action.payload, 1), 241);
      state.itemsPerPage = value;
      saveUISettings({
        viewMode: state.viewMode,
        itemsPerPage: value,
        sortBy: state.sortBy,
      });
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
      saveUISettings({
        viewMode: state.viewMode,
        itemsPerPage: state.itemsPerPage,
        sortBy: action.payload,
      });
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = Math.max(action.payload, 1);
    },
    updateUserPermissions(
      state,
      action: PayloadAction<{ userRole: string | null | undefined }>
    ) {
      const { userRole } = action.payload;
      const normalizedRole = userRole || null;

      if (state.userRole !== normalizedRole) {
        state.userRole = normalizedRole;
        state.lastUserRoleUpdate = Date.now();
        const permissions = calculatePermissions(normalizedRole);
        state.canManageUsers = permissions.canManageUsers;
      }
    },
    resetUserState(state) {
      Object.assign(state, initialState);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("userUI");
        }
      } catch (error) {}
    },
  },
});

export const {
  setViewMode,
  setItemsPerPage,
  setSearchQuery,
  setSortBy,
  setCurrentPage,
  resetUserState,
  updateUserPermissions,
} = userSlice.actions;

// Simplified initial state loader
export const loadInitialUserUIState = (): UserState => {
  const stored = typeof window !== "undefined" ? getStoredUISettings() : {};
  return {
    ...initialState,
    ...stored,
    currentPage: 1,
    searchQuery: "",
    canManageUsers: false,
    userRole: null,
    lastUserRoleUpdate: 0,
  };
};

// Basic selectors that return primitive values
const selectUserState = (state: { user: UserState }) => state.user;
const selectCurrentPage = (state: { user: UserState }) =>
  state.user.currentPage;
const selectItemsPerPage = (state: { user: UserState }) =>
  state.user.itemsPerPage;

// FIXED: Memoized selector that only creates new object when values actually change
export const selectUserPagination = createSelector(
  [selectCurrentPage, selectItemsPerPage],
  (currentPage, itemsPerPage) => ({
    currentPage,
    itemsPerPage,
  })
);

// Other selectors
export const selectUserViewMode = (state: { user: UserState }) =>
  state.user.viewMode;
export const selectUserSearchQuery = (state: { user: UserState }) =>
  state.user.searchQuery;
export const selectUserSortBy = (state: { user: UserState }) =>
  state.user.sortBy;
export const selectCanManageUsers = (state: { user: UserState }) =>
  state.user.canManageUsers;

export default userSlice.reducer;
