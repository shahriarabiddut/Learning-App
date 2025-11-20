import { ActionButton } from "@/components/shared/Actions";
import { IBlogPage } from "@/models/blogPage.model";

interface BlogPageActionsProps {
  blogpage: IBlogPage;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  showtoggleButtons: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isLoading?: boolean;
}

export const BlogPageActions = ({
  blogpage,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isLoading = false,
  showtoggleButtons = false,
}: BlogPageActionsProps) => {
  return (
    <div
      className={`flex ${
        showtoggleButtons ? "justify-between mt-1" : "-mt-2 justify-center"
      } items-center`}
    >
      <div className="flex gap-1 md:gap-2">
        <ActionButton action="view" onClick={onView} title="View Blog Post" />
        <ActionButton action="edit" onClick={onEdit} title="Edit Blog Post" />
        <ActionButton
          action="delete"
          onClick={onDelete}
          title="Delete Blog Post"
        />
        {/* <ActionButton
          action="duplicate"
          onClick={onDuplicate}
          title="Duplicate Blog Post"
          isLoading={isLoading}
        /> */}
      </div>

      {/* Toggle Status Badge */}
      {/* {showtoggleButtons && (
        <div
          className="cursor-pointer"
          onClick={() =>
            onToggleStatus(blogpage.id, blogpage.isActive || false)
          }
        >
          {blogpage.isActive ? (
            <Badge
              variant="secondaryGreen"
              className="hover:bg-green-600 transition-colors"
            >
              Active
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="hover:bg-gray-600 transition-colors"
            >
              Inactive
            </Badge>
          )}
        </div>
      )} */}
    </div>
  );
};
