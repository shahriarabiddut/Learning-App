import { AlertTriangle } from "lucide-react";
import React from "react";

interface ErrorMessageProps {
  error: any;
  fallbackMessage?: string;
}

export default function ErrorMessage({
  error,
  fallbackMessage = "An error occurred",
}: ErrorMessageProps) {
  if (!error) return null;

  // Extract error message from various possible error structures
  const getErrorMessage = (err: any): string => {
    // RTK Query error structure
    if (err?.data?.message) return err.data.message;
    if (err?.data?.error) return err.data.error;
    if (err?.data && typeof err.data === "string") return err.data;

    // Standard Error object
    if (err?.message) return err.message;

    // String error
    if (typeof err === "string") return err;

    // HTTP status errors
    if (err?.status) {
      switch (err.status) {
        case 400:
          return "Bad request - please check your input";
        case 401:
          return "Unauthorized - please log in again";
        case 403:
          return "Access forbidden - insufficient permissions";
        case 404:
          return "Resource not found";
        case 500:
          return "Internal server error - please try again later";
        case "FETCH_ERROR":
          return "Network error - please check your connection";
        case "TIMEOUT_ERROR":
          return "Request timed out - please try again";
        default:
          return `Error ${err.status}: ${err.statusText || "Unknown error"}`;
      }
    }

    return fallbackMessage;
  };

  return (
    <div className="border border-destructive bg-destructive/10 rounded-xl">
      <p className="p-3 text-destructive flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>{getErrorMessage(error)}</span>
      </p>
    </div>
  );
}
