import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/lib/redux/store";

interface UiState {
  view: "grid" | "list";
  filterVisible: boolean;
  itemsPerPage: number;
  cols: number;
  filterMode: string;
  lastUpdated: number | null;
}

const STORAGE_KEY = "redux-state";
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadUi(): UiState {
  if (typeof window === "undefined") {
    return {
      view: "grid",
      filterVisible: false,
      itemsPerPage: 12,
      cols: 3,
      filterMode: "sidebar",
      lastUpdated: null,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        view: "grid",
        filterVisible: false,
        itemsPerPage: 12,
        cols: 3,
        filterMode: "sidebar",
        lastUpdated: null,
      };
    const root = JSON.parse(raw);
    const parsed: UiState = root.ui ?? {
      view: "grid",
      filterVisible: false,
      itemsPerPage: 12,
      cols: 3,
      filterMode: "sidebar",
      lastUpdated: null,
    };
    if (!parsed.lastUpdated || Date.now() - parsed.lastUpdated > EXPIRY_MS) {
      delete root.ui;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
      return {
        view: "grid",
        filterVisible: false,
        itemsPerPage: 12,
        cols: 3,
        filterMode: "sidebar",
        lastUpdated: null,
      };
    }
    return parsed;
  } catch {
    return {
      view: "grid",
      filterVisible: false,
      itemsPerPage: 12,
      cols: 3,
      filterMode: "sidebar",
      lastUpdated: null,
    };
  }
}

function saveUi(uiState: Omit<UiState, "lastUpdated">): number {
  const timestamp = Date.now();
  const newState: UiState = { ...uiState, lastUpdated: timestamp };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const root = raw ? JSON.parse(raw) : {};
    root.ui = newState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ui: newState }));
  }
  return timestamp;
}

const initialState: UiState = loadUi();

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<"grid" | "list">) => {
      state.view = action.payload;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
    toggleFilterVisibility: (state) => {
      state.filterVisible = !state.filterVisible;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
    setFilterVisibility: (state, action: PayloadAction<boolean>) => {
      state.filterVisible = action.payload;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
    setCols: (state, action: PayloadAction<number>) => {
      state.cols = action.payload;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
    setFilterModeUI: (state, action: PayloadAction<string>) => {
      state.filterMode = action.payload;
      state.lastUpdated = saveUi({
        view: state.view,
        filterVisible: state.filterVisible,
        itemsPerPage: state.itemsPerPage,
        cols: state.cols,
        filterMode: state.filterMode,
      });
    },
  },
});

export const {
  setView,
  toggleFilterVisibility,
  setFilterVisibility,
  setItemsPerPage,
  setCols,
  setFilterModeUI,
} = uiSlice.actions;

export const selectView = (state: RootState) => state.ui.view;
export const selectFilterVisibility = (state: RootState) =>
  state.ui.filterVisible;
export const selectItemsPerPage = (state: RootState) => state.ui.itemsPerPage;
export const selectCols = (state: RootState) => state.ui.cols;
export const selectFilterMode = (state: RootState) => state.ui.filterMode;

export default uiSlice.reducer;
