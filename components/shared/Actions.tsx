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
  onClick: () => void;
  title?: string;
  isLoading?: boolean;
  className?: string;
}

export const ActionButton = ({
  action,
  show = true,
  onClick,
  title,
  isLoading = false,
  className = "",
}: ActionButtonProps) => {
  if (!show) return null;

  const baseClass = {
    view: "text-blue-500 hover:bg-blue-50",
    note: "text-orange-500 hover:bg-orange-50",
    edit: "",
    delete: "text-red-500 hover:bg-red-50",
    duplicate: "",
  };

  return (
    <Button
      variant={"outline"}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={`rounded-full p-1 md:p-2 ${
        action == "duplicate" && "md:flex hidden"
      } ${baseClass[action] || ""} ${className}`}
      disabled={isLoading}
    >
      {ICONS[action]}
    </Button>
  );
};

export const ToggleStatus = ({
  show = true,
  item,
  onToggleStatus,
  isLoading = false,
  buttonShowText = { active: "Active", disable: "Inactive" },
  buttonText = { active: "Activate", disable: "Disable" },
  title = "item",
}: ToggleStatusProps) => {
  if (!show) return null;
  const status = item?.isActive || item?.status;
  return (
    <div className="group inline-flex items-center space-x-2 ml-2">
      <Badge
        variant={!status ? "default" : "secondaryGreen"}
        className="cursor-help py-1.5"
      >
        {status ? buttonShowText.active : buttonShowText.disable}
      </Badge>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant={status ? "secondary" : "outline"}
          size="sm"
          title={`${status ? buttonText.disable : buttonText.active} ${title}!`}
          className={`${
            status
              ? "bg-gray-900 text-white hover:bg-red-500"
              : "bg-green-200 text-green-800 hover:bg-green-400 hover:text-white"
          } gap-1 rounded-full flex items-center text-xs`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(item.id, status);
          }}
          disabled={isLoading}
        >
          {status ? ICONS.disable : ICONS.activate}
          {isLoading ? "..." : status ? buttonText.disable : buttonText.active}
        </Button>
      </div>
    </div>
  );
};
