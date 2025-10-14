import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="modal-content">{children}</DialogContent>
    </Dialog>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <DialogHeader className="modal-header">
    <DialogTitle>{children}</DialogTitle>
  </DialogHeader>
);

export const ModalBody: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="modal-body">{children}</div>;

export const ModalFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <DialogFooter className="modal-footer">{children}</DialogFooter>;
