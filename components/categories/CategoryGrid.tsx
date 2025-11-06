"use client";
import { Card } from "@/components/ui/card";
import { ICategory } from "@/models/categories.model";
import { useState } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { FaBan, FaStarHalfStroke } from "react-icons/fa6";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { CategoryActions } from "./CategoryActions";

interface CategoryGridProps {
  categories: ICategory[];
  handleViewClick: (category: ICategory) => void;
  handleEditClick: (category: ICategory) => void;
  handleDeleteClick: (id: string) => void;
  handleDuplicateClick: (category: ICategory) => void;
  handleToggleStatusClick: (id: string, currentStatus: boolean) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkStatusToggle: (ids: string[], targetStatus: boolean) => void;
  handleFeaturedStatusToggle: (ids: string[], targetStatus: boolean) => void;
  canManage: boolean;
  canViewAllData: boolean;
  canDelete: boolean;
}

export const CategoryGrid = ({
  categories,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
  canManage = false,
  canViewAllData = false,
  canDelete = false,
}: CategoryGridProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single category
  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category?.id));
    }
  };

  const handleCheckboxChange = (
    checked: boolean | string,
    index: number,
    categoryId: string | undefined
  ) => {
    if (checked === "indeterminate" || !categoryId) return;

    if (
      typeof window !== "undefined" &&
      window.event instanceof MouseEvent &&
      window.event.shiftKey &&
      lastCheckedIndex !== null
    ) {
      const start = Math.min(index, lastCheckedIndex);
      const end = Math.max(index, lastCheckedIndex);

      const range = categories
        .slice(start, end + 1)
        .map((category) => category.id)
        .filter((id): id is string => !!id); // Filter out undefined ids

      setSelectedCategories((prev) => {
        // Determine if we should add or remove based on the last clicked checkbox
        const shouldAdd = !prev.includes(categories[lastCheckedIndex].id);

        if (shouldAdd) {
          // Add all in range that aren't already selected
          const newSelections = new Set(prev);
          range.forEach((id) => newSelections.add(id));
          return Array.from(newSelections);
        } else {
          // Remove all in range that are selected
          return prev.filter((id) => !range.includes(id));
        }
      });
    } else {
      toggleCategorySelection(categoryId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedCategories.length === 0) return;
    handleBulkDelete(selectedCategories);
    setSelectedCategories([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    // Handle bulk status toggle
    handleBulkStatusToggle(selectedCategories, targetStatus);
  }; // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedCategories, targetStatus);
  };
  return (
    <>
      {selectedCategories.length > 0 && canManage && (
        <div className="flex items-center gap-2 mb-4 bg-muted rounded-md px-4 py-3 ">
          <span className="text-sm font-medium">
            {selectedCategories.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedCategories.length === categories.length
              ? "Deselect all"
              : "Select all"}
          </Button>

          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
            >
              Delete selected
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(false)}
            className="bg-gray-900 text-white hover:bg-red-500 gap-1 dark:bg-red-900 dark:hover:bg-red-700"
          >
            <FaBan className="h-3 w-3" />
            Deactivate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(true)}
            className="bg-green-200 text-green-800 hover:bg-green-400 hover:text-white gap-1 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-700"
          >
            <FaCheckCircle className="h-4 w-4" />
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeaturedClick(true)}
            className="bg-orange-200 text-orange-800 hover:bg-orange-400 hover:text-white gap-1 dark:bg-orange-900 dark:text-orange-100 dark:hover:bg-orange-700"
            disabled={selectedCategories.length > 8}
          >
            <FaStar className="h-4 w-4" />
            Add to Featured
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeaturedClick(false)}
            className="bg-gray-200 text-gray-800 hover:bg-gray-400 hover:text-white gap-1 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <FaStarHalfStroke className="h-4 w-4" />
            Remove From Featured
          </Button>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => (
          <Card
            key={category.id}
            className="p-7 flex flex-col relative bg-card text-card-foreground overflow-x-hidden"
          >
            {/* Checkbox */}
            {canManage && (
              <div className="absolute top-[2%] right-[0%]">
                <Checkbox
                  checked={selectedCategories.includes(category?.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, index, category?.id)
                  }
                  className="mr-2"
                />
              </div>
            )}

            {/* Card Content */}
            <div
              className="flex items-start space-x-4 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-1 -m-1 relative"
              onClick={() => handleViewClick(category)}
            >
              {category?.featured && (
                <Badge
                  variant="outline"
                  className="absolute top-3 left-3 z-20 bg-white/70 text-gray-800  px-2"
                >
                  {category.featured ? (
                    <div className="flex items-center justify-between gap-2">
                      {" "}
                      <FaStar
                        className="text-yellow-400"
                        title="Featured"
                      />{" "}
                      Featured
                    </div>
                  ) : (
                    ""
                  )}
                </Badge>
              )}
              {/* Image Container */}
              <div className="flex-shrink-0 lg:w-32 lg:h-32 w-28 h-28 rounded-xl border-2 border-border bg-muted flex items-center justify-center">
                {category.imageUrl ? (
                  <>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </>
                ) : (
                  <span className="text-2xl text-muted-foreground">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {category.name}
                </h2>
                <p className="line-clamp-3">{category.description}</p>
                {canViewAllData && (
                  <div className="capitalize text-xs font-semibold">
                    {" "}
                    {category.store != "0"
                      ? ` Store : ${category.store}`
                      : "General Store"}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canManage && (
              <CategoryActions
                category={category}
                onEdit={() => handleEditClick(category)}
                onView={() => handleViewClick(category)}
                onDelete={() => handleDeleteClick(category.id)}
                onDuplicate={() => handleDuplicateClick(category)}
                showtoggleButtons={true}
                onToggleStatus={() =>
                  handleToggleStatusClick(category.id, category.isActive)
                }
                canDelete={canDelete}
                canManage={canManage}
              />
            )}
          </Card>
        ))}
      </div>
    </>
  );
};
