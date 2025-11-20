import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteBlogPageMutation } from "@/lib/redux-features/blogPage/blogPageApi";
import { IBlogPage } from "@/models/blogPage.model";
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
import { FaStar } from "react-icons/fa";
import { toast } from "sonner";
import { formatDate } from "@/lib/helper/clientHelperfunc";

interface BlogPageModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedBlogPage: IBlogPage | null;
  onEdit: (blogpage: IBlogPage) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  blogpageToDelete: string | null;
  onBlogPageChange?: () => void;
}

export const BlogPageModal = ({
  viewModalOpen,
  setViewModalOpen,
  selectedBlogPage,
  onEdit,
  deleteDialogOpen,
  setDeleteDialogOpen,
  blogpageToDelete,
  onBlogPageChange,
}: BlogPageModalProps) => {
  const [deleteBlogPage] = useDeleteBlogPageMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!blogpageToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBlogPage(blogpageToDelete).unwrap();
      toast.success("Blog post deleted successfully");
      onBlogPageChange?.();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
        <DialogContent className="w-11/12 md:max-w-5xl max-h-[90vh] overflow-y-auto mx-auto dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl border-b pb-4">
              Preview
            </DialogTitle>
          </DialogHeader>

          {selectedBlogPage && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Post Details</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({selectedBlogPage.commentsCount || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Featured Image */}
                {selectedBlogPage.featuredImage && (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border">
                    <Image
                      src={selectedBlogPage.featuredImage}
                      alt={selectedBlogPage.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Title and Badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedBlogPage.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <FaStar className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge
                      className={
                        getStatusBadge(selectedBlogPage.status || "draft")
                          .className
                      }
                    >
                      {getStatusBadge(selectedBlogPage.status || "draft").label}
                    </Badge>
                    {selectedBlogPage.isActive ? (
                      <Badge variant="secondaryGreen">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                    {!selectedBlogPage.allowComments && (
                      <Badge variant="outline">Comments Disabled</Badge>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-foreground">
                    {selectedBlogPage.title}
                  </h2>

                  {selectedBlogPage.excerpt && (
                    <p className="text-lg text-muted-foreground italic">
                      {selectedBlogPage.excerpt}
                    </p>
                  )}
                </div>

                {/* Meta Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  {selectedBlogPage.authorName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Author:</span>
                      <span>{selectedBlogPage.authorName}</span>
                    </div>
                  )}

                  {selectedBlogPage.publishedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Published:</span>
                      <span>
                        {formatDate(selectedBlogPage.publishedAt, false)}
                      </span>
                    </div>
                  )}

                  {selectedBlogPage.readingTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Reading Time:</span>
                      <span>{selectedBlogPage.readingTime} minutes</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Views:</span>
                    <span>{selectedBlogPage.views || 0}</span>
                  </div>

                  {selectedBlogPage.allowComments && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Comments:</span>
                      <span>{selectedBlogPage.comments?.length || 0}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Content Type:</span>
                    <span className="capitalize">
                      {selectedBlogPage.contentType || "html"}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                {selectedBlogPage.categories &&
                  selectedBlogPage.categories.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlogPage.categories.map((cat: any, index) => (
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
                {selectedBlogPage.tags && selectedBlogPage.tags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlogPage.tags.map((tag, index) => (
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
                {selectedBlogPage.seo && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <h3 className="text-sm font-semibold text-foreground">
                      SEO Information
                    </h3>

                    {selectedBlogPage.seo.title && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          SEO Title:
                        </span>
                        <p className="text-sm">{selectedBlogPage.seo.title}</p>
                      </div>
                    )}

                    {selectedBlogPage.seo.description && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Meta Description:
                        </span>
                        <p className="text-sm">
                          {selectedBlogPage.seo.description}
                        </p>
                      </div>
                    )}

                    {selectedBlogPage.seo.keywords &&
                      selectedBlogPage.seo.keywords.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">
                            Keywords:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedBlogPage.seo.keywords.map(
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

                {/* Timestamps */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(selectedBlogPage.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {formatDate(selectedBlogPage.updatedAt)}
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
                      onEdit(selectedBlogPage);
                      setViewModalOpen(false);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Edit Post
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
