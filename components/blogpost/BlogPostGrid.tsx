"use client";
import { BlogPostActions } from "@/components/blogpost/BlogPostActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IBlogPost } from "@/models/blogPost.model";
import { Calendar, Clock, Eye, MessageSquare, User } from "lucide-react";
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

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      published: {
        variant: "default",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      draft: {
        variant: "secondary",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      },
      archived: {
        variant: "outline",
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {blogposts.map((blogpost, index) => {
          const statusInfo = getStatusBadge(blogpost.status || "draft");

          return (
            <Card
              key={blogpost.id}
              className="overflow-hidden flex flex-col relative bg-card text-card-foreground hover:shadow-lg transition-shadow duration-200"
            >
              {/* Checkbox */}
              <div className="absolute top-3 right-3 z-10">
                <Checkbox
                  checked={selectedBlogPosts.includes(blogpost?.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, index, blogpost?.id)
                  }
                  className="bg-white dark:bg-gray-800 border-2"
                />
              </div>

              {/* Featured Badge */}
              {blogpost?.isFeatured && (
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
                onClick={() => handleViewClick(blogpost)}
              >
                {blogpost.featuredImage ? (
                  <Image
                    src={blogpost.featuredImage}
                    alt={blogpost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                    <span className="text-6xl font-bold text-purple-300 dark:text-purple-700">
                      {blogpost.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Status and Category */}
                <div className="flex items-center gap-2 mb-3 capitalize">
                  <Badge className={statusInfo.className}>
                    {blogpost.status}
                  </Badge>
                  {blogpost.categories && blogpost.categories.length > 0 && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {typeof blogpost.categories[0] === "string"
                        ? blogpost.categories[0]
                        : blogpost.categories[0]?.name || "Uncategorized"}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={() => handleViewClick(blogpost)}
                >
                  {blogpost.title}
                </h3>

                {/* Excerpt */}
                {blogpost.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {blogpost.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                  {blogpost.authorName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{blogpost.authorName}</span>
                    </div>
                  )}
                  {blogpost.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(blogpost.publishedAt)}</span>
                    </div>
                  )}
                  {blogpost.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blogpost.readingTime} min read</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{blogpost.views || 0} views</span>
                  </div>
                  {blogpost.allowComments && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{blogpost.comments?.length || 0} comments</span>
                    </div>
                  )}
                  {blogpost.tags && blogpost.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {blogpost.tags.length} tags
                      </span>
                    </div>
                  )}
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
                    handleToggleStatusClick(
                      blogpost.id,
                      blogpost.isActive || false
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
