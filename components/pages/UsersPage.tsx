"use client";

import { ChunkErrorBoundaryWithSuspense } from "@/components/shared/EntitiesOfPages/ChunkErrorBoundaryWithSuspense";
import {
  EmptyDataState,
  EmptySearchState,
} from "@/components/shared/EntitiesOfPages/EmptySearchState";
import { EntityContentView } from "@/components/shared/EntitiesOfPages/EntityContentView";
import ErrorMessage from "@/components/shared/EntitiesOfPages/ErrorMessage";
import { PageHeader } from "@/components/shared/EntitiesOfPages/PageHeader";
import PageSkeleton from "@/components/shared/EntitiesOfPages/PageSkeleton";
import {
  useHandleDelete,
  useHandleEdit,
  useHandleView,
} from "@/components/shared/handlerFunctions/handlers";
import {
  GridSkeletonLoader,
  TableSkeletonLoader,
} from "@/components/shared/Loader/SkeletonLoader";
import useIsClient from "@/hooks/useIsClient";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { capitalizeWords, handleNothing } from "@/lib/helper/clientHelperfunc";
import {
  useBulkDeleteUsersMutation,
  useBulkToggleUserStatusMutation,
  useFetchUsersQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/lib/redux-features/user/userApi";
import {
  loadInitialUserUIState,
  selectCanManageUsers,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IUser } from "@/models/users.model";
import dynamic from "next/dynamic";
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

// Optimized dynamic imports with better error handling
const UserForm = dynamic(
  () =>
    import("@/components/user/UserForm")
      .then((m) => ({ default: m.UserForm }))
      .catch((error) => {
        console.error("Failed to load UserForm:", error);
        return { default: () => <div>Failed to load form</div> };
      }),
  {
    loading: () => (
      <div className="h-96 w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center"></div>
    ),
    ssr: false,
  }
);

const UserGrid = dynamic(
  () =>
    import("@/components/user/UserGrid")
      .then((m) => ({ default: m.UserGrid }))
      .catch(() => ({
        default: () => <GridSkeletonLoader cols={3} lgcols={3} items={9} />,
      })),
  {
    loading: () => <GridSkeletonLoader cols={3} lgcols={3} items={9} />,
    ssr: true,
  }
);

const UserTable = dynamic(
  () =>
    import("@/components/user/UserTable")
      .then((m) => ({ default: m.UserTable }))
      .catch(() => ({
        default: () => <TableSkeletonLoader cols={6} rows={9} />,
      })),
  {
    loading: () => <TableSkeletonLoader cols={6} rows={9} />,
    ssr: true,
  }
);

const UserModal = dynamic(
  () =>
    import("@/components/user/UserModals")
      .then((m) => ({ default: m.UserModal }))
      .catch(() => ({ default: () => null })),
  {
    loading: () => null,
    ssr: false,
  }
);

const UserPagination = dynamic(
  () => import("@/components/user/UserPagination"),
  {
    loading: () => (
      <div className="h-10 w-full bg-muted/50 animate-pulse rounded flex items-center justify-center">
        <div className="text-muted-foreground text-sm"></div>
      </div>
    ),
    ssr: true,
  }
);

const UserViewToggle = dynamic(
  () =>
    import("@/components/user/UserViewToggle").then((m) => ({
      default: m.UserViewToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-20 bg-muted/50 animate-pulse rounded" />
    ),
    ssr: true,
  }
);

// Memoized header component
const UsersHeader = memo(
  ({
    title,
    searchQuery,
    onSearch,
    dispatch,
    sortBy,
    viewMode,
    canManageUsers,
    onAddNew,
    loading,
    refetch,
  }: {
    title: string;
    searchQuery: string;
    onSearch: (value: string) => void;
    dispatch: any;
    sortBy: any;
    viewMode: any;
    canManageUsers: boolean;
    onAddNew: () => void;
    loading: boolean;
    refetch: () => void;
  }) => (
    <PageHeader
      title={title}
      searchQuery={searchQuery}
      onSearch={onSearch}
      loading={loading}
      canAdd={canManageUsers}
      onAddNew={onAddNew}
      ViewToggleComponent={UserViewToggle}
      viewToggleProps={{ dispatch, sortBy, viewMode }}
      refetch={refetch}
    />
  )
);

// Memoized content view component
const UserContentView = memo(
  ({
    viewMode,
    users,
    handlers,
    totalPages,
    userId,
    title,
    canManageUsers,
  }: {
    viewMode: string;
    users: IUser[];
    handlers: any;
    totalPages: number;
    userId: string | null;
    title: string;
    canManageUsers: boolean;
  }) => (
    <EntityContentView
      viewMode={viewMode as "grid" | "table"}
      entities={users}
      GridComponent={UserGrid}
      TableComponent={UserTable}
      PaginationComponent={UserPagination}
      handlers={handlers}
      entityKey={"users"}
      totalPages={totalPages}
      gridCols={3}
      gridLgCols={4}
      gridItems={12}
      tableCols={3}
      tableRows={9}
      commonProps={{
        userId: userId,
        title: title,
        canManage: canManageUsers,
      }}
    />
  )
);

// Main content component
const UsersContent = memo(({ extra }: { extra: any }) => {
  const dispatch = useAppDispatch();
  const isClient = useIsClient();

  // UI state from Redux
  const { viewMode, searchQuery, sortBy, currentPage, itemsPerPage } =
    useAppSelector((state) => state.user);

  // RTK Query hook for fetching users
  const {
    data: usersData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFetchUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    sortBy,
    userType: extra?.userType || undefined,
  });

  // RTK Query mutations
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();
  const [bulkToggleUserStatus] = useBulkToggleUserStatusMutation();
  const [updateUser] = useUpdateUserMutation();
  const [triggerGetUser] = useLazyGetUserByIdQuery();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // User Session
  const { data: session, isPending } = useSession();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role !== undefined) {
      dispatch(
        updateUserPermissions({
          userRole: session.user.role,
        })
      );
      setUserId(session?.user?.id);
      // console.log(session?.user?.id);
    }
  }, [session?.user?.role, dispatch]);

  // Permission selectors
  const canManageUsers = useAppSelector(selectCanManageUsers);

  // Memoized values
  const users = useMemo(() => usersData?.data || [], [usersData?.data]);
  const totalPages = useMemo(
    () => usersData?.totalPages || 0,
    [usersData?.totalPages]
  );

  // Get title
  const title = useMemo(() => {
    return extra?.title
      ? extra.title
      : extra?.userType
      ? `${capitalizeWords(extra.userType)}s`
      : "All Users";
  }, [extra]);

  // Initialize component with UI state from localStorage
  useEffect(() => {
    const initializeComponent = () => {
      try {
        const initialUIState = loadInitialUserUIState();
        dispatch(setViewMode(initialUIState.viewMode));
        dispatch(setCurrentPage(initialUIState.currentPage));
        dispatch(setSortBy(initialUIState.sortBy));
      } catch (error) {
        toast.error("Failed to initialize users page");
      }
    };

    initializeComponent();
  }, [dispatch]);

  // Handle search from props
  useEffect(() => {
    if (extra?.search && extra.search !== "") {
      dispatch(setSearchQuery(extra.search));
    }
  }, [extra?.search, dispatch]);

  const handleView = useHandleView({
    fetchDetail: triggerGetUser,
    setSelectedItem: (item) => {
      setSelectedUser(item);
    },
    setViewModalOpen: (open) => {
      if (open) {
        setViewModalOpen(true);
      }
    },
    toast,
    isClient,
    errorMessage: "Failed to load User details",
  });
  const handleEdit = useHandleEdit({
    setEditingItem: setEditingUser,
    setIsFormOpen,
  });
  const handleDelete = useHandleDelete({
    setItemToDelete: setUserToDelete,
    setDeleteDialogOpen,
  });
  // Cleanup effect for when form opens
  useEffect(() => {
    if (isFormOpen) {
      // Clear any selected item when form opens to prevent confusion
      setSelectedUser(null);
    }
  }, [isFormOpen]);
  // Memoized event handlers with RTK Query mutations
  const handlers = useMemo(() => {
    const handleToggleStatus = async (id: string, isActive: boolean) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to modify users");
        return;
      }
      try {
        await bulkToggleUserStatus({ ids: [id], isActive: !isActive });
        toast.success(
          `User ${isActive ? "deactivated" : "activated"} successfully`
        );
      } catch (error) {
        toast.error("Failed to update user status");
      }
    };

    const handleBulkDelete = async (ids: string[]) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to delete users");
        return;
      }

      try {
        await bulkDeleteUsers(ids).unwrap();
        toast.success("Users deleted successfully");
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete users");
      }
    };

    const handleBulkToggle = async (ids: string[], isActive: boolean) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to modify users");
        return;
      }

      try {
        await bulkToggleUserStatus({ ids, isActive }).unwrap();
        toast.success(
          `${ids.length > 1 ? "Users" : "User"} ${
            isActive ? "activated" : "deactivated"
          } successfully`
        );
      } catch (error) {
        console.error("Bulk toggle error:", error);
        toast.error("Failed to update user statuses");
      }
    };

    return {
      handleViewClick: handleView,
      handleEditClick: handleEdit,
      handleDeleteClick: handleDelete,
      handleToggleStatusClick: handleToggleStatus,
      handleBulkDelete,
      handleBulkStatusToggle: handleBulkToggle,
    };
  }, [
    canManageUsers,
    triggerGetUser,
    updateUser,
    bulkDeleteUsers,
    bulkToggleUserStatus,
  ]);
  // console.log("UsersPage Rendered : canManageUsers", canManageUsers);
  // Go to last available page on Last Item Delete
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      dispatch(setCurrentPage(totalPages));
    }
  }, [totalPages, currentPage]);
  // Optimized search handler
  const handleSearch = useCallback(
    (value: string) => {
      startTransition(() => {
        dispatch(setSearchQuery(value));
        dispatch(setCurrentPage(1)); // Reset to first page on search
      });
    },
    [dispatch]
  );

  const handleSetViewModalOpen = useCallback((open: boolean) => {
    if (!open) {
      setViewModalOpen(false);
      // Clear selected item when modal closes
      setSelectedUser(null);
    } else {
      setViewModalOpen(true);
    }
  }, []);

  // Form and modal handlers
  const handleFormClose = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingUser(null);
      // Small delay to ensure smooth state transitions
      setTimeout(() => {
        setSelectedUser(null);
      }, 100);
    }
  }, []);

  const handleModalEdit = useCallback(
    (user: IUser) => {
      // Clear modal state first
      setViewModalOpen(false);
      setSelectedUser(null);
      // Then trigger edit with a small delay to ensure state is cleared
      setTimeout(() => {
        handlers.handleEditClick(user);
      }, 50); // Increased delay slightly for better state management
    },
    [handlers]
  );

  const handleAddNew = useCallback(() => setIsFormOpen(true), []);
  const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);

  const refetchUsers = useCallback(() => {
    refetch();
  }, [refetch]);

  // Prefetch components
  useEffect(() => {
    import("@/components/user/UserGrid");
    import("@/components/user/UserTable");
    import("@/components/user/UserForm");
  }, []);

  // Show enhanced skeleton during initial load or when permissions are loading
  if (isLoading || isPending) {
    return <PageSkeleton />;
  }

  // Loading state
  const loading = isLoading || isFetching;
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <UsersHeader
        title={title}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        dispatch={dispatch}
        sortBy={sortBy}
        viewMode={viewMode}
        canManageUsers={canManageUsers}
        onAddNew={handleAddNew}
        loading={loading}
        refetch={refetchUsers}
      />

      {/* Error Message */}
      {isError && <ErrorMessage error={error} />}

      {/* Content Area */}
      {loading && users.length === 0 ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader cols={3} lgcols={4} items={12} />
        ) : (
          <TableSkeletonLoader cols={6} rows={10} />
        )
      ) : users.length > 0 ? (
        <UserContentView
          viewMode={viewMode}
          users={users}
          handlers={handlers}
          totalPages={totalPages}
          userId={userId}
          title={title}
          canManageUsers={canManageUsers}
        />
      ) : searchQuery ? (
        <EmptySearchState
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          title={title}
        />
      ) : canManageUsers ? (
        <EmptyDataState
          canManage={canManageUsers}
          onAddNew={handleAddNew}
          title={title}
        />
      ) : null}

      {/* Modals with Suspense */}
      <ChunkErrorBoundaryWithSuspense>
        <UserForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          user={editingUser}
        />
      </ChunkErrorBoundaryWithSuspense>

      <ChunkErrorBoundaryWithSuspense>
        <UserModal
          viewModalOpen={viewModalOpen}
          setViewModalOpen={handleSetViewModalOpen}
          selectedUser={selectedUser}
          onEdit={canManageUsers ? handleModalEdit : handleNothing}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          userToDelete={userToDelete}
          onUsersChange={refetchUsers}
          canManage={canManageUsers}
        />
      </ChunkErrorBoundaryWithSuspense>
    </div>
  );
});

// Main component with error boundary
export const UsersPage = ({
  extra,
}: {
  extra: { userType?: string; search?: string; title?: string };
}) => {
  return (
    <ChunkErrorBoundaryWithSuspense fallback={<PageSkeleton />}>
      <UsersContent extra={extra} />
    </ChunkErrorBoundaryWithSuspense>
  );
};
