import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { Copy, Eye, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { FaBan } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

interface ToggleStatusProps {
  show?: boolean;
  title?: string;
  item: { id: string; isActive?: boolean; status?: boolean };
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isLoading?: boolean;
  buttonShowText?: { active: string; disable: string };
  buttonText?: { active: string; disable: string };
}

const ICONS: Record<string, JSX.Element> = {
  view: <Eye className="h-4 w-4 " />,
  edit: <Pencil className="h-4 w-4" />,
  note: <NotebookPen className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4 " />,
  duplicate: <Copy className="h-4 w-4" />,
  disable: <FaBan className="h-4 w-4" />,
  activate: <FaCheckCircle className="h-4 w-4" />,
};

interface ActionButtonProps {
  action: "view" | "note" | "edit" | "delete" | "duplicate";
  show?: boolean;
  showTitle?: boolean;
  title?: string;
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ActionButton = ({
  action,
  show = true,
  showTitle = false,
  title,
  onClick,
  isLoading = false,
  className = "",
}: ActionButtonProps) => {
  if (!show) return null;

  const baseClass = {
    view: "text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    note: "text-orange-500 hover:bg-orange-50",
    edit: "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
    delete:
      "text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
    duplicate:
      "text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20",
  };

  return (
    <Button
      variant={"outline"}
      size={showTitle ? undefined : "icon"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`transition-colors ${
        showTitle
          ? "rounded-lg px-3 py-2 flex items-center gap-2"
          : "rounded-full p-1 md:p-2"
      } ${action == "duplicate" && "md:flex hidden"} ${
        baseClass[action] || ""
      } ${className}`}
      disabled={isLoading}
      type="button"
    >
      {ICONS[action]}
      {showTitle && (
        <span className="text-sm font-medium">{isLoading ? "..." : title}</span>
      )}
    </Button>
  );
};

export const ToggleStatus = ({
  show = true,
  item,
  onToggleStatus,
  isLoading = false,
}: ToggleStatusProps) => {
  if (!show) return null;

  return (
    <div className="group inline-flex items-center space-x-2 ml-2">
      <Badge
        variant={!item.isActive ? "default" : "secondaryGreen"}
        className="cursor-help md:py-1.5 md:px-2 px-0.5"
        title={item.isActive ? "Item is Active" : "Item is Inactive"}
      >
        <span className="md:inline-flex hidden">
          {item.isActive ? "Active" : "Inactive"}
        </span>{" "}
        <span className="inline-flex md:hidden">
          {item.isActive ? ICONS.activate : ICONS.disable}
        </span>
      </Badge>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant={item.isActive ? "secondary" : "outline"}
          size="sm"
          title={item.isActive ? "Disable This Item" : "Activate This Item"}
          className={`${
            item.isActive
              ? "bg-gray-900 text-white hover:bg-red-500"
              : "bg-green-200 text-green-800 hover:bg-green-400 hover:text-white"
          } gap-1 rounded-full flex items-center text-xs md:py-1.5 md:px-2 px-0.5`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, item.isActive);
          }}
          disabled={isLoading}
          type="button"
        >
          {item.isActive ? ICONS.disable : ICONS.activate}
          <span className="lg:inline-flex hidden">
            {" "}
            {isLoading ? "..." : item.isActive ? "Disable" : "Activate"}
          </span>
        </Button>
      </div>
    </div>
  );
};
