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
