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
import { Calendar, Clock, Eye, FileText, User } from "lucide-react";
import Image from "next/image";

interface BlogPostTableProps {
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

export const BlogPostTable = ({
  blogposts,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
}: BlogPostTableProps) => {
  const [selectedBlogPosts, setSelectedBlogPosts] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single blog post
  const toggleBlogPostSelection = (blogpostId: string) => {
    setSelectedBlogPosts((prev) =>
      prev.includes(blogpostId)
        ? prev.filter((id) => id !== blogpostId)
        : [...prev, blogpostId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedBlogPosts.length === blogposts.length) {
      setSelectedBlogPosts([]);
    } else {
      setSelectedBlogPosts(blogposts.map((blogpost) => blogpost?.id));
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
        .filter((id): id is string => !!id);

      setSelectedBlogPosts((prev) => {
        const shouldAdd = !prev.includes(blogposts[lastCheckedIndex].id);

        if (shouldAdd) {
          const newSelections = new Set(prev);
          range.forEach((id) => newSelections.add(id));
          return Array.from(newSelections);
        } else {
          return prev.filter((id) => !range.includes(id));
        }
      });
    } else {
      toggleBlogPostSelection(blogpostId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedBlogPosts.length === 0) return;
    handleBulkDelete(selectedBlogPosts);
    setSelectedBlogPosts([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    handleBulkStatusToggle(selectedBlogPosts, targetStatus);
  };

  // Handle Featured Click
  const handleFeaturedClick = (targetStatus: boolean) => {
    handleFeaturedStatusToggle(selectedBlogPosts, targetStatus);
  };

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      published: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        label: "Published",
      },
      draft: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Draft",
      },
      archived: {
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        label: "Archived",
      },
    };

    return variants[status] || variants.draft;
  };

  return (
    <>
      {selectedBlogPosts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 bg-muted rounded-md px-4 py-3">
          <span className="text-sm font-medium">
            {selectedBlogPosts.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedBlogPosts.length === blogposts.length
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
            disabled={selectedBlogPosts.length > 8}
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
              <TableHead className="w-[50%]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      blogposts.length > 0 &&
                      selectedBlogPosts.length === blogposts.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="mr-2"
                  />
                  Post Details
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden lg:table-cell">Stats</TableHead>
              <TableHead className="hidden xl:table-cell">Published</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {blogposts.map((blogpost, index) => {
              const statusInfo = getStatusBadge(blogpost.status || "draft");

              return (
                <TableRow key={blogpost.id} className="hover:bg-muted/30">
                  {/* Post Details Column */}
                  <TableCell className="py-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedBlogPosts.includes(blogpost.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(checked, index, blogpost.id)
                        }
                        className="mr-1 mt-1"
                      />

                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-border bg-muted overflow-hidden relative">
                        {blogpost.featuredImage ? (
                          <Image
                            src={blogpost.featuredImage}
                            alt={blogpost.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                            <FileText className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* Title and Meta */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleViewClick(blogpost)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {blogpost.isFeatured && (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 px-1 py-0"
                            >
                              <FaStar className="w-3 h-3" />
                            </Badge>
                          )}
                          <Badge className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                          {blogpost.categories &&
                            blogpost.categories.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {typeof blogpost.categories[0] === "string"
                                  ? blogpost.categories[0]
                                  : blogpost.categories[0]?.name ||
                                    "Uncategorized"}
                              </Badge>
                            )}
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          {blogpost.title}
                        </h3>
                        {blogpost.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {blogpost.excerpt}
                          </p>
                        )}

                        {/* Mobile view condensed info */}
                        <div className="md:hidden flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                          {blogpost.authorName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {blogpost.authorName}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blogpost.views || 0}
                          </div>
                          {blogpost.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {blogpost.readingTime}m
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Author Column - Hidden on mobile */}
                  <TableCell className="hidden md:table-cell py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {blogpost.authorName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Stats Column - Hidden on medium and below */}
                  <TableCell className="hidden lg:table-cell py-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{blogpost.views || 0} views</span>
                      </div>
                      {blogpost.readingTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{blogpost.readingTime} min</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Published Date Column - Hidden on large and below */}
                  <TableCell className="hidden xl:table-cell py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(blogpost.publishedAt || blogpost.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-center">
                    <BlogPostActions
                      blogpost={blogpost}
                      onEdit={() => handleEditClick(blogpost)}
                      onView={() => handleViewClick(blogpost)}
                      onDelete={() => handleDeleteClick(blogpost.id)}
                      onDuplicate={() => handleDuplicateClick(blogpost)}
                      showtoggleButtons={false}
                      onToggleStatus={() =>
                        handleToggleStatusClick(
                          blogpost.id,
                          blogpost.isActive || false
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
