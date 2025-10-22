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
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";

interface BlogPostModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedBlogPost: IBlogPost | null;
  onEdit: (blogpost: IBlogPost) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  blogpostToDelete: string | null;
  onBlogpostChange?: () => void;
}

export const BlogPostModal = ({
  viewModalOpen,
  setViewModalOpen,
  selectedBlogPost,
  onEdit,
  deleteDialogOpen,
  setDeleteDialogOpen,
  blogpostToDelete,
  onBlogpostChange,
}: BlogPostModalProps) => {
  const [deleteBlogPost] = useDeleteBlogPostMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!blogpostToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBlogPost(blogpostToDelete).unwrap();
      toast.success("BlogPost deleted successfully");
      onBlogpostChange?.();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  // console.log(selectedBlogPost);
  return (
    <>
      {/* View BlogPost Dialog */}

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-11/12 md:min-w-[30vw] max-h-[90vh] max-w-11/12 mx-auto dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl border-b-1">
              BlogPost Details
            </DialogTitle>
          </DialogHeader>
          {selectedBlogPost && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-32 h-32 rounded-xl border border-border bg-muted flex items-center justify-center">
                  {selectedBlogPost?.imageUrl ? (
                    <img
                      src={selectedBlogPost?.imageUrl}
                      alt={selectedBlogPost?.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-muted-foreground">
                      {selectedBlogPost?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1  min-w-0 space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedBlogPost?.name}
                  </h2>
                  <div className="flex flex-row gap-1 ">
                    {" "}
                    <Badge
                      variant={
                        !selectedBlogPost?.isActive
                          ? "default"
                          : "secondaryGreen"
                      }
                    >
                      {selectedBlogPost?.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {selectedBlogPost?.parentBlogPost && (
                      <Badge
                        variant={
                          !selectedBlogPost?.isActive
                            ? "outline"
                            : "secondaryGreen"
                        }
                        className="mx-2"
                      >
                        Parent : {selectedBlogPost?.parent}
                      </Badge>
                    )}
                    {selectedBlogPost?.userName && (
                      <Badge variant={"secondary"}>
                        {selectedBlogPost?.userName}
                      </Badge>
                    )}
                  </div>

                  <p className="py-1 text-foreground">
                    {selectedBlogPost?.description}
                  </p>
                </div>
              </div>
              <div className="flex justify-end items-center pt-4">
                <div className="flex space-x-3">
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
                  >
                    Edit BlogPost
                  </Button>
                </div>
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
        title="Are you sure ?"
        description="This action cannot be undone. This will permanently delete the
              blogpost and remove its data from our servers."
      />
    </>
  );
};
