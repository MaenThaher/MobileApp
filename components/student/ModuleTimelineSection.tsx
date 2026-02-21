import { theme } from "@/constants/colors";
import type {
  ModuleStatus,
  ModuleTimelineData,
} from "@/utils/studentStatusHelpers";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ModuleTimelineSectionProps = {
  moduleItems: ModuleTimelineData[];
  moduleCount: number;
};

const MODULE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Lecture: "book-open",
  Slides: "file-text",
  Lab: "activity",
  Assignment: "clipboard",
  Quiz: "check-circle",
};

const STATUS_STYLES: Record<ModuleStatus, { dot: string; text: string }> = {
  completed: { dot: "#10b981", text: "#10b981" },
  closed: { dot: theme.destructive, text: theme.destructive },
  locked: { dot: theme.mutedForeground, text: theme.mutedForeground },
  in_progress: { dot: theme.accent, text: theme.accent },
  available: { dot: theme.primary, text: theme.primary },
};

export function ModuleTimelineSection({
  moduleItems,
  moduleCount,
}: ModuleTimelineSectionProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Module timeline</Text>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>{moduleCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.timeline}>
        {moduleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No modules have been published yet.
            </Text>
          </View>
        ) : (
          moduleItems.map((item, index) => {
            const statusStyle = STATUS_STYLES[item.status];
            const iconName = MODULE_ICONS[item.type] ?? "file-text";

            return (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: statusStyle.dot },
                    ]}
                  />
                  {index < moduleItems.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineCard}>
                  <View style={styles.moduleHeader}>
                    <View style={styles.moduleIcon}>
                      <Feather name={iconName} size={18} color={theme.primary} />
                    </View>
                    <View style={styles.moduleMain}>
                      <Text style={styles.moduleTitle}>{item.title}</Text>
                      <Text style={styles.moduleMeta}>{item.type}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusStyle.text}1F` },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusStyle.text }]}
                      >
                        {item.statusLabel}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.moduleDetails}>
                    <Text style={styles.moduleSchedule}>
                      {item.scheduleLabel}
                    </Text>
                    {item.lockLabel && (
                      <Text style={styles.moduleLock}>{item.lockLabel}</Text>
                    )}
                  </View>
                  <View style={styles.moduleActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push(item.actionHref as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionButtonText}>
                        {item.actionLabel}
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={14}
                        color={theme.primaryForeground}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
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
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineMarker: {
    alignItems: "center",
    width: 18,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.border,
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleMain: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  moduleMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  moduleDetails: {
    gap: 6,
  },
  moduleSchedule: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  moduleLock: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  moduleActions: {
    alignItems: "flex-start",
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
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  emptyState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  emptyText: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
});
