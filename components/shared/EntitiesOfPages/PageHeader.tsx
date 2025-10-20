"use client";

import SearchInput from "@/components/shared/EntitiesOfPages/SearchInput";
import { AddNewButton } from "@/components/shared/InsideToggles";
import { useIsMobile } from "@/components/ui/use-mobile";
import { ComponentType, memo, ReactNode, Suspense } from "react";

interface PageHeaderProps {
  // Required props
  title: string;
  searchQuery: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  // Optional add button
  canAdd?: boolean;
  onAddNew?: () => void;
  // Optional view toggle component
  ViewToggleComponent?: ComponentType<any>;
  viewToggleProps?: Record<string, any>;
  // Optional custom actions (buttons, dropdowns, etc.)
  customActions?: ReactNode;
  // Optional subtitle or description
  subtitle?: string;
  description?: ReactNode;
  refetch: () => void;
  extraHeader?: ReactNode;
}

export const PageHeader = memo<PageHeaderProps>(
  ({
    title,
    searchQuery,
    onSearch,
    searchPlaceholder,
    loading = false,
    canAdd = false,
    onAddNew,
    ViewToggleComponent,
    viewToggleProps = {},
    customActions,
    subtitle,
    description,
    refetch,
    extraHeader,
  }) => {
    const defaultPlaceholder =
      searchPlaceholder || `Search ${title.toLowerCase()}...`;
    const isMobile = useIsMobile();
    return (
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4 w-full">
          {/* Search Input */}
          <Suspense
            fallback={
              <div className="h-10 w-[240px] bg-muted/50 animate-pulse rounded" />
            }
          >
            <SearchInput
              searchQuery={searchQuery}
              onSearch={onSearch}
              loading={loading}
              placeHolder={defaultPlaceholder}
              refetch={refetch}
            />
          </Suspense>
          {/* View Toggle Component */}
          {ViewToggleComponent && (
            <Suspense
              fallback={
                <div className="h-10 w-20 bg-muted/50 animate-pulse rounded" />
              }
            >
              <ViewToggleComponent {...viewToggleProps} />
            </Suspense>
          )}
        </div>
        {/* Left side - Title and description */}
        <div className="block lg:flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {extraHeader ? extraHeader : title}
            </h2>
            {subtitle && (
              <span className="text-lg text-muted-foreground">
                ({subtitle})
              </span>
            )}
          </div>
          {description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add New Button Mobile Display*/}
          {canAdd && isMobile && onAddNew && (
            <AddNewButton onClick={onAddNew} />
          )}

          {/* Custom Actions */}
          {customActions}

          {/* Add New Button Large Display*/}
          {canAdd && !isMobile && onAddNew && (
            <AddNewButton onClick={onAddNew} />
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";
