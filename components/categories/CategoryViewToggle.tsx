"use client";

import {
  setSortBy,
  setViewMode,
} from "@/lib/redux-features/categories/categoriesSlice";
import {
  AddNewButton,
  SortSelector,
  ViewModeToggle,
} from "@/components/shared/InsideToggles";

export const CategoryViewToggle = ({
  dispatch,
  sortBy,
  viewMode,
  onAddNew,
  canAdd,
}: {
  dispatch: any;
  sortBy: string;
  viewMode: "table" | "grid";
  onAddNew: () => void;
  canAdd: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <SortSelector
        value={sortBy}
        onChange={(val) => dispatch(setSortBy(val))}
        show={true}
        width="min-w-[190px] w-auto"
      />
      <ViewModeToggle
        value={viewMode}
        onChange={(val) => dispatch(setViewMode(val))}
        show={true}
      />
      {canAdd && <AddNewButton onClick={onAddNew} />}
    </div>
  );
};
