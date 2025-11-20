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
import { IBlogPage } from "@/models/blogPage.model";
import { useState } from "react";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogPageActions } from "./BlogPageActions";
import { Calendar, Clock, Eye, FileText, User } from "lucide-react";
import Image from "next/image";
import { formatDate, getStatusBadge } from "@/lib/helper/clientHelperfunc";

interface BlogPageTableProps {
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

export const BlogPageTable = ({
  blogpages,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleDuplicateClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  handleFeaturedStatusToggle,
}: BlogPageTableProps) => {
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
        .map((blogpage) => blogpage.id)
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

      <div className="rounded-md border">
        <Table className="overflow-hidden">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      blogpages.length > 0 &&
                      selectedBlogPages.length === blogpages.length
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
            {blogpages.map((blogpage, index) => {
              const statusInfo = getStatusBadge(blogpage.status || "draft");

              return (
                <TableRow key={blogpage.id} className="hover:bg-muted/30">
                  {/* Post Details Column */}
                  <TableCell className="py-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedBlogPages.includes(blogpage.id)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(checked, index, blogpage.id)
                        }
                        className="mr-1 mt-1"
                      />

                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-border bg-muted overflow-hidden relative">
                        {blogpage.featuredImage ? (
                          <Image
                            src={blogpage.featuredImage}
                            alt={blogpage.title}
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
                        onClick={() => handleViewClick(blogpage)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {blogpage.isFeatured && (
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
                          {blogpage.categories &&
                            blogpage.categories.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {typeof blogpage.categories[0] === "string"
                                  ? blogpage.categories[0]
                                  : blogpage.categories[0]?.name ||
                                    "Uncategorized"}
                              </Badge>
                            )}
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          {blogpage.title}
                        </h3>
                        {blogpage.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {blogpage.excerpt}
                          </p>
                        )}

                        {/* Mobile view condensed info */}
                        <div className="md:hidden flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                          {blogpage.authorName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {blogpage.authorName}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {blogpage.views || 0}
                          </div>
                          {blogpage.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {blogpage.readingTime}m
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
                        {blogpage.authorName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Stats Column - Hidden on medium and below */}
                  <TableCell className="hidden lg:table-cell py-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{blogpage.views || 0} views</span>
                      </div>
                      {blogpage.readingTime && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{blogpage.readingTime} min</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Published Date Column - Hidden on large and below */}
                  <TableCell className="hidden xl:table-cell py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(
                          blogpage.publishedAt || blogpage.createdAt,
                          true
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-center">
                    <BlogPageActions
                      blogpage={blogpage}
                      onEdit={() => handleEditClick(blogpage)}
                      onView={() => handleViewClick(blogpage)}
                      onDelete={() => handleDeleteClick(blogpage.id)}
                      onDuplicate={() => handleDuplicateClick(blogpage)}
                      showtoggleButtons={false}
                      onToggleStatus={() =>
                        handleToggleStatusClick(
                          blogpage.id,
                          blogpage.isActive || false
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
