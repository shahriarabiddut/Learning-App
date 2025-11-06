import { IUser } from "@/models/users.model";
import { ActionButton, ToggleStatus } from "@/components/shared/Actions";

interface UserActionsProps {
  user: IUser;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  showtoggleButtons: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isLoading?: boolean;
  canDelete: boolean;
  canUpdate: boolean;
}

export const UserActions = ({
  user,
  onEdit,
  onView,
  onDelete,
  showtoggleButtons = false,
  onToggleStatus,
  isLoading = false,
  canDelete = false,
  canUpdate = false,
}: UserActionsProps) => {
  return (
    <div
      className={`mt-4 flex ${
        showtoggleButtons ? "justify-between" : "justify-center"
      } items-center`}
    >
      <div className="flex space-x-1">
        <ActionButton action="view" onClick={onView} title="View User" />
        {canUpdate && (
          <ActionButton action="edit" onClick={onEdit} title="Edit User" />
        )}
        {canDelete && (
          <ActionButton
            action="delete"
            onClick={onDelete}
            title="Delete User"
          />
        )}
      </div>

      {canUpdate && (
        <ToggleStatus
          item={user}
          onToggleStatus={onToggleStatus}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
