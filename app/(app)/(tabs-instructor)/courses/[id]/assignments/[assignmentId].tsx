import { theme } from "@/constants/colors";
import { getInstructorAssignmentDetail } from "@/services/instructorService";
import type { Submission } from "@/types";
import type { InstructorAssignmentDetail } from "@/types/serviceTypes";
import { formatDate } from "@/utils/generalUtils";
import { formatAssignmentGrade, formatCourseName } from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterStatus = "all" | "to_grade" | "graded";

export default function AssignmentDetailScreen() {
  const { id, assignmentId } = useLocalSearchParams();
  const router = useRouter();
  const courseId = id as string;
  const assignmentIdParam = assignmentId as string;

  const [assignment, setAssignment] =
    useState<InstructorAssignmentDetail | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAssignment = async (options?: { isRefresh?: boolean }) => {
    if (!courseId || !assignmentIdParam) return;
    try {
      setErrorMessage(null);
      if (!options?.isRefresh) setIsLoading(true);
      const data = await getInstructorAssignmentDetail(
        courseId,
        assignmentIdParam
      );
      setAssignment(data);
      setSubmissions(data.submissions ?? []);
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      setErrorMessage("Failed to load assignment details.");
      setAssignment(null);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [courseId, assignmentIdParam]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAssignment({ isRefresh: true });
  };

  const maxPoints = assignment?.max_points ?? 100;

  const courseLabel = assignment
    ? formatCourseName(
        assignment.course_code ?? null,
        assignment.course_name ?? null
      )
    : "";

  const dueDateLabel = assignment?.due_date
    ? formatDate(assignment.due_date)
    : "No due date";

  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter(
    (item) => item.status === "graded"
  ).length;
  const toGradeCount = Math.max(totalSubmissions - gradedCount, 0);

  const getFilteredSubmissions = () => {
    if (filterStatus === "all") return submissions;
    if (filterStatus === "graded") {
      return submissions.filter((item) => item.status === "graded");
    }
    return submissions.filter((item) => item.status !== "graded");
  };
  const filteredSubmissions = getFilteredSubmissions();

  const getAverageScore = () => {
    const graded = submissions.filter(
      (submission) =>
        submission.status === "graded" && submission.grade !== null
    );
    if (graded.length === 0) return null;
    const total = graded.reduce(
      (sum, submission) => sum + (submission.grade ?? 0),
      0
    );
    return total / graded.length;
  };
  const averageScore = getAverageScore();

  const lateCount =
    assignment?.due_date && submissions.length
      ? submissions.filter((submission) => {
          if (!submission.submitted_at) return false;
          return (
            new Date(submission.submitted_at) >
            new Date(assignment.due_date as string)
          );
        }).length
      : 0;

  const formatSubmittedAt = (submittedAt?: string | null) => {
    if (!submittedAt) return "Not submitted";
    const date = new Date(submittedAt);
    if (Number.isNaN(date.getTime())) return "Not submitted";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSubmissionStatus = (status: Submission["status"]) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "in_progress":
        return "In Progress";
      case "not_started":
      default:
        return "Not Started";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return {
          color: "#10b981",
          background: "rgba(16, 185, 129, 0.12)",
        };
      case "closed":
        return {
          color: theme.destructive,
          background: "rgba(239, 68, 68, 0.12)",
        };
      default:
        return {
          color: theme.mutedForeground,
          background: theme.secondary,
        };
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  const handleOpenSubmission = (submissionId: string) => {
    router.push(
      `/(app)/(tabs-instructor)/courses/${courseId}/assignments/${assignmentIdParam}/submission/${submissionId}` as any
    );
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => {
    const studentName = item.student_name ?? "Unknown Student";
    const statusLabel = formatSubmissionStatus(item.status);
    const isGraded = item.status === "graded";

    return (
      <TouchableOpacity
        style={styles.submissionCard}
        onPress={() => handleOpenSubmission(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.submissionHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{studentName.charAt(0)}</Text>
          </View>
          <View style={styles.submissionInfo}>
            <Text style={styles.submissionName} numberOfLines={1}>
              {studentName}
            </Text>
            <Text style={styles.submissionMeta}>
              {formatSubmittedAt(item.submitted_at)}
            </Text>
          </View>
          <View style={styles.submissionGrade}>
            <Text style={styles.gradeValue}>
              {formatAssignmentGrade(item.grade, maxPoints)}
            </Text>
            <Text style={styles.gradeLabel}>Grade</Text>
          </View>
        </View>

        <View style={styles.submissionFooter}>
          <View
            style={[
              styles.statusPill,
              isGraded ? styles.statusPillSuccess : styles.statusPillWarning,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isGraded
                  ? styles.statusPillTextSuccess
                  : styles.statusPillTextWarning,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={theme.mutedForeground}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!assignment) return null;
    const statusStyles = getStatusStyles(assignment.status);

    return (
      <View>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={theme.foreground} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle} numberOfLines={1}>
            Assignment
          </Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.summaryCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyles.background },
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: statusStyles.color }]}>
              {assignment.status}
            </Text>
          </View>
          <Text style={styles.title}>{assignment.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather
                name="book-open"
                size={14}
                color={theme.mutedForeground}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {courseLabel}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={theme.mutedForeground} />
              <Text style={styles.metaText}>Due {dueDateLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalSubmissions}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gradedCount}</Text>
            <Text style={styles.statLabel}>Graded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{toGradeCount}</Text>
            <Text style={styles.statLabel}>To Grade</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {averageScore !== null ? averageScore.toFixed(1) : "—"}
            </Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lateCount}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailText}>
              {assignment.description || "No description provided."}
            </Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Instructions</Text>
            <Text style={styles.detailText}>
              {assignment.instructions || "No instructions provided."}
            </Text>
          </View>

          {assignment.attachment_url && (
            <TouchableOpacity
              style={styles.attachmentRow}
              onPress={() => openLink(assignment.attachment_url!)}
            >
              <View style={styles.attachmentIcon}>
                <Feather name="file-text" size={18} color={theme.primary} />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentLabel}>Assignment File</Text>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  Open attachment
                </Text>
              </View>
              <Feather
                name="external-link"
                size={16}
                color={theme.mutedForeground}
              />
            </TouchableOpacity>
          )}

          {assignment.template_id && (
            <View style={styles.templateRow}>
              <Feather name="check-circle" size={16} color={theme.accent} />
              <Text style={styles.templateText}>
                Template ID: {assignment.template_id}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filterStatus === "all" && styles.filterPillActive,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "all" && styles.filterTextActive,
              ]}
            >
              All ({totalSubmissions})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filterStatus === "to_grade" && styles.filterPillActive,
            ]}
            onPress={() => setFilterStatus("to_grade")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "to_grade" && styles.filterTextActive,
              ]}
            >
              To Grade ({toGradeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filterStatus === "graded" && styles.filterPillActive,
            ]}
            onPress={() => setFilterStatus("graded")}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === "graded" && styles.filterTextActive,
              ]}
            >
              Graded ({gradedCount})
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.submissionsTitle}>Student Submissions</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={40} color={theme.muted} />
      <Text style={styles.emptyTitle}>No submissions found</Text>
      <Text style={styles.emptyText}>
        {submissions.length === 0
          ? "No submissions yet."
          : "No submissions match the selected filter."}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading assignment...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.background}
        />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {errorMessage || "Assignment not found."}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchAssignment()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                `/(app)/(tabs-instructor)/courses/${courseId}/assignments` as any
              )
            }
          >
            <Text style={styles.secondaryButtonText}>Back to Assignments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={filteredSubmissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    color: theme.mutedForeground,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
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
  summaryCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.foreground,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.foreground,
    marginBottom: 8,
  },
  metaRow: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: theme.mutedForeground,
    fontSize: 13,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 92,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 12,
  },
  detailBlock: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailText: {
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.secondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  attachmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentLabel: {
    color: theme.mutedForeground,
    fontSize: 12,
  },
  attachmentName: {
    color: theme.foreground,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  templateText: {
    color: theme.foreground,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterPillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  filterTextActive: {
    color: theme.primaryForeground,
  },
  submissionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 12,
  },
  submissionCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 12,
  },
  submissionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: theme.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  submissionInfo: {
    flex: 1,
  },
  submissionName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 4,
  },
  submissionMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  submissionGrade: {
    alignItems: "flex-end",
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  gradeLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
    marginTop: 2,
  },
  submissionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  statusPillWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusPillTextSuccess: {
    color: "#10b981",
  },
  statusPillTextWarning: {
    color: "#f59e0b",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.foreground,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  retryButtonText: {
    color: theme.primaryForeground,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryButtonText: {
    color: theme.foreground,
    fontWeight: "600",
  },
});
