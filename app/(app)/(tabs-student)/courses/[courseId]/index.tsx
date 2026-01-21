import { CourseDetailSidebar } from "@/components/student/CourseDetailSidebar";
import { ModuleTimelineSection } from "@/components/student/ModuleTimelineSection";
import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentCourseDetail } from "@/services/studentService";
import type { StudentCourseDetail } from "@/types/serviceTypes";
import { clampNumber } from "@/utils/generalUtils";
import {
  buildAssignmentCard,
  buildModuleTimeline,
  buildQuizSummary,
  getNextDueContent,
  getNextDueItems,
  selectNextEvent,
} from "@/utils/studentStatusHelpers";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_STYLES = {
  completed: { backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" },
  overdue: { backgroundColor: "rgba(239, 68, 68, 0.12)", color: theme.destructive },
  upcoming: { backgroundColor: "rgba(59, 130, 246, 0.12)", color: theme.primary },
} as const;

export default function StudentCourseDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.courseId as string;
  const studentId = user?.id ?? null;

  const [courseData, setCourseData] = useState<StudentCourseDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !courseId) return;

    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentCourseDetail(courseId, studentId);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching student course detail:", error);
        setErrorMessage("Failed to load course details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [studentId, courseId]);

  const {
    course,
    instructor,
    modules,
    assignments,
    quizzes,
    slide_decks: slideDecks,
    progress: rawProgress,
  } = courseData ?? {
    course: null,
    instructor: null,
    modules: [],
    assignments: [],
    quizzes: [],
    slide_decks: [],
    progress: 0,
  };

  const progressValue = clampNumber(Math.round(rawProgress ?? 0), 0, 100);

  const moduleItems = useMemo(
    () => buildModuleTimeline(modules, quizzes, courseId),
    [modules, quizzes, courseId]
  );

  const quizSummary = useMemo(
    () => buildQuizSummary(quizzes, courseId),
    [quizzes, courseId]
  );

  const nextDueContent = useMemo(() => {
    const now = new Date();
    const candidates = getNextDueItems(assignments, quizzes, now);
    const nextDue = selectNextEvent(candidates, now, (item) => item.date);
    return getNextDueContent(nextDue);
  }, [assignments, quizzes]);

  const assignmentsSorted = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const aTime = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const bTime = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return aTime - bTime;
    });
  }, [assignments]);

  const instructorEmail = instructor?.email ?? null;

  const handleEmailPress = async (email: string) => {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      console.error("Failed to open email:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            style={styles.breadcrumbLink}
            onPress={() =>
              router.push(`/(app)/(tabs-student)/courses` as any)
            }
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color={theme.foreground} />
            <Text style={styles.breadcrumbText}>Courses</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}>/</Text>
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
            {course?.code ?? "Course"}
          </Text>
        </View>

        {errorMessage && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Loading course...</Text>
          </View>
        ) : !courseData || !course ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Course not found.</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.badges}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>
                    {course.code ?? "COURSE"}
                  </Text>
                </View>
                <View style={styles.semesterBadge}>
                  <Text style={styles.semesterText}>
                    {course.semester ?? "Semester TBD"}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>{course.name}</Text>
              {course.description && (
                <Text style={styles.description}>{course.description}</Text>
              )}

              <View style={styles.instructorInfo}>
                <Text style={styles.instructorLabel}>Instructor</Text>
                <View style={styles.instructorDetails}>
                  <Text style={styles.instructorName}>
                    {instructor?.full_name ?? "Instructor TBD"}
                  </Text>
                  {instructorEmail && (
                    <TouchableOpacity
                      style={styles.instructorEmail}
                      onPress={() => handleEmailPress(instructorEmail)}
                      activeOpacity={0.7}
                    >
                      <Feather name="mail" size={14} color={theme.primary} />
                      <Text style={styles.instructorEmailText}>
                        {instructorEmail}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.progressCard]}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressValue}>{progressValue}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressValue}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>Completion</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statLabelRow}>
                  <Feather
                    name="calendar"
                    size={14}
                    color={theme.mutedForeground}
                  />
                  <Text style={styles.statLabel}>Next due</Text>
                </View>
                <Text
                  style={[
                    styles.statValue,
                    nextDueContent.isOverdue && styles.statValueOverdue,
                  ]}
                >
                  {nextDueContent.title}
                </Text>
                <Text style={styles.statMeta}>{nextDueContent.meta}</Text>
              </View>
            </View>

            <ModuleTimelineSection
              moduleItems={moduleItems}
              moduleCount={modules.length}
            />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Assignments</Text>
                  <View style={styles.sectionCount}>
                    <Text style={styles.sectionCountText}>
                      {assignments.length}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.sectionAction}
                  onPress={() =>
                    router.push(
                      `/(app)/(tabs-student)/courses/${courseId}/assignments` as any
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionActionText}>View all</Text>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.assignmentList}>
                {assignmentsSorted.length === 0 ? (
                  <Text style={styles.sectionEmpty}>
                    No assignments published yet.
                  </Text>
                ) : (
                  assignmentsSorted.slice(0, 4).map((assignment) => {
                    const card = buildAssignmentCard(assignment, courseId, {
                      completed: "completed",
                      overdue: "overdue",
                      upcoming: "upcoming",
                    });
                    const statusStyle =
                      STATUS_STYLES[card.status] ?? STATUS_STYLES.upcoming;
                    const actionIconColor = card.actionSecondary
                      ? theme.foreground
                      : theme.primaryForeground;

                    return (
                      <View key={assignment.id} style={styles.assignmentCard}>
                        <View style={styles.assignmentHeader}>
                          <View style={styles.assignmentInfo}>
                            <Text style={styles.assignmentTitle}>
                              {assignment.title}
                            </Text>
                            <View style={styles.assignmentMeta}>
                              <Text style={styles.assignmentMetaText}>
                                {card.timeLabel}
                              </Text>
                              <Text style={styles.assignmentDate}>
                                {card.dateLabel}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusStyle.backgroundColor },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: statusStyle.color },
                              ]}
                            >
                              {card.statusLabel}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.assignmentFooter}>
                          <Text style={styles.assignmentStatus}>
                            Status: {card.statusLabel}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              card.actionSecondary &&
                                styles.actionButtonSecondary,
                            ]}
                            onPress={() => router.push(card.actionHref as any)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.actionButtonText,
                                card.actionSecondary &&
                                  styles.actionButtonTextSecondary,
                              ]}
                            >
                              {card.actionLabel}
                            </Text>
                            <Feather
                              name="arrow-right"
                              size={14}
                              color={actionIconColor}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Quizzes</Text>
                  <View style={styles.sectionCount}>
                    <Text style={styles.sectionCountText}>
                      {quizzes.length}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.sectionAction}
                  onPress={() =>
                    router.push(
                      `/(app)/(tabs-student)/courses/${courseId}/quizzes` as any
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionActionText}>View all</Text>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.quizCard}>
                <View style={styles.quizStatsRow}>
                  <View style={styles.quizStat}>
                    <Text style={styles.quizStatLabel}>Completed</Text>
                    <Text style={styles.quizStatValue}>
                      {quizSummary.completed}/{quizSummary.total}
                    </Text>
                  </View>
                  <View style={styles.quizStat}>
                    <Text style={styles.quizStatLabel}>In progress</Text>
                    <Text style={styles.quizStatValue}>
                      {quizSummary.inProgress}
                    </Text>
                  </View>
                </View>

                {quizSummary.nextQuiz ? (
                  <View style={styles.quizNext}>
                    <View style={styles.quizNextInfo}>
                      <Text style={styles.quizNextTitle}>
                        {quizSummary.nextQuiz.title}
                      </Text>
                      <View style={styles.quizNextMeta}>
                        {(() => {
                          const statusStyle =
                            STATUS_STYLES[quizSummary.nextQuiz!.status] ??
                            STATUS_STYLES.upcoming;
                          const statusLabel =
                            quizSummary.nextQuiz!.status === "completed"
                              ? "Completed"
                              : quizSummary.nextQuiz!.status === "overdue"
                              ? "Closed"
                              : "Upcoming";

                          return (
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor: statusStyle.backgroundColor,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  { color: statusStyle.color },
                                ]}
                              >
                                {statusLabel}
                              </Text>
                            </View>
                          );
                        })()}
                        <Text style={styles.quizNextMetaText}>
                          {quizSummary.nextQuiz!.timeLabel}
                        </Text>
                        <Text style={styles.quizNextDate}>
                          {quizSummary.nextQuiz!.dateLabel}
                        </Text>
                        <Text style={styles.quizNextProgress}>
                          {quizSummary.nextQuiz!.progressLabel}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push(quizSummary.nextQuiz!.actionHref as any)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>
                        {quizSummary.nextQuiz!.actionLabel}
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={14}
                        color={theme.primaryForeground}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.sectionEmpty}>No upcoming quizzes.</Text>
                )}
              </View>
            </View>

            <CourseDetailSidebar
              courseId={courseId}
              moduleItems={moduleItems}
              slideDecks={slideDecks}
              assignments={assignments}
              quizzes={quizzes}
              modules={modules}
            />
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
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breadcrumbLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  breadcrumbSeparator: {
    color: theme.mutedForeground,
    fontSize: 12,
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: theme.mutedForeground,
    flexShrink: 1,
  },
  errorState: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    padding: 12,
  },
  errorText: {
    color: theme.destructive,
    fontSize: 12,
  },
  loadingState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  emptyState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 14,
    color: theme.foreground,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  header: {
    gap: 10,
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
  semesterBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  semesterText: {
    color: theme.mutedForeground,
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.foreground,
  },
  description: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  instructorInfo: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 6,
  },
  instructorLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  instructorDetails: {
    gap: 6,
  },
  instructorName: {
    fontSize: 14,
    color: theme.foreground,
    fontWeight: "600",
  },
  instructorEmail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  instructorEmailText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 6,
    flexGrow: 1,
    flexBasis: 140,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  statValueOverdue: {
    color: theme.destructive,
  },
  statMeta: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  progressCard: {
    alignItems: "center",
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: theme.primary,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.foreground,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.secondary,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  sectionCount: {
    backgroundColor: theme.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 12,
    color: theme.mutedForeground,
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
    fontSize: 12,
    color: theme.mutedForeground,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  assignmentList: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  assignmentInfo: {
    flex: 1,
    gap: 6,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  assignmentMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  assignmentMetaText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  assignmentDate: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
  },
  assignmentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  assignmentStatus: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  actionButtonTextSecondary: {
    color: theme.foreground,
  },
  quizCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 16,
  },
  quizStatsRow: {
    flexDirection: "row",
    gap: 24,
  },
  quizStat: {
    gap: 4,
  },
  quizStatLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  quizStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.foreground,
  },
  quizNext: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    gap: 12,
  },
  quizNextInfo: {
    gap: 8,
  },
  quizNextTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  quizNextMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  quizNextMetaText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  quizNextDate: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  quizNextProgress: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
