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
  useAddBlogPostMutation,
  useBulkDeleteBlogPostsMutation,
  useBulkToggleBlogPostPropertyMutation,
  useFetchBlogPostsQuery,
  useLazyGetBlogPostByIdQuery,
} from "@/lib/redux-features/blogPost/blogPostApi";
import {
  loadInitialBlogPostUIState,
  selectCanManagePosts,
  setCurrentPage,
  setSearchQuery,
  setSortBy,
  setViewMode,
  updateUserPermissions,
} from "@/lib/redux-features/blogPost/blogPostSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IBlogPost } from "@/models/blogPost.model";
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
const BlogPostForm = dynamic(
  () =>
    import("@/components/blogpost/BlogPostForm")
      .then((m) => ({ default: m.BlogPostForm }))
      .catch((error) => {
        toast.error("Failed to load Blog Post Form!");
        return { default: () => <div>Failed to load form</div> };
      }),
  {
    loading: () => (
      <div className="h-96 w-full bg-muted/50 animate-pulse rounded-lg flex items-center justify-center"></div>
    ),
    ssr: false,
  }
);

const BlogPostGrid = dynamic(
  () =>
    import("@/components/blogpost/BlogPostGrid")
      .then((m) => ({ default: m.BlogPostGrid }))
      .catch(() => ({
        default: () => <GridSkeletonLoader cols={2} lgcols={3} items={12} />,
      })),
  {
    loading: () => <GridSkeletonLoader cols={2} lgcols={3} items={12} />,
    ssr: false,
  }
);

const BlogPostTable = dynamic(
  () =>
    import("@/components/blogpost/BlogPostTable")
      .then((m) => ({ default: m.BlogPostTable }))
      .catch(() => ({
        default: () => <TableSkeletonLoader cols={5} rows={9} />,
      })),
  {
    loading: () => <TableSkeletonLoader cols={5} rows={9} />,
    ssr: false,
  }
);

const BlogPostModal = dynamic(
  () =>
    import("@/components/blogpost/BlogPostModals")
      .then((m) => ({ default: m.BlogPostModal }))
      .catch(() => ({ default: () => null })),
  {
    loading: () => null,
    ssr: false,
  }
);

const BlogPostPagination = dynamic(
  () => import("@/components/blogpost/BlogPostPagination"),
  {
    loading: () => (
      <div className="h-10 w-full bg-muted/50 animate-pulse rounded flex items-center justify-center">
        <div className="text-muted-foreground text-sm"></div>
      </div>
    ),
    ssr: false,
  }
);

const BlogPostViewToggle = dynamic(
  () =>
    import("@/components/blogpost/BlogPostViewToggle").then((m) => ({
      default: m.BlogPostViewToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-20 bg-muted/50 animate-pulse rounded" />
    ),
    ssr: false,
  }
);

// Memoized header component
const BlogPostsHeader = memo(
  ({
    searchQuery,
    onSearch,
    dispatch,
    sortBy,
    viewMode,
    canManagePosts,
    onAddNew,
    loading,
    refetch,
  }: {
    searchQuery: string;
    onSearch: (value: string) => void;
    dispatch: any;
    sortBy: any;
    viewMode: any;
    canManagePosts: boolean;
    onAddNew: () => void;
    loading: boolean;
    refetch: () => void;
  }) => (
    <PageHeader
      title="Blog Posts"
      searchQuery={searchQuery}
      onSearch={onSearch}
      loading={loading}
      canAdd={canManagePosts}
      onAddNew={onAddNew}
      ViewToggleComponent={BlogPostViewToggle}
      viewToggleProps={{ dispatch, sortBy, viewMode }}
      refetch={refetch}
    />
  )
);

BlogPostsHeader.displayName = "BlogPostsHeader";

// Memoized content view component
const BlogPostContentView = memo(
  ({
    viewMode,
    posts,
    handlers,
    totalPages,
  }: {
    viewMode: string;
    posts: any[];
    handlers: any;
    totalPages: number;
  }) => (
    <EntityContentView
      viewMode={viewMode as "grid" | "table"}
      entities={posts}
      GridComponent={BlogPostGrid}
      TableComponent={BlogPostTable}
      PaginationComponent={BlogPostPagination}
      handlers={handlers}
      entityKey="blogposts"
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

BlogPostContentView.displayName = "BlogPostContentView";

// Main content component
const BlogPostsContent = memo(() => {
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
    filterCategory,
    filterTags,
    showFeaturedOnly,
  } = useAppSelector((state) => state.blogPosts);

  // RTK Query hook for fetching posts
  const {
    data: postsData,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useFetchBlogPostsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sortBy,
    status: filterStatus !== "all" ? filterStatus : undefined,
    author: filterAuthor || undefined,
    category: filterCategory || undefined,
    tags: filterTags.length > 0 ? filterTags : undefined,
    isFeatured: showFeaturedOnly ? true : undefined,
  });

  // RTK Query mutations
  const [addBlogPost] = useAddBlogPostMutation();
  const [bulkDelete] = useBulkDeleteBlogPostsMutation();
  const [bulkToggle] = useBulkToggleBlogPostPropertyMutation();
  const [triggerGetPost] = useLazyGetBlogPostByIdQuery();

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IBlogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<IBlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
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
  const canManagePosts = useAppSelector(selectCanManagePosts);

  const posts = useMemo(() => postsData?.data || [], [postsData?.data]);
  const totalPages = useMemo(
    () => postsData?.totalPages || 0,
    [postsData?.totalPages]
  );

  // Initialize component with UI state from localStorage
  useEffect(() => {
    if (!isClient) return;

    const initializeComponent = () => {
      try {
        const initialUIState = loadInitialBlogPostUIState();
        dispatch(setViewMode(initialUIState.viewMode));
        dispatch(setCurrentPage(initialUIState.currentPage));
        dispatch(setSortBy(initialUIState.sortBy));
      } catch (error) {
        if (isClient) {
          toast.error("Failed to initialize blog posts page");
        }
      }
    };

    const timeoutId = setTimeout(initializeComponent, 0);
    return () => clearTimeout(timeoutId);
  }, [dispatch, isClient]);

  const handleView = useHandleView({
    fetchDetail: triggerGetPost,
    setSelectedItem: (item) => {
      setSelectedPost(item);
    },
    setViewModalOpen: (open) => {
      if (open) {
        setViewModalOpen(true);
      }
    },
    toast,
    isClient,
    errorMessage: "Failed to load post details",
  });

  const handleEdit = useHandleEdit({
    setEditingItem: setEditingPost,
    setIsFormOpen,
  });

  const handleDelete = useHandleDelete({
    setItemToDelete: setPostToDelete,
    setDeleteDialogOpen,
  });

  // Cleanup effect for when form opens
  useEffect(() => {
    if (isFormOpen) {
      setSelectedPost(null);
    }
  }, [isFormOpen]);

  // Memoized event handlers
  const handlers = useMemo(() => {
    const handleToggleStatus = async (id: string, current: boolean) => {
      await handleBulkToggle([id], "isActive", !current);
    };

    const handleDuplicate = async (post: IBlogPost) => {
      const payload = {
        title: `${post.title} (Copy)`,
        slug: `${post.slug}-copy-${Date.now()}`,
        excerpt: post.excerpt,
        content: post.content,
        contentType: post.contentType,
        categories: post.categories,
        tags: post.tags,
        featuredImage: post.featuredImage,
        status: "draft" as const,
        isActive: false,
        isFeatured: false,
        allowComments: post.allowComments,
        seo: post.seo,
        readingTime: post.readingTime,
      };

      try {
        await addBlogPost(payload).unwrap();
        if (isClient) {
          toast.success(`"${post.title}" duplicated successfully`);
        }
      } catch (error) {
        console.error(error);
        if (isClient) {
          toast.error("Failed to duplicate post!");
        }
      }
    };

    const handleBulkDelete = async (ids: string[]) => {
      try {
        await bulkDelete(ids).unwrap();
        if (isClient) {
          toast.success("Posts deleted successfully");
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        if (isClient) {
          toast.error("Failed to delete posts");
        }
      }
    };

    const handleBulkToggle = async (
      ids: string[],
      property: "isActive" | "isFeatured" | "allowComments",
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
            `${ids.length > 1 ? "Posts" : "Post"} ${
              propertyLabels[property]
            } Successfully`
          );
        }
      } catch (error) {
        console.error("Bulk toggle error:", error);
        if (isClient) {
          toast.error("Failed to update posts!");
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
  }, [bulkDelete, bulkToggle, addBlogPost, triggerGetPost, isClient]);

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
      setSelectedPost(null);
    } else {
      setViewModalOpen(true);
    }
  }, []);

  // Form and modal handlers
  const handleFormClose = useCallback((open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingPost(null);
      setTimeout(() => {
        setSelectedPost(null);
      }, 100);
    }
  }, []);

  const handleModalEdit = useCallback(
    (post: IBlogPost) => {
      setViewModalOpen(false);
      setSelectedPost(null);
      setTimeout(() => {
        handlers.handleEditClick(post);
      }, 50);
    },
    [handlers]
  );

  const handleAddNew = useCallback(() => setIsFormOpen(true), []);
  const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);

  const refetchPosts = useCallback(() => {
    refetch();
  }, [refetch]);

  // Prefetch components only on client
  useEffect(() => {
    if (!isClient) return;

    import("@/components/blogpost/BlogPostGrid");
    import("@/components/blogpost/BlogPostTable");
    import("@/components/blogpost/BlogPostForm");
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
      <BlogPostsHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        dispatch={dispatch}
        sortBy={sortBy}
        viewMode={viewMode}
        canManagePosts={canManagePosts}
        onAddNew={handleAddNew}
        loading={loading}
        refetch={refetchPosts}
      />

      {/* Error Message */}
      {isError && <ErrorMessage error={error} />}

      {/* Content Area */}
      {loading && posts.length === 0 ? (
        viewMode === "grid" ? (
          <GridSkeletonLoader cols={2} lgcols={3} items={12} />
        ) : (
          <TableSkeletonLoader cols={5} rows={9} />
        )
      ) : posts.length > 0 ? (
        <BlogPostContentView
          viewMode={viewMode}
          posts={posts}
          handlers={handlers}
          totalPages={totalPages}
        />
      ) : searchQuery ? (
        <EmptySearchState
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
          title="blog post"
          icon={FileText}
        />
      ) : (
        <EmptyDataState
          canManage={canManagePosts}
          onAddNew={handleAddNew}
          title="blog post"
          icon={FileText}
        />
      )}

      {/* Modals */}
      {isClient && (
        <>
          <ChunkErrorBoundaryWithSuspense>
            <BlogPostForm
              postId={editingPost?.id}
              isFormOpen={isFormOpen}
              handleFormClose={handleFormClose}
              onComplete={() => {
                handleFormClose(false);
                refetchPosts();
              }}
            />
          </ChunkErrorBoundaryWithSuspense>

          <ChunkErrorBoundaryWithSuspense>
            <BlogPostModal
              viewModalOpen={viewModalOpen}
              setViewModalOpen={handleSetViewModalOpen}
              selectedBlogPost={selectedPost}
              onEdit={handleModalEdit}
              deleteDialogOpen={deleteDialogOpen}
              setDeleteDialogOpen={setDeleteDialogOpen}
              blogpostToDelete={postToDelete}
              onBlogPostChange={refetchPosts}
            />
          </ChunkErrorBoundaryWithSuspense>
        </>
      )}
    </div>
  );
});

BlogPostsContent.displayName = "BlogPostsContent";

// Main component with error boundary
export const BlogPostPage = () => {
  return (
    <ChunkErrorBoundaryWithSuspense
      fallback={<PageSkeleton cols={2} lgcols={3} items={12} />}
    >
      <BlogPostsContent />
    </ChunkErrorBoundaryWithSuspense>
  );
};
