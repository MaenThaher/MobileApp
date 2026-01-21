import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentCourseAssignments } from "@/services/studentService";
import type { SubmissionStatus } from "@/types";
import type { StudentCourseAssignmentsData } from "@/types/serviceTypes";
import { formatDate } from "@/utils/generalUtils";
import {
  buildAssignmentPageData,
  filterAndSortAssignments,
} from "@/utils/studentStatusHelpers";
import { formatCourseName } from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatusFilter = "all" | SubmissionStatus;
type TimeFilter = "all" | "upcoming" | "overdue";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
];

const timeOptions: Array<{ value: TimeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
];

export default function StudentCourseAssignmentsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.courseId as string;
  const studentId = user?.id ?? null;

  const [courseData, setCourseData] =
    useState<StudentCourseAssignmentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  useEffect(() => {
    if (!studentId || !courseId) return;

    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentCourseAssignments(courseId, studentId);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching student assignments:", error);
        setErrorMessage("Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, courseId]);

  const course = courseData?.course ?? null;
  const assignments = courseData?.assignments ?? [];

  const { assignmentMeta, overdueCount, completedCount } = useMemo(
    () =>
      buildAssignmentPageData(assignments, courseId, {
        completed: "completed",
        overdue: "overdue",
        inProgress: "inProgress",
        notStarted: "notStarted",
        submitted: "submitted",
        graded: "graded",
      }),
    [assignments, courseId]
  );

  const filteredAssignments = useMemo(
    () =>
      filterAndSortAssignments(
        assignmentMeta,
        search,
        statusFilter,
        timeFilter
      ),
    [assignmentMeta, search, statusFilter, timeFilter]
  );

  const formattedCourseName = course
    ? formatCourseName(course.code, course.name)
    : "Course";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={theme.foreground} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle} numberOfLines={1}>
            Assignments
          </Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.header}>
          <View style={styles.badges}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>
                {course?.code ?? "COURSE"}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Assignments</Text>
          <Text style={styles.subtitle}>
            Track every task for {formattedCourseName}, from drafts to graded
            submissions.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{assignments.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Submitted</Text>
            <Text style={styles.statValue}>{completedCount}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={styles.statValue}>{overdueCount}</Text>
          </View>
        </View>

        {!isLoading && overdueCount > 0 && (
          <View style={styles.overdueBanner}>
            <Feather name="alert-circle" size={16} color={theme.destructive} />
            <Text style={styles.overdueText}>
              You have {overdueCount} overdue assignment
              {overdueCount === 1 ? "" : "s"}. Submit late to keep progress.
            </Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.toolbar}>
          <View style={styles.searchWrapper}>
            <Feather name="search" size={16} color={theme.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search assignments..."
              placeholderTextColor={theme.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.filterRow}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterButton,
                    statusFilter === option.value &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setStatusFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      statusFilter === option.value &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Timeline</Text>
            <View style={styles.filterRow}>
              {timeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterButton,
                    timeFilter === option.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setTimeFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      timeFilter === option.value &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.skeletonList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.skeletonCard} />
            ))}
          </View>
        ) : filteredAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptyText}>
              Try adjusting filters or check back when new work is posted.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/courses/${courseId}` as any)
              }
            >
              <Text style={styles.primaryButtonText}>Back to course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.assignmentList}>
            {filteredAssignments.map((item) => {
              const { assignment } = item;
              const progressFillStyle = [
                styles.progressFill,
                item.isOverdue && styles.progressFillOverdue,
                item.isDueSoon && styles.progressFillUrgent,
                { width: `${item.progressPercent ?? 0}%` },
              ].filter(Boolean) as any;

              const statusStyles =
                item.isOverdue && !item.isCompleted
                  ? styles.statusOverdue
                  : item.submissionStatus === "graded"
                  ? styles.statusGraded
                  : item.submissionStatus === "submitted"
                  ? styles.statusSubmitted
                  : item.submissionStatus === "in_progress"
                  ? styles.statusInProgress
                  : styles.statusNotStarted;

              return (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View style={styles.iconBox}>
                        <Feather name="file-text" size={16} color={theme.primary} />
                      </View>
                      <View style={styles.cardTitleBlock}>
                        <Text style={styles.cardTitle}>{assignment.title}</Text>
                        {item.summaryText && (
                          <Text style={styles.cardSubtitle}>
                            {item.summaryText}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <View style={[styles.statusBadge, statusStyles]}>
                        <Text style={styles.statusBadgeText}>
                          {item.statusLabel}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.actionSecondary && styles.actionButtonSecondary,
                        ]}
                        onPress={() =>
                          router.push(item.actionHref as any)
                        }
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            item.actionSecondary &&
                              styles.actionButtonTextSecondary,
                          ]}
                        >
                          {item.actionLabel}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Feather
                        name="calendar"
                        size={14}
                        color={theme.mutedForeground}
                      />
                      <Text style={styles.metaText}>
                        {assignment.due_date
                          ? `Due ${formatDate(assignment.due_date)}`
                          : "No due date"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color={theme.mutedForeground}
                      />
                      <Text style={styles.metaText}>
                        {assignment.max_points} pts
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather
                        name="award"
                        size={14}
                        color={theme.mutedForeground}
                      />
                      <Text style={styles.metaText}>
                        Grade: {item.gradeLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View style={progressFillStyle} />
                    </View>
                    <View style={styles.progressText}>
                      <Feather
                        name="clock"
                        size={14}
                        color={theme.mutedForeground}
                      />
                      <Text style={styles.progressLabel}>{item.timeLabel}</Text>
                    </View>
                  </View>

                  {item.draftLabel && (
                    <Text style={styles.draftMeta}>{item.draftLabel}</Text>
                  )}

                  {item.isOverdue && !item.isCompleted && (
                    <View style={styles.overdueRow}>
                      <Feather name="alert-circle" size={14} color={theme.destructive} />
                      <Text style={styles.overdueRowText}>
                        Overdue - submit as soon as possible.
                      </Text>
                    </View>
                  )}

                  {item.lateLabel && (
                    <View style={styles.lateWarning}>
                      <Feather name="alert-circle" size={14} color={theme.destructive} />
                      <Text style={styles.overdueRowText}>
                        Submitted {item.lateLabel}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.card,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  header: {
    marginBottom: 16,
    gap: 8,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  codeBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeBadgeText: {
    color: theme.primaryForeground,
    fontSize: 11,
    fontWeight: "700",
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
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
  overdueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginBottom: 12,
  },
  overdueText: {
    flex: 1,
    fontSize: 12,
    color: theme.foreground,
  },
  errorState: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.destructive,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    color: theme.destructive,
    fontSize: 13,
  },
  toolbar: {
    gap: 12,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.foreground,
    fontSize: 14,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  filterButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.foreground,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: theme.primaryForeground,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 140,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  emptyText: {
    fontSize: 13,
    color: theme.mutedForeground,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.primary,
  },
  primaryButtonText: {
    color: theme.primaryForeground,
    fontWeight: "600",
  },
  assignmentList: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  cardActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.foreground,
  },
  statusOverdue: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  statusSubmitted: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  statusGraded: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  statusInProgress: {
    backgroundColor: "rgba(129, 140, 248, 0.12)",
  },
  statusNotStarted: {
    backgroundColor: theme.secondary,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.primary,
  },
  actionButtonSecondary: {
    backgroundColor: theme.secondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionButtonText: {
    fontSize: 12,
    color: theme.primaryForeground,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    color: theme.foreground,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  progressRow: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.secondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
  },
  progressFillOverdue: {
    backgroundColor: theme.destructive,
  },
  progressFillUrgent: {
    backgroundColor: "#f59e0b",
  },
  progressText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  draftMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  overdueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  overdueRowText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  lateWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
