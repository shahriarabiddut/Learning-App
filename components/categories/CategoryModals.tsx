import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCategoryMutation } from "@/lib/redux-features/categories/categoriesApi";
import { ICategory } from "@/models/categories.model";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";

interface CategoryModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedCategory: ICategory | null;
  onEdit: (category: ICategory) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  categoryToDelete: string | null;
  onCategoriesChange?: () => void;
}

export const CategoryModal = ({
  viewModalOpen,
  setViewModalOpen,
  selectedCategory,
  onEdit,
  deleteDialogOpen,
  setDeleteDialogOpen,
  categoryToDelete,
  onCategoriesChange,
}: CategoryModalProps) => {
  const [deleteCategory] = useDeleteCategoryMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete).unwrap();
      toast.success("Category deleted successfully");
      onCategoriesChange?.();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  // console.log(selectedCategory);
  return (
    <>
      {/* View Category Dialog */}

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-11/12 md:min-w-[30vw] max-h-[90vh] max-w-11/12 mx-auto dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl border-b-1">
              Category Details
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-32 h-32 rounded-xl border border-border bg-muted flex items-center justify-center">
                  {selectedCategory?.imageUrl ? (
                    <img
                      src={selectedCategory?.imageUrl}
                      alt={selectedCategory?.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-muted-foreground">
                      {selectedCategory?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1  min-w-0 space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedCategory?.name}
                  </h2>
                  <div className="flex flex-row gap-1 ">
                    {" "}
                    <Badge
                      variant={
                        !selectedCategory?.isActive
                          ? "default"
                          : "secondaryGreen"
                      }
                    >
                      {selectedCategory?.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {selectedCategory?.parentCategory && (
                      <Badge
                        variant={
                          !selectedCategory?.isActive
                            ? "outline"
                            : "secondaryGreen"
                        }
                        className="mx-2"
                      >
                        Parent : {selectedCategory?.parent}
                      </Badge>
                    )}
                    {selectedCategory?.userName && (
                      <Badge variant={"secondary"}>
                        {selectedCategory?.userName}
                      </Badge>
                    )}
                  </div>

                  <p className="py-1 text-foreground">
                    {selectedCategory?.description}
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
                      onEdit(selectedCategory);
                      setViewModalOpen(false);
                    }}
                  >
                    Edit Category
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
              category and remove its data from our servers."
      />
    </>
  );
};
