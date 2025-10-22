"use client";

import {
  SortSelector,
  ViewModeToggle,
} from "@/components/shared/InsideToggles";
import {
  setSortBy,
  setViewMode,
} from "@/lib/redux-features/blogPost/blogPostSlice";

export const BlogPostViewToggle = ({
  dispatch,
  sortBy,
  viewMode,
}: {
  dispatch: any;
  sortBy: string;
  viewMode: "table" | "grid";
}) => {
  return (
    <div className="flex items-center gap-2">
      <SortSelector
        value={sortBy}
        onChange={(val) => dispatch(setSortBy(val))}
        show={true}
      />
      <ViewModeToggle
        value={viewMode}
        onChange={(val) => dispatch(setViewMode(val))}
        show={true}
        withTitle={true}
      />
    </div>
  );
};
