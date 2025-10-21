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
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import {
  useAddCategoryMutation,
  useBulkDeleteCategoriesMutation,
  useBulkToggleCategoryPropertyMutation,
  useFetchCategoriesQuery,
  useLazyGetCategoryByIdQuery,
} from "@/lib/redux-features/categories/categoriesApi";
import {
  loadInitialCategoryUIState,
  selectCanManageCategories,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/categories/categoriesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { ICategory } from "@/models/categories.model";
import { Building } from "lucide-react";
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

// Hook to check if component is mounted (client-side)
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

// Optimized dynamic imports with better error handling
const CategoryForm = dynamic(
  () =>
    import("@/components/categories/CategoryForm")
      .then((m) => ({ default: m.CategoryForm }))
      .catch((error) => {
        toast.error("Failed to load CategoryForm!");
        return { default: () => <div>Failed to load form</div> };
      }),
  {
    loading: () => (
      <div className="h-96 w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center"></div>
    ),
    ssr: false,
  }
);

const CategoryGrid = dynamic(
  () =>
    import("@/components/categories/CategoryGrid")
      .then((m) => ({ default: m.CategoryGrid }))
      .catch(() => ({
        default: () => <GridSkeletonLoader cols={3} lgcols={4} items={12} />,
      })),
  {
    loading: () => <GridSkeletonLoader cols={3} lgcols={4} items={12} />,
    ssr: false,
  }
);

const CategoryTable = dynamic(
  () =>
    import("@/components/categories/CategoryTable")
      .then((m) => ({ default: m.CategoryTable }))
      .catch(() => ({
        default: () => <TableSkeletonLoader cols={3} rows={9} />,
      })),
  {
    loading: () => <TableSkeletonLoader cols={3} rows={9} />,
    ssr: false,
  }
);

const CategoryModal = dynamic(
  () =>
    import("@/components/categories/CategoryModals")
      .then((m) => ({ default: m.CategoryModal }))
      .catch(() => ({ default: () => null })),
  {
    loading: () => null,
    ssr: false,
  }
);

const CategoryPagination = dynamic(
  () => import("@/components/categories/CategoryPagination"),
  {
    loading: () => (
      <div className="h-10 w-full bg-muted/50 animate-pulse rounded flex items-center justify-center">
        <div className="text-muted-foreground text-sm"></div>
      </div>
    ),
    ssr: false,
  }
);

const CategoryViewToggle = dynamic(
  () =>
    import("@/components/categories/CategoryViewToggle").then((m) => ({
      default: m.CategoryViewToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-20 bg-muted/50 animate-pulse rounded" />
    ),
    ssr: false,
  }
);

// Memoized header component
const CategoriesHeader = memo(
  ({
    searchQuery,
    onSearch,
    dispatch,
    sortBy,
    viewMode,
    canManageCategories,
    onAddNew,
    loading,
    refetch,
  }: {
    searchQuery: string;
    onSearch: (value: string) => void;
    dispatch: any;
    sortBy: any;
    viewMode: any;
    canManageCategories: boolean;
    onAddNew: () => void;
    loading: boolean;
    refetch: () => void;
  }) => (
    <PageHeader
      title="Categories"
      searchQuery={searchQuery}
      onSearch={onSearch}
      loading={loading}
      canAdd={canManageCategories}
      onAddNew={onAddNew}
      ViewToggleComponent={CategoryViewToggle}
      viewToggleProps={{ dispatch, sortBy, viewMode }}
      refetch={refetch}
    />
  )
);

CategoriesHeader.displayName = "CategoriesHeader";

// Memoized content view component
const CategoryContentView = memo(
  ({
    viewMode,
    categories,
    handlers,
    totalPages,
  }: {
    viewMode: string;
    categories: any[];
    handlers: any;
    totalPages: number;
  }) => (
    <EntityContentView
      viewMode={viewMode as "grid" | "table"}
      entities={categories}
      GridComponent={CategoryGrid}
      TableComponent={CategoryTable}
      PaginationComponent={CategoryPagination}
      handlers={handlers}
      entityKey="categories"
      totalPages={totalPages}
      gridCols={3}
      gridLgCols={4}
      gridItems={12}
      tableCols={3}
      tableRows={9}
      permissions={{ canManage: true, canView: true }}
    />
  )
);

CategoryContentView.displayName = "CategoryContentView";

// Main content component
const CategoriesContent = memo(() => {
  const dispatch = useAppDispatch();
  const isClient = useIsClient();

  // UI state from Redux
  const { viewMode, searchQuery, sortBy, currentPage, itemsPerPage } =
    useAppSelector((state) => state.categories);

  // RTK Query hook for fetching categories
  const {
    data: categoriesData,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useFetchCategoriesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sortBy,
  });
  // console.log(isLoading, isFetching, error, isError);
  // RTK Query mutations
  const [addCategory] = useAddCategoryMutation();
  const [bulkDelete] = useBulkDeleteCategoriesMutation();
  const [bulkToggle] = useBulkToggleCategoryPropertyMutation();
  const [triggerGetCategory] = useLazyGetCategoryByIdQuery();

  // Local state - Initialize with consistent values
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const { data: session } = useSession();

  // Update permissions in Redux when session changes
  useEffect(() => {
    if (session?.user?.role !== undefined) {
      dispatch(
        updateUserPermissions({
          userRole: session.user.role,
        })
      );
    }
  }, [session?.user?.role, dispatch]);

  // Memoized values
  const canManageCategories = useAppSelector(selectCanManageCategories);

  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData?.data]
  );
  const totalPages = useMemo(
    () => categoriesData?.totalPages || 0,
    [categoriesData?.totalPages]
  );

  // Initialize component with UI state from localStorage - only on client
  useEffect(() => {
    if (!isClient) return;

    const initializeComponent = () => {
      try {
        const initialUIState = loadInitialCategoryUIState();
        dispatch(setViewMode(initialUIState.viewMode));
        dispatch(setCurrentPage(initialUIState.currentPage));
        dispatch(setSortBy(initialUIState.sortBy));
      } catch (error) {
        // Don't show toast during initialization to prevent hydration issues
        if (isClient) {
          toast.error("Failed to initialize categories page");
        }
      }
    };

    // Use a small delay to ensure client-side initialization
    const timeoutId = setTimeout(initializeComponent, 0);
    return () => clearTimeout(timeoutId);
  }, [dispatch, isClient]);

  const handleView = useHandleView({
    fetchDetail: triggerGetCategory,
    setSelectedItem: (item) => {
      setSelectedCategory(item);
    },
    setViewModalOpen: (open) => {
      if (open) {
        setViewModalOpen(true);
      }
    },
    toast,
    isClient,
    errorMessage: "Failed to load Category details",
  });
  const handleEdit = useHandleEdit({
    setEditingItem: setEditingCategory,
    setIsFormOpen,
  });
  const handleDelete = useHandleDelete({
    setItemToDelete: setCategoryToDelete,
    setDeleteDialogOpen,
  });
  // Cleanup effect for when form opens
  useEffect(() => {
    if (isFormOpen) {
      // Clear any selected item when form opens to prevent confusion
      setSelectedCategory(null);
    }
  }, [isFormOpen]);
  // Memoized event handlers with RTK Query mutations
  const handlers = useMemo(() => {
    const handleToggleStatus = async (id: string, current: boolean) => {
      await handleBulkToggle([id], !current);
    };

    const handleDuplicate = async (category: ICategory) => {
      const payload = {
        name: `${category.name} (Copy)`,
        description: `${category.description} (Copy)`,
        imageUrl: category.imageUrl,
        parentCategory: category.parentCategory || null,
        isActive: false,
      };
      try {
        await addCategory(payload).unwrap();
        if (isClient) {
          toast.success(`"${category.name}" duplicated successfully`);
        }
      } catch (error) {
        console.error(error);
        if (isClient) {
          toast.error("Failed to duplicate category!");
        }
      }
    };

    const handleBulkDelete = async (ids: string[]) => {
      try {
        await bulkDelete(ids).unwrap();
        if (isClient) {
          toast.success("Categories deleted successfully");
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        if (isClient) {
          toast.error("Failed to delete categories");
        }
      }
    };

    const handleBulkToggle = async (ids: string[], active: boolean) => {
      try {
        await bulkToggle({ ids, property: "isActive", value: active }).unwrap();
        if (isClient) {
          toast.success(
            `${ids.length > 1 ? `Categories` : `Category`} ${
              active ? "Activated" : "Deactivated"
            } Successfully`
          );
        }
      } catch (error) {
        console.error("Bulk toggle error:", error);
        if (isClient) {
          toast.error("Failed to update category statuses!");
        }
      }
    };

    const handleFeaturedToggle = async (ids: string[], featured: boolean) => {
      try {
        await bulkToggle({
          ids,
          property: "isFeatured",
          value: featured,
        }).unwrap();
        if (isClient) {
          toast.success(
            `Categories ${
              featured ? "Added to " : "Removed From "
            }Featured successfully`
          );
        }
      } catch (error) {
        // console.error("Featured toggle error:", error);
        if (isClient) {
          toast.error("Failed to update Pin Statuses!");
        }
      }
    };

    return {
      handleViewClick: handleView,
      handleEditClick: handleEdit,
      handleDeleteClick: handleDelete,
      handleDuplicateClick: handleDuplicate,
      handleToggleStatusClick: handleToggleStatus,
      handleBulkDelete,
      handleBulkStatusToggle: handleBulkToggle,
      handleFeaturedStatusToggle: handleFeaturedToggle,
    };
  }, [bulkDelete, bulkToggle, addCategory, triggerGetCategory, isClient]);
  // Go to last available page on Last Item Delete
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      dispatch(setCurrentPage(totalPages));
    }
  }, [totalPages, currentPage]);
  // Optimized search handler
  const handleSearch = useCallback(
    (value: string) => {
      if (!isClient) return;

      startTransition(() => {
        dispatch(setSearchQuery(value));
        dispatch(setCurrentPage(1));
      });
    },
    [dispatch, isClient]
  );

  const handleSetViewModalOpen = useCallback((open: boolean) => {
    if (!open) {
      setViewModalOpen(false);
      // Clear selected item when modal closes
      setSelectedCategory(null);
    } else {
      setViewModalOpen(true);
    }
  }, []);

  // Form and modal handlers
  const handleFormClose = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCategory(null);
      // Small delay to ensure smooth state transitions
      setTimeout(() => {
        setSelectedCategory(null);
      }, 100);
    }
  }, []);

  const handleModalEdit = useCallback(
    (category: ICategory) => {
      // Clear modal state first
      setViewModalOpen(false);
      setSelectedCategory(null);
      // Then trigger edit with a small delay to ensure state is cleared
      setTimeout(() => {
        handlers.handleEditClick(category);
      }, 50); // Increased delay slightly for better state management
    },
    [handlers]
  );

  const handleAddNew = useCallback(() => setIsFormOpen(true), []);
  const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);

  const refetchCategories = useCallback(() => {
    refetch();
  }, [refetch]);

  // Prefetch components only on client
  useEffect(() => {
    if (!isClient) return;

    // Prefetch common heavy components on mount
    import("@/components/categories/CategoryGrid");
    import("@/components/categories/CategoryTable");
    import("@/components/categories/CategoryForm");
  }, [isClient]);

  // Show enhanced skeleton during initial load or when not client-side
  if (isLoading || !isClient) {
    return <PageSkeleton cols={3} lgcols={4} items={12} />;
  }

  // Loading state
  const loading = isLoading || isFetching;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <CategoriesHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        dispatch={dispatch}
        sortBy={sortBy}
        viewMode={viewMode}
        canManageCategories={canManageCategories}
        onAddNew={handleAddNew}
        loading={loading}
        refetch={refetchCategories}
      />

      {/* Error Message */}
      {isError && <ErrorMessage error={error} />}

      {/* Content Area */}
      {loading && categories.length === 0 ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader cols={3} lgcols={4} items={12} />
        ) : (
          <TableSkeletonLoader cols={4} rows={9} />
        )
      ) : categories.length > 0 ? (
        <CategoryContentView
          viewMode={viewMode}
          categories={categories}
          handlers={handlers}
          totalPages={totalPages}
        />
      ) : searchQuery ? (
        <EmptySearchState
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          title="category"
          icon={Building}
        />
      ) : (
        <EmptyDataState
          canManage={canManageCategories}
          onAddNew={handleAddNew}
          title="category"
          icon={Building}
        />
      )}

      {/* Modals with Suspense - Only render on client */}
      {isClient && (
        <>
          <ChunkErrorBoundaryWithSuspense>
            <CategoryForm
              open={isFormOpen}
              onOpenChange={handleFormClose}
              category={editingCategory}
            />
          </ChunkErrorBoundaryWithSuspense>

          <ChunkErrorBoundaryWithSuspense>
            <CategoryModal
              viewModalOpen={viewModalOpen}
              setViewModalOpen={handleSetViewModalOpen}
              selectedCategory={selectedCategory}
              onEdit={handleModalEdit}
              deleteDialogOpen={deleteDialogOpen}
              setDeleteDialogOpen={setDeleteDialogOpen}
              categoryToDelete={categoryToDelete}
              onCategoriesChange={refetchCategories}
            />
          </ChunkErrorBoundaryWithSuspense>
        </>
      )}
    </div>
  );
});

CategoriesContent.displayName = "CategoriesContent";

// Main component with error boundary
export const CategoriesPage = () => {
  return (
    <ChunkErrorBoundaryWithSuspense
      fallback={<PageSkeleton cols={3} lgcols={4} items={12} />}
    >
      <CategoriesContent />
    </ChunkErrorBoundaryWithSuspense>
  );
};
