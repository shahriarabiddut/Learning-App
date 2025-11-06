import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, X } from "lucide-react";
import { memo, startTransition, useCallback, useEffect, useState } from "react";

// Custom hook for debounced values
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Optimized search component with better UX
const SearchInput = memo(
  ({
    searchQuery,
    onSearch,
    loading,
    placeHolder = "Search ...",
    refetch,
  }: {
    searchQuery: string;
    onSearch: (v: string) => void;
    loading: boolean;
    placeHolder: string;
    refetch: () => void;
  }) => {
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const debounced = useDebounce(localSearch, 300);

    // FIXED: Better synchronization with external searchQuery changes
    useEffect(() => {
      setLocalSearch(searchQuery);
    }, [searchQuery]);

    // FIXED: Only call onSearch if the debounced value is actually different
    useEffect(() => {
      if (debounced !== searchQuery) {
        startTransition(() => onSearch(debounced));
      }
    }, [debounced, onSearch]); // Removed searchQuery from deps to avoid infinite loops

    // NEW: Clear button handler
    const handleClear = useCallback(() => {
      setLocalSearch("");
      startTransition(() => onSearch(""));
    }, [onSearch]);
    // Refresh handler
    const onRefresh = () => {
      refetch();
    };
    return (
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="space-x-1" title="Refreshing">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh"
            className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white cursor-pointer"
          >
            <RefreshCw
              className={loading ? "animate-spin h-4 w-4" : " h-5 w-5"}
            />
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeHolder}
            className={`pl-8 pr-8 w-[80vw] sm:w-[190px] lg:w-[240px]`}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            aria-label="Search What You Are Looking For"
          />
          {/* NEW: Clear button - only show when there's text */}
          {localSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
