"use client";
import { BlogPostActions } from "@/components/blogpost/BlogPostActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IBlogPost } from "@/models/blogPost.model";
import Image from "next/image";
import { useState } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { FaBan, FaStarHalfStroke } from "react-icons/fa6";

interface BlogPostGridProps {
  blogposts: IBlogPost[];
  handleViewClick: (blogpost: IBlogPost) => void;
  handleEditClick: (blogpost: IBlogPost) => void;
  handleDeleteClick: (id: string) => void;
  handleDuplicateClick: (blogpost: IBlogPost) => void;
  handleToggleStatusClick: (id: string, currentStatus: boolean) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkStatusToggle: (ids: string[], targetStatus: boolean) => void;
  handleFeaturedStatusToggle: (ids: string[], targetStatus: boolean) => void;
}

export const BlogPostGrid = ({
  blogposts,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
}: BlogPostGridProps) => {
  const [selectedBlogposts, setSelectedBlogposts] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single blogpost
  const toggleBlogpostselection = (blogpostId: string) => {
    setSelectedBlogposts((prev) =>
      prev.includes(blogpostId)
        ? prev.filter((id) => id !== blogpostId)
        : [...prev, blogpostId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedBlogposts.length === blogposts.length) {
      setSelectedBlogposts([]);
    } else {
      setSelectedBlogposts(blogposts.map((blogpost) => blogpost?.id));
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

      const range = blogposts
        .slice(start, end + 1)
        .map((blogpost) => blogpost.id)
        .filter((id): id is string => !!id); // Filter out undefined ids

      setSelectedBlogposts((prev) => {
        // Determine if we should add or remove based on the last clicked checkbox
        const shouldAdd = !prev.includes(blogposts[lastCheckedIndex].id);

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
      toggleBlogpostselection(blogpostId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedBlogposts.length === 0) return;
    handleBulkDelete(selectedBlogposts);
    setSelectedBlogposts([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    // Handle bulk status toggle
    handleBulkStatusToggle(selectedBlogposts, targetStatus);
  }; // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedBlogposts, targetStatus);
  };
  return (
    <>
      {selectedBlogposts.length > 0 && (
        <div className="flex  flex-wrap items-center gap-2 mb-4 bg-muted rounded-md px-4 py-3 ">
          <span className="text-sm font-medium">
            {selectedBlogposts.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedBlogposts.length === blogposts.length
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
            disabled={selectedBlogposts.length > 8}
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {blogposts.map((blogpost, index) => (
          <Card
            key={blogpost.id}
            className="p-7 w-auto flex flex-col relative bg-card text-card-foreground"
          >
            {/* Checkbox */}
            <div className="absolute top-[2%] right-[0%]">
              <Checkbox
                checked={selectedBlogposts.includes(blogpost?.id)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(checked, index, blogpost?.id)
                }
                className="mr-2"
              />
            </div>

            {/* Card Content */}
            <div
              className="flex items-start space-x-4 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-1 -m-1 relative"
              onClick={() => handleViewClick(blogpost)}
            >
              {blogpost?.featured && (
                <Badge
                  variant="outline"
                  className="absolute top-3 left-3 z-20 bg-white/70 text-gray-800  px-2"
                >
                  {blogpost.featured ? (
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
              <div className="flex-shrink-0 w-28 h-28 rounded-xl border-2 border-border bg-muted flex items-center justify-center">
                {blogpost.imageUrl ? (
                  <>
                    <Image
                      fill
                      src={blogpost.imageUrl}
                      alt={blogpost.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </>
                ) : (
                  <span className="text-2xl text-muted-foreground">
                    {blogpost.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-bold text-foreground truncate capitalize">
                  {blogpost.name}
                </h2>
                <div className="capitalize line-clamp-3">
                  {blogpost.description}
                </div>
              </div>
            </div>

            {/* Actions */}
            <BlogPostActions
              blogpost={blogpost}
              onEdit={() => handleEditClick(blogpost)}
              onView={() => handleViewClick(blogpost)}
              onDelete={() => handleDeleteClick(blogpost.id)}
              onDuplicate={() => handleDuplicateClick(blogpost)}
              showtoggleButtons={true}
              onToggleStatus={() =>
                handleToggleStatusClick(blogpost.id, blogpost.isActive)
              }
            />
          </Card>
        ))}
      </div>
    </>
  );
};
