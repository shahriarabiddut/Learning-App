"use client";

import React from "react";
import SearchableSelect from "@/components/shared/Input/SearchableSelect";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { ReactNode, useCallback, useMemo } from "react";

// Common interfaces
export interface BaseSelectOption {
  id: string;
  name: string;
  [key: string]: any;
}

export interface BaseSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  mode?: "form" | "standalone";
  showSelected?: boolean;
  onSelect?: (id: string, data?: any) => void;
  placeholder?: string;
  title?: string;
  showTitle?: boolean;
  filterdId?: string; // Common typo in original - keeping for compatibility
}

export interface SelectState<T> {
  data: T[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

// Common error handling utility
export const useSelectError = (error: unknown) => {
  return useMemo(() => {
    if (!error) return null;

    // Handle RTK Query FetchBaseQueryError
    if (typeof error === "object" && error !== null && "status" in error) {
      const status = (error as any).status;

      if ("data" in error && (error as any).data) {
        const data = (error as any).data;

        if (typeof data === "string") {
          return data;
        }

        if (typeof data === "object" && data !== null) {
          if ("message" in data && typeof data.message === "string") {
            return data.message;
          }
          if ("error" in data && typeof data.error === "string") {
            return data.error;
          }
        }
      }

      return `Error ${status}: Failed to fetch data`;
    }

    // Handle SerializedError
    if (typeof error === "object" && error !== null && "message" in error) {
      const errorMessage = (error as any).message;
      if (typeof errorMessage === "string" && errorMessage.trim()) {
        return errorMessage;
      }
    }

    return "Failed to fetch data";
  }, [error]);
};

// Common data processing utility
export const useSelectData = <T extends BaseSelectOption>(
  data: T[] | undefined,
  filterdId?: string,
  addNoneOption = false
) => {
  return useMemo(() => {
    if (!data) return [];

    let processedData = [...data];

    // Filter out the filtered ID if provided
    if (filterdId) {
      processedData = processedData.filter((item) => item.id !== filterdId);

      // Add "None" option if requested
      if (addNoneOption) {
        processedData.push({ id: "0000", name: "None" } as T);
      }
    }

    return processedData;
  }, [data, filterdId, addNoneOption]);
};

// Safe theme configuration utility (using safe Tailwind classes)
export interface ThemeConfig {
  bg: string;
  iconBg: string;
  iconColor: string;
  selectedBg: string;
  selectedText: string;
  borderColor: string;
}

// Safe color mappings that won't be purged by Tailwind
const SAFE_COLOR_CLASSES = {
  blue: {
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    selectedBg: "bg-blue-100 dark:bg-blue-900/30",
    selectedText: "text-blue-800 dark:text-blue-200",
    borderColor: "border-blue-200 dark:border-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    selectedBg: "bg-emerald-100 dark:bg-emerald-900/30",
    selectedText: "text-emerald-800 dark:text-emerald-200",
    borderColor: "border-emerald-200 dark:border-emerald-700",
  },
  green: {
    bg: "bg-green-50 border-green-100",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    selectedBg: "bg-green-100 dark:bg-green-900/30",
    selectedText: "text-green-800 dark:text-green-200",
    borderColor: "border-green-200 dark:border-green-700",
  },
  purple: {
    bg: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    selectedBg: "bg-purple-100 dark:bg-purple-900/30",
    selectedText: "text-purple-800 dark:text-purple-200",
    borderColor: "border-purple-200 dark:border-purple-700",
  },
  orange: {
    bg: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    selectedBg: "bg-orange-100 dark:bg-orange-900/30",
    selectedText: "text-orange-800 dark:text-orange-200",
    borderColor: "border-orange-200 dark:border-orange-700",
  },
  teal: {
    bg: "bg-teal-50 border-teal-100",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    selectedBg: "bg-teal-100 dark:bg-teal-900/30",
    selectedText: "text-teal-800 dark:text-teal-200",
    borderColor: "border-teal-200 dark:border-teal-700",
  },
  indigo: {
    bg: "bg-indigo-50 border-indigo-100",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    selectedBg: "bg-indigo-100 dark:bg-indigo-900/30",
    selectedText: "text-indigo-800 dark:text-indigo-200",
    borderColor: "border-indigo-200 dark:border-indigo-700",
  },
  cyan: {
    bg: "bg-cyan-50 border-cyan-100",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    selectedBg: "bg-cyan-100 dark:bg-cyan-900/30",
    selectedText: "text-cyan-800 dark:text-cyan-200",
    borderColor: "border-cyan-200 dark:border-cyan-700",
  },
  gray: {
    bg: "bg-gray-50 border-gray-100",
    iconBg: "bg-gray-100 dark:bg-gray-700",
    iconColor: "text-gray-600 dark:text-gray-400",
    selectedBg: "bg-gray-100 dark:bg-gray-700",
    selectedText: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-200 dark:border-gray-600",
  },
} as const;

export const createThemeConfig = (
  color: keyof typeof SAFE_COLOR_CLASSES
): ThemeConfig => {
  return SAFE_COLOR_CLASSES[color] || SAFE_COLOR_CLASSES.gray;
};

// Special value constants for better maintainability
export const SPECIAL_VALUES = {
  NONE: "0000",
  CUSTOM_INPUT: "custom_input",
  ALL: "all",
} as const;

// Common error component
interface ErrorComponentProps {
  errorMessage: string | null;
  onRetry: () => void;
  isFetching: boolean;
}

const ErrorComponent = ({
  errorMessage,
  onRetry,
  isFetching,
}: ErrorComponentProps) => (
  <div className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800/50">
    <div className="flex items-center justify-between">
      <span>{errorMessage}</span>
      <button
        onClick={onRetry}
        type="button"
        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
        disabled={isFetching}
      >
        {isFetching ? "Retrying..." : "Retry"}
      </button>
    </div>
  </div>
);

// Common loading component
const LoadingComponent = () => (
  <Skeleton className="h-10 w-full animate-pulse bg-gray-200 dark:bg-gray-700" />
);

// Base Select Component
interface BaseSelectComponentProps<T extends BaseSelectOption>
  extends BaseSelectProps {
  options: T[];
  state: SelectState<T>;
  icon: ReactNode;
  theme?: ThemeConfig;
  getOptionLabel?: (option: T) => string;
  selectedInfo?: ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
  size?: "sm" | "default"; // Added size prop for consistency
  showId?: boolean;
}

export function BaseSelectComponent<T extends BaseSelectOption>({
  value,
  onValueChange,
  options,
  state,
  icon,
  theme,
  disabled = false,
  required = false,
  mode = "form",
  showSelected = false,
  onSelect,
  placeholder = "Select an option",
  title,
  showTitle = true,
  filterdId,
  getOptionLabel = (option) =>
    `${option.name || option.title}  ${showId ? `(${option.id})` : ""}`,
  selectedInfo,
  loadingMessage = "Updating...",
  emptyMessage,
  size = "default",
  showId = false,
}: BaseSelectComponentProps<T>) {
  const errorMessage = useSelectError(state.error);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value),
    [options, value]
  );

  const handleValueChange = useCallback(
    (newValue: string) => {
      // Handle special "None" option conversion
      const finalValue = newValue === SPECIAL_VALUES.NONE ? "" : newValue;
      const selectedOption = options.find((opt) => opt.id === newValue);

      onValueChange(finalValue);

      if (onSelect) {
        if (newValue === SPECIAL_VALUES.NONE || !selectedOption) {
          onSelect("", undefined);
        } else {
          onSelect(finalValue, selectedOption);
        }
      }
    },
    [options, onValueChange, onSelect]
  );

  const handleClear = useCallback(() => {
    onValueChange("");
    onSelect?.("", undefined);
  }, [onValueChange, onSelect]);

  const handleRetry = useCallback(() => {
    state.refetch();
  }, [state.refetch]);

  // Get theme colors based on state with safe fallbacks
  const getThemeColors = () => {
    if (state.error)
      return "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-800/50";
    if (selectedOption && theme) return theme.bg;
    return "bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-700";
  };

  const SelectComponent = () => (
    <SearchableSelect
      value={value === "" && filterdId ? SPECIAL_VALUES.NONE : value}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      options={options.map((option) => ({
        value: option.id,
        label: getOptionLabel(option),
      }))}
      disabled={disabled || state.isFetching}
      size={size}
    />
  );

  // Standalone mode
  if (mode === "standalone") {
    return (
      <div
        className={`border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm dark:shadow-gray-900/20 transition-all duration-300 hover:shadow-md dark:hover:shadow-gray-900/40 bg-white dark:bg-gray-800 ${getThemeColors()}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl flex-shrink-0 relative ${
              state.error
                ? "bg-red-100 dark:bg-red-900/30"
                : selectedOption && theme
                ? theme.iconBg
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div
              className={
                state.error
                  ? "text-red-600 dark:text-red-400"
                  : selectedOption && theme
                  ? theme.iconColor
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {icon}
            </div>

            {!state.error && !state.isLoading && options.length > 0 && (
              <div className="absolute -top-2 -left-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded-bl-lg rounded-tr-lg border border-gray-200 dark:border-gray-600">
                {options.length}
              </div>
            )}

            {selectedOption && !state.error && (
              <button
                onClick={handleClear}
                type="button"
                className="absolute top-0 right-0 text-gray-900 dark:text-gray-100 bg-red-500 dark:bg-red-600 px-1 rounded-bl-lg rounded-tr-lg border border-gray-200 dark:border-gray-600 hover:text-white cursor-pointer transition-colors"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-between flex-wrap gap-5 md:items-center md:flex-row flex-col">
            <div className="flex-1 min-w-0">
              {showTitle && title && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {title}
                    {required && (
                      <span className="text-rose-500 dark:text-rose-400 ml-1">
                        *
                      </span>
                    )}
                  </span>
                </div>
              )}

              {state.error ? (
                <ErrorComponent
                  errorMessage={errorMessage}
                  onRetry={handleRetry}
                  isFetching={state.isFetching}
                />
              ) : state.isLoading ? (
                <LoadingComponent />
              ) : (
                <>
                  <SelectComponent />
                  {showSelected &&
                    selectedOption &&
                    !state.error &&
                    selectedInfo && (
                      <div className="flex items-center gap-2 flex-shrink-0 mt-3 mb-1">
                        {selectedInfo}
                        <button
                          onClick={handleClear}
                          type="button"
                          className="p-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 rounded font-semibold cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                </>
              )}

              {emptyMessage &&
                options.length === 0 &&
                !state.isLoading &&
                !state.error && (
                  <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700">
                    {emptyMessage}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Loading indicator for fetching states */}
        {state.isFetching && !state.isLoading && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm ${
              theme ? theme.iconColor : "text-blue-600 dark:text-blue-400"
            }`}
          >
            <div
              className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`}
            ></div>
            <span>{loadingMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // Form mode
  return (
    <FormItem>
      <FormLabel>
        {showTitle && (
          <>
            {title} {required && <span className="text-rose-500">*</span>}
          </>
        )}
      </FormLabel>
      <FormControl>
        {state.error ? (
          <ErrorComponent
            errorMessage={errorMessage}
            onRetry={handleRetry}
            isFetching={state.isFetching}
          />
        ) : state.isLoading ? (
          <LoadingComponent />
        ) : (
          <SelectComponent />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

// Selected info component utility
interface SelectedInfoProps {
  label: string;
  value: string;
  theme?: ThemeConfig;
  additionalInfo?: string;
}

export const SelectedInfo = ({
  label,
  value,
  theme,
  additionalInfo,
}: SelectedInfoProps) => (
  <span
    className={`px-3 py-2.5 rounded-full text-sm font-medium border ${
      theme
        ? `${theme.selectedBg} ${theme.selectedText} ${theme.borderColor}`
        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
    }`}
  >
    <span
      className={theme ? theme.iconColor : "text-gray-600 dark:text-gray-400"}
    >
      {label}:
    </span>{" "}
    <span
      className={`font-semibold ${
        theme ? theme.iconColor : "text-gray-800 dark:text-gray-200"
      }`}
    >
      {value}
      {additionalInfo && (
        <span className="font-normal opacity-80"> {additionalInfo}</span>
      )}
    </span>
  </span>
);

// Hook for common select logic
export function useSelectLogic<T extends BaseSelectOption>(
  data: T[] | undefined,
  value: string,
  filterdId?: string,
  addNoneOption = false
) {
  const processedData = useSelectData(data, filterdId, addNoneOption);

  const selectedItem = useMemo(
    () => processedData.find((item) => item.id === value),
    [processedData, value]
  );

  return {
    options: processedData,
    selectedItem,
  };
}

// Common query parameters interface
export interface CommonQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

// Common RTK Query options
export const commonQueryOptions = {
  skip: false,
  refetchOnMountOrArgChange: true,
  refetchOnFocus: false,
};

// Export theme configurations using safe color classes
export const THEME_CONFIGS = {
  category: createThemeConfig("blue"),
} as const;
