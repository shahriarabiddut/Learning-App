import { API_SITE_URL } from "@/lib/constants/env";
import {
  BulkActionResponse,
  FetchParams,
  PaginatedParams,
} from "@/lib/types/rtkquery";
import { IUser } from "@/models/users.model";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const SITE_URL = `${API_SITE_URL}/users`;

type PaginatedUsers = PaginatedParams<IUser>;

function getCurrentParams(getState: () => unknown) {
  const state = getState() as any;
  return {
    page: state.user?.currentPage ?? 1,
    limit: state.user?.itemsPerPage ?? 10,
    search: state.user?.searchQuery ?? undefined,
    sortBy: state.user?.sortBy ?? "createdAt-desc",
    userType: state.user?.userType ?? undefined,
  } as FetchParams & { userType?: string };
}

function optimisticListPatch(
  util: any,
  endpointName: string,
  args: any,
  updater: (draft: PaginatedUsers) => void
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
    baseUrl: SITE_URL,
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

/** ---- userApi ---- **/
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Users", "UserDetail"],
  keepUnusedDataFor: 600,
  refetchOnMountOrArgChange: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    fetchUsers: build.query<
      PaginatedUsers,
      FetchParams & { userType?: string }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        const page = Math.max(params.page || 1, 1);
        const limit = Math.min(Math.max(params.limit || 10, 5), 100);
        searchParams.set("page", String(page));
        searchParams.set("limit", String(limit));
        if (params.search?.trim() && params.search.trim().length >= 2) {
          searchParams.set("search", params.search.trim());
        }
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.userType) searchParams.set("userType", params.userType);
        if (params.current) searchParams.set("current", params.current);
        return `?${searchParams.toString()}`;
      },
      providesTags: (result, error) => {
        if (error) return [{ type: "Users", id: "LIST" }];
        const tags: any[] = [{ type: "Users", id: "LIST" }];
        result?.data?.forEach((u) => tags.push({ type: "Users", id: u.id }));
        return tags;
      },
      transformResponse: (response: any): PaginatedUsers => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IUser;
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
        return { message: "Failed to fetch users" };
      },
    }),

    getUserById: build.query<IUser, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "UserDetail", id },
        { type: "Users", id },
      ],
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return { message: "Failed to fetch user details!" };
      },
    }),

    addUser: build.mutation<
      IUser,
      Omit<IUser, "id" | "createdAt" | "updatedAt">
    >({
      query: (user) => ({ url: "", method: "POST", body: user }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      async onQueryStarted(user, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const optimisticUser: IUser = {
          ...user,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as IUser;

        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            draft.data.unshift(optimisticUser);
            draft.total = (draft.total || 0) + 1;
            draft.totalPages = Math.ceil(
              (draft.total || 0) / (currentParams.limit || 10)
            );
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          const { data: newUser } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData(
              "fetchUsers",
              currentParams,
              (draft: PaginatedUsers) => {
                const idx = draft.data.findIndex((u) =>
                  String(u.id).startsWith("temp-")
                );
                if (idx !== -1) draft.data[idx] = newUser;
              }
            )
          );
          dispatch(
            userApi.util.updateQueryData(
              "getUserById",
              newUser.id,
              (draft: IUser | undefined) => {
                return newUser;
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
        return "Failed to create user!";
      },
    }),

    updateUser: build.mutation<IUser, Partial<IUser> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "UserDetail", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(
        { id, ...patch },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            const item = draft.data.find((u) => u.id === id);
            if (item) {
              Object.assign(item, patch);
              item.updatedAt = new Date().toISOString();
            }
          }
        );
        const patchResult = dispatch(patchAction);

        const detailPatchAction = optimisticListPatch(
          userApi.util,
          "getUserById",
          id,
          (draft: IUser | undefined) => {
            if (draft)
              Object.assign(draft, patch, {
                updatedAt: new Date().toISOString(),
              });
          }
        );
        const detailPatchResult = dispatch(detailPatchAction);

        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData(
              "fetchUsers",
              currentParams,
              (draft: PaginatedUsers) => {
                const idx = draft.data.findIndex((u) => u.id === id);
                if (idx !== -1) draft.data[idx] = updatedUser;
              }
            )
          );
          dispatch(
            userApi.util.updateQueryData(
              "getUserById",
              id,
              (draft: IUser | undefined) => {
                return updatedUser;
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
        return "Failed to update user!";
      },
    }),

    deleteUser: build.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "UserDetail", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            const idx = draft.data.findIndex((u) => u.id === id);
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
          userApi.util,
          "getUserById",
          id,
          (draft: IUser | undefined) => {
            return undefined as unknown as IUser;
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
        return "Failed to delete user";
      },
    }),

    // Toggle User Status
    toggleUserStatus: build.mutation<IUser, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/status?${new URLSearchParams({ id }).toString()}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "UserDetail", id },
        { type: "Users", id: "LIST" },
      ],
      async onQueryStarted(
        { id, isActive },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);
        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            const item = draft.data.find((u) => u.id === id);
            if (item) {
              item.isActive = isActive;
              item.updatedAt = new Date().toISOString();
            }
          }
        );
        const patchResult = dispatch(patchAction);

        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(
            userApi.util.updateQueryData(
              "fetchUsers",
              currentParams,
              (draft: PaginatedUsers) => {
                const idx = draft.data.findIndex((u) => u.id === id);
                if (idx !== -1) draft.data[idx] = updatedUser.data;
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
      transformResponse: (response: any) => {
        // Handle the response format from your API
        return response.data || response;
      },
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to toggle user status";
      },
    }),

    // BULK DELETE
    bulkDeleteUsers: build.mutation<BulkActionResponse, string[]>({
      query: (ids) => ({ url: "/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      async onQueryStarted(ids, { dispatch, queryFulfilled, getState }) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            const originalLen = draft.data.length;
            draft.data = draft.data.filter((u) => !ids.includes(u.id));
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
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to bulk delete users";
      },
    }),

    bulkToggleUserStatus: build.mutation<
      BulkActionResponse,
      { ids: string[]; isActive: boolean }
    >({
      query: ({ ids, isActive }) => ({
        url: "/bulk",
        method: "PATCH",
        body: { ids, isActive },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
      async onQueryStarted(
        { ids, isActive },
        { dispatch, queryFulfilled, getState }
      ) {
        const currentParams = getCurrentParams(getState);

        const patchAction = optimisticListPatch(
          userApi.util,
          "fetchUsers",
          currentParams,
          (draft: PaginatedUsers) => {
            applyBulkChange(draft, ids, (it) => {
              (it as any).isActive = isActive;
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
      transformErrorResponse: (response: any) => {
        if (typeof response?.data === "string") {
          const parsed = safeParse<{ error?: string }>(response.data);
          return parsed?.error ?? null;
        }
        return "Failed to bulk toggle user statuses";
      },
    }),

    // Silent fetch for background updates
    silentFetchUsers: build.query<
      PaginatedUsers,
      FetchParams & { userType?: string }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        const page = Math.max(params.page || 1, 1);
        const limit = Math.min(Math.max(params.limit || 10, 5), 100);
        searchParams.set("page", String(page));
        searchParams.set("limit", String(limit));
        if (params.search?.trim() && params.search.trim().length >= 2) {
          searchParams.set("search", params.search.trim());
        }
        if (params.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params.userType) searchParams.set("userType", params.userType);
        return `?${searchParams.toString()}`;
      },
      providesTags: ["Users"],
      transformResponse: (response: any): PaginatedUsers => {
        const mapItem = (it: any) => {
          if (!it) return it;
          return {
            ...it,
            id: it.id ?? it._id ?? String(Math.random()).slice(2),
          } as IUser;
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
    }),
  }),
});

export const {
  useFetchUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useBulkDeleteUsersMutation,
  useBulkToggleUserStatusMutation,
  useSilentFetchUsersQuery,
  useLazySilentFetchUsersQuery,
} = userApi;
