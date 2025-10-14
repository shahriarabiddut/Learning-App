import { pbkdf2Sync, randomBytes } from "crypto";

// Helper to handle fetch responses
export async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unknown error");
  return data;
}
// Helper to build query params
export function buildQueryParams(params: Record<string, any>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// Helper to build query params for Products
export function buildProductQuery(
  params: URLSearchParams,
  categoryIds: string[]
): {
  query: any;
  sort: any;
} {
  const search = params.get("search") || "";
  const gender = params.get("gender") || "na";
  const kids = params.get("kids") || "false";
  const minPrice = parseInt(params.get("minPrice") || "0");
  const maxPrice = parseInt(params.get("maxPrice") || Infinity.toString());
  const minRating = parseInt(params.get("minRating") || "0");
  const sortBy = params.get("sortBy") || "createdAt-desc";
  const [field, order] = sortBy.split("-");
  const sort: Record<string, 1 | -1> = { [field]: order === "asc" ? 1 : -1 };
  const query: any = { stock: { $gte: 0 } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (categoryIds.length > 0) {
    query.category = { $in: categoryIds };
  }

  if (minPrice) query.price = { $gt: minPrice };
  if (maxPrice) query.price = { $gt: minPrice, $lt: maxPrice };
  if (minRating > 0) query.rating = { $gte: minRating };
  if (gender == "male" || gender == "female") query.gender = gender;
  if (kids) query.kids = kids === "true" ? true : false;

  return { query, sort };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex"); // 32-char hex
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function validEmailOrNot(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) {
    return true;
  } else {
    return false;
  }
}

export function generateRandomString(length = 10) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
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
