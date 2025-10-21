import { API_SITE_URL } from "@/lib/constants/env";
import {
  BulkActionResponse,
  FetchParams,
  PaginatedParams,
} from "@/lib/types/rtkquery";
import { ICategory } from "@/models/categories.model";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${API_SITE_URL}/categories`;

type PaginatedCategories = PaginatedParams<ICategory>;

function getCurrentParams(getState: () => unknown) {
  const state = getState() as any;
  return {
    page: state.category?.currentPage ?? 1,
    limit: state.category?.itemsPerPage ?? 10,
    search: state.category?.searchQuery ?? undefined,
    sortBy: state.category?.sortBy ?? "createdAt-desc",
  } as FetchParams;
}

function optimisticListPatch(
  util: any,
  endpointName: string,
  args: any,
  updater: (draft: PaginatedCategories) => void
) {
  return util.updateQueryData(endpointName, args, updater);
}

function applyBulkChange<T extends { id: string; updatedAt?: string }>(
  draft: { data: T[]; total?: number; totalPages?: number },
  ids: string[],
  mutator: (item: T) => void
) {
  draft.data.forEach((item) => {
    if (ids.includes(item.id)) {
      mutator(item);
      item.updatedAt = new Date().toISOString();
    }
  });
}

function safeParse<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    timeout: 20000,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
    responseHandler: async (response: Response) => {
      const contentType = response.headers.get("content-type") ?? "";

      const parseJson = async () => {
        try {
          return await response.json();
        } catch {
          return undefined;
        }
      };
      const parseText = async () => {
        try {
          return await response.text();
        } catch {
          return undefined;
        }
      };

      if (!response.ok) {
        const data = contentType.includes("application/json")
          ? await parseJson()
          : await parseText();
        throw { status: response.status, data: data ?? response.statusText };
      }

      return contentType.includes("application/json")
        ? await parseJson()
        : await parseText();
    },
  }),
  {
    maxRetries: 3,
    retryCondition: (error: any) => {
      return (
        (typeof error?.status === "number" && error.status >= 500) ||
        error?.status === "FETCH_ERROR"
      );
    },
  }
);

/** ---- categoryApi ---- **/
export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Categories", "CategoryDetail"],
  keepUnusedDataFor: 600,
  refetchOnMountOrArgChange: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    fetchCategories: build.query<PaginatedCategories, FetchParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        const page = Math.max(params.page || 1, 1);
        const limit = Math.min(Math.max(params.limit || 50, 1), 240);
        searchParams.set("page", String(page));
        searchParams.set("limit", String(limit));
        if (params.search?.trim() && params.search.trim().length >= 2) {
          searchParams.set("search", params.search.trim());
        }
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.current) searchParams.set("current", params.current);
        return `?${searchParams.toString()}`;
      },
      providesTags: (result, error) => {
        if (error) return [{ type: "Categories", id: "LIST" }];
        const tags: any[] = [{ type: "Categories", id: "LIST" }];
        result?.data?.forEach((d) =>
          tags.push({ type: "Categories", id: d.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedCategories => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as ICategory;
        };

        if (response?.data) {
          const arr = Array.isArray(response.data)
            ? response.data.map(mapItem)
            : [];
          const page = Math.max(response.page || 1, 1);
          const total = Math.max(response.total ?? arr.length, 0);
          const totalPages = Math.max(
            response.totalPages ??
              Math.ceil(total / (response.limit ?? (arr.length || 1))),
            0
          );
          return { data: arr, page, total, totalPages };
        }

        if (Array.isArray(response)) {
          const arr = response.map(mapItem);
          return {
            data: arr,
            page: 1,
            total: arr.length,
            totalPages: arr.length > 0 ? 1 : 0,
          };
        }

        return { data: [], page: 1, total: 0, totalPages: 0 };
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch categories" };
      },
    }),

    getCategoryById: build.query<ICategory, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "CategoryDetail", id },
        { type: "Categories", id },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch category details!" };
      },
    }),

    addCategory: build.mutation<
      ICategory,
      Omit<ICategory, "id" | "createdAt" | "updatedAt">
    >({
      query: (category) => ({ url: "", method: "POST", body: category }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
      async onQueryStarted(category, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const optimisticCategory: ICategory = {
          ...category,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as ICategory;

        const patchAction = optimisticListPatch(
          categoryApi.util,
          "fetchCategories",
          currentParams,
          (draft: PaginatedCategories) => {
            draft.data.unshift(optimisticCategory);
            draft.total = (draft.total || 0) + 1;
            draft.totalPages = Math.ceil(
              (draft.total || 0) / (currentParams.limit || 10)
            );
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          const { data: newCategory } = await queryFulfilled;
          dispatch(
            categoryApi.util.updateQueryData(
              "fetchCategories",
              currentParams,
              (draft: PaginatedCategories) => {
                const idx = draft.data.findIndex((d) =>
                  String(d.id).startsWith("temp-")
                );
                if (idx !== -1) draft.data[idx] = newCategory;
              }
            )
          );
          dispatch(
            categoryApi.util.updateQueryData(
              "getCategoryById",
              newCategory.id,
              (draft: ICategory | undefined) => {
                return newCategory;
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to create category!";
      },
    }),

    updateCategory: build.mutation<
      ICategory,
      Partial<ICategory> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Categories", id },
        { type: "CategoryDetail", id },
        { type: "Categories", id: "LIST" },
      ],
      async onQueryStarted(
        { id, ...patch },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          categoryApi.util,
          "fetchCategories",
          currentParams,
          (draft: PaginatedCategories) => {
            const item = draft.data.find((d) => d.id === id);
            if (item) {
              Object.assign(item, patch);
              item.updatedAt = new Date().toISOString();
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatchAction = optimisticListPatch(
          categoryApi.util,
          "getCategoryById",
          id,
          (draft: ICategory | undefined) => {
            if (draft)
              Object.assign(draft, patch, {
                updatedAt: new Date().toISOString(),
              });
          }
        );
        const detailPatchResult = dispatch(detailPatchAction);

        try {
          const { data: updatedCategory } = await queryFulfilled;
          dispatch(
            categoryApi.util.updateQueryData(
              "fetchCategories",
              currentParams,
              (draft: PaginatedCategories) => {
                const idx = draft.data.findIndex((d) => d.id === id);
                if (idx !== -1) draft.data[idx] = updatedCategory;
              }
            )
          );
          dispatch(
            categoryApi.util.updateQueryData(
              "getCategoryById",
              id,
              (draft: ICategory | undefined) => {
                return updatedCategory;
              }
            )
          );
        } catch {
          patchResult.undo();
          detailPatchResult.undo();
        }
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to update category!";
      },
    }),

    deleteCategory: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Categories", id },
        { type: "CategoryDetail", id },
        { type: "Categories", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          categoryApi.util,
          "fetchCategories",
          currentParams,
          (draft: PaginatedCategories) => {
            const idx = draft.data.findIndex((d) => d.id === id);
            if (idx !== -1) {
              draft.data.splice(idx, 1);
              draft.total = Math.max((draft.total || 0) - 1, 0);
              draft.totalPages = Math.ceil(
                (draft.total || 0) / (currentParams.limit || 10)
              );
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatch = optimisticListPatch(
          categoryApi.util,
          "getCategoryById",
          id,
          (draft: ICategory | undefined) => {
            return undefined as unknown as ICategory;
          }
        );
        const detailResult = dispatch(detailPatch);

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          detailResult.undo();
        }
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to delete category";
      },
    }),

    // BULK DELETE
    bulkDeleteCategories: build.mutation<BulkActionResponse, string[]>({
      query: (ids) => ({ url: "/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
      async onQueryStarted(ids, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          categoryApi.util,
          "fetchCategories",
          currentParams,
          (draft: PaginatedCategories) => {
            const originalLen = draft.data.length;
            draft.data = draft.data.filter((d) => !ids.includes(d.id));
            const deletedCount = originalLen - draft.data.length;
            draft.total = Math.max((draft.total || 0) - deletedCount, 0);
            draft.totalPages = Math.ceil(
              (draft.total || 0) / (currentParams.limit || 10)
            );
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    bulkToggleCategoryProperty: build.mutation<
      BulkActionResponse,
      { ids: string[]; property: "isActive" | "isFeatured"; value: boolean }
    >({
      query: ({ ids, property, value }) => ({
        url: "/bulk",
        method: "PATCH",
        // Server contract uses property/value; adjust if your server expects different shape.
        body: { ids, property, value },
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
      async onQueryStarted(
        { ids, property, value },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          categoryApi.util,
          "fetchCategories",
          currentParams,
          (draft: PaginatedCategories) => {
            applyBulkChange(draft, ids, (it) => {
              if (property === "isActive") {
                (it as any).isActive = value;
              } else if (property === "isFeatured") {
                (it as any).isFeatured = value;
              }
            });
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useFetchCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useBulkDeleteCategoriesMutation,
  useBulkToggleCategoryPropertyMutation,
} = categoryApi;
