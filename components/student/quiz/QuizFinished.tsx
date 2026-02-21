import { theme } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuizFinishedProps = {
  score?: number | null;
  maxScore?: number | null;
  completedAt?: string | null;
  courseId: string;
};

export default function QuizFinished({
  score,
  maxScore,
  completedAt,
  courseId,
}: QuizFinishedProps) {
  const router = useRouter();
  const hasScore = score !== undefined && score !== null;
  const percentage =
    hasScore && maxScore ? Math.round((score / maxScore) * 100) : 0;

  let scoreColor: string = theme.foreground;
  if (hasScore) {
    if (percentage >= 80) scoreColor = "#10b981";
    else if (percentage >= 60) scoreColor = "#f59e0b";
    else scoreColor = theme.destructive;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Feather name="check" size={36} color="#10b981" />
            {hasScore && percentage >= 90 && (
              <View style={styles.trophyBadge}>
                <Feather name="award" size={16} color={theme.foreground} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Quiz Completed</Text>
          <Text style={styles.description}>
            Your attempt has been successfully submitted and recorded.
          </Text>

          {hasScore ? (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Your Score</Text>
              <View style={styles.scoreDisplay}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {score}
                </Text>
                <Text style={styles.scoreMax}>/ {maxScore || 100}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Your score is pending grading or hidden.
              </Text>
            </View>
          )}

          {completedAt && (
            <View style={styles.completionDate}>
              <Feather
                name="calendar"
                size={14}
                color={theme.mutedForeground}
              />
              <Text style={styles.completionText}>
                Submitted on {new Date(completedAt).toLocaleString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push(
                `/(app)/(tabs-student)/courses/${courseId}/modules` as any
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>Return to Modules</Text>
            <Feather name="arrow-right" size={16} color={theme.white} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.16)",
  },
  trophyBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  body: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.foreground,
  },
  description: {
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
  scoreBox: {
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 8,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  scoreMax: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  warningBox: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    padding: 12,
  },
  warningText: {
    fontSize: 12,
    color: theme.foreground,
  },
  completionDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  completionText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
