// I spent 3 mins naming this file bc I am bad at naming things lol

import type { SubmissionStatus } from "@/types";
import type {
  StudentAssignment,
  StudentCourseDetail,
  StudentCourseOverview,
  StudentQuiz,
} from "@/types/serviceTypes";
import {
  clampNumber,
  deriveFileNameFromUrl,
  formatDate,
  formatRelativeTime,
  formatTimeAgo,
  parseDate,
  truncateText,
} from "./generalUtils";
import {
  formatAssignmentGrade,
  formatGradeLabel,
  formatLateDuration,
} from "./uiUtils";

// SHARED HELPERS

function formatEventTimeLabel(
  date: Date,
  now: Date,
  eventType: "due" | "opens" | "closes"
): string {
  const relative = formatRelativeTime(date, now);

  if (relative.isOverdue) {
    switch (eventType) {
      case "due":
        return `Overdue by ${relative.label}`;
      case "opens":
        return `Opened ${relative.label} ago`;
      case "closes":
        return `Closed ${relative.label} ago`;
    }
  } else {
    switch (eventType) {
      case "due":
        return `Due in ${relative.label}`;
      case "opens":
        return `Opens in ${relative.label}`;
      case "closes":
        return `Closes in ${relative.label}`;
    }
  }
}

function getAssignmentActionInfo(
  status: ItemStatus,
  submissionStatus: SubmissionStatus | null,
  isOverdue: boolean
): { label: string; secondary: boolean } {
  if (submissionStatus === "graded") {
    return { label: "View Feedback", secondary: true };
  }

  if (submissionStatus === "submitted") {
    return { label: "View Submission", secondary: true };
  }

  if (submissionStatus === "in_progress") {
    return { label: "Continue", secondary: false };
  }

  if (isOverdue) {
    return { label: "Submit Late", secondary: false };
  }

  return { label: "Start", secondary: false };
}

function getAssignmentHref(
  assignment: StudentAssignment,
  courseId: string
): string {
  const assignmentHref = `/(app)/(tabs-student)/courses/${courseId}/assignments/${assignment.id}`;
  return assignmentHref;
}

function getModuleActionInfo(
  module: CourseModuleItem,
  quiz: StudentQuiz | null,
  courseId: string,
  now: Date
): { actionLabel: string; actionHref: string } {
  let actionLabel = "Open";
  let actionHref = getModuleHref(courseId, module.type, module.id);

  if (module.type === "Assignment") {
    actionLabel = "View assignments";
    actionHref = `/(app)/(tabs-student)/courses/${courseId}/assignments`;
  } else if (quiz) {
    const resolvedStatus = quiz ? getQuizStatus(quiz, now) : null;
    if (resolvedStatus) {
      actionLabel = getQuizAction(quiz, now, resolvedStatus);
      actionHref = `/(app)/(tabs-student)/courses/${courseId}/modules/${module.id}/quiz`;
    }
  }

  return { actionLabel, actionHref };
}

// STATUS TYPES

export type ItemStatus = "overdue" | "upcoming" | "completed";
export type ModuleStatus =
  | "available"
  | "locked"
  | "closed"
  | "completed"
  | "in_progress";
export type CourseModuleItem = StudentCourseDetail["modules"][number];

export type NextDueCandidate = {
  id: string;
  kind: "assignment" | "quiz";
  title: string;
  date: Date;
  label: "due" | "opens" | "closes";
};

export type ModuleTimelineData = {
  id: string;
  title: string;
  type: string;
  status: ModuleStatus;
  statusLabel: string;
  scheduleLabel: string;
  actionLabel: string;
  actionHref: string;
  lockLabel: string | null;
};

export type AssignmentCardData = {
  status: ItemStatus;
  statusClass: string;
  statusLabel: string;
  actionLabel: string;
  actionHref: string;
  actionSecondary: boolean;
  timeLabel: string;
  dateLabel: string;
};

export type QuizSummaryData = {
  total: number;
  completed: number;
  inProgress: number;
  nextQuiz: {
    title: string;
    status: ItemStatus;
    timeLabel: string;
    dateLabel: string;
    actionLabel: string;
    actionHref: string;
    progressLabel: string;
  } | null;
};

// CORE STATUS FUNCTIONS

export function getAssignmentStatus(
  dueDate: Date,
  submissionStatus: SubmissionStatus | null,
  now: Date
): ItemStatus {
  if (submissionStatus === "submitted" || submissionStatus === "graded") {
    return "completed";
  }
  return dueDate.getTime() < now.getTime() ? "overdue" : "upcoming";
}

export function getAssignmentAction(
  status: ItemStatus,
  submissionStatus: SubmissionStatus | null
): string {
  if (status === "completed") return "View";
  if (submissionStatus === "in_progress") return "Continue";
  if (status === "overdue") return "Submit";
  return "Start";
}

export function getQuizStatus(quiz: StudentQuiz, now: Date): ItemStatus {
  if (quiz.attempt?.completed_at) return "completed";
  const endsAt = quiz.ends_at ? new Date(quiz.ends_at) : null;
  if (endsAt && endsAt.getTime() < now.getTime()) return "overdue";
  return "upcoming";
}

export function getQuizAction(
  quiz: StudentQuiz,
  now: Date,
  status: ItemStatus
): string {
  if (status === "overdue") return "View Details";
  if (quiz.attempt?.completed_at) return "View Results";
  if (quiz.attempt && !quiz.attempt.completed_at) return "Resume";
  const startsAt = quiz.starts_at ? new Date(quiz.starts_at) : null;
  if (startsAt && now.getTime() < startsAt.getTime()) return "View Details";
  return "Start";
}

export function getQuizEvent(quiz: StudentQuiz, now: Date) {
  const startsAt = parseDate(quiz.starts_at);
  const endsAt = parseDate(quiz.ends_at);

  if (startsAt && now < startsAt)
    return { eventDate: startsAt, label: "opens" as const };
  if (endsAt) return { eventDate: endsAt, label: "closes" as const };
  if (startsAt) return { eventDate: startsAt, label: "opens" as const };
  return null;
}

export function getModuleScheduleLabel(module: CourseModuleItem): string {
  const parts: string[] = [];
  if (module.starts_at) parts.push(`Opens ${formatDate(module.starts_at)}`);
  if (module.ends_at) parts.push(`Closes ${formatDate(module.ends_at)}`);
  return parts.length > 0 ? parts.join(" | ") : "Self-paced";
}

// COURSE OVERVIEW HELPERS

export function getCourseGradeLabel(course: StudentCourseOverview): string {
  return "—";
}

export function getCourseDeadlineLabel(course: StudentCourseOverview): string {
  const { next_event, has_overdue } = course;
  if (next_event) {
    const prefix = next_event.kind === "assignment" ? "Assignment" : "Quiz";
    return `${prefix}: ${next_event.title}`;
  }
  return has_overdue ? "Overdue items" : "No upcoming deadlines";
}

export function getCourseDeadlineMeta(course: StudentCourseOverview): string {
  const { next_event, has_overdue } = course;
  if (next_event) {
    const timeInfo = formatRelativeTime(new Date(next_event.date), new Date());
    const actionLabel =
      next_event.label === "due"
        ? "Due"
        : next_event.label === "opens"
        ? "Opens"
        : "Closes";
    return `${actionLabel} ${timeInfo.label} • ${formatDate(next_event.date)}`;
  }
  return has_overdue ? "Past due tasks need attention" : "";
}

// NEXT DUE HELPERS

export function getAssignmentCandidate(
  assignment: StudentAssignment
): NextDueCandidate | null {
  const dueDate = parseDate(assignment.due_date);
  if (!dueDate) return null;
  if (
    assignment.submission_status === "submitted" ||
    assignment.submission_status === "graded"
  ) {
    return null;
  }
  return {
    id: assignment.id,
    kind: "assignment",
    title: assignment.title,
    date: dueDate,
    label: "due",
  };
}

export function getQuizCandidate(
  quiz: StudentQuiz,
  now: Date
): NextDueCandidate | null {
  if (quiz.attempt?.completed_at) return null;
  const event = getQuizEvent(quiz, now);
  if (!event) return null;
  return {
    id: quiz.id,
    kind: "quiz",
    title: quiz.title,
    date: event.eventDate,
    label: event.label,
  };
}

export function selectNextEvent<T>(
  items: T[],
  now: Date,
  getDate: (item: T) => Date
): T | null {
  if (items.length === 0) return null;
  const upcoming = items.filter((i) => getDate(i).getTime() >= now.getTime());
  if (upcoming.length > 0) {
    return upcoming.sort(
      (a, b) => getDate(a).getTime() - getDate(b).getTime()
    )[0];
  }
  return items
    .slice()
    .sort((a, b) => getDate(b).getTime() - getDate(a).getTime())[0];
}

export function getNextDueItems(
  assignments: StudentAssignment[],
  quizzes: StudentQuiz[],
  now: Date
): NextDueCandidate[] {
  const assignmentCandidates = assignments
    .map(getAssignmentCandidate)
    .filter((x): x is NextDueCandidate => Boolean(x));
  const quizCandidates = quizzes
    .map((q) => getQuizCandidate(q, now))
    .filter((x): x is NextDueCandidate => Boolean(x));
  return [...assignmentCandidates, ...quizCandidates];
}

export function getNextDueContent(nextDue: NextDueCandidate | null) {
  if (!nextDue) {
    return {
      title: "No upcoming deadlines",
      meta: "You are all caught up.",
      isOverdue: false,
    };
  }
  const now = new Date();
  const timeLabel = formatEventTimeLabel(nextDue.date, now, nextDue.label);
  const isOverdue = formatRelativeTime(nextDue.date, now).isOverdue;

  return {
    title: `${nextDue.kind === "assignment" ? "Assignment" : "Quiz"}: ${
      nextDue.title
    }`,
    meta: `${timeLabel} - ${formatDate(nextDue.date.toISOString())}`,
    isOverdue,
  };
}

// MODULE TIMELINE BUILDER

export function buildModuleTimeline(
  modules: CourseModuleItem[],
  quizzes: StudentQuiz[],
  courseId: string
): ModuleTimelineData[] {
  const now = new Date();
  const quizMap = new Map(quizzes.map((q) => [q.id, q]));

  return modules.map((module) => {
    const quiz = module.type === "Quiz" ? quizMap.get(module.id) ?? null : null;
    const startsAt = parseDate(module.starts_at);
    const endsAt = parseDate(module.ends_at);
    const quizStatus = quiz ? getQuizStatus(quiz, now) : null;

    // Compute status
    let status: ModuleStatus = "available";
    let statusLabel = "Available";
    let lockLabel: string | null = null;

    if (quiz && quizStatus) {
      if (quizStatus === "completed") {
        status = "completed";
        statusLabel = "Completed";
      } else if (quizStatus === "overdue") {
        status = "closed";
        statusLabel = "Closed";
      } else if (quiz.attempt && !quiz.attempt.completed_at) {
        status = "in_progress";
        statusLabel = "In progress";
      } else if (startsAt && now < startsAt) {
        status = "locked";
        statusLabel = "Locked";
      }
    } else if (startsAt && now < startsAt) {
      status = "locked";
      statusLabel = "Locked";
    } else if (endsAt && now > endsAt) {
      status = "closed";
      statusLabel = "Closed";
    }

    if (status === "locked" && startsAt) {
      lockLabel = `Opens in ${formatRelativeTime(startsAt, now).label}`;
    }

    // Compute action
    const { actionLabel, actionHref } = getModuleActionInfo(
      module,
      quiz,
      courseId,
      now
    );

    return {
      id: module.id,
      title: module.title,
      type: module.type,
      status,
      statusLabel,
      scheduleLabel: getModuleScheduleLabel(module),
      actionLabel,
      actionHref,
      lockLabel,
    };
  });
}

function getModuleHref(
  courseId: string,
  type: string,
  moduleId: string
): string {
  if (type === "Quiz")
    return `/(app)/(tabs-student)/courses/${courseId}/modules/${moduleId}/quiz`;
  if (type === "Lab")
    return `/(app)/(tabs-student)/courses/${courseId}/labs/${moduleId}`;
  if (type === "Assignment")
    return `/(app)/(tabs-student)/courses/${courseId}/assignments`;
  return `/(app)/(tabs-student)/courses/${courseId}/modules/${moduleId}`;
}

// ASSIGNMENT CARD BUILDER

export function buildAssignmentCard(
  assignment: StudentAssignment,
  courseId: string,
  statusClasses: { completed: string; overdue: string; upcoming: string }
): AssignmentCardData {
  const now = new Date();
  const dueDate = parseDate(assignment.due_date);
  const submissionStatus = assignment.submission_status ?? null;

  const status = dueDate
    ? getAssignmentStatus(dueDate, submissionStatus, now)
    : submissionStatus === "submitted" || submissionStatus === "graded"
    ? "completed"
    : "upcoming";

  const statusClass =
    status === "completed"
      ? statusClasses.completed
      : status === "overdue"
      ? statusClasses.overdue
      : statusClasses.upcoming;

  const isOverdue = dueDate ? dueDate.getTime() < now.getTime() : false;
  const statusLabel = getAssignmentStatusLabel(
    submissionStatus ?? "not_started",
    isOverdue
  );

  const { label: actionLabel, secondary: actionSecondary } =
    getAssignmentActionInfo(status, submissionStatus, isOverdue);
  const actionHref = getAssignmentHref(assignment, courseId);

  const timeLabel = dueDate
    ? formatEventTimeLabel(dueDate, now, "due")
    : "No due date";
  const dateLabel = dueDate
    ? formatDate(assignment.due_date ?? "")
    : "Self-paced";

  return {
    status,
    statusClass,
    statusLabel,
    actionLabel,
    actionHref,
    actionSecondary,
    timeLabel,
    dateLabel,
  };
}

// QUIZ SUMMARY BUILDER

export function buildQuizSummary(
  quizzes: StudentQuiz[],
  courseId: string
): QuizSummaryData {
  const now = new Date();
  const total = quizzes.length;
  const completed = quizzes.filter((q) => q.attempt?.completed_at).length;
  const inProgress = quizzes.filter(
    (q) => q.attempt && !q.attempt.completed_at
  ).length;

  // Find next quiz
  const candidates = quizzes
    .filter((q) => !q.attempt?.completed_at)
    .map((quiz) => {
      const event = getQuizEvent(quiz, now);
      return event
        ? { quiz, eventDate: event.eventDate, label: event.label }
        : null;
    })
    .filter(
      (
        x
      ): x is {
        quiz: StudentQuiz;
        eventDate: Date;
        label: "opens" | "closes";
      } => Boolean(x)
    );

  const nextQuizData = selectNextEvent(candidates, now, (i) => i.eventDate);

  if (!nextQuizData) {
    return { total, completed, inProgress, nextQuiz: null };
  }

  const { quiz, eventDate, label } = nextQuizData;
  const quizStatus = getQuizStatus(quiz, now);
  const actionLabel = getQuizAction(quiz, now, quizStatus);
  const actionHref = `/(app)/(tabs-student)/courses/${courseId}/modules/${quiz.id}/quiz`;

  const timeLabel = formatEventTimeLabel(eventDate, now, label);

  return {
    total,
    completed,
    inProgress,
    nextQuiz: {
      title: quiz.title,
      status: quizStatus,
      timeLabel,
      dateLabel: formatDate(eventDate.toISOString()),
      actionLabel,
      actionHref,
      progressLabel:
        quiz.question_count > 0
          ? `${quiz.answered_count}/${quiz.question_count} answered`
          : "Questions TBD",
    },
  };
}

// ASSIGNMENT STATUS LABELS AND CLASSES

export function getAssignmentStatusLabel(
  submissionStatus: SubmissionStatus,
  isOverdue: boolean
): string {
  if (submissionStatus === "graded") return "Graded";
  if (submissionStatus === "submitted") return "Submitted";
  if (submissionStatus === "in_progress") return "Draft saved";
  if (isOverdue) return "Overdue";
  return "Not started";
}

export function getAssignmentStatusClass(
  submissionStatus: SubmissionStatus,
  isOverdue: boolean,
  statusClasses: {
    completed: string;
    overdue: string;
    inProgress: string;
    notStarted: string;
    submitted: string;
    graded: string;
  }
): string {
  if (
    isOverdue &&
    submissionStatus !== "submitted" &&
    submissionStatus !== "graded"
  ) {
    return statusClasses.overdue;
  }
  switch (submissionStatus) {
    case "in_progress":
      return statusClasses.inProgress;
    case "submitted":
      return statusClasses.submitted;
    case "graded":
      return statusClasses.graded;
    default:
      return statusClasses.notStarted;
  }
}

// ASSIGNMENT PROGRESS CALCULATION

export function calculateAssignmentProgress(
  dueDate: Date | null,
  createdAt: Date | null,
  now: Date
): number | null {
  if (!dueDate) return null;
  const start = createdAt ?? now;
  const total = dueDate.getTime() - start.getTime();
  if (total <= 0) {
    return dueDate.getTime() <= now.getTime() ? 0 : 100;
  }
  const remaining = dueDate.getTime() - now.getTime();
  const percent = (remaining / total) * 100;
  return clampNumber(Math.round(percent), 0, 100);
}

// ASSIGNMENT METADATA BUILDER

export type AssignmentMetaData = {
  assignment: StudentAssignment;
  submissionStatus: SubmissionStatus;
  statusLabel: string;
  statusClass: string;
  timeLabel: string;
  dueTimestamp: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  isCompleted: boolean;
  progressPercent: number | null;
  actionLabel: string;
  actionHref: string;
  actionSecondary: boolean;
  gradeLabel: string;
  lateLabel: string | null;
  draftLabel: string | null;
  summaryText: string | null;
};

export function buildAssignmentMeta(
  assignment: StudentAssignment,
  courseId: string,
  statusClasses: {
    completed: string;
    overdue: string;
    inProgress: string;
    notStarted: string;
    submitted: string;
    graded: string;
  }
): AssignmentMetaData {
  const now = new Date();
  const submissionStatus = assignment.submission_status ?? "not_started";
  const dueDate = parseDate(assignment.due_date);
  const createdAt = parseDate(assignment.created_at);
  const timeMeta = dueDate ? formatRelativeTime(dueDate, now) : null;
  const isOverdue = Boolean(timeMeta?.isOverdue);
  const isDueSoon = Boolean(timeMeta?.isDueSoon);
  const isCompleted =
    submissionStatus === "submitted" || submissionStatus === "graded";

  const timelineStatus = dueDate
    ? getAssignmentStatus(dueDate, submissionStatus, now)
    : isCompleted
    ? "completed"
    : "upcoming";

  const timeLabel = dueDate
    ? formatEventTimeLabel(dueDate, now, "due")
    : "Self-paced";

  const progressPercent = calculateAssignmentProgress(dueDate, createdAt, now);

  const { label, secondary } = getAssignmentActionInfo(
    timelineStatus,
    submissionStatus,
    isOverdue
  );
  const href = getAssignmentHref(assignment, courseId);

  const gradeLabel =
    submissionStatus === "graded" && assignment.submission_grade !== null
      ? formatAssignmentGrade(
          assignment.submission_grade,
          assignment.max_points
        )
      : submissionStatus === "submitted"
      ? "Pending"
      : "—";

  const submittedAt = parseDate(assignment.submission_submitted_at ?? null);
  const lateLabel =
    dueDate && submittedAt
      ? formatLateDuration(dueDate, submittedAt) || null
      : null;

  const draftLabel =
    submissionStatus === "in_progress"
      ? `Last saved ${formatTimeAgo(assignment.submission_updated_at)}`
      : null;

  const summarySource = assignment.description || assignment.instructions || "";
  const summaryText = summarySource ? truncateText(summarySource, 160) : null;

  return {
    assignment,
    submissionStatus,
    statusLabel: getAssignmentStatusLabel(submissionStatus, isOverdue),
    statusClass: getAssignmentStatusClass(
      submissionStatus,
      isOverdue,
      statusClasses
    ),
    timeLabel: timelineStatus === "completed" ? "Completed" : timeLabel,
    dueTimestamp: dueDate ? dueDate.getTime() : Number.POSITIVE_INFINITY,
    isOverdue,
    isDueSoon,
    isCompleted,
    progressPercent,
    actionLabel: label,
    actionHref: href,
    actionSecondary: secondary,
    gradeLabel,
    lateLabel,
    draftLabel,
    summaryText,
  };
}

// ASSIGNMENT PAGE HELPERS

export function buildAssignmentPageData(
  assignments: StudentAssignment[],
  courseId: string,
  statusClasses: {
    completed: string;
    overdue: string;
    inProgress: string;
    notStarted: string;
    submitted: string;
    graded: string;
  }
) {
  const assignmentMeta = assignments.map((assignment) =>
    buildAssignmentMeta(assignment, courseId, statusClasses)
  );

  const overdueCount = assignmentMeta.filter(
    (item) => item.isOverdue && !item.isCompleted
  ).length;

  const completedCount = assignmentMeta.filter(
    (item) =>
      item.submissionStatus === "submitted" ||
      item.submissionStatus === "graded"
  ).length;

  return {
    assignmentMeta,
    overdueCount,
    completedCount,
  };
}

export function filterAndSortAssignments(
  assignmentMeta: AssignmentMetaData[],
  search: string,
  statusFilter: "all" | SubmissionStatus,
  timeFilter: "all" | "upcoming" | "overdue"
): AssignmentMetaData[] {
  const searchValue = search.trim().toLowerCase();

  return assignmentMeta
    .filter((item) => {
      if (statusFilter === "all") return true;
      return item.submissionStatus === statusFilter;
    })
    .filter((item) => {
      if (timeFilter === "all") return true;
      if (timeFilter === "overdue") return item.isOverdue;
      if (timeFilter === "upcoming")
        return !item.isOverdue && !item.isCompleted;
      return true;
    })
    .filter((item) => {
      if (!searchValue) return true;
      return item.assignment.title.toLowerCase().includes(searchValue);
    })
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) {
        return a.isOverdue ? -1 : 1;
      }
      return a.dueTimestamp - b.dueTimestamp;
    });
}

// SIDEBAR NEXT ITEM LOGIC

export type NextItemData = {
  type: "due-item" | "module";
  title: string;
  actionHref: string;
  isLocked: boolean;
  status: ModuleStatus | "overdue";
};

export function getNextItem(
  assignments: StudentAssignment[],
  quizzes: StudentQuiz[],
  moduleItems: ModuleTimelineData[],
  courseId: string
): NextItemData | null {
  const now = new Date();
  const candidates = getNextDueItems(assignments, quizzes, now);

  // First priority: urgent items due in < 24 hours
  const urgentItems = candidates.filter((item) => {
    const hoursUntilDue =
      (item.date.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue < 24;
  });

  if (urgentItems.length > 0) {
    const nextUrgent = selectNextEvent(urgentItems, now, (i) => i.date);
    if (nextUrgent) {
      const prefix = nextUrgent.kind === "assignment" ? "Assignment" : "Quiz";
      const href =
        nextUrgent.kind === "assignment"
          ? `/(app)/(tabs-student)/courses/${courseId}/assignments/${nextUrgent.id}`
          : `/(app)/(tabs-student)/courses/${courseId}/modules/${nextUrgent.id}/quiz`;
      const isOverdue =
        nextUrgent.label === "due" && nextUrgent.date.getTime() < now.getTime();

      return {
        type: "due-item",
        title: `${prefix}: ${nextUrgent.title}`,
        actionHref: href,
        isLocked: false,
        status: isOverdue ? "overdue" : "available",
      };
    }
  }

  // Second priority: available or in-progress modules
  const available = moduleItems.find(
    (i) => i.status === "available" || i.status === "in_progress"
  );
  if (available) {
    return {
      type: "module",
      title: available.title,
      actionHref: available.actionHref,
      isLocked: available.status === "locked",
      status: available.status,
    };
  }

  // Fallback: any incomplete module
  const anyIncomplete = moduleItems.find((i) => i.status !== "completed");
  if (anyIncomplete) {
    return {
      type: "module",
      title: anyIncomplete.title,
      actionHref: anyIncomplete.actionHref,
      isLocked: anyIncomplete.status === "locked",
      status: anyIncomplete.status,
    };
  }

  return null;
}

// SIDEBAR ATTACHMENTS

export type ResourceAttachment = {
  id: string;
  title: string;
  url: string;
  source: string;
  fileName: string;
};

export function buildAttachments(
  assignments: StudentAssignment[],
  modules: CourseModuleItem[]
): ResourceAttachment[] {
  const seen = new Set<string>();
  const items: ResourceAttachment[] = [];

  const add = (
    title: string,
    url: string | null | undefined,
    source: string
  ) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const fileName = deriveFileNameFromUrl(url, "attachment");
    items.push({
      id: `${source}-${title}-${url}`,
      title,
      url,
      source,
      fileName,
    });
  };

  assignments.forEach((a) => add(a.title, a.attachment_url, "Assignment"));
  modules.forEach((m) => add(m.title, m.attachment_url, m.type));

  return items;
}
