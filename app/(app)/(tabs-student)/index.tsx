import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/services/studentService";
import type {
  StudentDashboardData,
  StudentEnrollmentSummary,
  StudentModuleItem,
  StudentRecentFeedbackItem,
  StudentResumeAssignmentItem,
  StudentResumeQuizItem,
} from "@/types/serviceTypes";
import {
  formatDate,
  formatRelativeTime,
  formatTimeAgo,
  truncateText,
} from "@/utils/generalUtils";
import { formatCourseName } from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NextUpItem = {
  id: string;
  title: string;
  course_id: string;
  course_code: string | null;
  course_name: string | null;
  type: string;
  actionHref: string;
  statusLabel: string;
  timeLabel: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  order_index: number | null;
};

type ResumeItem =
  | {
      kind: "assignment";
      id: string;
      title: string;
      course_id: string | null;
      course_code: string | null;
      updated_at: string | null;
      actionHref: string;
    }
  | {
      kind: "quiz";
      id: string;
      title: string;
      course_id: string | null;
      course_code: string | null;
      answered_count: number;
      question_count: number;
      started_at: string | null;
      actionHref: string;
    }
  | {
      kind: "module";
      id: string;
      title: string;
      type: string;
      course_id: string | null;
      course_code: string | null;
      opened_at: string;
      actionHref: string;
    };

const calculateAverageProgress = (enrollments: StudentEnrollmentSummary[]) =>
  enrollments.length
    ? Math.round(
        enrollments.reduce((acc, item) => acc + (item.progress ?? 0), 0) /
          enrollments.length
      )
    : 0;

const getTypeIconName = (type: string) => {
  if (type === "Assignment") return "file-text";
  if (type === "Quiz") return "check-circle";
  return "book-open";
};

const buildNextUpItem = (
  item: StudentModuleItem,
  now: Date
): NextUpItem | null => {
  if (item.type === "Assignment") {
    if (!item.assignment_id || !item.course_id) return null;
    const submissionStatus = item.submission_status ?? "not_started";
    const statusLabel =
      submissionStatus === "in_progress" ? "In progress" : "Not started";

    let timeLabel = "No due date";
    let isOverdue = false;
    let isDueSoon = false;

    if (item.due_date) {
      const relative = formatRelativeTime(new Date(item.due_date), now);
      timeLabel = relative.isOverdue
        ? `OVERDUE ${relative.label}`
        : `Due in ${relative.label}`;
      isOverdue = relative.isOverdue;
      isDueSoon = relative.isDueSoon;
    }

    return {
      id: item.assignment_id,
      title: item.title,
      course_id: item.course_id,
      course_code: item.course_code,
      course_name: item.course_name,
      type: item.type,
      actionHref: `/(app)/(tabs-student)/courses/${item.course_id}/assignments/${item.assignment_id}`,
      statusLabel,
      timeLabel,
      isOverdue,
      isDueSoon,
      order_index: item.order_index ?? null,
    };
  }

  if (item.type === "Quiz") {
    if (!item.module_id || !item.course_id) return null;
    const statusLabel = item.quiz_attempt_id ? "In progress" : "Not started";

    let timeLabel = "Ready to start";
    let isOverdue = false;
    let isDueSoon = false;

    if (item.quiz_starts_at && new Date(item.quiz_starts_at) > now) {
      const relative = formatRelativeTime(new Date(item.quiz_starts_at), now);
      timeLabel = `Opens in ${relative.label}`;
    } else if (item.quiz_ends_at) {
      const relative = formatRelativeTime(new Date(item.quiz_ends_at), now);
      timeLabel = relative.isOverdue
        ? `Closed ${relative.label} ago`
        : `Ends in ${relative.label}`;
      isOverdue = relative.isOverdue;
      isDueSoon = relative.isDueSoon;
    }

    return {
      id: item.module_id,
      title: item.title,
      course_id: item.course_id,
      course_code: item.course_code,
      course_name: item.course_name,
      type: item.type,
      actionHref: `/(app)/(tabs-student)/courses/${item.course_id}/modules/${item.module_id}/quiz`,
      statusLabel,
      timeLabel,
      isOverdue,
      isDueSoon,
      order_index: item.order_index ?? null,
    };
  }

  if (!item.module_id || !item.course_id) return null;

  return {
    id: item.module_id,
    title: item.title,
    course_id: item.course_id,
    course_code: item.course_code,
    course_name: item.course_name,
    type: item.type,
    actionHref: `/(app)/(tabs-student)/courses/${item.course_id}/modules/${item.module_id}`,
    statusLabel: "Next to open",
    timeLabel: "Ready to start",
    isOverdue: false,
    isDueSoon: false,
    order_index: item.order_index ?? null,
  };
};

const getActionLabel = (item: NextUpItem) => {
  if (item.type === "Assignment") {
    return item.statusLabel === "In progress" ? "Continue" : "Start";
  }
  if (item.type === "Quiz") {
    return item.statusLabel === "In progress" ? "Resume" : "Start";
  }
  return "Open";
};

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonStack}>
      <View style={[styles.skeletonLine, styles.skeletonLineMedium]} />
      <View style={[styles.skeletonLine, styles.skeletonLineWide]} />
    </View>
  </View>
);

function NextUpTaskCard({ item }: { item: NextUpItem }) {
  const router = useRouter();
  const taskStyle = [
    styles.taskCard,
    item.isOverdue && styles.taskCardOverdue,
    item.isDueSoon && !item.isOverdue && styles.taskCardSoon,
  ];
  const timeStyle = [
    styles.taskTime,
    item.isOverdue && styles.taskTimeOverdue,
    item.isDueSoon && !item.isOverdue && styles.taskTimeSoon,
  ];

  const handlePress = () => {
    if (!item.actionHref) return;
    router.push(item.actionHref as any);
  };

  return (
    <View style={taskStyle}>
      <View style={styles.taskIcon}>
        <Feather
          name={getTypeIconName(item.type)}
          size={18}
          color={theme.primary}
        />
      </View>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>
          {item.type}: {item.title}
        </Text>
        <Text style={styles.taskCourse}>
          {formatCourseName(item.course_code, item.course_name)}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskStatus}>{item.statusLabel}</Text>
          <Text style={timeStyle}>{item.timeLabel}</Text>
          <TouchableOpacity
            style={styles.taskAction}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text style={styles.taskActionText}>{getActionLabel(item)}</Text>
            <Feather name="arrow-right" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ResumeCard({ item }: { item: ResumeItem }) {
  const router = useRouter();
  const metaText =
    item.kind === "assignment"
      ? `Last edited ${formatTimeAgo(item.updated_at)}`
      : item.kind === "quiz"
      ? `${item.answered_count}/${item.question_count} questions answered`
      : `${item.type} • Opened ${formatTimeAgo(item.opened_at)}`;

  const actionLabel =
    item.kind === "assignment"
      ? "Continue"
      : item.kind === "quiz"
      ? "Resume"
      : "Open";

  const handlePress = () => {
    if (!item.actionHref) return;
    router.push(item.actionHref as any);
  };

  return (
    <View style={styles.resumeCard}>
      <Text style={styles.resumeTitle}>{item.title}</Text>
      <Text style={styles.resumeMeta}>{metaText}</Text>
      <TouchableOpacity
        style={styles.resumeAction}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.resumeActionText}>{actionLabel}</Text>
        <Feather name="arrow-right" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}

function CourseCard({ item }: { item: StudentEnrollmentSummary }) {
  const router = useRouter();
  const progressValue = Math.round(item.progress ?? 0);

  return (
    <View style={styles.courseCard}>
      <Text style={styles.courseCardCode}>{item.course.code}</Text>
      <Text style={styles.courseCardTitle}>{item.course.name}</Text>
      <View style={styles.courseProgressRow}>
        <View style={styles.courseProgressBar}>
          <View
            style={[
              styles.courseProgressFill,
              { width: `${progressValue}%` },
            ]}
          />
        </View>
        <Text style={styles.courseProgressText}>{progressValue}%</Text>
      </View>
      <TouchableOpacity
        style={styles.courseAction}
        onPress={() =>
          router.push(`/(app)/(tabs-student)/courses/${item.course.id}` as any)
        }
        activeOpacity={0.7}
      >
        <Text style={styles.courseActionText}>Open course</Text>
        <Feather name="arrow-right" size={14} color={theme.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

function FeedbackCard({ item }: { item: StudentRecentFeedbackItem }) {
  const router = useRouter();
  const scoreLabel =
    item.grade !== null && item.max_score
      ? `Graded: ${item.grade}/${item.max_score}`
      : "Graded";
  const feedbackPreview =
    truncateText(item.feedback, 120) || "No feedback provided.";
  const actionHref =
    item.id && item.course_id
      ? `/(app)/(tabs-student)/courses/${item.course_id}/assignments/${item.id}`
      : "";

  const handlePress = () => {
    if (!actionHref) return;
    router.push(actionHref as any);
  };

  return (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackTitleRow}>
        <Feather name="check-circle" size={16} color={theme.primary} />
        <Text style={styles.feedbackTitle}>{item.title}</Text>
      </View>
      <View style={styles.feedbackMeta}>
        <Text style={styles.feedbackMetaText}>
          {formatCourseName(item.course_code, item.course_name)}
        </Text>
        <Text style={styles.feedbackMetaDivider}>•</Text>
        <Text style={styles.feedbackMetaText}>{scoreLabel}</Text>
        <Text style={styles.feedbackMetaDivider}>•</Text>
        <Text style={styles.feedbackMetaText}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.feedbackPreview}>{feedbackPreview}</Text>
      <TouchableOpacity
        style={styles.feedbackAction}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.feedbackActionText}>View</Text>
        <Feather name="arrow-right" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const studentId = user?.id ?? null;
  const studentName = user?.full_name ?? "Student";

  const enrollments = dashboardData?.enrollments ?? [];
  const recentFeedback = dashboardData?.recentFeedback ?? [];
  const resumeAssignments = dashboardData?.resumeAssignments ?? [];
  const resumeQuizzes = dashboardData?.resumeQuizzes ?? [];
  const resumeModules = dashboardData?.resumeModules ?? [];
  const activities = dashboardData?.activities ?? [];
  const nextModules = dashboardData?.nextModules ?? [];

  const averageProgress = useMemo(
    () => calculateAverageProgress(enrollments),
    [enrollments]
  );

  const nextUpItems = useMemo(() => {
    const now = new Date();
    return nextModules
      .map((item) => buildNextUpItem(item, now))
      .filter((item): item is NextUpItem => item !== null)
      .sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        const aOrder = a.order_index ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.order_index ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });
  }, [nextModules]);

  const resumeItems = useMemo<ResumeItem[]>(() => {
    const items: ResumeItem[] = [
      ...resumeQuizzes
        .filter((quiz) => quiz.quiz_id && quiz.course_id)
        .map((quiz: StudentResumeQuizItem) => ({
          kind: "quiz" as const,
          id: quiz.quiz_id,
          title: quiz.title,
          course_id: quiz.course_id ?? null,
          course_code: quiz.course_code ?? null,
          answered_count: quiz.answered_count ?? 0,
          question_count: quiz.question_count ?? 0,
          started_at: quiz.started_at ?? null,
          actionHref: `/(app)/(tabs-student)/courses/${quiz.course_id}/modules/${quiz.quiz_id}/quiz`,
        })),
      ...resumeAssignments
        .filter((assignment) => assignment.assignment_id && assignment.course_id)
        .map((assignment: StudentResumeAssignmentItem) => ({
          kind: "assignment" as const,
          id: assignment.assignment_id,
          title: assignment.title,
          course_id: assignment.course_id ?? null,
          course_code: assignment.course_code ?? null,
          updated_at: assignment.updated_at ?? null,
          actionHref: `/(app)/(tabs-student)/courses/${assignment.course_id}/assignments/${assignment.assignment_id}`,
        })),
      ...resumeModules
        .filter((module) => module.module_id && module.course_id)
        .map((module: StudentModuleItem) => ({
          kind: "module" as const,
          id: module.module_id,
          title: module.title,
          type: module.type,
          course_id: module.course_id ?? null,
          course_code: module.course_code ?? null,
          opened_at: module.opened_at ?? "",
          actionHref: `/(app)/(tabs-student)/courses/${module.course_id}/modules/${module.module_id}`,
        })),
    ];
    return items.slice(0, 4);
  }, [resumeAssignments, resumeQuizzes, resumeModules]);

  useEffect(() => {
    if (!studentId) return;

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentDashboard(studentId);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
        setErrorMessage("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [studentId]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEmpty = !isLoading && enrollments.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.greetingRow}>
              <View style={styles.iconBox}>
                <Feather name="layout" size={22} color={theme.primary} />
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.title}>Student Dashboard</Text>
                <Text style={styles.subtitle}>
                  Welcome back, {studentName}. Here is what needs your
                  attention.
                </Text>
              </View>
            </View>
            <View style={styles.dateBadge}>
              <Feather name="calendar" size={14} color={theme.mutedForeground} />
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {errorMessage && (
          <View style={styles.sectionEmpty}>
            <Text style={styles.sectionEmptyText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.statIconCourses]}>
                  <Feather name="book-open" size={18} color={theme.primary} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Enrolled Courses</Text>
                  <Text style={styles.statValue}>{enrollments.length}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.statIconDue]}>
                  <Feather name="clock" size={18} color={theme.accent} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Next Modules</Text>
                  <Text style={styles.statValue}>{nextUpItems.length}</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, styles.statIconProgress]}>
                  <Feather name="trending-up" size={18} color="#10b981" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Average Progress</Text>
                  <Text style={styles.statValue}>{averageProgress}%</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptyText}>
              Join your first course to unlock assignments and quizzes.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/courses/join` as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Join a Course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Next Up</Text>
                <TouchableOpacity
                  style={styles.sectionAction}
                  onPress={() =>
                    router.push(`/(app)/(tabs-student)/calendar` as any)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionActionText}>View all</Text>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.taskList}>
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : nextUpItems.length > 0 ? (
                  nextUpItems.map((item) => (
                    <NextUpTaskCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                    />
                  ))
                ) : (
                  <View style={styles.sectionEmpty}>
                    <Text style={styles.sectionEmptyText}>
                      All caught up. No upcoming tasks.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Courses</Text>
                <TouchableOpacity
                  style={styles.sectionAction}
                  onPress={() =>
                    router.push(`/(app)/(tabs-student)/courses` as any)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionActionText}>View all</Text>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>
              {isLoading ? (
                <View style={styles.carousel}>
                  <SkeletonCard />
                  <SkeletonCard />
                </View>
              ) : enrollments.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carousel}
                >
                  {enrollments.map((item) => (
                    <CourseCard key={item.course.id} item={item} />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.sectionEmpty}>
                  <Text style={styles.sectionEmptyText}>
                    No enrolled courses yet.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Recent Feedback</Text>
                  {!isLoading && recentFeedback.length > 0 && (
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>
                        {recentFeedback.length}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.sectionAction}
                  onPress={() =>
                    router.push(`/(app)/(tabs-student)/grades` as any)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionActionText}>View all</Text>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.feedbackList}>
                {isLoading ? (
                  <SkeletonCard />
                ) : recentFeedback.length > 0 ? (
                  recentFeedback.map((item, index) => (
                    <FeedbackCard
                      key={`${item.kind}-${index}`}
                      item={item}
                    />
                  ))
                ) : (
                  <View style={styles.sectionEmpty}>
                    <Text style={styles.sectionEmptyText}>
                      No recent feedback yet.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Resume Work</Text>
              </View>
              <View style={styles.resumeList}>
                {isLoading ? (
                  <View style={styles.skeletonStack}>
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLine} />
                  </View>
                ) : resumeItems.length > 0 ? (
                  resumeItems.map((item) => (
                    <ResumeCard key={`${item.kind}-${item.id}`} item={item} />
                  ))
                ) : (
                  <View style={styles.sectionEmpty}>
                    <Text style={styles.sectionEmptyText}>
                      No work in progress.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
              </View>
              <View style={styles.activityFeed}>
                {isLoading ? (
                  <View style={styles.skeletonStack}>
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLine} />
                    <View style={styles.skeletonLine} />
                  </View>
                ) : activities.length > 0 ? (
                  activities.map((item, index) => (
                    <View
                      key={`${item.id}-${index}`}
                      style={styles.activityItem}
                    >
                      <View style={styles.activityTimeline}>
                        <View style={styles.activityDot} />
                        {index !== activities.length - 1 && (
                          <View style={styles.activityLine} />
                        )}
                      </View>
                      <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                          {item.description}
                        </Text>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityMetaText}>
                            {formatDate(item.created_at)}
                          </Text>
                          {item.course_code && (
                            <View style={styles.activityBadge}>
                              <Text style={styles.activityBadgeText}>
                                {item.course_code}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.sectionEmpty}>
                    <Text style={styles.sectionEmptyText}>
                      No recent activity.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    gap: 16,
  },
  headerContent: {
    gap: 12,
  },
  greetingRow: {
    flexDirection: "row",
    gap: 12,
  },
  greetingText: {
    flex: 1,
    gap: 6,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.foreground,
  },
  subtitle: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  dateText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconCourses: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  statIconDue: {
    backgroundColor: "rgba(129, 140, 248, 0.12)",
  },
  statIconProgress: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  statInfo: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.foreground,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.foreground,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
  },
  sectionEmpty: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  sectionEmptyText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  taskCardOverdue: {
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  taskCardSoon: {
    borderColor: "rgba(129, 140, 248, 0.4)",
  },
  taskIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  taskCourse: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  taskMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  taskStatus: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.mutedForeground,
  },
  taskTime: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  taskTimeOverdue: {
    color: theme.destructive,
  },
  taskTimeSoon: {
    color: theme.accent,
  },
  taskAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  taskActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.primary,
  },
  carousel: {
    flexDirection: "row",
    gap: 12,
  },
  courseCard: {
    width: 220,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
  },
  courseCardCode: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  courseCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  courseProgressRow: {
    gap: 6,
  },
  courseProgressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.secondary,
    overflow: "hidden",
  },
  courseProgressFill: {
    height: "100%",
    backgroundColor: theme.primary,
  },
  courseProgressText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  courseAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 8,
  },
  courseActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 8,
  },
  feedbackTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  feedbackMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  feedbackMetaText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  feedbackMetaDivider: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  feedbackPreview: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  feedbackAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedbackActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
  },
  infoBadge: {
    backgroundColor: theme.secondary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  infoBadgeText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  resumeList: {
    gap: 10,
  },
  resumeCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 6,
  },
  resumeTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
  },
  resumeMeta: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  resumeAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resumeActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
  },
  activityFeed: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
  },
  activityTimeline: {
    alignItems: "center",
    width: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginTop: 4,
  },
  activityLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.border,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 6,
  },
  activityText: {
    fontSize: 12,
    color: theme.foreground,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  activityMetaText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  activityBadge: {
    backgroundColor: theme.secondary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activityBadgeText: {
    fontSize: 10,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  emptyText: {
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  skeletonCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  skeletonStack: {
    gap: 8,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.secondary,
  },
  skeletonLineMedium: {
    width: "60%",
  },
  skeletonLineWide: {
    width: "90%",
  },
});
