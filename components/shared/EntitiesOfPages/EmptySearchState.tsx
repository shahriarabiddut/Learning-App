import { Button } from "@/components/ui/button";
import {
  capitalizeWords,
  singleTitleToPluralY,
} from "@/lib/helper/clientHelperfunc";
import { Search } from "lucide-react";
import { memo } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { FcDocument } from "react-icons/fc";

// Memoized empty states
export const EmptySearchState = memo(
  ({
    searchQuery,
    onClearSearch,
    title = "item",
    icon: Icon = Search,
  }: {
    searchQuery: string;
    onClearSearch: () => void;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="h-24 w-24 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-1">
        No {singleTitleToPluralY(title)} found for "{searchQuery}"
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Try adjusting your search terms or clear the search to see all{" "}
        {singleTitleToPluralY(title)}.
      </p>
      <Button variant="outline" onClick={onClearSearch}>
        Clear Search
      </Button>
    </div>
  )
);

export const EmptyDataState = memo(
  ({
    canManage,
    onAddNew,
    title = "item",
    icon: Icon = FcDocument,
    buttonIcon: ButtonIcon = FaPlusCircle,
  }: {
    canManage: boolean;
    onAddNew: () => void;
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    buttonIcon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="h-24 w-24 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-1">
        No {singleTitleToPluralY(title)} found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        You haven't added any {singleTitleToPluralY(title)} yet. Add your first{" "}
        {title} below.
      </p>
      {canManage && (
        <Button onClick={onAddNew} className="gap-2">
          <ButtonIcon /> Add New {capitalizeWords(title)}
        </Button>
      )}
    </div>
  )
);
