"use client";
import {
  SortSelector,
  ViewModeToggle,
} from "@/components/shared/InsideToggles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  clearAllFilters,
  setFilterAuthor,
  setFilterStatus,
  setShowFeaturedOnly,
  setSortBy,
  setViewMode,
} from "@/lib/redux-features/blogPage/blogPageSlice";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import { Filter, Star, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/lib/redux/hooks";

export const BlogPageViewToggle = ({
  dispatch,
  sortBy,
  viewMode,
}: {
  dispatch: any;
  sortBy: string;
  viewMode: "table" | "grid";
}) => {
  const [filterOpen, setFilterOpen] = useState(false);

  // Get filter state from Redux
  const { filterStatus, filterAuthor, showFeaturedOnly } = useAppSelector(
    (state) => state.blogPages
  );

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useFetchCategoriesQuery({
    page: 1,
    limit: 100,
  });

  // Calculate active filters count
  const activeFiltersCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterAuthor ? 1 : 0) +
    (showFeaturedOnly ? 1 : 0);

  // Handle clear all filters
  const handleClearFilters = () => {
    dispatch(clearAllFilters());
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Sort Selector */}
      <SortSelector
        value={sortBy}
        onChange={(val) => dispatch(setSortBy(val))}
        show={true}
      />

      {/* Advanced Filters Popover */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="default"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-purple-600"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-4 bg-white dark:bg-gray-800"
          align="end"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-semibold text-sm">Filter Posts</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  dispatch(
                    setFilterStatus(
                      value as "all" | "draft" | "published" | "archived"
                    )
                  )
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Input
                placeholder="Filter by author..."
                value={filterAuthor || ""}
                onChange={(e) =>
                  dispatch(setFilterAuthor(e.target.value || null))
                }
                className="h-9"
              />
              {filterAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(setFilterAuthor(null))}
                  className="h-6 text-xs w-full"
                >
                  Clear Author Filter
                </Button>
              )}
            </div>

            {/* Featured Only Filter */}
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox
                id="featured-only"
                checked={showFeaturedOnly}
                onCheckedChange={(checked) =>
                  dispatch(setShowFeaturedOnly(!!checked))
                }
              />
              <label
                htmlFor="featured-only"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                Featured Posts Only
              </label>
            </div>

            {/* Apply Button */}
            <Button className="w-full" onClick={() => setFilterOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filterStatus !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1">
              Status: {filterStatus}
              <button
                onClick={() => dispatch(setFilterStatus("all"))}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filterAuthor && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1">
              Author: {filterAuthor}
              <button
                onClick={() => dispatch(setFilterAuthor(null))}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {showFeaturedOnly && (
            <Badge
              variant="secondary"
              className="pl-2 pr-1 py-1 gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            >
              <Star className="h-3 w-3" />
              Featured
              <button
                onClick={() => dispatch(setShowFeaturedOnly(false))}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* View Mode Toggle */}
      <ViewModeToggle
        value={viewMode}
        onChange={(val) => dispatch(setViewMode(val))}
        show={true}
      />
    </div>
  );
};
