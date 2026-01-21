//COPIED FROM WEB APP
import { formatNumericGrade } from "./generalUtils";

export function numericToLetterGrade(
  numeric: number | null | undefined
): string {
  if (numeric === null || numeric === undefined) {
    return "—";
  }

  const grade = Number(numeric);

  if (grade >= 4.0) return "A";
  else if (grade >= 3.75) return "A-";
  else if (grade >= 3.5) return "B+";
  else if (grade >= 3.0) return "B";
  else if (grade >= 2.75) return "B-";
  else if (grade >= 2.5) return "C+";
  else if (grade >= 2.0) return "C";
  else if (grade >= 1.75) return "C-";
  else if (grade >= 1.5) return "D+";
  else if (grade >= 1.0) return "D";
  else if (grade >= 0.75) return "D-";
  else return "E";
}

export function letterToNumericGrade(
  letter: string | null | undefined
): number {
  if (!letter || letter === "—") {
    return 0;
  }

  const normalized = letter.trim().toUpperCase();

  switch (normalized) {
    case "A":
      return 4.0;
    case "A-":
      return 3.75;
    case "B+":
      return 3.5;
    case "B":
      return 3.0;
    case "B-":
      return 2.75;
    case "C+":
      return 2.5;
    case "C":
      return 2.0;
    case "C-":
      return 1.75;
    case "D+":
      return 1.5;
    case "D":
      return 1.0;
    case "D-":
      return 0.75;
    case "E":
      return 0.0;
    default:
      return 0.0;
  }
}

export function formatAssignmentGrade(
  score: number | null | undefined,
  maxPoints: number = 100
): string {
  if (score === null || score === undefined) {
    return "—";
  }

  const numericScore = Number(score);
  return `${Math.round(numericScore)}/${maxPoints}`;
}

export function formatLateDuration(
  dueDate: string | Date,
  submittedAt: string | Date
): string {
  const due = new Date(dueDate);
  const submitted = new Date(submittedAt);
  const diffMs = submitted.getTime() - due.getTime();

  if (diffMs <= 0) return "";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    if (remainingHours > 0) {
      return `${diffDays}d ${remainingHours}h late`;
    }
    return `${diffDays} day${diffDays > 1 ? "s" : ""} late`;
  } else if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes > 0) {
      return `${diffHours}h ${remainingMinutes}m late`;
    }
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} late`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} late`;
  }
}

// // Digital Simulator UI Helpers

// export function logicToColor(value: LogicValue): string {
//   switch (value) {
//     case 1:
//       return "#3fb950"; // green
//     case 0:
//       return "#f85149"; // red
//     default:
//       return "#8b949e"; // gray
//   }
// }

// Format course name consistently across the app [Course Code - Course Name]
export function formatCourseName(
  code: string | null,
  name: string | null
): string {
  return `${code ?? "Course"}${name ? ` - ${name}` : ""}`;
}

// Generic grade label formatter for any numeric grade
export function formatGradeLabel(grade: number | null): string {
  return grade !== null
    ? `${numericToLetterGrade(grade)} (${formatNumericGrade(grade)})`
    : "No grade yet";
}

// EXTRA

export function getModuleIcon(type: string) {
  switch (type) {
    case "Lecture":
      return "book-open";
    case "Lab":
      return "activity";
    case "Quiz":
    case "Assignment":
      return "check-circle";
    case "Slides":
      return "file-text";
    default:
      return "file-text";
  }
}
