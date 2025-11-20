import { Input } from "@/components/ui/input";
import { Ban, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface RawOption {
  value?: string;
  label?: string;
  id?: string;
  name?: string;
}

export interface SearchableSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  onSelect?: (option: { value: string; label: string }) => void;
  placeholder?: string;
  options: RawOption[];
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "dropdown" | "modal";
  disablePrevious?: boolean;
  disableBeforeValue?: string | null;
}

const DROPDOWN_MAX_HEIGHT = 160; // 10rem

export default function SearchableSelect({
  value,
  onValueChange,
  onSelect,
  placeholder = "Select...",
  options,
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  variant = "dropdown",
  disablePrevious = false,
  disableBeforeValue = null,
}: SearchableSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const showModal = variant === "modal";

  // size-based style lookup
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          triggerHeight: "h-8",
          fontSize: "text-xs",
          inputHeight: "h-6",
          dropdownWidth: "w-full",
          modalHeader: "p-2",
          modalContent: "p-1",
        };
      case "lg":
        return {
          triggerHeight: "h-12",
          fontSize: "text-base",
          inputHeight: "h-10",
          dropdownWidth: "w-full",
          modalHeader: "p-4",
          modalContent: "p-2",
        };
      case "md":
      default:
        return {
          triggerHeight: "min-h-10 sm:h-12 p-2",
          fontSize: "text-sm",
          inputHeight: "",
          dropdownWidth: "w-full",
          modalHeader: "p-3",
          modalContent: "p-1.5",
        };
    }
  }, [size]);

  // Normalize options
  const normalized = useMemo(
    () =>
      options?.map((opt) => ({
        value: opt.value ?? opt.id ?? "",
        label: opt.label ?? opt.name ?? opt.id ?? "",
      })),
    [options]
  );

  const filtered = useMemo(
    () =>
      normalized?.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [normalized, searchTerm]
  );

  const selected = useMemo(
    () => normalized?.find((opt) => opt.value === value) ?? null,
    [normalized, value]
  );

  // Find the index of the reference value to determine which options to disable
  const disableBeforeIndex = useMemo(() => {
    if (!disablePrevious || !disableBeforeValue) return -1;
    return (
      normalized?.findIndex((opt) => opt.value === disableBeforeValue) ?? -1
    );
  }, [normalized, disableBeforeValue, disablePrevious]);

  // Check if an option should be disabled
  const isOptionDisabled = (optionValue: string) => {
    if (!disablePrevious || disableBeforeIndex === -1) return false;
    const optionIndex =
      normalized?.findIndex((opt) => opt.value === optionValue) ?? -1;
    return optionIndex < disableBeforeIndex && optionIndex !== -1;
  };

  // Decide dropdown direction
  useEffect(() => {
    if (!open || !containerRef.current || showModal) return;
    const rect = containerRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    setDropUp(below < DROPDOWN_MAX_HEIGHT && above > DROPDOWN_MAX_HEIGHT);
  }, [open, showModal]);

  // Click outside handler
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Reset search when closing
  useEffect(() => {
    if (!open) setSearchTerm("");
  }, [open]);

  const handleSelect = (opt: { value: string; label: string }) => {
    if (isOptionDisabled(opt.value)) return;
    onValueChange(opt.label === "None" ? null : opt.value);
    if (onSelect) {
      onSelect(opt);
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        className={
          `flex ${sizeClasses.triggerHeight} w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 ${sizeClasses.fontSize} text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600` +
          (loading ? " opacity-50 pointer-events-none" : "")
        }
        onClick={() => !loading && setOpen(true)}
      >
        <span className={selected ? "" : "text-gray-500 dark:text-gray-400"}>
          {loading ? "Loading..." : selected ? selected.label : placeholder}
        </span>
        {!disabled ? (
          <svg
            className={`h-4 w-4 opacity-50`}
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
        ) : (
          !loading && (
            <span title="No Modification Allowed!">
              {" "}
              <Ban className="h-4 w-4 text-gray-500" />
            </span>
          )
        )}
      </div>

      {/* Dropdown Variant */}
      {open && !disabled && !loading && !showModal && (
        <div
          className={
            `absolute z-50 ${sizeClasses.dropdownWidth} rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg ` +
            (dropUp ? "bottom-full mb-1" : "top-full mt-1")
          }
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${sizeClasses.inputHeight} ${sizeClasses.fontSize} bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600`}
              autoFocus
              disabled={disabled}
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt, idx) => {
                const isDisabled = isOptionDisabled(opt.value);
                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    className={
                      `px-3 py-2 ${sizeClasses.fontSize} ` +
                      (isDisabled
                        ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ") +
                      (value === opt.value && !isDisabled
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : !isDisabled
                        ? "text-gray-900 dark:text-gray-100"
                        : "")
                    }
                    onClick={() => !isDisabled && handleSelect(opt)}
                  >
                    {opt.label}
                  </div>
                );
              })
            ) : (
              <div
                className={`px-3 py-2 ${sizeClasses.fontSize} text-gray-500 dark:text-gray-400`}
              >
                No results found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Variant (Mobile) */}
      {open && !disabled && !loading && showModal && (
        // absolute - based in place , fixed - based on page
        <div className="aboslute inset-0 z-50 bg-black/10 bg-opacity-50 flex items-center justify-center p-1 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Search Input */}
            <div
              className={`${sizeClasses.modalHeader} border-b border-gray-200 dark:border-gray-700 relative`}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
              <Input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-11/12 mr-auto ${sizeClasses.inputHeight} ${sizeClasses.fontSize} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700`}
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1">
              {filtered.length > 0 ? (
                filtered.slice(0, 4).map((opt, idx) => {
                  const isDisabled = isOptionDisabled(opt.value);
                  return (
                    <div
                      key={`modal-${opt.value}-${idx}`}
                      className={
                        `px-4 py-3 ${sizeClasses.fontSize} ` +
                        (isDisabled
                          ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
                          : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ") +
                        (value === opt.value && !isDisabled
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : !isDisabled
                          ? "text-gray-900 dark:text-gray-100"
                          : "")
                      }
                      onClick={() => !isDisabled && handleSelect(opt)}
                    >
                      {opt.label}
                    </div>
                  );
                })
              ) : (
                <div
                  className={`px-4 py-3 ${sizeClasses.fontSize} text-gray-500 dark:text-gray-400`}
                >
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
