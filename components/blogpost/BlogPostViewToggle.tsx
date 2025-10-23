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
  setFilterCategory,
  setFilterStatus,
  setFilterTags,
  setShowFeaturedOnly,
  setSortBy,
  setViewMode,
} from "@/lib/redux-features/blogPost/blogPostSlice";
import { useFetchCategoriesQuery } from "@/lib/redux-features/categories/categoriesApi";
import { Filter, Star, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppSelector } from "@/lib/redux/hooks";

export const BlogPostViewToggle = ({
  dispatch,
  sortBy,
  viewMode,
}: {
  dispatch: any;
  sortBy: string;
  viewMode: "table" | "grid";
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Get filter state from Redux
  const {
    filterStatus,
    filterAuthor,
    filterCategory,
    filterTags,
    showFeaturedOnly,
  } = useAppSelector((state) => state.blogPosts);

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useFetchCategoriesQuery({
    page: 1,
    limit: 100,
  });

  const categories = categoriesData?.data || [];

  // Calculate active filters count
  const activeFiltersCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterAuthor ? 1 : 0) +
    (filterCategory ? 1 : 0) +
    (filterTags.length > 0 ? 1 : 0) +
    (showFeaturedOnly ? 1 : 0);

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !filterTags.includes(trimmedTag)) {
      dispatch(setFilterTags([...filterTags, trimmedTag]));
      setTagInput("");
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    dispatch(setFilterTags(filterTags.filter((tag) => tag !== tagToRemove)));
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    dispatch(clearAllFilters());
    setTagInput("");
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

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filterCategory || "all"}
                onValueChange={(value) =>
                  dispatch(setFilterCategory(value === "all" ? null : value))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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

            {/* Tags Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag to filter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="h-9 flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  className="h-9"
                >
                  Add
                </Button>
              </div>
              {filterTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filterTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="pl-2 pr-1 py-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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
          {filterCategory && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1">
              Category
              <button
                onClick={() => dispatch(setFilterCategory(null))}
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
          {filterTags.length > 0 && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1">
              {filterTags.length} tag{filterTags.length > 1 ? "s" : ""}
              <button
                onClick={() => dispatch(setFilterTags([]))}
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
        withTitle={true}
      />
    </div>
  );
};
