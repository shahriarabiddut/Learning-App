"use client";
import { BlogPageActions } from "@/components/blogpage/BlogPageActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, getStatusBadge } from "@/lib/helper/clientHelperfunc";
import { IBlogPage } from "@/models/blogPage.model";
import { Calendar, Clock, Eye, MessageSquare, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { FaBan, FaStarHalfStroke } from "react-icons/fa6";

interface BlogPageGridProps {
  blogpages: IBlogPage[];
  handleViewClick: (blogpage: IBlogPage) => void;
  handleEditClick: (blogpage: IBlogPage) => void;
  handleDeleteClick: (id: string) => void;
  handleDuplicateClick: (blogpage: IBlogPage) => void;
  handleToggleStatusClick: (id: string, currentStatus: boolean) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkStatusToggle: (ids: string[], targetStatus: boolean) => void;
  handleFeaturedStatusToggle: (ids: string[], targetStatus: boolean) => void;
}

export const BlogPageGrid = ({
  blogpages,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
}: BlogPageGridProps) => {
  const [selectedBlogPages, setSelectedBlogPages] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single blog post
  const toggleBlogPageSelection = (blogpageId: string) => {
    setSelectedBlogPages((prev) =>
      prev.includes(blogpageId)
        ? prev.filter((id) => id !== blogpageId)
        : [...prev, blogpageId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedBlogPages.length === blogpages.length) {
      setSelectedBlogPages([]);
    } else {
      setSelectedBlogPages(blogpages.map((blogpage) => blogpage?.id));
    }
  };

  const handleCheckboxChange = (
    checked: boolean | string,
    index: number,
    blogpageId: string | undefined
  ) => {
    if (checked === "indeterminate" || !blogpageId) return;

    if (
      typeof window !== "undefined" &&
      window.event instanceof MouseEvent &&
      window.event.shiftKey &&
      lastCheckedIndex !== null
    ) {
      const start = Math.min(index, lastCheckedIndex);
      const end = Math.max(index, lastCheckedIndex);

      const range = blogpages
        .slice(start, end + 1)
        .map((blogpage) => blogpage?.id)
        .filter((id): id is string => !!id);

      setSelectedBlogPages((prev) => {
        const shouldAdd = !prev.includes(blogpages[lastCheckedIndex].id);

        if (shouldAdd) {
          const newSelections = new Set(prev);
          range.forEach((id) => newSelections.add(id));
          return Array.from(newSelections);
        } else {
          return prev.filter((id) => !range.includes(id));
        }
      });
    } else {
      toggleBlogPageSelection(blogpageId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedBlogPages.length === 0) return;
    handleBulkDelete(selectedBlogPages);
    setSelectedBlogPages([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    handleBulkStatusToggle(selectedBlogPages, targetStatus);
  };

  // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedBlogPages, targetStatus);
  };

  return (
    <>
      {selectedBlogPages.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-muted rounded-md px-4 py-3">
          <span className="text-sm font-medium">
            {selectedBlogPages.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedBlogPages.length === blogpages.length
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
            Hide
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(true)}
            className="bg-green-200 text-green-800 hover:bg-green-400 hover:text-white gap-1 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-700"
          >
            <FaCheckCircle className="h-4 w-4" />
            Visible
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeaturedClick(true)}
            className="bg-orange-200 text-orange-800 hover:bg-orange-400 hover:text-white gap-1 dark:bg-orange-900 dark:text-orange-100 dark:hover:bg-orange-700"
            disabled={selectedBlogPages.length > 8}
          >
            <FaStar className="h-4 w-4" />
            Featured
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blogpages.map((blogpage, index) => {
          const statusInfo = getStatusBadge(blogpage?.status || "draft");

          return (
            <Card
              key={blogpage?.id}
              className="overflow-hidden flex flex-col relative p-0 bg-card text-card-foreground hover:shadow-lg transition-shadow duration-200"
            >
              {/* Checkbox */}
              <div className="absolute top-3 right-3 z-10">
                <Checkbox
                  checked={selectedBlogPages.includes(blogpage?.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, index, blogpage?.id)
                  }
                  className="bg-white dark:bg-gray-800 border-2"
                />
              </div>

              {/* Featured Badge */}
              {blogpage?.isFeatured && (
                <Badge
                  variant="outline"
                  className="absolute top-3 left-3 z-10 bg-yellow-100/90 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
                >
                  <FaStar className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}

              {/* Featured Image */}
              <div
                className="relative w-full h-48 bg-muted cursor-pointer group"
                onClick={() => handleViewClick(blogpage)}
              >
                {blogpage?.featuredImage ? (
                  <Image
                    src={blogpage?.featuredImage}
                    alt={blogpage?.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                    <span className="text-6xl font-bold text-purple-300 dark:text-purple-700">
                      {blogpage?.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Status and Category */}
                <div className="flex items-center gap-2 mb-3 capitalize">
                  <Badge className={statusInfo.className}>
                    {blogpage?.status}
                  </Badge>
                  {blogpage?.categories && blogpage?.categories.length > 0 && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {typeof blogpage?.categories[0] === "string"
                        ? blogpage?.categories[0]
                        : blogpage?.categories[0]?.name || "Uncategorized"}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={() => handleViewClick(blogpage)}
                >
                  {blogpage?.title}
                </h3>

                {/* Excerpt */}
                {blogpage?.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {blogpage?.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                  {blogpage?.authorName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{blogpage?.authorName}</span>
                    </div>
                  )}
                  {(blogpage?.publishedAt || blogpage?.createdAt) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(
                          blogpage?.publishedAt || blogpage?.createdAt,
                          true
                        )}
                      </span>
                    </div>
                  )}
                  {blogpage?.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blogpage?.readingTime} min read</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{blogpage?.views || 0} views</span>
                  </div>
                  {blogpage?.allowComments && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{blogpage?.comments?.length || 0} comments</span>
                    </div>
                  )}
                  {blogpage?.tags && blogpage?.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {blogpage?.tags.length} tags
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <BlogPageActions
                  blogpage={blogpage}
                  onEdit={() => handleEditClick(blogpage)}
                  onView={() => handleViewClick(blogpage)}
                  onDelete={() => handleDeleteClick(blogpage?.id)}
                  onDuplicate={() => handleDuplicateClick(blogpage)}
                  showtoggleButtons={true}
                  onToggleStatus={() =>
                    handleToggleStatusClick(
                      blogpage?.id,
                      blogpage?.isActive || false
                    )
                  }
                />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};
