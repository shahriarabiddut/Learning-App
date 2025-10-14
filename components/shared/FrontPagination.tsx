"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface FrontPaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  totalItems: number;
  itemsPerPageOptions?: number[];
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export default function FrontPagination({
  page,
  totalPages,
  limit,
  totalItems,
  itemsPerPageOptions = [6, 12, 30, 45, 90],
  // itemsPerPageOptions = [1, 2, 3],
  onPageChange,
  onLimitChange,
}: FrontPaginationProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] =
    useState(false);

  const renderPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }

    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="h-8 w-8"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          title={`Page ${i}`}
          onClick={() => onPageChange(i)}
          className="h-8 w-8"
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8"
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowItemsPerPageDropdown(false);
      }
    }

    if (showItemsPerPageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showItemsPerPageDropdown]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
      {/* Per Page Selector */}
      <div
        ref={dropdownRef}
        className="flex items-center justify-start gap-4 w-full relative"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
          className="h-8 px-3 text-xs"
        >
          {limit} per page
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
        {showItemsPerPageDropdown && (
          <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
            {itemsPerPageOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onLimitChange(option);
                  setShowItemsPerPageDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-accent text-sm ${
                  limit === option ? "bg-accent" : ""
                }`}
              >
                {option} per page
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FrontPagination Controls */}
      <div className="flex justify-center items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="h-8 px-3"
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 px-3"
        >
          Prev
        </Button>
        <div className="flex items-center gap-1 mx-2">
          {renderPageNumbers()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 px-3"
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="h-8 px-3"
        >
          Last
        </Button>
      </div>

      {/* Item Range Info */}
      <div className="flex justify-end items-center gap-1 text-sm text-muted-foreground">
        {Math.min((page - 1) * limit + 1, totalItems)}-
        {Math.min(page * limit, totalItems)} of {totalItems} items
      </div>
    </div>
  );
}
