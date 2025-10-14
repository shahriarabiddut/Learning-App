import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from "@/lib/redux-features/user/userSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { IUser } from "@/models/users.model";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { formatDate } from "@/lib/helper/clientHelperfunc";
import { useDeleteUserMutation } from "@/lib/redux-features/user/userApi";

interface UserModalProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedUser: IUser | null;
  onEdit: (user: IUser) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  userToDelete: string | null;
  onUsersChange?: () => void;
}

export const UserModal = ({
  viewModalOpen,
  setViewModalOpen,
  selectedUser,
  onEdit,
  deleteDialogOpen,
  setDeleteDialogOpen,
  userToDelete,
  onUsersChange,
}: UserModalProps) => {
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  // Delete handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete).unwrap();
      toast.success("User deleted successfully");
      onUsersChange?.();
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const isSuperAdmin = useSuperAdmin();
  return (
    <>
      {/* View User Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="w-xl md:w-3xl max-w-11/12 mx-auto dark:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                {/* Avatar Section */}
                <div className="flex-shrink-0 w-32 h-32 rounded-xl border border-border bg-muted flex items-center justify-center">
                  {selectedUser.image ? (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-semibold text-muted-foreground">
                      {selectedUser.name?.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedUser.name}
                    </h2>

                    <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                      <p>Email: {selectedUser.email}</p>
                      <p className="capitalize">
                        Role: {selectedUser.role || "No role assigned"}
                      </p>
                      <p>Joined: {formatDate(selectedUser.createdAt)}</p>
                      <p>Last Updated: {formatDate(selectedUser.updatedAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge
                        variant={
                          !selectedUser.isActive ? "default" : "secondaryGreen"
                        }
                      >
                        Acount: {selectedUser.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {isSuperAdmin && selectedUser?.store && (
                        <Badge
                          variant={
                            !selectedUser.isActive
                              ? "outline"
                              : "secondaryGreen"
                          }
                        >
                          {selectedUser.store != "0"
                            ? selectedUser.store
                            : "General Store"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isSuperAdmin && selectedUser?.storeType !== "0" && (
                    <div className="flex space-x-2 text-sm text-muted-foreground">
                      <span className="font-medium">Store Type:</span>
                      <span>
                        {selectedUser?.storeType || "No Store Type available"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4">
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
                      onEdit(selectedUser);
                      setViewModalOpen(false);
                    }}
                  >
                    Edit User
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
        description="This will permanently delete the user account and all associated data. This action cannot be undone."
      />
    </>
  );
};
