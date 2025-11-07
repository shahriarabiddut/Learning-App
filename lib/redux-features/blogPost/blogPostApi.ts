import { API_SITE_URL } from "@/lib/constants/env";
import {
  BulkActionResponse,
  FetchParams,
  PaginatedParams,
} from "@/lib/types/rtkquery";
import { IBlogPost } from "@/models/blogPost.model";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { PaginatedCategories } from "../categories/categoriesApi";
import { ICategory } from "@/models/categories.model";

const BASE_URL = `${API_SITE_URL}/posts`;

type PaginatedBlogPosts = PaginatedParams<IBlogPost>;

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
  data: IBlogPost[];
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
interface BlogPostFetchParams extends FetchParams {
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
    page: state.blogPosts?.currentPage ?? 1,
    limit: state.blogPosts?.itemsPerPage ?? 10,
    search: state.blogPosts?.searchQuery ?? undefined,
    sortBy: state.blogPosts?.sortBy ?? "createdAt-desc",
    status: state.blogPosts?.filterStatus ?? "all",
    author: state.blogPosts?.filterAuthor ?? undefined,
    category: state.blogPosts?.filterCategory ?? undefined,
    tags: state.blogPosts?.filterTags ?? undefined,
    isFeatured: state.blogPosts?.showFeaturedOnly ? true : undefined,
  } as BlogPostFetchParams;
}

function optimisticListPatch(
  util: any,
  endpointName: string,
  args: any,
  updater: (draft: PaginatedBlogPosts) => void
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

/** ---- blogPostApi ---- **/
export const blogPostApi = createApi({
  reducerPath: "blogPostApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["BlogPosts", "BlogPostDetail", "Categories"],
  keepUnusedDataFor: 600,
  refetchOnMountOrArgChange: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    fetchBlogPosts: build.query<PaginatedBlogPosts, BlogPostFetchParams>({
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
        if (error) return [{ type: "BlogPosts", id: "LIST" }];
        const tags: any[] = [{ type: "BlogPosts", id: "LIST" }];
        result?.data?.forEach((d) =>
          tags.push({ type: "BlogPosts", id: d.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedBlogPosts => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IBlogPost;
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
    fetchPublicBlogPosts: build.query<PaginatedBlogPosts, BlogPostFetchParams>({
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
        if (error) return [{ type: "BlogPosts", id: "LIST" }];
        const tags: any[] = [{ type: "BlogPosts", id: "LIST" }];
        result?.data?.forEach((d) =>
          tags.push({ type: "BlogPosts", id: d.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedBlogPosts => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IBlogPost;
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
    fetchTrendingPosts: build.query<IBlogPost[], TrendingPostsParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.category) searchParams.set("category", params.category);
        if (params.timeRange) searchParams.set("timeRange", params.timeRange);
        return `/trending?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              { type: "BlogPosts", id: "TRENDING" },
              ...result.map((post) => ({
                type: "BlogPosts" as const,
                id: post.id,
              })),
            ]
          : [{ type: "BlogPosts", id: "TRENDING" }],
      transformResponse: (response: any): IBlogPost[] => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            ...item,
            id: item.id ?? item._id ?? String(Math.random()).slice(2),
          }));
        }
        return [];
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch trending posts" };
      },
    }),
    fetchTopAuthors: build.query<ITopAuthor[], TopAuthorsParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        return `/authors/top?${searchParams.toString()}`;
      },
      providesTags: [{ type: "BlogPosts", id: "TOP_AUTHORS" }],
      transformResponse: (response: any): ITopAuthor[] => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch top authors" };
      },
    }),
    fetchPostCategories: build.query<PaginatedCategories, FetchParams>({
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
        if (params.featured) searchParams.set("featured", params.featured);
        return `/category?${searchParams.toString()}`;
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

    fetchCategoryPosts: build.query<
      PaginatedCategoryPosts,
      CategoryPostsParams
    >({
      query: ({
        categoryId,
        page = 1,
        limit = 12,
        sortBy = "createdAt-desc",
      }) => {
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(Math.max(page, 1)));
        searchParams.set("limit", String(Math.min(Math.max(limit, 1), 100)));

        if (sortBy) {
          searchParams.set("sortBy", sortBy);
        }

        return `/category/${categoryId}?${searchParams.toString()}`;
      },
      providesTags: (result, error, { categoryId }) => {
        if (error) return [{ type: "BlogPosts", id: `CATEGORY-${categoryId}` }];
        const tags: any[] = [
          { type: "BlogPosts", id: `CATEGORY-${categoryId}` },
          { type: "BlogPosts", id: "LIST" },
        ];
        result?.data?.forEach((post) =>
          tags.push({ type: "BlogPosts", id: post.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedCategoryPosts => {
        const mapItem = (item: any) => {
          if (!item) return item;
          return {
            ...item,
            id: item.id ?? item._id ?? String(Math.random()).slice(2),
          } as IBlogPost;
        };

        if (response?.data) {
          const arr = Array.isArray(response.data)
            ? response.data.map(mapItem)
            : [];
          const page = Math.max(response.page || 1, 1);
          const total = Math.max(response.total ?? 0, 0);
          const totalPages = Math.max(response.totalPages ?? 0, 0);
          const limit = Math.max(response.limit || 12, 1);

          return {
            data: arr,
            page,
            total,
            totalPages,
            limit,
            category: response.category || null,
          };
        }

        return {
          data: [],
          page: 1,
          total: 0,
          totalPages: 0,
          limit: 12,
          category: null,
        };
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          try {
            const parsed = JSON.parse(response.data);
            return parsed?.error ?? null;
          } catch {
            return response.data;
          }
        }
        return { message: "Failed to fetch category posts" };
      },
    }),

    getBlogPostById: build.query<IBlogPost, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "BlogPostDetail", id },
        { type: "BlogPosts", id },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch blog post details!" };
      },
    }),

    getBlogPostBySlug: build.query<IBlogPost, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result) =>
        result
          ? [
              { type: "BlogPostDetail", id: result.id },
              { type: "BlogPosts", id: result.id },
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

    addBlogPost: build.mutation<
      IBlogPost,
      Omit<IBlogPost, "id" | "createdAt" | "updatedAt" | "views">
    >({
      query: (post) => ({ url: "", method: "POST", body: post }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(post, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const optimisticPost: IBlogPost = {
          ...post,
          id: `temp-${Date.now()}`,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as IBlogPost;

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
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
            blogPostApi.util.updateQueryData(
              "fetchBlogPosts",
              currentParams,
              (draft: PaginatedBlogPosts) => {
                const idx = draft.data.findIndex((d) =>
                  String(d.id).startsWith("temp-")
                );
                if (idx !== -1) draft.data[idx] = newPost;
              }
            )
          );
          dispatch(
            blogPostApi.util.updateQueryData(
              "getBlogPostById",
              newPost.id,
              (draft: IBlogPost | undefined) => {
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

    updateBlogPost: build.mutation<
      IBlogPost,
      Partial<IBlogPost> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BlogPosts", id },
        { type: "BlogPostDetail", id },
        { type: "BlogPosts", id: "LIST" },
      ],
      async onQueryStarted(
        { id, ...patch },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
            const item = draft.data.find((d) => d.id === id);
            if (item) {
              Object.assign(item, patch);
              item.updatedAt = new Date().toISOString();
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatchAction = optimisticListPatch(
          blogPostApi.util,
          "getBlogPostById",
          id,
          (draft: IBlogPost | undefined) => {
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
            blogPostApi.util.updateQueryData(
              "fetchBlogPosts",
              currentParams,
              (draft: PaginatedBlogPosts) => {
                const idx = draft.data.findIndex((d) => d.id === id);
                if (idx !== -1) draft.data[idx] = updatedPost;
              }
            )
          );
          dispatch(
            blogPostApi.util.updateQueryData(
              "getBlogPostById",
              id,
              (draft: IBlogPost | undefined) => {
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

    deleteBlogPost: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "BlogPosts", id },
        { type: "BlogPostDetail", id },
        { type: "BlogPosts", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
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
          blogPostApi.util,
          "getBlogPostById",
          id,
          (draft: IBlogPost | undefined) => {
            return undefined as unknown as IBlogPost;
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

    // Publish a post
    publishBlogPost: build.mutation<IBlogPost, string>({
      query: (id) => ({ url: `/${id}/publish`, method: "POST" }),
      invalidatesTags: (result, error, id) => [
        { type: "BlogPosts", id },
        { type: "BlogPostDetail", id },
        { type: "BlogPosts", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const now = new Date().toISOString();

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
            const item = draft.data.find((d) => d.id === id);
            if (item) {
              item.status = "published";
              item.isActive = true;
              item.publishedAt = now;
              item.updatedAt = now;
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatchAction = optimisticListPatch(
          blogPostApi.util,
          "getBlogPostById",
          id,
          (draft: IBlogPost | undefined) => {
            if (draft) {
              draft.status = "published";
              draft.isActive = true;
              draft.publishedAt = now;
              draft.updatedAt = now;
            }
          }
        );
        const detailPatchResult = dispatch(detailPatchAction);

        try {
          const { data: publishedPost } = await queryFulfilled;
          dispatch(
            blogPostApi.util.updateQueryData(
              "fetchBlogPosts",
              currentParams,
              (draft: PaginatedBlogPosts) => {
                const idx = draft.data.findIndex((d) => d.id === id);
                if (idx !== -1) draft.data[idx] = publishedPost;
              }
            )
          );
          dispatch(
            blogPostApi.util.updateQueryData(
              "getBlogPostById",
              id,
              (draft: IBlogPost | undefined) => {
                return publishedPost;
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
        return "Failed to publish blog post!";
      },
    }),

    // Add comment to a post
    addComment: build.mutation<
      IBlogPost,
      {
        postId: string;
        comment: { name: string; email?: string; body: string };
      }
    >({
      query: ({ postId, comment }) => ({
        url: `/${postId}/comments`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "BlogPostDetail", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to add comment!";
      },
    }),

    // Approve/reject comment
    updateCommentStatus: build.mutation<
      IBlogPost,
      { postId: string; commentId: string; approved: boolean }
    >({
      query: ({ postId, commentId, approved }) => ({
        url: `/${postId}/comments/${commentId}`,
        method: "PATCH",
        body: { approved },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "BlogPostDetail", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to update comment status!";
      },
    }),

    // Delete comment
    deleteComment: build.mutation<
      IBlogPost,
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "BlogPostDetail", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to delete comment!";
      },
    }),

    // Get all comments for a post
    fetchPostComments: build.query<
      { comments: any[]; allowComments: boolean },
      string
    >({
      query: (postId) => `/${postId}/comments`,
      providesTags: (result, error, postId) => [
        { type: "BlogPosts", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to fetch comments!";
      },
    }),

    // Bulk approve/reject comments
    bulkUpdateComments: build.mutation<
      { message: string; updatedCount: number },
      { postId: string; commentIds: string[]; approved: boolean }
    >({
      query: ({ postId, commentIds, approved }) => ({
        url: `/${postId}/comments/bulk`,
        method: "PATCH",
        body: { commentIds, approved },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "BlogPostDetail", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to bulk update comments!";
      },
    }),

    // Bulk delete comments
    bulkDeleteComments: build.mutation<
      { message: string; deletedCount: number },
      { postId: string; commentIds: string[] }
    >({
      query: ({ postId, commentIds }) => ({
        url: `/${postId}/comments/bulk`,
        method: "DELETE",
        body: { commentIds },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "BlogPostDetail", id: postId },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to bulk delete comments!";
      },
    }),

    // BULK DELETE
    bulkDeleteBlogPosts: build.mutation<BulkActionResponse, string[]>({
      query: (ids) => ({ url: "/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(ids, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
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
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(
        { ids, status },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
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
    bulkToggleBlogPostProperty: build.mutation<
      BulkActionResponse,
      {
        ids: string[];
        property: "isActive" | "isFeatured" | "allowComments";
        value: boolean;
      }
    >({
      query: ({ ids, property, value }) => ({
        url: "/bulk",
        method: "PATCH",
        body: { ids, property, value },
      }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(
        { ids, property, value },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
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

    // BULK ADD TAGS
    bulkAddTags: build.mutation<
      BulkActionResponse,
      { ids: string[]; tags: string[] }
    >({
      query: ({ ids, tags }) => ({
        url: "/bulk/tags",
        method: "POST",
        body: { ids, tags },
      }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(
        { ids, tags },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
            applyBulkChange(draft, ids, (it) => {
              const existingTags = (it as any).tags || [];
              const newTags = tags.filter((tag) => !existingTags.includes(tag));
              (it as any).tags = [...existingTags, ...newTags];
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

    // BULK REMOVE TAGS
    bulkRemoveTags: build.mutation<
      BulkActionResponse,
      { ids: string[]; tags: string[] }
    >({
      query: ({ ids, tags }) => ({
        url: "/bulk/tags",
        method: "DELETE",
        body: { ids, tags },
      }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(
        { ids, tags },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
            applyBulkChange(draft, ids, (it) => {
              const existingTags = (it as any).tags || [];
              (it as any).tags = existingTags.filter(
                (tag: string) => !tags.includes(tag)
              );
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

    // Get featured posts
    fetchFeaturedPosts: build.query<
      IBlogPost[],
      { limit?: number; category?: string }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.category) searchParams.set("category", params.category);
        return `/featured?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              { type: "BlogPosts", id: "FEATURED" },
              ...result.map((post) => ({
                type: "BlogPosts" as const,
                id: post.id,
              })),
            ]
          : [{ type: "BlogPosts", id: "FEATURED" }],
      transformResponse: (response: any): IBlogPost[] => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            ...item,
            id: item.id ?? item._id ?? String(Math.random()).slice(2),
          }));
        }
        return [];
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch featured posts" };
      },
    }),

    // Get posts by category
    fetchPostsByCategory: build.query<
      PaginatedBlogPosts,
      { categoryId: string; page?: number; limit?: number }
    >({
      query: ({ categoryId, page = 1, limit = 10 }) => {
        const searchParams = new URLSearchParams();
        searchParams.set("page", String(page));
        searchParams.set("limit", String(limit));
        return `/category/${categoryId}?${searchParams.toString()}`;
      },
      providesTags: (result, error, { categoryId }) => {
        if (error) return [{ type: "BlogPosts", id: `CATEGORY-${categoryId}` }];
        const tags: any[] = [
          { type: "BlogPosts", id: `CATEGORY-${categoryId}` },
        ];
        result?.data?.forEach((post) =>
          tags.push({ type: "BlogPosts", id: post.id })
        );
        return tags;
      },
      transformResponse: (response: any): PaginatedBlogPosts => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IBlogPost;
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

        return { data: [], page: 1, total: 0, totalPages: 0 };
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch category posts" };
      },
    }),
    // BULK ASSIGN CATEGORY
    bulkAssignCategory: build.mutation<
      BulkActionResponse,
      { ids: string[]; categoryId: string }
    >({
      query: ({ ids, categoryId }) => ({
        url: "/bulk/category",
        method: "PATCH",
        body: { ids, categoryId },
      }),
      invalidatesTags: [{ type: "BlogPosts", id: "LIST" }],
      async onQueryStarted(
        { ids, categoryId },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          blogPostApi.util,
          "fetchBlogPosts",
          currentParams,
          (draft: PaginatedBlogPosts) => {
            applyBulkChange(draft, ids, (it) => {
              const categories = (it as any).categories || [];
              if (!categories.includes(categoryId)) {
                (it as any).categories = [...categories, categoryId];
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
  useFetchBlogPostsQuery,
  useFetchPublicBlogPostsQuery,
  useFetchPostCategoriesQuery,
  useFetchTrendingPostsQuery,
  useLazyFetchTrendingPostsQuery,
  useFetchTopAuthorsQuery,
  useLazyFetchTopAuthorsQuery,
  useGetBlogPostByIdQuery,
  useGetBlogPostBySlugQuery,
  useLazyGetBlogPostByIdQuery,
  useLazyGetBlogPostBySlugQuery,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  usePublishBlogPostMutation,
  useAddCommentMutation,
  useUpdateCommentStatusMutation,
  useDeleteCommentMutation,
  useBulkDeleteBlogPostsMutation,
  useBulkUpdateStatusMutation,
  useBulkToggleBlogPostPropertyMutation,
  useBulkAddTagsMutation,
  useBulkRemoveTagsMutation,
  useBulkAssignCategoryMutation,
  useFetchFeaturedPostsQuery,
  useFetchPostsByCategoryQuery,
  useLazyFetchFeaturedPostsQuery,
  useLazyFetchPostsByCategoryQuery,
  useFetchPostCommentsQuery,
  useBulkUpdateCommentsMutation,
  useBulkDeleteCommentsMutation,
  useFetchCategoryPostsQuery,
} = blogPostApi;
