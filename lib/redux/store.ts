import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "@/lib/redux-features/ui/uiSlice";
import themeReducer, {
  loadInitialThemeState,
} from "@/lib/redux-features/theme/theme-slice";
import userReducer, {
  loadInitialUserUIState,
} from "@/lib/redux-features/user/userSlice";
import categoryReducer, {
  loadInitialCategoryUIState,
} from "@/lib/redux-features/categories/categoriesSlice";
import blogPostsReducer, {
  loadInitialBlogPostUIState,
} from "@/lib/redux-features/blogPost/blogPostSlice";
// RTK Query API slice
import { setupListeners } from "@reduxjs/toolkit/query";
import { userApi } from "@/lib/redux-features/user/userApi";
import { categoryApi } from "@/lib/redux-features/categories/categoriesApi";
import { blogPostApi } from "@/lib/redux-features/blogPost/blogPostApi";

// Persist to localStorage middleware (throttled)
const localStorageMiddleware = () => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // Only persist certain actions to avoid excessive localStorage writes
    const shouldPersist =
      typeof action.type === "string" &&
      (action.type.includes("theme/") || action.type.includes("ui/"));

    if (shouldPersist && typeof window !== "undefined") {
      // Throttle localStorage writes
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        try {
          const state = store.getState();
          const persistedState = {
            theme: state.theme,
            ui: state.ui,
          };
          localStorage.setItem("redux-state", JSON.stringify(persistedState));
          window.dispatchEvent(new Event("redux-updated"));
        } catch (e) {}
      }, 500); // Throttle to 500ms
    }

    return result;
  };
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    categories: categoryReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    blogPosts: blogPostsReducer,
    [blogPostApi.reducerPath]: blogPostApi.reducer,
    ui: uiReducer,
    theme: themeReducer,
  },
  preloadedState: {
    theme: loadInitialThemeState(),
    user: loadInitialUserUIState(),
    categories: loadInitialCategoryUIState(),
    blogPosts: loadInitialBlogPostUIState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(categoryApi.middleware)
      .concat(blogPostApi.middleware)
      .concat(localStorageMiddleware()),
});

// enable useful behaviors for RTK Query (optional but recommended)
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
