import { memo } from "react";
import {
  GridSkeletonLoader,
  TableSkeletonLoader,
} from "@/components/shared/Loader/SkeletonLoader";

interface PageSkeletonProps {
  items?: number;
  cols?: number;
  lgcols?: number;
  xlcols?: number;
  showHeader?: boolean;
  className?: string;
  view?: string;
}

const PageSkeleton = memo<PageSkeletonProps>(
  ({
    items = 12,
    cols = 3,
    lgcols = 3,
    xlcols = 4,
    showHeader = true,
    className = "",
    view = "grid",
  }) => (
    <div
      className={`flex-1 space-y-3 sm:space-y-4 lg:space-y-6 p-3 pt-4 sm:p-4 sm:pt-6 md:p-6 lg:p-8 animate-pulse ${className}`}
    >
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Page Title */}
          <div className="h-8 sm:h-9 w-28 sm:w-32 lg:w-40 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer rounded" />

          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-2">
            {/* Search Bar - Full width on mobile */}
            <div className="w-full xs:w-[200px] sm:w-[240px] lg:w-[280px] h-9 sm:h-10 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer rounded" />

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <div className="h-8 sm:h-10 w-16 sm:w-20 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer rounded" />

              {/* Add Button */}
              <div className="h-8 sm:h-10 w-20 sm:w-24 lg:w-28 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer rounded" />

              {/* Menu Button - Hidden on mobile */}
              <div className="hidden sm:block h-10 w-10 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] animate-shimmer rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Grid Content */}
      {view == "grid" ? (
        <GridSkeletonLoader items={items} cols={cols} lgcols={lgcols} />
      ) : (
        <TableSkeletonLoader cols={cols} rows={items} />
      )}
    </div>
  )
);

PageSkeleton.displayName = "PageSkeleton";

export default PageSkeleton;
