import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export const DeleteConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete the item and remove its data from our servers.",
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
}: DeleteConfirmationModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg p-6 space-y-2">
        <DialogHeader>
          <DialogTitle className="text-center text-lg py-2">
            {title}
          </DialogTitle>
          <DialogDescription className="w-10/12 mx-auto">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelButtonText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="dark:hover:bg-red-600"
          >
            {isDeleting ? "Deleting..." : confirmButtonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
