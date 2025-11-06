"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICategory } from "@/models/categories.model";
import { useState } from "react";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { Checkbox } from "../ui/checkbox";
import { CategoryActions } from "./CategoryActions";

interface CategoryTableProps {
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

export const CategoryTable = ({
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
}: CategoryTableProps) => {
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
  };
  // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedCategories, targetStatus);
  };

  return (
    <>
      {selectedCategories.length > 0 && canManage && (
        <div className="flex items-center gap-2 mb-4 bg-gray-100 rounded-md px-4 py-3">
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
            className="bg-gray-900 text-white hover:bg-red-500 gap-1"
          >
            <FaBan className="h-3 w-3" />
            Deactivate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(true)}
            className="bg-green-200 text-green-800 hover:bg-green-400 hover:text-white gap-1"
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
      <div className="rounded-md border">
        <Table className="overflow-hidden">
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <Checkbox
                      checked={
                        categories.length > 0 &&
                        selectedCategories.length === categories.length
                      }
                      onCheckedChange={toggleSelectAll}
                      className="mr-2"
                    />
                  )}
                  Name
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Parent</TableHead>
              {canViewAllData && (
                <TableHead className="hidden md:table-cell">Store</TableHead>
              )}
              {canManage && (
                <TableHead className="text-center">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="relative font-medium truncate max-w-[240px] flex items-center gap-1 ">
                  {canManage && (
                    <Checkbox
                      checked={selectedCategories.includes(category?.id)}
                      onCheckedChange={(checked) => {
                        // toggleLeadSelection(lead?._id);
                        handleCheckboxChange(checked, index, category?.id);
                      }}
                      className="mr-2"
                    />
                  )}
                  {category?.featured && (
                    <Badge
                      variant="outline"
                      className="absolute top-1 left-3 z-20 bg-white/70 text-gray-800  px-1"
                    >
                      {category.featured && (
                        <div className="flex items-center justify-between gap-2">
                          <FaStar
                            className="text-yellow-400 cursor-pointer"
                            title="Featured"
                          />
                        </div>
                      )}
                    </Badge>
                  )}
                  <div
                    onClick={() => handleViewClick(category)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">
                          {category.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {category.name}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {category.parentCategory != null ? (
                    <span className="font-medium">{category?.parent}</span>
                  ) : (
                    "None"
                  )}
                </TableCell>
                {canViewAllData && (
                  <TableHead className="capitalize hidden md:table-cell">
                    {category.store}
                  </TableHead>
                )}
                {canManage && (
                  <TableCell className="max-w-32 ">
                    {/* Actions */}
                    <CategoryActions
                      category={category}
                      onEdit={() => handleEditClick(category)}
                      onView={() => handleViewClick(category)}
                      onDelete={() => handleDeleteClick(category.id)}
                      onDuplicate={() => handleDuplicateClick(category)}
                      showtoggleButtons={false}
                      onToggleStatus={() =>
                        handleToggleStatusClick(category.id, category.isActive)
                      }
                      canDelete={canDelete}
                      canManage={canManage}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
