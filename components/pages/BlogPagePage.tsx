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
  useAddBlogPageMutation,
  useBulkDeleteBlogPagesMutation,
  useBulkToggleBlogPagePropertyMutation,
  useFetchBlogPagesQuery,
  useLazyGetBlogPageByIdQuery,
} from "@/lib/redux-features/blogPage/blogPageApi";
import {
  loadInitialBlogPageUIState,
  selectCanManagePages,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/blogPage/blogPageSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IBlogPage } from "@/models/blogPage.model";
import { FileText } from "lucide-react";
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
const BlogPageForm = dynamic(
  () =>
    import("@/components/blogpage/BlogPageForm")
      .then((m) => ({ default: m.BlogPageForm }))
      .catch((error) => {
        toast.error("Failed to load Blog Page Form!");
        return { default: () => <div>Failed to load form</div> };
      }),
  {
    loading: () => (
      <div className="h-96 w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center"></div>
    ),
    ssr: false,
  }
);

const BlogPageGrid = dynamic(
  () =>
    import("@/components/blogpage/BlogPageGrid")
      .then((m) => ({ default: m.BlogPageGrid }))
      .catch(() => ({
        default: () => <GridSkeletonLoader cols={2} lgcols={3} items={12} />,
      })),
  {
    loading: () => <GridSkeletonLoader cols={2} lgcols={3} items={12} />,
    ssr: false,
  }
);

const BlogPageTable = dynamic(
  () =>
    import("@/components/blogpage/BlogPageTable")
      .then((m) => ({ default: m.BlogPageTable }))
      .catch(() => ({
        default: () => <TableSkeletonLoader cols={5} rows={9} />,
      })),
  {
    loading: () => <TableSkeletonLoader cols={5} rows={9} />,
    ssr: false,
  }
);

const BlogPageModal = dynamic(
  () =>
    import("@/components/blogpage/BlogPageModals")
      .then((m) => ({ default: m.BlogPageModal }))
      .catch(() => ({ default: () => null })),
  {
    loading: () => null,
    ssr: false,
  }
);

const BlogPagePagination = dynamic(
  () => import("@/components/blogpage/BlogPagePagination"),
  {
    loading: () => (
      <div className="h-10 w-full bg-muted/50 animate-pulse rounded flex items-center justify-center">
        <div className="text-muted-foreground text-sm"></div>
      </div>
    ),
    ssr: false,
  }
);

const BlogPageViewToggle = dynamic(
  () =>
    import("@/components/blogpage/BlogPageViewToggle").then((m) => ({
      default: m.BlogPageViewToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-20 bg-muted/50 animate-pulse rounded" />
    ),
    ssr: false,
  }
);

// Memoized header component
const BlogPagesHeader = memo(
  ({
    searchQuery,
    onSearch,
    dispatch,
    sortBy,
    viewMode,
    canManagePages,
    onAddNew,
    loading,
    refetch,
  }: {
    searchQuery: string;
    onSearch: (value: string) => void;
    dispatch: any;
    sortBy: any;
    viewMode: any;
    canManagePages: boolean;
    onAddNew: () => void;
    loading: boolean;
    refetch: () => void;
  }) => (
    <PageHeader
      title="Blog Pages"
      searchQuery={searchQuery}
      onSearch={onSearch}
      loading={loading}
      canAdd={canManagePages}
      onAddNew={onAddNew}
      ViewToggleComponent={BlogPageViewToggle}
      viewToggleProps={{ dispatch, sortBy, viewMode }}
      refetch={refetch}
    />
  )
);

BlogPagesHeader.displayName = "BlogPagesHeader";

// Memoized content view component
const BlogPageContentView = memo(
  ({
    viewMode,
    pages,
    handlers,
    totalPages,
  }: {
    viewMode: string;
    pages: any[];
    handlers: any;
    totalPages: number;
  }) => (
    <EntityContentView
      viewMode={viewMode as "grid" | "table"}
      entities={pages}
      GridComponent={BlogPageGrid}
      TableComponent={BlogPageTable}
      PaginationComponent={BlogPagePagination}
      handlers={handlers}
      entityKey="blogpages"
      totalPages={totalPages}
      gridCols={2}
      gridLgCols={3}
      gridItems={12}
      tableCols={5}
      tableRows={9}
      permissions={{ canManage: true, canView: true }}
    />
  )
);

BlogPageContentView.displayName = "BlogPageContentView";

// Main content component
const BlogPagesContent = memo(() => {
  const dispatch = useAppDispatch();
  const isClient = useIsClient();

  // UI state from Redux
  const {
    viewMode,
    searchQuery,
    sortBy,
    currentPage,
    itemsPerPage,
    filterStatus,
    filterAuthor,
    filterTags,
    showFeaturedOnly,
  } = useAppSelector((state) => state.blogPages);

  // RTK Query hook for fetching pages
  const {
    data: pagesData,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useFetchBlogPagesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sortBy,
    status: filterStatus !== "all" ? filterStatus : undefined,
    author: filterAuthor || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
    isFeatured: showFeaturedOnly ? true : undefined,
  });

  // RTK Query mutations
  const [addBlogPage] = useAddBlogPageMutation();
  const [bulkDelete] = useBulkDeleteBlogPagesMutation();
  const [bulkToggle] = useBulkToggleBlogPagePropertyMutation();
  const [triggerGetPage] = useLazyGetBlogPageByIdQuery();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<IBlogPage | null>(null);
  const [selectedPage, setSelectedPage] = useState<IBlogPage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
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
  const canManagePages = useAppSelector(selectCanManagePages);

  const pages = useMemo(() => pagesData?.data || [], [pagesData?.data]);
  const totalPages = useMemo(
    () => pagesData?.totalPages || 0,
    [pagesData?.totalPages]
  );

  // Initialize component with UI state from localStorage
  useEffect(() => {
    if (!isClient) return;

    const initializeComponent = () => {
      try {
        const initialUIState = loadInitialBlogPageUIState();
        dispatch(setViewMode(initialUIState.viewMode));
        dispatch(setCurrentPage(initialUIState.currentPage));
        dispatch(setSortBy(initialUIState.sortBy));
      } catch (error) {
        if (isClient) {
          toast.error("Failed to initialize blog pages page");
        }
      }
    };

    const timeoutId = setTimeout(initializeComponent, 0);
    return () => clearTimeout(timeoutId);
  }, [dispatch, isClient]);

  const handleView = useHandleView({
    fetchDetail: triggerGetPage,
    setSelectedItem: (item) => {
      setSelectedPage(item);
    },
    setViewModalOpen: (open) => {
      if (open) {
        setViewModalOpen(true);
      }
    },
    toast,
    isClient,
    errorMessage: "Failed to load page details",
  });

  const handleEdit = useHandleEdit({
    setEditingItem: setEditingPage,
    setIsFormOpen,
  });

  const handleDelete = useHandleDelete({
    setItemToDelete: setPageToDelete,
    setDeleteDialogOpen,
  });

  // Cleanup effect for when form opens
  useEffect(() => {
    if (isFormOpen) {
      setSelectedPage(null);
    }
  }, [isFormOpen]);

  // Memoized event handlers
  const handlers = useMemo(() => {
    const handleToggleStatus = async (id: string, current: boolean) => {
      await handleBulkToggle([id], "isActive", !current);
    };

    const handleDuplicate = async (page: IBlogPage) => {
      const payload = {
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy-${Date.now()}`,
        excerpt: page.excerpt,
        content: page.content,
        contentType: page.contentType,
        tags: page.tags,
        featuredImage: page.featuredImage,
        status: "draft" as const,
        isActive: false,
        isFeatured: false,
        seo: page.seo,
        readingTime: page.readingTime,
      };

      try {
        await addBlogPage(payload).unwrap();
        if (isClient) {
          toast.success(`"${page.title}" duplicated successfully`);
        }
      } catch (error) {
        console.error(error);
        if (isClient) {
          toast.error("Failed to duplicate page!");
        }
      }
    };

    const handleBulkDelete = async (ids: string[]) => {
      try {
        await bulkDelete(ids).unwrap();
        if (isClient) {
          toast.success("Pages deleted successfully");
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        if (isClient) {
          toast.error("Failed to delete pages");
        }
      }
    };

    const handleBulkToggle = async (
      ids: string[],
      property: "isActive" | "isFeatured",
      value: boolean
    ) => {
      try {
        await bulkToggle({ ids, property, value }).unwrap();

        const propertyLabels = {
          isActive: value ? "Activated" : "Deactivated",
          isFeatured: value ? "Added to Featured" : "Removed from Featured",
          allowComments: value ? "Comments Enabled" : "Comments Disabled",
        };

        if (isClient) {
          toast.success(
            `${ids.length > 1 ? "Pages" : "Page"} ${
              propertyLabels[property]
            } Successfully`
          );
        }
      } catch (error) {
        console.error("Bulk toggle error:", error);
        if (isClient) {
          toast.error("Failed to update pages!");
        }
      }
    };

    const handleFeaturedToggle = async (ids: string[], featured: boolean) => {
      await handleBulkToggle(ids, "isFeatured", featured);
    };

    return {
      handleViewClick: handleView,
      handleEditClick: handleEdit,
      handleDeleteClick: handleDelete,
      handleDuplicateClick: handleDuplicate,
      handleToggleStatusClick: handleToggleStatus,
      handleBulkDelete,
      handleBulkStatusToggle: (ids: string[], value: boolean) =>
        handleBulkToggle(ids, "isActive", value),
      handleFeaturedStatusToggle: handleFeaturedToggle,
    };
  }, [bulkDelete, bulkToggle, addBlogPage, triggerGetPage, isClient]);

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
      setSelectedPage(null);
    } else {
      setViewModalOpen(true);
    }
  }, []);

  // Form and modal handlers
  const handleFormClose = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingPage(null);
      setTimeout(() => {
        setSelectedPage(null);
      }, 100);
    }
  }, []);

  const handleModalEdit = useCallback(
    (page: IBlogPage) => {
      setViewModalOpen(false);
      setSelectedPage(null);
      setTimeout(() => {
        handlers.handleEditClick(page);
      }, 50);
    },
    [handlers]
  );

  const handleAddNew = useCallback(() => setIsFormOpen(true), []);
  const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);

  const refetchPages = useCallback(() => {
    refetch();
  }, [refetch]);

  // Prefetch components only on client
  useEffect(() => {
    if (!isClient) return;

    import("@/components/blogpage/BlogPageGrid");
    import("@/components/blogpage/BlogPageTable");
    import("@/components/blogpage/BlogPageForm");
  }, [isClient]);

  // Show enhanced skeleton during initial load
  if (isLoading || !isClient) {
    return <PageSkeleton cols={2} lgcols={3} items={12} />;
  }

  // Loading state
  const loading = isLoading || isFetching;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <BlogPagesHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        dispatch={dispatch}
        sortBy={sortBy}
        viewMode={viewMode}
        canManagePages={canManagePages}
        onAddNew={handleAddNew}
        loading={loading}
        refetch={refetchPages}
      />

      {/* Error Message */}
      {isError && <ErrorMessage error={error} />}

      {/* Content Area */}
      {loading && pages.length === 0 ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader cols={2} lgcols={3} items={12} />
        ) : (
          <TableSkeletonLoader cols={5} rows={9} />
        )
      ) : pages.length > 0 ? (
        <BlogPageContentView
          viewMode={viewMode}
          pages={pages}
          handlers={handlers}
          totalPages={totalPages}
        />
      ) : searchQuery ? (
        <EmptySearchState
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          title="blog page"
          icon={FileText}
        />
      ) : (
        <EmptyDataState
          canManage={canManagePages}
          onAddNew={handleAddNew}
          title="blog page"
          icon={FileText}
        />
      )}

      {/* Modals */}
      {isClient && (
        <>
          <ChunkErrorBoundaryWithSuspense>
            <BlogPageForm
              pageId={editingPage?.id}
              open={isFormOpen}
              onOpenChange={handleFormClose}
              handleFormClose={handleFormClose}
              onComplete={() => {
                handleFormClose(false);
                refetchPages();
              }}
            />
          </ChunkErrorBoundaryWithSuspense>

          <ChunkErrorBoundaryWithSuspense>
            <BlogPageModal
              viewModalOpen={viewModalOpen}
              setViewModalOpen={handleSetViewModalOpen}
              selectedBlogPage={selectedPage}
              onEdit={handleModalEdit}
              deleteDialogOpen={deleteDialogOpen}
              setDeleteDialogOpen={setDeleteDialogOpen}
              blogpageToDelete={pageToDelete}
              onBlogPageChange={refetchPages}
            />
          </ChunkErrorBoundaryWithSuspense>
        </>
      )}
    </div>
  );
});

BlogPagesContent.displayName = "BlogPagesContent";

// Main component with error boundary
export const BlogPagePage = () => {
  return (
    <ChunkErrorBoundaryWithSuspense
      fallback={<PageSkeleton cols={2} lgcols={3} items={12} />}
    >
      <BlogPagesContent />
    </ChunkErrorBoundaryWithSuspense>
  );
};
