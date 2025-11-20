import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/helper/clientHelperfunc";
import {
  useBulkDeleteCommentsMutation,
  useBulkUpdateCommentsMutation,
  useDeleteCommentMutation,
  useFetchPostCommentsQuery,
  useUpdateCommentStatusMutation,
} from "@/lib/redux-features/blogPost/blogPostApi";
import { CommentStatus } from "@/models/comment.model"; // Import CommentStatus enum
import {
  Ban,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  MoreVertical,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface Comment {
  _id: string;
  name: string;
  email?: string;
  body: string;
  status: CommentStatus; // Changed from approved: boolean
  createdAt: string;
}

interface CommentsManagementProps {
  postId: string;
  allowComments?: boolean;
}

export const CommentsManagement = ({
  postId,
  allowComments = true,
}: CommentsManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Fetch comments
  const {
    data: commentsData,
    isLoading,
    refetch,
  } = useFetchPostCommentsQuery(postId);

  // Mutations
  const [updateCommentStatus] = useUpdateCommentStatusMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [bulkUpdateComments] = useBulkUpdateCommentsMutation();
  const [bulkDeleteComments] = useBulkDeleteCommentsMutation();

  const comments = commentsData?.comments || [];

  // Filter and search comments
  const filteredComments = useMemo(() => {
    let filtered = comments;

    // Filter by status
    if (filterStatus === "approved") {
      filtered = filtered.filter(
        (c: Comment) => c.status === CommentStatus.APPROVED
      );
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(
        (c: Comment) => c.status === CommentStatus.PENDING
      );
    } else if (filterStatus === "rejected") {
      filtered = filtered.filter(
        (c: Comment) => c.status === CommentStatus.REJECTED
      );
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c: Comment) =>
          c.name.toLowerCase().includes(query) ||
          c.body.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [comments, filterStatus, searchQuery]);

  // Handle single comment status update
  const handleUpdateStatus = async (
    commentId: string,
    status: CommentStatus
  ) => {
    try {
      await updateCommentStatus({
        postId,
        commentId,
        status,
      }).unwrap();
      toast.success(`Comment ${status}`);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to update comment";
      toast.error(errorMessage);
    }
  };

  // Handle single comment delete
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment({
        postId,
        commentId: commentToDelete,
      }).unwrap();
      toast.success("Comment deleted successfully");
      setSelectedComments((prev) =>
        prev.filter((id) => id !== commentToDelete)
      );
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to delete comment";
      toast.error(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedComments.length === 0) {
      toast.error("No comments selected");
      return;
    }

    try {
      const result = await bulkUpdateComments({
        postId,
        commentIds: selectedComments,
        status: CommentStatus.APPROVED,
      }).unwrap();
      toast.success(result.message);
      setSelectedComments([]);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to approve comments";
      toast.error(errorMessage);
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedComments.length === 0) {
      toast.error("No comments selected");
      return;
    }

    try {
      const result = await bulkUpdateComments({
        postId,
        commentIds: selectedComments,
        status: CommentStatus.REJECTED,
      }).unwrap();
      toast.success(result.message);
      setSelectedComments([]);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to reject comments";
      toast.error(errorMessage);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) {
      toast.error("No comments selected");
      return;
    }

    try {
      const result = await bulkDeleteComments({
        postId,
        commentIds: selectedComments,
      }).unwrap();
      toast.success(result.message);
      setSelectedComments([]);
      refetch();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to delete comments";
      toast.error(errorMessage);
    }
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map((c: Comment) => c._id));
    }
  };

  // Toggle individual selection
  const handleToggleSelect = (commentId: string) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  // Stats - Updated to use status enum
  const totalComments = comments.length;
  const approvedCount = comments.filter(
    (c: Comment) => c.status === CommentStatus.APPROVED
  ).length;
  const rejectedCount = comments.filter(
    (c: Comment) => c.status === CommentStatus.REJECTED
  ).length;
  const pendingCount = comments.filter(
    (c: Comment) => c.status === CommentStatus.PENDING
  ).length;

  return (
    <>
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalComments}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {!allowComments && (
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              ⚠️ Comments are currently disabled for this post
            </p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("approved")}
            >
              Approved
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === "rejected" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("rejected")}
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedComments.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium">
              {selectedComments.length} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkApprove}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkReject}
                className="text-orange-600 hover:text-orange-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== "all"
                  ? "No comments found matching your filters"
                  : "No comments yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-2 p-2 border-b">
                <Checkbox
                  checked={
                    filteredComments.length > 0 &&
                    selectedComments.length === filteredComments.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select All
                </span>
              </div>

              {/* Comment Items */}
              {filteredComments.map((comment: Comment) => (
                <div
                  key={comment._id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedComments.includes(comment._id)
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      checked={selectedComments.includes(comment._id)}
                      onCheckedChange={() => handleToggleSelect(comment._id)}
                      className="mt-1"
                    />

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {comment.name}
                              </span>
                            </div>
                            {comment.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{comment.email}</span>
                              </div>
                            )}
                            <Badge
                              variant={
                                comment.status === CommentStatus.PENDING
                                  ? "outline"
                                  : comment.status === CommentStatus.APPROVED
                                  ? "secondaryGreen"
                                  : "destructive"
                              }
                              className={
                                comment.status === CommentStatus.PENDING
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                  : comment.status === CommentStatus.APPROVED
                                  ? ""
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }
                            >
                              {comment.status === CommentStatus.PENDING ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </>
                              ) : comment.status === CommentStatus.APPROVED ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3 mr-1" />
                                  Rejected
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(comment.createdAt, false)}
                          </div>
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {comment.status === CommentStatus.PENDING && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      comment._id,
                                      CommentStatus.APPROVED
                                    )
                                  }
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      comment._id,
                                      CommentStatus.REJECTED
                                    )
                                  }
                                  className="text-orange-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {comment.status === CommentStatus.APPROVED && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(
                                    comment._id,
                                    CommentStatus.REJECTED
                                  )
                                }
                                className="text-orange-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            {comment.status === CommentStatus.REJECTED && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(
                                    comment._id,
                                    CommentStatus.APPROVED
                                  )
                                }
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setCommentToDelete(comment._id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Comment Body */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredComments.length > 0 && (
          <div className="text-sm text-muted-foreground pt-4 border-t">
            Showing {filteredComments.length} of {totalComments} comments
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteComment}
        title="Delete Comment?"
        description="This action cannot be undone. This will permanently delete the comment."
      />
    </>
  );
};
