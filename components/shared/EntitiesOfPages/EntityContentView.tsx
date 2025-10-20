"use client";
import {
  GridSkeletonLoader,
  TableSkeletonLoader,
} from "@/components/shared/Loader/SkeletonLoader";
import { ComponentType, memo, Suspense } from "react";
import { ChunkErrorBoundaryWithSuspense } from "./ChunkErrorBoundaryWithSuspense";

interface EntityContentViewProps<T = any> {
  // View configuration
  viewMode: "grid" | "table";
  entities: T[];

  // Components
  GridComponent: ComponentType<any>;
  TableComponent: ComponentType<any>;
  PaginationComponent?: ComponentType<{ totalPages: number }>;

  // Handlers (passed to Grid/Table components)
  handlers: Record<string, any>;

  // Entity naming (for props)
  entityKey: string; // e.g., "departments", "users", "products"

  // Pagination
  totalPages: number;

  // Skeleton configuration
  gridCols?: number;
  gridLgCols?: number;
  gridItems?: number;
  tableCols?: number;
  tableRows?: number;

  // Optional custom props for components
  gridProps?: Record<string, any>;
  tableProps?: Record<string, any>;
  commonProps?: Record<string, any>;
  paginationProps?: Record<string, any>;
  permissions?: { canManage: boolean; canView: boolean };
}

export const EntityContentView = memo<EntityContentViewProps>(
  ({
    viewMode,
    entities,
    GridComponent,
    TableComponent,
    PaginationComponent,
    handlers,
    entityKey,
    totalPages,
    gridCols = 3,
    gridLgCols = 4,
    gridItems = 12,
    tableCols = 3,
    tableRows = 9,
    gridProps = {},
    tableProps = {},
    commonProps = {},
    paginationProps = {},
    permissions = {},
  }) => {
    const isGridView = viewMode === "grid";

    // Combine entity data with handlers and custom props
    const componentProps = {
      [entityKey]: entities,
      ...handlers,
      ...commonProps,
      ...(isGridView ? gridProps : tableProps),
      permissions,
    };

    return (
      <>
        {/* Main Content */}
        <ChunkErrorBoundaryWithSuspense
          fallback={
            isGridView ? (
              <GridSkeletonLoader
                cols={gridCols}
                lgcols={gridLgCols}
                items={gridItems}
              />
            ) : (
              <TableSkeletonLoader cols={tableCols} rows={tableRows} />
            )
          }
        >
          {isGridView ? (
            <GridComponent key="grid-view" {...componentProps} />
          ) : (
            <TableComponent key="table-view" {...componentProps} />
          )}
        </ChunkErrorBoundaryWithSuspense>

        {/* Pagination */}
        {totalPages > 0 && PaginationComponent && (
          <Suspense
            fallback={
              <div className="h-10 w-full bg-muted/50 animate-pulse rounded flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Loading pagination...
                </div>
              </div>
            }
          >
            <PaginationComponent totalPages={totalPages} {...paginationProps} />
          </Suspense>
        )}
      </>
    );
  }
);

EntityContentView.displayName = "EntityContentView";

// Simple entity without pagination
// export const CategoriesContentView = memo(
//   ({
//     viewMode,
//     categories,
//     handlers,
//   }: {
//     viewMode: string;
//     categories: any[];
//     handlers: any;
//   }) => (
//     <EntityContentView
//       viewMode={viewMode as "grid" | "table"}
//       entities={categories}
//       GridComponent={CategoryGrid}
//       TableComponent={CategoryTable}
//       handlers={handlers}
//       entityKey="categories"
//       totalPages={0} // No pagination
//       gridCols={3}
//       gridLgCols={4}
//       tableCols={3}
//     />
//   )
// );

// Table-only view (no grid option)
// export const LogsContentView = memo(
//   ({
//     logs,
//     handlers,
//     totalPages,
//   }: {
//     logs: any[];
//     handlers: any;
//     totalPages: number;
//   }) => (
//     <EntityContentView
//       viewMode="table"
//       entities={logs}
//       GridComponent={() => null} // Not used
//       TableComponent={LogsTable}
//       PaginationComponent={LogsPagination}
//       handlers={handlers}
//       entityKey="logs"
//       totalPages={totalPages}
//       tableCols={6}
//       tableRows={20}
//     />
//   )
// );

// export default EntityContentView;
