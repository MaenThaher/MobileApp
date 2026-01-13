// THIS FILE IS DIRECTLY COPIED FROM THE WEB VERSION OF THE PROJECT

// Returns a relative time label (e.g., '2 days', '3 hours'), and flags for overdue/due soon
export function formatRelativeTime(target: Date, now: Date) {
  const diffMs = target.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));

  let value = 0;
  let unit = "minute";

  if (days >= 1) {
    value = days;
    unit = "day";
  } else if (hours >= 1) {
    value = hours;
    unit = "hour";
  } else {
    value = Math.max(1, minutes);
    unit = "minute";
  }

  const label = `${value} ${unit}${value === 1 ? "" : "s"}`;
  const isDueSoon = !isOverdue && diffMs <= 24 * 60 * 60 * 1000 && diffMs >= 0;

  return { label, isOverdue, isDueSoon };
}

// Returns a string like '2 days ago', 'just now', etc.
export function formatTimeAgo(dateValue: string | null) {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const absMs = Math.abs(diffMs);

  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(absMs / (1000 * 60 * 60));
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  return "just now";
}

// Truncates text to a max length, adding '...' if needed
export function truncateText(value: string | null, maxLength: number) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "No due date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hebron",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatTime(dateString?: string | null): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hebron",
  });
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatNumericGrade(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toString();
}

export function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

//Centralized functions to deal with Supabase storage URLs

// This one simply extracts the path portion after the bucket name in storage URLs,which is used for file uploads
export function deriveSupabasePathFromUrl(
  url: string | null | undefined,
  bucket: string
): string | null {
  if (!url || !bucket) return null;

  const cleanUrl = url.split(/[?#]/)[0];
  const match =
    cleanUrl.match(new RegExp(`/public/${bucket}/(.+)$`)) ||
    cleanUrl.match(new RegExp(`/${bucket}/(.+)$`));
  return match ? match[1] : null;
}

// This one extracts a sensible file name from a Supabase storage URL or any URL.
// Applies fallback if result is not a plausible file name.
export function deriveFileNameFromUrl(
  url: string | null | undefined,
  fallback = "Attachment"
): string {
  if (!url) return fallback;

  // Drop query/fragments, get last path segment
  const candidate = decodeURIComponent(
    url.split(/[?#]/)[0].split("/").filter(Boolean).pop() || ""
  );

  // Remove leading timestamp prefix if present (e.g. 1234132-filename.txt)
  const name = candidate.replace(/^\d+-/, "");

  // Must have a non-trivial, reasonable filename with extension
  if (
    name &&
    name.length <= 255 &&
    name.length > 1 &&
    /\.[A-Za-z0-9]{1,8}$/.test(name)
  ) {
    return name;
  }
  return fallback;
}
