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
import { extractErrorMessage } from "@/lib/helper/clientHelperfunc";
import {
  useAddCategoryMutation,
  useBulkDeleteCategoriesMutation,
  useBulkToggleCategoryPropertyMutation,
  useFetchCategoriesQuery,
  useLazyGetCategoryByIdQuery,
} from "@/lib/redux-features/categories/categoriesApi";
import {
  loadInitialCategoryUIState,
  selectCanAddCategory,
  selectCanDeleteCategories,
  selectCanManageCategories,
  selectCanUpdateCategories,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/categories/categoriesSlice";
import { selectCanViewAllData } from "@/lib/redux-features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { ICategory } from "@/models/categories.model";
import { AlertTriangle, Building } from "lucide-react";
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
    canAdd,
    onAddNew,
    loading,
    refetch,
  }: {
    searchQuery: string;
    onSearch: (value: string) => void;
    dispatch: any;
    sortBy: any;
    viewMode: any;
    canAdd: boolean;
    onAddNew: () => void;
    loading: boolean;
    refetch: () => void;
  }) => (
    <PageHeader
      refetch={refetch}
      title={`Categories`}
      searchQuery={searchQuery}
      onSearch={onSearch}
      loading={loading}
      ViewToggleComponent={CategoryViewToggle}
      viewToggleProps={{
        dispatch,
        sortBy,
        viewMode,
        canAdd: canAdd,
        onAddNew: onAddNew,
      }}
      searchPlaceholder="Search Categories..."
    />
  )
);

// Memoized content view component
const CategoryContentView = memo(
  ({
    viewMode,
    categories,
    handlers,
    totalPages,
    canManage = false,
    canViewAllData = false,
    canDelete = false,
  }: {
    viewMode: string;
    categories: ICategory[];
    handlers: any;
    totalPages: number;
    canManage: boolean;
    canViewAllData: boolean;
    canDelete: boolean;
  }) => (
    <EntityContentView
      viewMode={viewMode as "grid" | "table"}
      entities={categories}
      GridComponent={CategoryGrid}
      TableComponent={CategoryTable}
      PaginationComponent={CategoryPagination}
      handlers={handlers}
      entityKey={"categories"}
      totalPages={totalPages}
      gridCols={3}
      gridLgCols={4}
      gridItems={12}
      tableCols={4}
      tableRows={9}
      commonProps={{
        canManage: canManage,
        canDelete: canDelete,
        canViewAllData: canViewAllData,
      }}
    />
  )
);

// Main content component
const CategoriesContent = memo(() => {
  const dispatch = useAppDispatch();

  // UI state from Redux
  const { viewMode, searchQuery, sortBy, currentPage, itemsPerPage } =
    useAppSelector((state) => state.categories);

  // RTK Query hook for fetching categories
  const {
    data: categoriesData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchCategoriesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sortBy,
  });

  // RTK Query mutations
  const [addCategory] = useAddCategoryMutation();
  const [bulkDelete] = useBulkDeleteCategoriesMutation();
  const [bulkToggle] = useBulkToggleCategoryPropertyMutation();
  const [triggerGetCategory] = useLazyGetCategoryByIdQuery();

  // Local state
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
  const canAddCategory = useAppSelector(selectCanAddCategory);
  const canDeleteCategories = useAppSelector(selectCanDeleteCategories);
  const canUpdateCategories = useAppSelector(selectCanUpdateCategories);
  const canManageCategories =
    canAddCategory && canUpdateCategories && canDeleteCategories;
  const canViewAllData = useAppSelector(selectCanViewAllData);

  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData?.data]
  );
  const totalPages = useMemo(
    () => categoriesData?.totalPages || 0,
    [categoriesData?.totalPages]
  );

  // Initialize component with UI state from localStorage
  useEffect(() => {
    const initializeComponent = () => {
      try {
        const initialUIState = loadInitialCategoryUIState();
        dispatch(setViewMode(initialUIState.viewMode));
        dispatch(setCurrentPage(initialUIState.currentPage));
        dispatch(setSortBy(initialUIState.sortBy));
      } catch (error) {
        const errorMessage =
          error &&
          extractErrorMessage(error, "Failed to initialize categories page");
        toast.error(errorMessage as string);
      }
    };

    initializeComponent();
  }, [dispatch]);

  // Memoized event handlers with RTK Query mutations
  const handlers = useMemo(() => {
    const handleView = async (category: ICategory) => {
      setSelectedCategory(category);
      setViewModalOpen(true);
      try {
        const detailed = await triggerGetCategory(category.id).unwrap();
        setSelectedCategory(detailed);
      } catch {
        const errorMessage =
          error &&
          extractErrorMessage(error, "Failed to load category details!");
        toast.error(errorMessage as string);
      }
    };

    const handleEdit = (category: ICategory) => {
      setEditingCategory(category);
      setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
      setCategoryToDelete(id);
      setDeleteDialogOpen(true);
    };

    const handleToggleStatus = async (id: string, current: boolean) => {
      try {
        await bulkToggle({
          ids: [id],
          property: "isActive",
          value: !current,
        }).unwrap();
        toast.success(
          `Category ${current ? "deactivated" : "activated"} successfully`
        );
      } catch (error) {
        const errorMessage =
          error &&
          extractErrorMessage(error, "Failed to update category status!");
        toast.error(errorMessage as string);
      }
    };

    const handleDuplicate = async (category: ICategory) => {
      const { _id, createdAt, updatedAt, ...rest } = category as any;
      const payload = {
        name: `${category.name} (Copy)`,
        description: `${category.description} (Copy)`,
        imageUrl: category.imageUrl,
        parentCategory: category.parentCategory || null,
        isActive: false,
      };
      try {
        await addCategory(payload).unwrap();
        toast.success(`"${category.name}" duplicated successfully`);
        // RTK Query will automatically refetch due to cache invalidation
      } catch (error) {
        const errorMessage =
          error && extractErrorMessage(error, "Failed to duplicate category!");
        toast.error(errorMessage as string);
      }
    };

    const handleBulkDelete = async (ids: string[]) => {
      try {
        await bulkDelete(ids).unwrap();
        toast.success("Categories deleted successfully");
        // RTK Query will automatically update the cache
      } catch (error) {
        const errorMessage =
          error && extractErrorMessage(error, "Failed to delete categories!");
        toast.error(errorMessage as string);
      }
    };

    const handleBulkToggle = async (ids: string[], active: boolean) => {
      try {
        await bulkToggle({ ids, property: "isActive", value: active }).unwrap();
        toast.success(
          `${ids.length > 1 ? `Categories` : `Category`} ${
            active ? "Activated" : "Deactivated"
          } Successfully`
        );
      } catch (error) {
        const errorMessage =
          error && extractErrorMessage(error, "Failed to update category!");
        toast.error(errorMessage as string);
      }
    };

    const handleFeaturedToggle = async (ids: string[], featured: boolean) => {
      try {
        await bulkToggle({
          ids,
          property: "isFeatured",
          value: featured,
        }).unwrap();
        toast.success(
          `Categories ${
            featured ? "Added to Featured" : "Removed from Featured"
          } successfully`
        );
      } catch (error) {
        const errorMessage =
          error && extractErrorMessage(error, "Failed to update status!");
        toast.error(errorMessage as string);
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
  }, [bulkDelete, bulkToggle, addCategory, triggerGetCategory]);

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

  // Cleanup function to close modal and abort any ongoing requests
  const closeModal = useCallback(() => {
    setViewModalOpen(false);
  }, []);

  const handleSetViewModalOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal();
      } else {
        setViewModalOpen(true);
      }
    },
    [closeModal]
  );

  // Form handlers
  const handleFormClose = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingCategory(null);
  }, []);

  const handleModalEdit = useCallback(
    (category: ICategory) => {
      handlers.handleEditClick(category);
      setViewModalOpen(false);
    },
    [handlers]
  );

  const handleAddNew = useCallback(() => setIsFormOpen(true), []);
  const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);

  const refetchCategories = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    // Prefetch common heavy components on mount
    import("@/components/categories/CategoryGrid");
    import("@/components/categories/CategoryTable");
    import("@/components/categories/CategoryForm");
  }, []);

  // Show enhanced skeleton during initial load
  if (isLoading) {
    return <PageSkeleton cols={3} lgcols={3} items={9} />;
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
        canAdd={canAddCategory}
        onAddNew={handleAddNew}
        loading={loading}
        refetch={refetch}
      />

      {/* Error Message */}
      {error && (
        <div className="border border-destructive bg-destructive/10 rounded-xl">
          <p className="p-3 text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {(error as any)?.data?.message || "Failed to load categories"}
          </p>
        </div>
      )}

      {/* Content Area */}
      {loading && categories.length === 0 ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader cols={3} lgcols={3} items={9} />
        ) : (
          <TableSkeletonLoader cols={3} rows={9} />
        )
      ) : categories.length > 0 ? (
        <CategoryContentView
          viewMode={viewMode}
          categories={categories}
          handlers={handlers}
          totalPages={totalPages}
          canManage={canManageCategories}
          canViewAllData={canViewAllData}
          canDelete={canDeleteCategories}
        />
      ) : searchQuery ? (
        <EmptySearchState
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          title="Categories"
        />
      ) : (
        <EmptyDataState
          canManage={canManageCategories}
          onAddNew={handleAddNew}
          title="Categories"
        />
      )}

      {/* Modals with Suspense */}
      <ChunkErrorBoundaryWithSuspense fallback={null}>
        <CategoryForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          category={editingCategory}
        />
      </ChunkErrorBoundaryWithSuspense>

      <ChunkErrorBoundaryWithSuspense fallback={null}>
        <CategoryModal
          viewModalOpen={viewModalOpen}
          setViewModalOpen={handleSetViewModalOpen}
          selectedCategory={selectedCategory}
          onEdit={handleModalEdit}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          categoryToDelete={categoryToDelete}
          onCategoriesChange={refetchCategories}
          canManage={canManageCategories}
        />
      </ChunkErrorBoundaryWithSuspense>
    </div>
  );
});

// Main component with error boundary
export const CategoriesPage = () => {
  return (
    <ChunkErrorBoundaryWithSuspense>
      <CategoriesContent />
    </ChunkErrorBoundaryWithSuspense>
  );
};
