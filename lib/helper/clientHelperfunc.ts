import { pbkdf2Sync, randomBytes } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex"); // 32-char hex
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export const formatDate = (dateString: string, onlyDate?: boolean) => {
  const date = new Date(dateString);
  return onlyDate
    ? date.toLocaleString("en-US", {
        timeZone: "UTC", // Keep it in UTC
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : date.toLocaleString("en-US", {
        timeZone: "UTC", // Keep it in UTC
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};
export function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function singleTitleToPluralY(title: string) {
  if (title.endsWith("y")) {
    return title.slice(0, -1) + "ies";
  }
  return title;
}

export const handleNothing = (): void => {};

export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string = "Failed to perform the action"
): string => {
  const tryParseJson = (value: unknown): string | null => {
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      if (parsed?.error && typeof parsed.error === "string")
        return parsed.error;
      if (typeof parsed === "string") return parsed;
      return null;
    } catch {
      return typeof value === "string" ? value : null;
    }
  };

  try {
    if (!error) return defaultMessage;
    if (typeof error === "string") return error;

    if (typeof error === "object") {
      const err = error as any;

      // Try data, message, and error fields in order
      const result =
        tryParseJson(err.data) ??
        tryParseJson(err.message) ??
        (typeof err.error === "string" ? err.error : null);

      if (result) return result;
    }

    return defaultMessage;
  } catch {
    return defaultMessage;
  }
};

export function getCategoryName(categories?: Array<{ name: string }>): string {
  if (!categories || categories.length === 0) return "Uncategorized";
  const names =
    categories.length > 0
      ? `${categories[0]?.name}  ${
          categories.length > 1 && ` , ${categories[1]?.name}`
        }`
      : "Uncategorized";
  return names;
}

// Get status badge
export const getStatusBadge = (status: string) => {
  const variants: Record<string, { className: string; label: string }> = {
    published: {
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      label: "Published",
    },
    draft: {
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      label: "Draft",
    },
    revision: {
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      label: "Revision",
    },
    pending: {
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      label: "Pending",
    },
  };

  return variants[status] || variants.draft;
};
