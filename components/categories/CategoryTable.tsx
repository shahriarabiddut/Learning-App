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
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryActions } from "./CategoryActions";
import { Building } from "lucide-react";

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
}: CategoryTableProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single category
  const toggleCategorieselection = (categoryId: string) => {
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
      toggleCategorieselection(categoryId);
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
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-gray-100 rounded-md px-4 py-3">
          <span className="text-sm font-medium">
            {selectedCategories.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedCategories.length === categories.length
              ? "Deselect all"
              : "Select all"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDeleteClick}
          >
            Delete selected
          </Button>

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
                  <Checkbox
                    checked={
                      categories.length > 0 &&
                      selectedCategories.length === categories.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="mr-2"
                  />
                  Title
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Parent</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id} className="hover:bg-muted/30">
                {/* Details column with image, name, parent (mobile view) */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(checked, index, category.id)
                      }
                      className="mr-1"
                    />
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">
                          {category?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div
                      className="grid gap-1 cursor-pointer wrap-break-word w-16 md:w-auto"
                      onClick={() => handleViewClick(category)}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {category.featured && (
                          <Badge
                            variant="outline"
                            className="bg-white/70 text-yellow-500 border-yellow-400 px-1 py-0.5"
                          >
                            <FaStar
                              title="Featured"
                              className="text-yellow-400"
                            />
                          </Badge>
                        )}
                        {category.name}
                      </div>

                      {/* Mobile view condensed info */}
                      <div className="lg:hidden flex flex-wrap items-center gap-2 text-sm mt-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {category.parent || "None"}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Parent Category - Visible on medium screens */}
                <TableCell className="hidden lg:table-cell py-3 capitalize">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {category.parent || "None"}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 max-w-32 text-center">
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
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
