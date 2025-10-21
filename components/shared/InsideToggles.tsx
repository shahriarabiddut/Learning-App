import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3x3, Plus, Table2, X } from "lucide-react";

import { useIsMobile } from "@/components/ui/use-mobile";

export const SortSelector = ({
  value,
  onChange,
  show = true,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  show?: boolean;
  className?: string;
}) => {
  if (!show) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`px-3 h-9 ${
          className && className != ""
            ? className
            : "w-[150px] md:w-[180px] lg:w-[240px] xl:w-[300px] "
        }`}
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc" className="cursor-pointer">
          Newest
        </SelectItem>
        <SelectItem value="createdAt-asc" className="cursor-pointer">
          Oldest
        </SelectItem>
        <SelectItem value="updatedAt-desc" className="cursor-pointer">
          Recently Updated
        </SelectItem>
        <SelectItem value="name-asc" className="cursor-pointer">
          Name (A–Z)
        </SelectItem>
        <SelectItem value="name-desc" className="cursor-pointer">
          Name (Z–A)
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export const ViewModeToggle = ({
  value,
  withTitle = true,
  onChange,
  show = true,
}: {
  value: "grid" | "table";
  withTitle?: boolean;
  onChange: (val: "grid" | "table") => void;
  show?: boolean;
}) => {
  const isMobile = useIsMobile();
  if (!show) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={value === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("grid")}
        className="flex items-center gap-1 overflow-hidden transition-all duration-300 group"
        title={value === "grid" ? "Grid Style" : ""}
      >
        <Grid3x3 className="h-4 w-4 flex-shrink-0" />
        {!isMobile && withTitle && (
          <span
            className="
              max-w-0 opacity-0 translate-x-2
              group-hover:max-w-[80px] group-hover:opacity-100 group-hover:translate-x-0
              overflow-hidden whitespace-nowrap transition-all duration-300
            "
          >
            Grid
          </span>
        )}
      </Button>

      <Button
        variant={value === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("table")}
        className="flex items-center gap-1 overflow-hidden transition-all duration-300 group"
        title={value === "table" ? "Table Style" : ""}
      >
        <Table2 className="h-4 w-4 flex-shrink-0" />
        {!isMobile && withTitle && (
          <span
            className="
              max-w-0 opacity-0 translate-x-2
              group-hover:max-w-[80px] group-hover:opacity-100 group-hover:translate-x-0
              overflow-hidden whitespace-nowrap transition-all duration-300
            "
          >
            Table
          </span>
        )}
      </Button>
    </div>
  );
};

export const AddNewButton = ({
  onClick,
  isFormOpen = false,
  show = true,
  title = "Add New",
}: {
  onClick: () => void;
  title?: string;
  show?: boolean;
  isFormOpen?: boolean;
}) => {
  const isMobile = useIsMobile();
  if (!show) return null;

  return (
    <Button
      size="sm"
      onClick={onClick}
      className="my-auto ml-1 md:ml-0 flex items-center gap-1 overflow-hidden transition-all duration-300 group "
      title={title}
    >
      {isFormOpen ? (
        <X className="h-4 w-4" />
      ) : (
        <>
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!isMobile && (
            <span
              className="
                max-w-0 opacity-0 translate-x-2
                group-hover:max-w-[100px] group-hover:opacity-100 group-hover:translate-x-0
                overflow-hidden whitespace-nowrap transition-all duration-300
              "
            >
              {title}
            </span>
          )}
        </>
      )}
    </Button>
  );
};
