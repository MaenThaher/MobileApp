import { FileUploadField } from "@/components/FileUploadField";
import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
  getStudentAssignmentDetail,
  updateStudentAssignmentSubmission,
} from "@/services/studentService";
import type { Submission, SubmissionStatus } from "@/types";
import type {
  StudentAssignment,
  StudentAssignmentDetailData,
} from "@/types/serviceTypes";
import {
  deriveFileNameFromUrl,
  formatDate,
  formatRelativeTime,
  formatTimeAgo,
  parseDate,
} from "@/utils/generalUtils";
import { getAssignmentStatusLabel } from "@/utils/studentStatusHelpers";
import {
  formatAssignmentGrade,
  formatCourseName,
  formatLateDuration,
} from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_SUBMISSION_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_MIME_TYPE_PREFIXES = ["image/"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.rar",
];

function resolveSubmissionStatus(
  assignment: StudentAssignment | null
): SubmissionStatus {
  return assignment?.submission_status ?? "not_started";
}

function getStatusStyles(status: SubmissionStatus, isOverdue: boolean) {
  if (isOverdue && status !== "submitted" && status !== "graded") {
    return {
      color: theme.destructive,
      backgroundColor: "rgba(239, 68, 68, 0.12)",
    };
  }

  switch (status) {
    case "graded":
      return {
        color: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
      };
    case "submitted":
      return {
        color: theme.primary,
        backgroundColor: "rgba(59, 130, 246, 0.12)",
      };
    case "in_progress":
      return {
        color: theme.accent,
        backgroundColor: "rgba(129, 140, 248, 0.12)",
      };
    default:
      return {
        color: theme.mutedForeground,
        backgroundColor: theme.secondary,
      };
  }
}

function getAssignmentMeta(
  assignment: StudentAssignment | null,
  submissionStatus: SubmissionStatus
) {
  if (!assignment) {
    return {
      dueLabel: "No due date",
      statusLabel: "Not started",
      statusStyles: getStatusStyles("not_started", false),
      timeLabel: "Self-paced",
      isOverdue: false,
      isDueSoon: false,
      isCompleted: false,
      gradeLabel: "—",
      lateLabel: null,
      draftLabel: null,
    };
  }

  const now = new Date();
  const dueDate = parseDate(assignment.due_date);
  const timeMeta = dueDate ? formatRelativeTime(dueDate, now) : null;
  const isCompleted =
    submissionStatus === "submitted" || submissionStatus === "graded";
  const isOverdue = Boolean(timeMeta?.isOverdue && !isCompleted);
  const isDueSoon = Boolean(timeMeta?.isDueSoon && !isCompleted);

  const timeLabel = dueDate
    ? timeMeta?.isOverdue
      ? `Overdue by ${timeMeta.label}`
      : `Due in ${timeMeta?.label ?? ""}`
    : "Self-paced";

  const gradeLabel = formatAssignmentGrade(
    assignment.submission_grade,
    assignment.max_points
  );

  const submittedAt = assignment.submission_submitted_at ?? null;
  const lateLabel =
    dueDate && submittedAt
      ? formatLateDuration(dueDate, submittedAt) || null
      : null;

  const draftLabel =
    submissionStatus === "in_progress"
      ? `Last saved ${formatTimeAgo(assignment.submission_updated_at)}`
      : null;

  return {
    dueLabel: assignment.due_date
      ? formatDate(assignment.due_date)
      : "No due date",
    statusLabel: getAssignmentStatusLabel(submissionStatus, isOverdue),
    statusStyles: getStatusStyles(submissionStatus, isOverdue),
    timeLabel: isCompleted ? "Completed" : timeLabel,
    isOverdue,
    isDueSoon,
    isCompleted,
    gradeLabel,
    lateLabel,
    draftLabel,
  };
}

function getHistoryItems(assignment: StudentAssignment | null) {
  if (!assignment) return [];
  return [
    {
      label: "Started",
      value: assignment.submission_created_at
        ? formatDate(assignment.submission_created_at)
        : "—",
    },
    {
      label: "Last saved",
      value: assignment.submission_updated_at
        ? formatTimeAgo(assignment.submission_updated_at)
        : "—",
    },
    {
      label: "Submitted",
      value: assignment.submission_submitted_at
        ? formatDate(assignment.submission_submitted_at)
        : "—",
    },
    {
      label: "Graded",
      value: assignment.submission_graded_at
        ? formatDate(assignment.submission_graded_at)
        : "—",
    },
    {
      label: "Grade",
      value:
        assignment.submission_grade !== null &&
        assignment.submission_grade !== undefined
          ? formatAssignmentGrade(
              assignment.submission_grade,
              assignment.max_points
            )
          : "—",
    },
  ];
}

export default function StudentAssignmentDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.courseId as string;
  const assignmentId = params.assignmentId as string;
  const studentId = user?.id ?? null;

  const [assignmentData, setAssignmentData] =
    useState<StudentAssignmentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [circuitId, setCircuitId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileBusy, setIsFileBusy] = useState(false);

  const populateFormFields = (
    submissionData: StudentAssignment | Submission | null
  ) => {
    if (!submissionData) return;
    const isStudentAssignment = "submission_content" in submissionData;
    setContent(
      isStudentAssignment
        ? (submissionData as StudentAssignment).submission_content ?? ""
        : (submissionData as Submission).content ?? ""
    );
    setAttachmentUrl(
      isStudentAssignment
        ? (submissionData as StudentAssignment).submission_attachment_url ?? null
        : (submissionData as Submission).attachment_url ?? null
    );
    setCircuitId(
      isStudentAssignment
        ? (submissionData as StudentAssignment).submission_circuit_id ?? ""
        : (submissionData as Submission).circuit_id ?? ""
    );
  };

  const fetchAssignment = useCallback(async () => {
    if (!studentId || !courseId || !assignmentId) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getStudentAssignmentDetail(
        courseId,
        assignmentId,
        studentId
      );
      setAssignmentData(data);
      populateFormFields(data?.assignment ?? null);
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      setErrorMessage("Failed to load assignment.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId, courseId, assignmentId]);

  useEffect(() => {
    if (studentId && courseId && assignmentId) {
      fetchAssignment();
    }
  }, [studentId, courseId, assignmentId, fetchAssignment]);

  const assignment = assignmentData?.assignment ?? null;
  const course = assignmentData?.course ?? null;
  const submissionStatus = resolveSubmissionStatus(assignment);
  const assignmentMeta = getAssignmentMeta(assignment, submissionStatus);
  const historyItems = getHistoryItems(assignment);
  const formattedCourseName = course
    ? formatCourseName(course.code, course.name)
    : "Course";

  const submissionLocked =
    submissionStatus === "graded" ||
    (assignmentMeta.isOverdue && submissionStatus === "submitted");
  const canEdit = Boolean(studentId) && !submissionLocked;
  const isBusy = isSaving || isSubmitting || isFileBusy;

  const getLockReason = () => {
    if (submissionStatus === "graded") {
      return "This assignment has been graded and cannot be edited.";
    }
    if (assignmentMeta.isOverdue && submissionStatus === "submitted") {
      return "This late submission has been locked and cannot be edited.";
    }
    return "Submission is locked.";
  };

  const handleSubmissionUpdate = async (action: "draft" | "submit") => {
    if (!assignment || !studentId || !courseId || !assignmentId) return;

    setActionError(null);
    setActionMessage(null);

    if (action === "draft") {
      setIsSaving(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const submission = await updateStudentAssignmentSubmission({
        courseId,
        assignmentId,
        studentId,
        content,
        attachmentUrl,
        circuitId: circuitId.trim() || null,
        action,
      });

      setActionMessage(action === "draft" ? "Draft saved." : "Submission sent.");
      populateFormFields(submission);

      setAssignmentData((prevData) => {
        if (!prevData?.assignment) return prevData;
        return {
          ...prevData,
          assignment: {
            ...prevData.assignment,
            submission_content: submission.content ?? null,
            submission_attachment_url: submission.attachment_url ?? null,
            submission_circuit_id: submission.circuit_id ?? null,
            submission_status: submission.status,
            submission_submitted_at: submission.submitted_at,
            submission_updated_at: submission.updated_at,
            submission_graded_at: submission.graded_at,
            submission_grade: submission.grade,
            submission_feedback: submission.feedback,
          },
        };
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      setActionError("Failed to update submission.");
    } finally {
      setIsSaving(false);
      setIsSubmitting(false);
    }
  };

  const handleOpenUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

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
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {errorMessage || "Assignment not found."}
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={fetchAssignment}
          >
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push(
                `/(app)/(tabs-student)/courses/${courseId}/assignments` as any
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              { backgroundColor: assignmentMeta.statusStyles.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: assignmentMeta.statusStyles.color },
              ]}
            >
              {assignmentMeta.statusLabel}
            </Text>
          </View>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.subtitle}>
            Work on your submission for {formattedCourseName}.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Due</Text>
              <Text style={styles.statValue}>{assignmentMeta.dueLabel}</Text>
              <Text style={styles.statMeta}>{assignmentMeta.timeLabel}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Points</Text>
              <Text style={styles.statValue}>{assignment.max_points ?? 0}</Text>
              <Text style={styles.statMeta}>Max score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Grade</Text>
              <Text style={styles.statValue}>{assignmentMeta.gradeLabel}</Text>
              <Text style={styles.statMeta}>Latest status</Text>
            </View>
          </View>
        </View>

        {assignmentMeta.isDueSoon && (
          <View style={[styles.banner, styles.bannerWarning]}>
            <Feather name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.bannerText}>
              Due soon: {assignmentMeta.timeLabel}. Save your draft early.
            </Text>
          </View>
        )}

        {assignmentMeta.isOverdue && (
          <View style={[styles.banner, styles.bannerOverdue]}>
            <Feather name="alert-circle" size={16} color={theme.destructive} />
            <Text style={styles.bannerText}>
              Overdue. You can still submit late to keep progress.
            </Text>
          </View>
        )}

        {assignmentMeta.lateLabel && (
          <View style={[styles.banner, styles.bannerLate]}>
            <Feather name="alert-circle" size={16} color={theme.destructive} />
            <Text style={styles.bannerText}>
              Submitted {assignmentMeta.lateLabel}
            </Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>
            {assignment.description || "No description provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.bodyText}>
            {assignment.instructions || "No instructions provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Attached Files</Text>
          {assignment.attachment_url ? (
            <TouchableOpacity
              style={styles.attachmentRow}
              onPress={() => handleOpenUrl(assignment.attachment_url!)}
            >
              <View style={styles.attachmentIcon}>
                <Feather name="file-text" size={18} color={theme.primary} />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {deriveFileNameFromUrl(assignment.attachment_url)}
                </Text>
                <Text style={styles.attachmentHint}>Instructor file</Text>
              </View>
              <Feather
                name="external-link"
                size={16}
                color={theme.mutedForeground}
              />
            </TouchableOpacity>
          ) : (
            <Text style={styles.bodyMuted}>
              No supporting files provided.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Submission Workspace</Text>
            {assignmentMeta.draftLabel && (
              <Text style={styles.draftLabel}>{assignmentMeta.draftLabel}</Text>
            )}
          </View>

          <Text style={styles.fieldLabel}>Submission Notes</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Write your solution, approach, or notes..."
            placeholderTextColor={theme.muted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={canEdit && !isBusy}
          />

          <View style={styles.uploadField}>
            <FileUploadField
              title="Upload submission file"
              hint="PDF, DOCX, PPTX, Images, ZIP/RAR up to 50MB"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,image/*"
              uploadEndpoint="/api/storage/submissions"
              deleteEndpoint="/api/storage/submissions"
              storageBucket="submissions"
              formData={{
                courseId,
                assignmentId,
                studentId: studentId ?? "",
              }}
              initialUrl={attachmentUrl}
              disabled={!canEdit}
              maxFileSizeBytes={MAX_SUBMISSION_SIZE_BYTES}
              maxFileSizeErrorMessage="File must be 50MB or less"
              acceptedMimeTypePrefixes={ACCEPTED_MIME_TYPE_PREFIXES}
              acceptedMimeTypes={ACCEPTED_MIME_TYPES}
              unsupportedFileTypeErrorMessage="Unsupported file type"
              selectButtonText="Select file"
              uploadingButtonText="Uploading..."
              onUrlChange={setAttachmentUrl}
              onBusyChange={setIsFileBusy}
              showCurrentFileHint
              currentFileHintPrefix="Current submission:"
            />
          </View>

          {assignment.template_id && (
            <View style={styles.templateCard}>
              <Text style={styles.templateLabel}>Circuit template</Text>
              <Text style={styles.templateValue}>
                Template ID: {assignment.template_id}
              </Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Circuit ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste your circuit ID once saved"
            placeholderTextColor={theme.muted}
            value={circuitId}
            onChangeText={setCircuitId}
            editable={canEdit && !isBusy}
          />

          {assignment.submission_circuit_id && (
            <Text style={styles.circuitHint}>
              Submitted circuit: {assignment.submission_circuit_id}
            </Text>
          )}

          {actionError && (
            <View style={styles.actionError}>
              <Text style={styles.actionErrorText}>{actionError}</Text>
            </View>
          )}
          {actionMessage && (
            <View style={styles.actionMessage}>
              <Text style={styles.actionMessageText}>{actionMessage}</Text>
            </View>
          )}

          {submissionLocked && (
            <View style={styles.lockedNotice}>
              <Text style={styles.lockedText}>{getLockReason()}</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
              onPress={() => handleSubmissionUpdate("draft")}
              disabled={!canEdit || isBusy}
            >
              <Text style={styles.secondaryButtonText}>
                {isSaving ? "Saving..." : "Save Draft"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
              onPress={() => handleSubmissionUpdate("submit")}
              disabled={!canEdit || isBusy}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting
                  ? "Submitting..."
                  : assignmentMeta.isOverdue
                  ? "Submit Late"
                  : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>

          {canEdit && (
            <View style={styles.requirementNotice}>
              <Text style={styles.requirementText}>
                Submission Requirements: You must provide at least one of:
                written notes, uploaded file, or circuit simulation.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Submission History</Text>
            <Feather name="clock" size={16} color={theme.mutedForeground} />
          </View>
          <View style={styles.historyStrip}>
            {historyItems.map((item) => (
              <View key={item.label} style={styles.historyItem}>
                <Text style={styles.historyLabel}>{item.label}</Text>
                <Text style={styles.historyValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {submissionStatus === "graded" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <View style={styles.feedbackGrid}>
              <View style={styles.feedbackStat}>
                <Text style={styles.feedbackLabel}>Grade</Text>
                <Text style={styles.feedbackValue}>
                  {assignmentMeta.gradeLabel}
                </Text>
              </View>
              <View style={styles.feedbackStat}>
                <Text style={styles.feedbackLabel}>Status</Text>
                <Text style={styles.feedbackValue}>
                  {assignmentMeta.statusLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.feedbackText}>
              {assignment.submission_feedback || "No feedback provided yet."}
            </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: theme.mutedForeground,
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
  summaryCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
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
  },
  subtitle: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  statMeta: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  bannerWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  bannerOverdue: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  bannerLate: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  bannerText: {
    flex: 1,
    color: theme.foreground,
    fontSize: 12,
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
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  bodyText: {
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
  },
  bodyMuted: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.secondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  attachmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: theme.foreground,
    fontWeight: "600",
  },
  attachmentHint: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 2,
  },
  draftLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  fieldLabel: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  textarea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    fontSize: 14,
    color: theme.foreground,
    backgroundColor: theme.input,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.foreground,
    backgroundColor: theme.input,
  },
  uploadField: {
    marginTop: 4,
  },
  templateCard: {
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 4,
  },
  templateLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  templateValue: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  circuitHint: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.primaryForeground,
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.secondary,
  },
  secondaryButtonText: {
    color: theme.foreground,
    fontWeight: "600",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionError: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.destructive,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionErrorText: {
    color: theme.destructive,
    fontSize: 12,
  },
  actionMessage: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  actionMessageText: {
    color: "#10b981",
    fontSize: 12,
  },
  lockedNotice: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
  },
  lockedText: {
    color: theme.mutedForeground,
    fontSize: 12,
  },
  requirementNotice: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
  },
  requirementText: {
    fontSize: 12,
    color: theme.mutedForeground,
    lineHeight: 18,
  },
  historyStrip: {
    gap: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  historyLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  historyValue: {
    fontSize: 12,
    color: theme.foreground,
    fontWeight: "600",
  },
  feedbackGrid: {
    flexDirection: "row",
    gap: 12,
  },
  feedbackStat: {
    flex: 1,
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 6,
  },
  feedbackLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  feedbackValue: {
    fontSize: 14,
    color: theme.foreground,
    fontWeight: "600",
  },
  feedbackText: {
    fontSize: 13,
    color: theme.foreground,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: theme.foreground,
    fontWeight: "600",
    textAlign: "center",
  },
});
