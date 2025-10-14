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
}: {
  value: string;
  onChange: (val: string) => void;
  show?: boolean;
}) => {
  if (!show) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px] md:w-[140px] text-xs">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="createdAt-desc">Newest</SelectItem>
        <SelectItem value="createdAt-asc">Oldest</SelectItem>
        <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
        <SelectItem value="name-asc">Name (A–Z)</SelectItem>
        <SelectItem value="name-desc">Name (Z–A)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const ViewModeToggle = ({
  value,
  onChange,
  show = true,
}: {
  value: "grid" | "table";
  onChange: (val: "grid" | "table") => void;
  show?: boolean;
}) => {
  const isMobile = useIsMobile();

  if (!show) return null;

  return (
    <>
      <Button
        variant={value === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("grid")}
      >
        <Grid3x3 className="h-4 w-4" />
        {!isMobile && <>Grid</>}
      </Button>
      <Button
        variant={value === "table" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("table")}
      >
        <Table2 className="h-4 w-4" />
        {!isMobile && <>Table</>}
      </Button>
    </>
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
    <Button onClick={onClick}>
      {isFormOpen ? (
        <X className="h-4 w-4" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {!isMobile && <>{title}</>}
        </>
      )}
    </Button>
  );
};
