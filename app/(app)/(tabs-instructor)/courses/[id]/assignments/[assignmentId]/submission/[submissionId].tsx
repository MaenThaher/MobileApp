import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
  getInstructorSubmissionDetail,
  postInstructorSubmissionAutoGrade,
  putInstructorSubmissionGrade,
} from "@/services/instructorService";
import type { Submission } from "@/types";
import { ExtendedSubmission } from "@/types/serviceTypes";
import { deriveFileNameFromUrl, formatDate } from "@/utils/generalUtils";
import { formatLateDuration } from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function SubmissionDetailScreen() {
  const { id, assignmentId, submissionId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = id as string;
  const assignmentIdParam = assignmentId as string;
  const submissionIdParam = submissionId as string;

  const [submission, setSubmission] = useState<ExtendedSubmission | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoGrading, setIsAutoGrading] = useState(false);
  const [autoGradeMessage, setAutoGradeMessage] = useState<string | null>(null);
  const [autoGradeError, setAutoGradeError] = useState<string | null>(null);

  const fetchSubmission = async () => {
    if (!submissionIdParam) return;
    try {
      setIsLoading(true);
      const data = await getInstructorSubmissionDetail(submissionIdParam);
      setSubmission(data);
      setGrade(
        data.grade !== null && data.grade !== undefined
          ? String(data.grade)
          : ""
      );
      setFeedback(data.feedback ?? "");
    } catch (error) {
      console.error("Failed to fetch submission:", error);
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [submissionIdParam]);

  const handleOpenUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert("Unable to open link", "Please try again later.");
    }
  };

  const handleSaveGrade = async () => {
    if (!submission) return;
    if (!user?.id) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    const numericGrade = Number(grade);
    if (!grade || Number.isNaN(numericGrade)) {
      Alert.alert("Invalid grade", "Please enter a valid grade.");
      return;
    }

    setIsSaving(true);
    try {
      const updated: Submission = await putInstructorSubmissionGrade(
        submission.id,
        {
          grade: numericGrade,
          feedback,
          instructorId: user.id,
        }
      );
      setSubmission((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              status: "graded",
            }
          : prev
      );
    } catch (error) {
      console.error("Failed to save grade:", error);
      Alert.alert("Save failed", "Unable to save the grade right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoGrade = async () => {
    if (!submission) return;
    const assignment = submission.assignment;
    const hasBenchmark = Boolean(
      assignment?.attachment_url?.trim() ||
        assignment?.description?.trim() ||
        assignment?.instructions?.trim()
    );
    if (!hasBenchmark) {
      setAutoGradeError(
        "Assignment must have a file, description, or instructions to auto-grade."
      );
      return;
    }

    const hasSubmissionWork = Boolean(
      submission.content?.trim() || submission.attachment_url?.trim()
    );
    if (!hasSubmissionWork) {
      setAutoGradeError(
        "Submission must have content or an attachment to auto-grade."
      );
      return;
    }

    setAutoGradeMessage(null);
    setAutoGradeError(null);
    setIsAutoGrading(true);

    try {
      const result = await postInstructorSubmissionAutoGrade(submission.id, {
        max_points: assignment?.max_points ?? 100,
        description: assignment?.description ?? null,
        instructions: assignment?.instructions ?? null,
        assignment_attachment_url: assignment?.attachment_url ?? null,
        submission_attachment_url: submission.attachment_url ?? null,
        submission_id: submission.id,
        content: submission.content ?? null,
      });

      const suggestedGrade =
        result.grade === null || result.grade === undefined
          ? ""
          : String(result.grade);
      const suggestedFeedback =
        typeof result.feedback === "string" ? result.feedback : "";

      setGrade(suggestedGrade);
      setFeedback(suggestedFeedback);
      setAutoGradeMessage("Auto-grade suggestion ready. Review and save.");
    } catch (error) {
      console.error("Failed to auto-grade submission:", error);
      setAutoGradeError("Failed to auto-grade submission.");
    } finally {
      setIsAutoGrading(false);
    }
  };

  const getFileIconName = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) return "image";
    if (url.match(/\.(zip|rar|7z)$/i)) return "archive";
    if (url.match(/\.pdf$/i)) return "file-text";
    return "file";
  };

  const getIsLate = () => {
    if (!submission?.assignment?.due_date || !submission.submitted_at) {
      return false;
    }
    return (
      new Date(submission.submitted_at) >
      new Date(submission.assignment.due_date)
    );
  };
  const isLate = getIsLate();

  const getLateDuration = () => {
    if (!submission?.assignment?.due_date || !submission.submitted_at) return "";
    return formatLateDuration(
      submission.assignment.due_date,
      submission.submitted_at
    );
  };
  const lateDuration = getLateDuration();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading submission...</Text>
      </View>
    );
  }

  if (!submission) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.background}
        />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Submission not found.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSubmission}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const assignment = submission.assignment;
  const studentName = submission.student?.full_name ?? "Student";
  const courseCode = assignment?.course?.code ?? "Course";
  const assignmentTitle = assignment?.title ?? "Assignment";
  const maxPoints = assignment?.max_points ?? 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.push(
                `/(app)/(tabs-instructor)/courses/${courseId}/assignments/${assignmentIdParam}` as any
              )
            }
          >
            <Feather name="arrow-left" size={20} color={theme.foreground} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle} numberOfLines={1}>
            Submission
          </Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.statusBadge,
                submission.status === "graded"
                  ? styles.statusBadgeSuccess
                  : styles.statusBadgeWarning,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  submission.status === "graded"
                    ? styles.statusBadgeTextSuccess
                    : styles.statusBadgeTextWarning,
                ]}
              >
                {submission.status.replace("_", " ")}
              </Text>
            </View>
            {isLate && (
              <View style={styles.lateBadge}>
                <Feather name="alert-triangle" size={12} color="#f59e0b" />
                <Text style={styles.lateBadgeText}>
                  {lateDuration || "Late"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{studentName}'s Submission</Text>
          <Text style={styles.subtitle}>
            {assignmentTitle} • {courseCode}
          </Text>
          {autoGradeMessage && (
            <Text style={styles.helperText}>{autoGradeMessage}</Text>
          )}
          {autoGradeError && (
            <Text style={styles.errorText}>{autoGradeError}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="file-text" size={18} color={theme.mutedForeground} />
            <Text style={styles.cardTitle}>Submission Content</Text>
          </View>

          {submission.content ? (
            <Text style={styles.contentText}>{submission.content}</Text>
          ) : (
            <Text style={styles.mutedText}>No text content provided.</Text>
          )}

          {submission.attachment_url && (
            <TouchableOpacity
              style={styles.attachmentRow}
              onPress={() => handleOpenUrl(submission.attachment_url!)}
            >
              <View style={styles.attachmentIcon}>
                <Feather
                  name={getFileIconName(submission.attachment_url)}
                  size={18}
                  color={theme.primary}
                />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentLabel}>Submission File</Text>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {deriveFileNameFromUrl(submission.attachment_url)}
                </Text>
              </View>
              <Feather
                name="download"
                size={16}
                color={theme.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather
              name="check-circle"
              size={18}
              color={theme.mutedForeground}
            />
            <Text style={styles.cardTitle}>Grading & Feedback</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.gradeInputRow}>
              <TextInput
                value={grade}
                onChangeText={setGrade}
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.mutedForeground}
              />
              <Text style={styles.maxPointsText}>/ {maxPoints} pts</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Feedback</Text>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              style={[styles.input, styles.textarea]}
              placeholder="Write feedback for the student..."
              placeholderTextColor={theme.mutedForeground}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleAutoGrade}
              disabled={isAutoGrading || isSaving}
            >
              {isAutoGrading ? (
                <ActivityIndicator size="small" color={theme.foreground} />
              ) : (
                <Feather name="zap" size={16} color={theme.foreground} />
              )}
              <Text style={styles.actionButtonText}>
                {isAutoGrading ? "Auto-grading..." : "Auto Grade"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleSaveGrade}
              disabled={isSaving || isAutoGrading}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.primaryForeground}
                />
              ) : (
                <Feather
                  name="save"
                  size={16}
                  color={theme.primaryForeground}
                />
              )}
              <Text style={styles.primaryButtonText}>
                {isSaving ? "Saving..." : "Save Grade"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submission Details</Text>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color={theme.mutedForeground} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Student</Text>
              <Text style={styles.infoValue}>{studentName}</Text>
              {submission.student?.email && (
                <Text style={styles.infoSubValue}>
                  {submission.student.email}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={theme.mutedForeground} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Submitted At</Text>
              <Text style={styles.infoValue}>
                {submission.submitted_at
                  ? formatDate(submission.submitted_at)
                  : "Not submitted"}
              </Text>
            </View>
          </View>
          {assignment?.template_id && (
            <View style={styles.infoRow}>
              <Feather name="layers" size={16} color={theme.mutedForeground} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Template</Text>
                <Text style={styles.infoValue}>{assignment.template_id}</Text>
              </View>
            </View>
          )}
          {submission.circuit_id && (
            <View style={styles.infoRow}>
              <Feather name="cpu" size={16} color={theme.mutedForeground} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Circuit</Text>
                <Text style={styles.infoValue}>{submission.circuit_id}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: theme.mutedForeground,
  },
  scrollContent: {
    paddingBottom: 32,
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  statusBadgeWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statusBadgeTextSuccess: {
    color: "#10b981",
  },
  statusBadgeTextWarning: {
    color: "#f59e0b",
  },
  lateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  lateBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.foreground,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: theme.primary,
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: theme.destructive,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.foreground,
    marginBottom: 12,
  },
  mutedText: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginBottom: 12,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
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
    fontSize: 12,
    color: theme.mutedForeground,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.foreground,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.foreground,
    backgroundColor: theme.secondary,
  },
  textarea: {
    minHeight: 100,
  },
  gradeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  maxPointsText: {
    color: theme.mutedForeground,
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: theme.foreground,
    fontWeight: "600",
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: theme.primary,
  },
  primaryButtonText: {
    color: theme.primaryForeground,
    fontWeight: "600",
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: theme.secondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.foreground,
    fontWeight: "600",
  },
  infoSubValue: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 2,
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
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  retryButtonText: {
    color: theme.primaryForeground,
    fontWeight: "600",
  },
});
