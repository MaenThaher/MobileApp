import { theme } from "@/constants/colors";
import type {
  StudentAssignment,
  StudentCourseDetail,
  StudentQuiz,
} from "@/types/serviceTypes";
import type { ModuleTimelineData } from "@/utils/studentStatusHelpers";
import { buildAttachments, getNextItem } from "@/utils/studentStatusHelpers";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CourseDetailSidebarProps = {
  courseId: string;
  moduleItems: ModuleTimelineData[];
  slideDecks: StudentCourseDetail["slide_decks"];
  assignments: StudentAssignment[];
  quizzes: StudentQuiz[];
  modules: StudentCourseDetail["modules"];
};

export function CourseDetailSidebar({
  courseId,
  moduleItems,
  slideDecks,
  assignments,
  quizzes,
  modules,
}: CourseDetailSidebarProps) {
  const router = useRouter();

  const nextItem = useMemo(
    () => getNextItem(assignments, quizzes, moduleItems, courseId),
    [assignments, quizzes, moduleItems, courseId]
  );

  const attachments = useMemo(
    () => buildAttachments(assignments, modules),
    [assignments, modules]
  );

  const getButtonLabel = () => {
    if (!nextItem) return "No items yet";
    if (nextItem.status === "in_progress") return "Resume next item";
    if (nextItem.status === "overdue") return "Complete overdue item";
    return "Start next item";
  };

  const handleOpenUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start next item</Text>
        {nextItem ? (
          nextItem.isLocked ? (
            <View style={styles.disabledButton}>
              <Text style={styles.disabledButtonText}>Locked</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push(nextItem.actionHref as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>{getButtonLabel()}</Text>
              <Feather name="arrow-right" size={16} color={theme.white} />
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.disabledButton}>
            <Text style={styles.disabledButtonText}>No items yet</Text>
          </View>
        )}
        <Text style={styles.hintText}>
          {nextItem
            ? `Next up: ${nextItem.title}`
            : "Check back once items are published."}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity
            style={styles.sectionAction}
            onPress={() =>
              router.push(
                `/(app)/(tabs-student)/courses/${courseId}/resources` as any
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.sectionActionText}>View all</Text>
            <Feather name="arrow-right" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.resourceGroup}>
          <Text style={styles.resourceTitle}>Slide decks</Text>
          {slideDecks.length === 0 ? (
            <Text style={styles.emptyText}>No slide decks yet.</Text>
          ) : (
            slideDecks.map((deck) => (
              <View key={deck.id} style={styles.resourceRow}>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceName}>{deck.filename}</Text>
                  <Text style={styles.resourceMeta}>
                    {deck.file_type.toUpperCase()} -{" "}
                    {deck.total_slides ?? "Slides TBD"}
                  </Text>
                </View>
                {deck.attachment_url ? (
                  <TouchableOpacity
                    onPress={() => handleOpenUrl(deck.attachment_url!)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resourceLink}>Open</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resourceMuted}>Unavailable</Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.resourceGroup}>
          <Text style={styles.resourceTitle}>Attachments</Text>
          {attachments.length === 0 ? (
            <Text style={styles.emptyText}>No attachments yet.</Text>
          ) : (
            attachments.map((item) => (
              <View key={item.id} style={styles.resourceRow}>
                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceName}>{item.fileName}</Text>
                  <Text style={styles.resourceMeta}>
                    {item.source}: {item.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenUrl(item.url)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resourceLink}>Download</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    backgroundColor: theme.secondary,
  },
  disabledButtonText: {
    color: theme.mutedForeground,
    fontSize: 13,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionActionText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "600",
  },
  resourceGroup: {
    gap: 10,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  resourceMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  resourceLink: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "600",
  },
  resourceMuted: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  emptyText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
