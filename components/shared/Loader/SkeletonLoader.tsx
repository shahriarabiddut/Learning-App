export const GridSkeletonLoader = ({ cols = 3, lgcols = 4, items = 12 }) => {
  const gridClasses = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols} lg:grid-cols-${lgcols} gap-4`;

  return (
    <div className={gridClasses}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="border rounded-lg shadow-sm">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-11 animate-pulse" />
            </div>

            <div className="flex-1" />

            <div className="flex justify-between mt-4">
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeletonLoader = ({ cols = 12, rows = 5 }) => {
  return (
    <div className="border rounded-lg">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="h-12 px-4 text-left align-middle">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, i) => (
              <tr key={i} className="border-b hover:bg-muted/50">
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </td>

                {/* Data cells */}
                {[...Array(Math.max(cols - 2, 0))].map((_, j) => (
                  <td key={j} className="p-4 align-middle">
                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                  </td>
                ))}

                {/* Action buttons cell */}
                <td className="p-4 align-middle">
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, k) => (
                      <div
                        key={k}
                        className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
