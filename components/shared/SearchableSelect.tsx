"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
  loading?: boolean;
  allowCustomValue?: boolean;
  customValueLabel?: string;
}

const SearchableSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  loading = false,
  allowCustomValue = false,
  customValueLabel = "Add custom value",
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedOptions = options.map((option) => ({
    ...option,
    label: option.label || option.name || "",
    value: option.value ?? option.id,
  }));

  const filteredOptions = normalizedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value
  );

  // Check if search term matches any existing option exactly
  const searchTermExists = normalizedOptions.some(
    (option) => option.label.toLowerCase() === searchTerm.toLowerCase()
  );

  // Show "Add custom" option if allowCustomValue is true, search term exists, and doesn't match existing options
  const showCustomOption =
    allowCustomValue && searchTerm.trim() && !searchTermExists;

  const handleCustomValueSelect = () => {
    const customValue = searchTerm.trim();
    onValueChange(customValue);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
        onClick={() => !loading && setOpen(!open)}
      >
        <span
          className={selectedOption ? "" : "text-gray-500 dark:text-gray-400"}
        >
          {loading
            ? "Loading..."
            : selectedOption
            ? selectedOption.label
            : value // Show custom value if no matching option found
            ? value
            : placeholder}
        </span>
        <svg
          className={`h-4 w-4 opacity-50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <Input
                type="text"
                placeholder="Search or type new value..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                autoFocus
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {/* Show filtered options */}
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    value === option.value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option.label}
                </div>
              ))}

              {/* Show "Add custom" option */}
              {showCustomOption && (
                <div
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2"
                  onClick={handleCustomValueSelect}
                >
                  <Plus className="h-3 w-3" />
                  {customValueLabel}: "{searchTerm}"
                </div>
              )}

              {/* Show "No results" if no options and no custom value allowed */}
              {filteredOptions.length === 0 && !showCustomOption && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchableSelect;
