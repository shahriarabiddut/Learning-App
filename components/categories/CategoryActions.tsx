import { ICategory } from "@/models/categories.model";
import { ActionButton, ToggleStatus } from "@/components/shared/Actions";

interface CategoryActionsProps {
  category: ICategory;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  showtoggleButtons: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isLoading?: boolean;
}

export const CategoryActions = ({
  category,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isLoading = false,
  showtoggleButtons = false,
}: CategoryActionsProps) => {
  return (
    <div
      className={`flex ${
        showtoggleButtons ? "justify-between mt-1" : "-mt-2 justify-center"
      } items-center`}
    >
      <div className="flex gap-1 md:gap-2">
        <ActionButton action="view" onClick={onView} title="View Category" />
        <ActionButton action="edit" onClick={onEdit} title="Edit Category" />
        <ActionButton
          action="delete"
          onClick={onDelete}
          title="Delete Category"
        />
        <ActionButton
          action="duplicate"
          onClick={onDuplicate}
          title="Duplicate Category"
          isLoading={isLoading}
        />
      </div>

      <ToggleStatus
        item={category}
        onToggleStatus={onToggleStatus}
        isLoading={isLoading}
      />
    </div>
  );
};
