import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage } from "@/lib/helper/clientHelperfunc";
import { useDeleteCategoryMutation } from "@/lib/redux-features/categories/categoriesApi";
import { ICategory } from "@/models/categories.model";
import { FaStar } from "react-icons/fa6";
import { toast } from "sonner";

interface CategoryModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedCategory: ICategory | null;
  onEdit: (category: ICategory) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  categoryToDelete: string | null;
  onCategoriesChange?: () => void;
  canManage: boolean;
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
  canManage = false,
}: CategoryModalProps) => {
  const [deleteCategory] = useDeleteCategoryMutation();

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete).unwrap();
      toast.success("Category deleted successfully!");
      onCategoriesChange?.();
    } catch (error) {
      const errorMessage =
        error && extractErrorMessage(error, "Failed to delete Categories!");
      toast.error(errorMessage as string);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  return (
    <>
      {/* View Category Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-gray-900 dark:text-white"></DialogTitle>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-8">
              {/* Header Section with Image and Basic Info */}
              <div className="relative">
                <div className="flex items-start gap-6">
                  {/* Featured Badge */}
                  {selectedCategory?.featured && (
                    <Badge className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-lg">
                      <FaStar className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}

                  {/* Category Image */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
                      {selectedCategory.imageUrl ? (
                        <img
                          src={selectedCategory.imageUrl}
                          alt={selectedCategory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                            {selectedCategory.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {selectedCategory.name}
                      </h2>

                      {/* Status and User Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          className={`px-3 py-1 font-medium ${
                            selectedCategory.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              selectedCategory.isActive
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          {selectedCategory.isActive ? "Active" : "Inactive"}
                        </Badge>

                        {selectedCategory?.userName && (
                          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1">
                            @ {selectedCategory?.userName}
                          </Badge>
                        )}
                      </div>

                      {/* Additional Badges */}
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory.parentCategory && (
                          <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-3 py-1">
                            Parent: {selectedCategory.parent}
                          </Badge>
                        )}

                        {selectedCategory?.store && (
                          <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1">
                            Store:{" "}
                            {selectedCategory.store !== "0"
                              ? selectedCategory.store
                              : "General Store"}
                          </Badge>
                        )}
                        {selectedCategory?.storeType && (
                          <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-3 py-1">
                            Store Type:{" "}
                            {selectedCategory.storeType !== ""
                              ? selectedCategory.storeType
                              : "N/A"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              {(selectedCategory?.productCount > 0 ||
                selectedCategory?.description) && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex gap-3 flex-col">
                  {selectedCategory?.description &&
                    selectedCategory.description !== "" && (
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className=" font-bold"> Description :</span>{" "}
                        <span className=" font-light">
                          {selectedCategory.description}
                        </span>
                      </p>
                    )}
                  {selectedCategory?.productCount > 0 && (
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className=" font-bold"> Total Items :</span>{" "}
                      {selectedCategory.productCount} Items Found in this
                      category
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setViewModalOpen(false)}
                  className="px-6 py-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </Button>
                {canManage && (
                  <Button
                    onClick={() => {
                      onEdit(selectedCategory);
                      setViewModalOpen(false);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Category
                  </Button>
                )}
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
        description="This will permanently delete the category data. This action cannot be undone."
      />
    </>
  );
};
