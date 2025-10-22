import { ActionButton } from "@/components/shared/Actions";
import { IBlogPost } from "@/models/blogPost.model";

interface BlogPostActionsProps {
  blogpost: IBlogPost;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  showtoggleButtons: boolean;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isLoading?: boolean;
}

export const BlogPostActions = ({
  blogpost,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onToggleStatus,
  isLoading = false,
  showtoggleButtons = false,
}: BlogPostActionsProps) => {
  return (
    <div
      className={`flex ${
        showtoggleButtons ? "justify-between mt-1" : "-mt-2 justify-center"
      } items-center`}
    >
      <div className="flex gap-1 md:gap-2">
        <ActionButton action="view" onClick={onView} title="View Blogpost" />
        <ActionButton action="edit" onClick={onEdit} title="Edit Blogpost" />
        <ActionButton
          action="delete"
          onClick={onDelete}
          title="Delete Blogpost"
        />
        <ActionButton
          action="duplicate"
          onClick={onDuplicate}
          title="Duplicate Blogpost"
          isLoading={isLoading}
        />
      </div>

      {/* ToggleStatus */}
    </div>
  );
};
