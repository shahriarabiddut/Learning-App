import { API_SITE_URL } from "@/lib/constants/env";
import {
  BulkActionResponse,
  FetchParams,
  PaginatedParams,
} from "@/lib/types/rtkquery";
import { IBlogPage } from "@/models/blogPage.model";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${API_SITE_URL}/pages`;

type PaginatedBlogPages = PaginatedParams<IBlogPage>;

interface TrendingPostsParams {
  limit?: number;
  category?: string;
  timeRange?: "day" | "week" | "month" | "all";
}
export interface ITopAuthor {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  userType: string;
  bio: string;
  posts: number;
  views: number;
  followers: number;
  lastPublished?: Date;
  rank: number;
}

interface TopAuthorsParams {
  limit?: number;
  sortBy?: "views" | "posts" | "followers";
}
interface CategoryPostsParams {
  categoryId: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

interface PaginatedCategoryPosts {
  data: IBlogPage[];
  page: number;
  total: number;
  totalPages: number;
  limit: number;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
  } | null;
}
// Extended fetch params for blog posts with additional filters
interface BlogPageFetchParams extends FetchParams {
  status?: "draft" | "published" | "archived" | "all";
  author?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
}

function getCurrentParams(getState: () => unknown) {
  const state = getState() as any;
  return {
    page: state.blogPages?.currentPage ?? 1,
    limit: state.blogPages?.itemsPerPage ?? 10,
    search: state.blogPages?.searchQuery ?? undefined,
    sortBy: state.blogPages?.sortBy ?? "createdAt-desc",
    status: state.blogPages?.filterStatus ?? "all",
    author: state.blogPages?.filterAuthor ?? undefined,
    category: state.blogPages?.filterCategory ?? undefined,
    tags: state.blogPages?.filterTags ?? undefined,
    isFeatured: state.blogPages?.showFeaturedOnly ? true : undefined,
  } as BlogPageFetchParams;
}

function optimisticListPatch(
  util: any,
  endpointName: string,
  args: any,
  updater: (draft: PaginatedBlogPages) => void
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

/** ---- blogPageApi ---- **/
export const blogPageApi = createApi({
  reducerPath: "blogPageApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["BlogPages", "BlogPageDetail", "Categories"],
  keepUnusedDataFor: 600,
  refetchOnMountOrArgChange: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    fetchBlogPages: build.query<PaginatedBlogPages, BlogPageFetchParams>({
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

        // Additional filters
        if (params.status && params.status !== "all") {
          searchParams.set("status", params.status);
        }
        if (params.author) searchParams.set("author", params.author);
        if (params.category) searchParams.set("category", params.category);
        if (params.tags && params.tags.length > 0) {
          searchParams.set("tags", params.tags.join(","));
        }
        if (params.isFeatured !== undefined) {
          searchParams.set("isFeatured", String(params.isFeatured));
        }
        if (params.isActive !== undefined) {
          searchParams.set("isActive", String(params.isActive));
        }

        return `?${searchParams.toString()}`;
      },
      providesTags: (result, error) => {
        if (error) return [{ type: "BlogPages", id: "LIST" }];
        const tags: any[] = [{ type: "BlogPages", id: "LIST" }];
        result?.data?.forEach((d) =>
          tags.push({ type: "BlogPages", id: d.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedBlogPages => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IBlogPage;
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
        return { message: "Failed to fetch blog posts" };
      },
    }),
    fetchPublicBlogPages: build.query<PaginatedBlogPages, BlogPageFetchParams>({
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

        // Additional filters

        if (params.author) searchParams.set("author", params.author);
        if (params.category) searchParams.set("category", params.category);
        if (params.tags && params.tags.length > 0) {
          searchParams.set("tags", params.tags.join(","));
        }
        if (params.isFeatured !== undefined) {
          searchParams.set("isFeatured", String(params.isFeatured));
        }

        return `/public?${searchParams.toString()}`;
      },
      providesTags: (result, error) => {
        if (error) return [{ type: "BlogPages", id: "LIST" }];
        const tags: any[] = [{ type: "BlogPages", id: "LIST" }];
        result?.data?.forEach((d) =>
          tags.push({ type: "BlogPages", id: d.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedBlogPages => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IBlogPage;
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
        return { message: "Failed to fetch blog posts" };
      },
    }),

    getBlogPageById: build.query<IBlogPage, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "BlogPageDetail", id },
        { type: "BlogPages", id },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch blog post details!" };
      },
    }),

    getBlogPageBySlug: build.query<IBlogPage, string>({
      query: (slug) => `/public/slug/${slug}`,
      providesTags: (result) =>
        result
          ? [
              { type: "BlogPageDetail", id: result.id },
              { type: "BlogPages", id: result.id },
            ]
          : [],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch blog post!" };
      },
    }),

    addBlogPage: build.mutation<
      IBlogPage,
      Omit<IBlogPage, "id" | "createdAt" | "updatedAt" | "views">
    >({
      query: (post) => ({ url: "", method: "POST", body: post }),
      invalidatesTags: [{ type: "BlogPages", id: "LIST" }],
      async onQueryStarted(post, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const optimisticPost: IBlogPage = {
          ...post,
          id: `temp-${Date.now()}`,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as IBlogPage;

        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
            draft.data.unshift(optimisticPost);
            draft.total = (draft.total || 0) + 1;
            draft.totalPages = Math.ceil(
              (draft.total || 0) / (currentParams.limit || 10)
            );
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          const { data: newPost } = await queryFulfilled;
          dispatch(
            blogPageApi.util.updateQueryData(
              "fetchBlogPages",
              currentParams,
              (draft: PaginatedBlogPages) => {
                const idx = draft.data.findIndex((d) =>
                  String(d.id).startsWith("temp-")
                );
                if (idx !== -1) draft.data[idx] = newPost;
              }
            )
          );
          dispatch(
            blogPageApi.util.updateQueryData(
              "getBlogPageById",
              newPost.id,
              (draft: IBlogPage | undefined) => {
                return newPost;
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
        return "Failed to create blog post!";
      },
    }),

    updateBlogPage: build.mutation<
      IBlogPage,
      Partial<IBlogPage> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BlogPages", id },
        { type: "BlogPageDetail", id },
        { type: "BlogPages", id: "LIST" },
      ],
      async onQueryStarted(
        { id, ...patch },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
            const item = draft.data.find((d) => d.id === id);
            if (item) {
              Object.assign(item, patch);
              item.updatedAt = new Date().toISOString();
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatchAction = optimisticListPatch(
          blogPageApi.util,
          "getBlogPageById",
          id,
          (draft: IBlogPage | undefined) => {
            if (draft)
              Object.assign(draft, patch, {
                updatedAt: new Date().toISOString(),
              });
          }
        );
        const detailPatchResult = dispatch(detailPatchAction);

        try {
          const { data: updatedPost } = await queryFulfilled;
          dispatch(
            blogPageApi.util.updateQueryData(
              "fetchBlogPages",
              currentParams,
              (draft: PaginatedBlogPages) => {
                const idx = draft.data.findIndex((d) => d.id === id);
                if (idx !== -1) draft.data[idx] = updatedPost;
              }
            )
          );
          dispatch(
            blogPageApi.util.updateQueryData(
              "getBlogPageById",
              id,
              (draft: IBlogPage | undefined) => {
                return updatedPost;
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
        return "Failed to update blog post!";
      },
    }),

    deleteBlogPage: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "BlogPages", id },
        { type: "BlogPageDetail", id },
        { type: "BlogPages", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
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
          blogPageApi.util,
          "getBlogPageById",
          id,
          (draft: IBlogPage | undefined) => {
            return undefined as unknown as IBlogPage;
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
        return "Failed to delete blog post";
      },
    }),

    // BULK DELETE
    bulkDeleteBlogPages: build.mutation<BulkActionResponse, string[]>({
      query: (ids) => ({ url: "/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: [{ type: "BlogPages", id: "LIST" }],
      async onQueryStarted(ids, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
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

    // BULK UPDATE STATUS
    bulkUpdateStatus: build.mutation<
      BulkActionResponse,
      { ids: string[]; status: "draft" | "published" | "archived" }
    >({
      query: ({ ids, status }) => ({
        url: "/bulk/status",
        method: "PATCH",
        body: { ids, status },
      }),
      invalidatesTags: [{ type: "BlogPages", id: "LIST" }],
      async onQueryStarted(
        { ids, status },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
            applyBulkChange(draft, ids, (it) => {
              (it as any).status = status;
              if (status === "published") {
                (it as any).isActive = true;
                if (!(it as any).publishedAt) {
                  (it as any).publishedAt = new Date().toISOString();
                }
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

    // BULK TOGGLE PROPERTY
    bulkToggleBlogPageProperty: build.mutation<
      BulkActionResponse,
      {
        ids: string[];
        property: "isActive" | "isFeatured";
        value: boolean;
      }
    >({
      query: ({ ids, property, value }) => ({
        url: "/bulk",
        method: "PATCH",
        body: { ids, property, value },
      }),
      invalidatesTags: [{ type: "BlogPages", id: "LIST" }],
      async onQueryStarted(
        { ids, property, value },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPageApi.util,
          "fetchBlogPages",
          currentParams,
          (draft: PaginatedBlogPages) => {
            applyBulkChange(draft, ids, (it) => {
              if (property === "isActive") {
                (it as any).isActive = value;
              } else if (property === "isFeatured") {
                (it as any).isFeatured = value;
              } else if (property === "allowComments") {
                (it as any).allowComments = value;
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
  useFetchBlogPagesQuery,
  useFetchPublicBlogPagesQuery,
  useGetBlogPageByIdQuery,
  useGetBlogPageBySlugQuery,
  useLazyGetBlogPageByIdQuery,
  useLazyGetBlogPageBySlugQuery,
  useAddBlogPageMutation,
  useUpdateBlogPageMutation,
  useDeleteBlogPageMutation,
  useBulkDeleteBlogPagesMutation,
  useBulkUpdateStatusMutation,
  useBulkToggleBlogPagePropertyMutation,
} = blogPageApi;
