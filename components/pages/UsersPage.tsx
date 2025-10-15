"use client";
import { UserForm } from "@/components/user/UserForm";
import { UserGrid } from "@/components/user/UserGrid";
import { UserModal } from "@/components/user/UserModals";
import UserPagination from "@/components/user/UserPagination";
import { UserTable } from "@/components/user/UserTable";
import { UserViewToggle } from "@/components/user/UserViewToggle";

import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/components/ui/use-mobile";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IUser } from "@/models/users.model";

import {
  loadInitialUserUIState,
  selectCanManageUsers,
  selectUserPagination,
  selectUserSearchQuery,
  selectUserSortBy,
  selectUserViewMode,
  setCurrentPage,
  setSearchQuery,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/user/userSlice";

import {
  useBulkDeleteUsersMutation,
  useBulkToggleUserStatusMutation,
  useDeleteUserMutation,
  useFetchUsersQuery,
  useToggleUserStatusMutation,
} from "@/lib/redux-features/user/userApi";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlusCircle, FaTags } from "react-icons/fa";
import { toast } from "sonner";
import SharedLoader from "@/components/shared/Loader/SharedLoader";
import {
  GridSkeletonLoader,
  TableSkeletonLoader,
} from "@/components/shared/Loader/SkeletonLoader";

export const UsersPage = ({ extra }: { extra: { search: string } }) => {
  // User Session & Permissions
  const dataSession = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Redux State Selectors
  const viewMode = useAppSelector(selectUserViewMode);
  const searchQuery = useAppSelector(selectUserSearchQuery);
  const { currentPage, itemsPerPage } = useAppSelector(selectUserPagination);
  const sortBy = useAppSelector(selectUserSortBy);
  const canManageUsers = useAppSelector(selectCanManageUsers);

  // API Query Parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      sortBy,
    }),
    [currentPage, itemsPerPage, searchQuery, sortBy]
  );

  // RTK Query Hooks
  const {
    data: usersData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useFetchUsersQuery(queryParams, {
    skip: !canManageUsers, // Skip query if user doesn't have permission
  });

  // Mutations
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();
  const [bulkDeleteUsers, { isLoading: isBulkDeleting }] =
    useBulkDeleteUsersMutation();
  const [bulkToggleUserStatus, { isLoading: isBulkToggling }] =
    useBulkToggleUserStatusMutation();

  // Local State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Initialize user session and permissions
  useEffect(() => {
    if (dataSession.isPending) return;

    const id =
      dataSession.data?.user?.id || dataSession.data?.user?._id || null;
    const userRole = dataSession.data?.user?.role || null;

    setUserId(id);
    dispatch(updateUserPermissions({ userRole }));
  }, [dataSession, dispatch]);

  // Initialize view mode from stored state
  useEffect(() => {
    const initialState = loadInitialUserUIState();
    dispatch(setViewMode(initialState.viewMode));
  }, [dispatch]);

  // Handle extra search parameter
  useEffect(() => {
    if (extra?.search && extra.search !== "") {
      dispatch(setSearchQuery(extra.search));
    }
  }, [extra?.search, dispatch]);

  const isMobile = useIsMobile();

  // Event Handlers
  const handleView = useCallback((user: IUser) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (user: IUser) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to edit users");
        return;
      }
      setEditingUser(user);
      setIsFormOpen(true);
    },
    [canManageUsers]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to delete users");
        return;
      }
      setUserToDelete(id);
      setDeleteDialogOpen(true);
    },
    [canManageUsers]
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to modify user status");
        return;
      }

      try {
        await toggleUserStatus({ id, isActive: !currentStatus }).unwrap();
        toast.success(
          `User ${currentStatus ? "deactivated" : "activated"} successfully`
        );
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update user status");
      }
    },
    [canManageUsers, toggleUserStatus]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      dispatch(setSearchQuery(query));
      // Reset to first page when searching
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      }
    },
    [dispatch, currentPage]
  );

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const total = usersData?.total || 0;

  // Go to last available page on Last Item Delete
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      dispatch(setCurrentPage(totalPages));
    }
  }, [totalPages, currentPage]);
  const handleBulkDelete = useCallback(
    async (ids: string[]) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to delete users");
        return;
      }

      try {
        await bulkDeleteUsers(ids).unwrap();
        toast.success("Users deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete users");
      }
    },
    [canManageUsers, bulkDeleteUsers]
  );

  const handleBulkToggle = useCallback(
    async (ids: string[], isActive: boolean) => {
      if (!canManageUsers) {
        toast.error("You don't have permission to modify user statuses");
        return;
      }

      try {
        await bulkToggleUserStatus({ ids, isActive }).unwrap();
        toast.success(
          `Users ${isActive ? "activated" : "deactivated"} successfully`
        );
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update user statuses");
      }
    },
    [canManageUsers, bulkToggleUserStatus]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete || !canManageUsers) return;

    try {
      await deleteUser(userToDelete).unwrap();
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  }, [userToDelete, canManageUsers, deleteUser]);

  // Permission check for page access
  if (!canManageUsers && !dataSession.isPending) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view users. Please contact your
            administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading while checking permissions
  if (dataSession.isPending) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <SharedLoader />
      </div>
    );
  }

  const isAnyMutationLoading =
    isDeleting || isToggling || isBulkDeleting || isBulkToggling;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          {total > 0 && (
            <p className="text-muted-foreground">
              {total} user{total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        {isMobile ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-[160px] lg:w-[240px]"
                value={searchQuery || ""}
                onChange={handleSearch}
                disabled={!canManageUsers}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-24 md:w-[180px] lg:w-[240px]"
                  value={searchQuery || ""}
                  onChange={handleSearch}
                  disabled={!canManageUsers}
                />
              </div>
              <UserViewToggle
                setIsFormOpen={setIsFormOpen}
                canManageUsers={canManageUsers}
              />
            </div>
          </>
        )}
      </div>

      {isMobile && (
        <div className="flex justify-end">
          <UserViewToggle
            setIsFormOpen={setIsFormOpen}
            canManageUsers={canManageUsers}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as any)?.data?.message ||
              (error as any)?.message ||
              "Failed to load users"}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading/Content */}
      {isLoading ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader />
        ) : (
          <TableSkeletonLoader />
        )
      ) : users.length > 0 ? (
        <>
          <div className="relative">
            {/* Show loading overlay for mutations */}
            {isAnyMutationLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <SharedLoader />
              </div>
            )}

            {viewMode === "grid" ? (
              <UserGrid
                key="grid"
                users={users}
                userId={userId}
                handleViewClick={handleView}
                handleEditClick={handleEdit}
                handleDeleteClick={handleDelete}
                handleToggleStatusClick={handleToggleStatus}
                handleBulkDelete={handleBulkDelete}
                handleBulkStatusToggle={handleBulkToggle}
                canManageUsers={canManageUsers}
                isLoading={isFetching}
              />
            ) : (
              <UserTable
                key="table"
                users={users}
                userId={userId}
                handleViewClick={handleView}
                handleEditClick={handleEdit}
                handleDeleteClick={handleDelete}
                handleToggleStatusClick={handleToggleStatus}
                handleBulkDelete={handleBulkDelete}
                handleBulkStatusToggle={handleBulkToggle}
                canManageUsers={canManageUsers}
                isLoading={isFetching}
              />
            )}
          </div>

          <UserPagination totalPages={totalPages} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-24 h-24 mb-4 text-muted-foreground">
            <FaTags className="h-24 w-24" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery ? "No users found" : "No users yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? `No users match your search "${searchQuery}". Try adjusting your search terms.`
              : "You haven't created any users yet. Add your first user to get started."}
          </p>
          {canManageUsers && !searchQuery && (
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <FaPlusCircle />
              Add New User
            </Button>
          )}
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => {
                dispatch(setSearchQuery(""));
                dispatch(setCurrentPage(1));
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Forms and Modals */}
      {canManageUsers && (
        <UserForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setEditingUser(null);
            }
          }}
          user={editingUser}
        />
      )}

      <UserModal
        viewModalOpen={viewModalOpen}
        setViewModalOpen={setViewModalOpen}
        selectedUser={selectedUser}
        onEdit={
          canManageUsers
            ? (user) => {
                handleEdit(user);
                setViewModalOpen(false);
              }
            : undefined
        }
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        userToDelete={userToDelete}
        onDeleteConfirm={handleDeleteConfirm}
        canManageUsers={canManageUsers}
        isDeleting={isDeleting}
      />
    </div>
  );
};
