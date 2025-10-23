import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteBlogPostMutation } from "@/lib/redux-features/blogPost/blogPostApi";
import { IBlogPost } from "@/models/blogPost.model";
import {
  Calendar,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { FaStar } from "react-icons/fa";
import RichTextDisplay from "../shared/RichTextDisplay";

interface BlogPostModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedBlogPost: IBlogPost | null;
  onEdit: (blogpost: IBlogPost) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  blogpostToDelete: string | null;
  onBlogPostChange?: () => void;
}

export const BlogPostModal = ({
  viewModalOpen,
  setViewModalOpen,
  selectedBlogPost,
  onEdit,
  deleteDialogOpen,
  setDeleteDialogOpen,
  blogpostToDelete,
  onBlogPostChange,
}: BlogPostModalProps) => {
  const [deleteBlogPost] = useDeleteBlogPostMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!blogpostToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBlogPost(blogpostToDelete).unwrap();
      toast.success("Blog post deleted successfully");
      onBlogPostChange?.();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      published: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        label: "Published",
      },
      draft: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Draft",
      },
      archived: {
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        label: "Archived",
      },
    };

    return variants[status] || variants.draft;
  };

  return (
    <>
      {/* View Blog Post Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-11/12 md:max-w-3xl max-h-[90vh] overflow-y-auto mx-auto dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl border-b pb-4">
              Preview
            </DialogTitle>
          </DialogHeader>

          {selectedBlogPost && (
            <div className="space-y-6">
              {/* Featured Image */}
              {selectedBlogPost.featuredImage && (
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border">
                  <Image
                    src={selectedBlogPost.featuredImage}
                    alt={selectedBlogPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title and Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedBlogPost.isFeatured && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <FaStar className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    className={
                      getStatusBadge(selectedBlogPost.status || "draft")
                        .className
                    }
                  >
                    {getStatusBadge(selectedBlogPost.status || "draft").label}
                  </Badge>
                  {selectedBlogPost.isActive ? (
                    <Badge variant="secondaryGreen">Active</Badge>
                  ) : (
                    <Badge variant="default">Inactive</Badge>
                  )}
                  {!selectedBlogPost.allowComments && (
                    <Badge variant="outline">Comments Disabled</Badge>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-foreground">
                  {selectedBlogPost.title}
                </h2>

                {selectedBlogPost.excerpt && (
                  <p className="text-lg text-muted-foreground italic">
                    {selectedBlogPost.excerpt}
                  </p>
                )}
              </div>

              {/* Meta Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                {selectedBlogPost.authorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Author:</span>
                    <span>{selectedBlogPost.authorName}</span>
                  </div>
                )}

                {selectedBlogPost.publishedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Published:</span>
                    <span>{formatDate(selectedBlogPost.publishedAt)}</span>
                  </div>
                )}

                {selectedBlogPost.readingTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Reading Time:</span>
                    <span>{selectedBlogPost.readingTime} minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Views:</span>
                  <span>{selectedBlogPost.views || 0}</span>
                </div>

                {selectedBlogPost.allowComments && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Comments:</span>
                    <span>{selectedBlogPost.comments?.length || 0}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Content Type:</span>
                  <span className="capitalize">
                    {selectedBlogPost.contentType || "html"}
                  </span>
                </div>
              </div>

              {/* Categories */}
              {selectedBlogPost.categories &&
                selectedBlogPost.categories.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlogPost.categories.map((cat: any, index) => (
                        <Badge key={index} variant="outline">
                          {typeof cat === "string"
                            ? cat
                            : cat?.name || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Tags */}
              {selectedBlogPost.tags && selectedBlogPost.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlogPost.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Information */}
              {selectedBlogPost.seo && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-foreground">
                    SEO Information
                  </h3>

                  {selectedBlogPost.seo.title && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        SEO Title:
                      </span>
                      <p className="text-sm">{selectedBlogPost.seo.title}</p>
                    </div>
                  )}

                  {selectedBlogPost.seo.description && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Meta Description:
                      </span>
                      <p className="text-sm">
                        {selectedBlogPost.seo.description}
                      </p>
                    </div>
                  )}

                  {selectedBlogPost.seo.keywords &&
                    selectedBlogPost.seo.keywords.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedBlogPost.seo.keywords.map(
                            (keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {keyword}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Content Preview */}
              {selectedBlogPost.content && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Content Preview
                  </h3>
                  <RichTextDisplay content={selectedBlogPost.content} />
                </div>
              )}

              {/* Timestamps */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(selectedBlogPost.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{" "}
                  {formatDate(selectedBlogPost.updatedAt)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    onEdit(selectedBlogPost);
                    setViewModalOpen(false);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Edit Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Blog Post?"
        description="This action cannot be undone. This will permanently delete the blog post and remove all its data from our servers."
      />
    </>
  );
};
