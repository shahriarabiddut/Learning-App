import { useCallback } from "react";

interface CommonEntity {
  id: string;
  [key: string]: any;
}

interface EditConfig<T extends CommonEntity> {
  setEditingItem: (item: T | null) => void; // Allow null to clear state
  setIsFormOpen: (open: boolean) => void;
}

interface DeleteConfig {
  setItemToDelete: (id: string | null) => void; // Allow null to clear state
  setDeleteDialogOpen: (open: boolean) => void;
}

interface ViewConfig<T extends CommonEntity> {
  fetchDetail: (id: string) => { unwrap: () => Promise<T> };
  setSelectedItem: (item: T | null) => void; // Allow null to clear state
  setViewModalOpen: (open: boolean) => void;
  toast?: {
    error: (message: string) => void;
  };
  isClient?: boolean;
  errorMessage?: string;
}

// Enhanced handleView with better state management
const createHandleView = <T extends CommonEntity>({
  fetchDetail,
  setSelectedItem,
  setViewModalOpen,
  toast,
  isClient = true,
  errorMessage = "Failed to load details",
}: ViewConfig<T>) => {
  return useCallback(
    async (item: T) => {
      try {
        // Clear any previous selection first
        setSelectedItem(null);

        // Set the basic item data immediately
        setSelectedItem(item);

        // Open modal
        setViewModalOpen(true);

        // Fetch detailed data
        const detailed = await fetchDetail(item.id).unwrap();

        // Update with detailed data
        setSelectedItem(detailed);
      } catch (error) {
        console.error(`Failed to load ${item.id} details:`, error);

        // On error, still show the basic item data
        setSelectedItem(item);

        if (isClient && toast) {
          toast.error(errorMessage);
        }
      }
    },
    [
      fetchDetail,
      setSelectedItem,
      setViewModalOpen,
      toast,
      isClient,
      errorMessage,
    ]
  );
};

// Enhanced handleEdit with proper state clearing
const createHandleEdit = <T extends CommonEntity>({
  setEditingItem,
  setIsFormOpen,
}: EditConfig<T>) => {
  return useCallback(
    (item: T, openForm = true) => {
      // Clear any existing editing state first
      setEditingItem(null);

      // Use requestAnimationFrame to ensure state is cleared before setting new item
      requestAnimationFrame(() => {
        setEditingItem(item);

        if (openForm) {
          // Another frame to ensure editing item is set before opening form
          requestAnimationFrame(() => {
            setIsFormOpen(true);
          });
        }
      });
    },
    [setEditingItem, setIsFormOpen]
  );
};

// Enhanced handleDelete with better state management
const createHandleDelete = ({
  setItemToDelete,
  setDeleteDialogOpen,
}: DeleteConfig) => {
  return useCallback(
    (id: string) => {
      // Clear any existing delete state first
      setItemToDelete(null);

      // Set the item to delete and open dialog
      requestAnimationFrame(() => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
      });
    },
    [setItemToDelete, setDeleteDialogOpen]
  );
};

// React hook wrappers
export const useHandleView = <T extends CommonEntity>(
  config: ViewConfig<T>
) => {
  return createHandleView(config);
};

export const useHandleEdit = <T extends CommonEntity>(
  config: EditConfig<T>
) => {
  return createHandleEdit(config);
};

export const useHandleDelete = (config: DeleteConfig) => {
  return createHandleDelete(config);
};
