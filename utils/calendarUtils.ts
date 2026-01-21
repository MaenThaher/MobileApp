import { formatTime } from "@/utils/generalUtils";
import type { ItemStatus } from "@/utils/studentStatusHelpers";
import {
  getAssignmentAction,
  getAssignmentStatus,
  getQuizAction,
  getQuizStatus,
} from "@/utils/studentStatusHelpers";

export type CalendarEventStatus = ItemStatus;

export type CalendarEvent = {
  id: string;
  kind: "assignment" | "quiz";
  title: string;
  course_id: string | null;
  course_code: string | null;
  course_name: string | null;
  due_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: CalendarEventStatus;
  actionLabel: string;
  actionHref: string;
  eventDate: Date;
};

export type ViewMode = "month" | "week";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function formatDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getStartOfWeek(date: Date): Date {
  const day = date.getDay();
  return startOfDay(addDays(date, -day));
}

export function getMonthGridDates(date: Date): Date[] {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = getStartOfWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, idx) => addDays(gridStart, idx));
}

export function getWeekDates(date: Date): Date[] {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
}

// Maybe this should be un Ui utils, TO-DO: decide later
function hashToHue(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
}

export function getCourseColor(key: string): string {
  const hue = hashToHue(key);
  return `hsl(${hue} 70% 55%)`;
}

// EVENT LABEL UTILITIES
export function getEventLabel(event: CalendarEvent): string {
  if (event.kind === "assignment") {
    const timeLabel = event.due_at ? formatTime(event.due_at) : "";
    return timeLabel ? `Due ${timeLabel}` : "Due today";
  }
  const startsLabel = event.starts_at
    ? `Opens ${formatTime(event.starts_at)}`
    : null;
  const endsLabel = event.ends_at
    ? `Closes ${formatTime(event.ends_at)}`
    : null;
  const combined = [startsLabel, endsLabel].filter(Boolean).join(" | ");
  return combined || "Schedule TBD";
}

// Re-export these utils from here for a cleaner import. yes im fancy w it rn
export {
  getAssignmentStatus,
  getQuizStatus,
  getAssignmentAction,
  getQuizAction,
};
