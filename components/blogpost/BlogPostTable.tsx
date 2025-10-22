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
import { IBlogPost } from "@/models/blogPost.model";
import { useState } from "react";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogPostActions } from "./BlogPostActions";
import { Building } from "lucide-react";

interface BlogPostTableProps {
  blogpost: IBlogPost[];
  handleViewClick: (blogpost: IBlogPost) => void;
  handleEditClick: (blogpost: IBlogPost) => void;
  handleDeleteClick: (id: string) => void;
  handleDuplicateClick: (blogpost: IBlogPost) => void;
  handleToggleStatusClick: (id: string, currentStatus: boolean) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkStatusToggle: (ids: string[], targetStatus: boolean) => void;
  handleFeaturedStatusToggle: (ids: string[], targetStatus: boolean) => void;
}

export const BlogPostTable = ({
  blogpost,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
}: BlogPostTableProps) => {
  const [selectedBlogPost, setSelectedBlogPost] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single blogpost
  const toggleBlogPostelection = (blogpostId: string) => {
    setSelectedBlogPost((prev) =>
      prev.includes(blogpostId)
        ? prev.filter((id) => id !== blogpostId)
        : [...prev, blogpostId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedBlogPost.length === blogpost.length) {
      setSelectedBlogPost([]);
    } else {
      setSelectedBlogPost(blogpost.map((blogpost) => blogpost?.id));
    }
  };

  const handleCheckboxChange = (
    checked: boolean | string,
    index: number,
    blogpostId: string | undefined
  ) => {
    if (checked === "indeterminate" || !blogpostId) return;

    if (
      typeof window !== "undefined" &&
      window.event instanceof MouseEvent &&
      window.event.shiftKey &&
      lastCheckedIndex !== null
    ) {
      const start = Math.min(index, lastCheckedIndex);
      const end = Math.max(index, lastCheckedIndex);

      const range = blogpost
        .slice(start, end + 1)
        .map((blogpost) => blogpost.id)
        .filter((id): id is string => !!id); // Filter out undefined ids

      setSelectedBlogPost((prev) => {
        // Determine if we should add or remove based on the last clicked checkbox
        const shouldAdd = !prev.includes(blogpost[lastCheckedIndex].id);

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
      toggleBlogPostelection(blogpostId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedBlogPost.length === 0) return;
    handleBulkDelete(selectedBlogPost);
    setSelectedBlogPost([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    // Handle bulk status toggle
    handleBulkStatusToggle(selectedBlogPost, targetStatus);
  };
  // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedBlogPost, targetStatus);
  };

  return (
    <>
      {selectedBlogPost.length > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-gray-100 rounded-md px-4 py-3">
          <span className="text-sm font-medium">
            {selectedBlogPost.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedBlogPost.length === blogpost.length
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
            disabled={selectedBlogPost.length > 8}
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
                      blogpost.length > 0 &&
                      selectedBlogPost.length === blogpost.length
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
            {blogpost.map((blogpost, index) => (
              <TableRow key={blogpost.id} className="hover:bg-muted/30">
                {/* Details column with image, name, parent (mobile view) */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedBlogPost.includes(blogpost.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(checked, index, blogpost.id)
                      }
                      className="mr-1"
                    />
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                      {blogpost.imageUrl ? (
                        <img
                          src={blogpost.imageUrl}
                          alt={blogpost.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-500">
                          {blogpost?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div
                      className="grid gap-1 cursor-pointer wrap-break-word w-16 md:w-auto"
                      onClick={() => handleViewClick(blogpost)}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {blogpost.featured && (
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
                        {blogpost.name}
                      </div>

                      {/* Mobile view condensed info */}
                      <div className="lg:hidden flex flex-wrap items-center gap-2 text-sm mt-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {blogpost.parent || "None"}
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Parent BlogPost - Visible on medium screens */}
                <TableCell className="hidden lg:table-cell py-3 capitalize">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {blogpost.parent || "None"}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 max-w-32 text-center">
                  <BlogPostActions
                    blogpost={blogpost}
                    onEdit={() => handleEditClick(blogpost)}
                    onView={() => handleViewClick(blogpost)}
                    onDelete={() => handleDeleteClick(blogpost.id)}
                    onDuplicate={() => handleDuplicateClick(blogpost)}
                    showtoggleButtons={false}
                    onToggleStatus={() =>
                      handleToggleStatusClick(blogpost.id, blogpost.isActive)
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
