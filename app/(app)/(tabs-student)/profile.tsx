import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentDashboard } from "@/services/studentService";
import type {
  StudentDashboardData,
  StudentModuleItem,
  StudentRecentFeedbackItem,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
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
  type: string;
  courseLabel: string;
  actionHref: string;
  statusLabel: string;
  timeLabel: string;
  isOverdue: boolean;
  isDueSoon: boolean;
};

const calculateAverageProgress = (enrollments: StudentDashboardData["enrollments"]) =>
  enrollments.length
    ? Math.round(
        enrollments.reduce((acc, item) => acc + (item.progress ?? 0), 0) /
          enrollments.length
      )
    : 0;

const getTypeIconName = (type: string): keyof typeof Feather.glyphMap => {
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
    let statusLabel = "Not started";
    if (submissionStatus === "in_progress") statusLabel = "In progress";
    if (submissionStatus === "submitted") statusLabel = "Submitted";
    if (submissionStatus === "graded") statusLabel = "Graded";

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
      type: item.type,
      courseLabel: formatCourseName(item.course_code, item.course_name),
      actionHref: `/(app)/(tabs-student)/courses/${item.course_id}/assignments/${item.assignment_id}`,
      statusLabel,
      timeLabel,
      isOverdue,
      isDueSoon,
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
      type: item.type,
      courseLabel: formatCourseName(item.course_code, item.course_name),
      actionHref: `/(app)/(tabs-student)/courses/${item.course_id}/modules/${item.module_id}/quiz`,
      statusLabel,
      timeLabel,
      isOverdue,
      isDueSoon,
    };
  }

  if (!item.course_id) return null;

  return {
    id: item.module_id ?? item.course_id,
    title: item.title,
    type: item.type,
    courseLabel: formatCourseName(item.course_code, item.course_name),
    actionHref: `/(app)/(tabs-student)/courses/${item.course_id}`,
    statusLabel: "Next to open",
    timeLabel: "Ready to start",
    isOverdue: false,
    isDueSoon: false,
  };
};

const StatCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  tone: "primary" | "accent" | "success" | "warning";
}) => {
  const toneStyles = {
    primary: { bg: "rgba(59, 130, 246, 0.12)", color: theme.primary },
    accent: { bg: "rgba(129, 140, 248, 0.12)", color: theme.accent },
    success: { bg: "rgba(16, 185, 129, 0.12)", color: "#10b981" },
    warning: { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" },
  } as const;
  const toneStyle = toneStyles[tone];

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: toneStyle.bg }]}>
        <Feather name={icon} size={18} color={toneStyle.color} />
      </View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
};

const FeedbackCard = ({ item }: { item: StudentRecentFeedbackItem }) => {
  const router = useRouter();
  const scoreLabel =
    item.grade !== null && item.max_score
      ? `Graded ${item.grade}/${item.max_score}`
      : "Feedback added";
  const feedbackPreview =
    truncateText(item.feedback, 90) || "No feedback provided.";
  const actionHref =
    item.id && item.course_id
      ? `/(app)/(tabs-student)/courses/${item.course_id}/assignments/${item.id}`
      : "";

  return (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => actionHref && router.push(actionHref as any)}
      activeOpacity={0.7}
    >
      <View style={styles.feedbackHeader}>
        <Feather name="check-circle" size={16} color={theme.primary} />
        <Text style={styles.feedbackTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <Text style={styles.feedbackMeta}>
        {formatCourseName(item.course_code, item.course_name)} • {scoreLabel}
      </Text>
      <Text style={styles.feedbackPreview} numberOfLines={2}>
        {feedbackPreview}
      </Text>
      <Text style={styles.feedbackDate}>{formatDate(item.date)}</Text>
    </TouchableOpacity>
  );
};

export default function StudentProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const studentId = user?.id ?? null;

  const fetchProfileData = useCallback(
    async (isRefresh = false) => {
      if (!studentId) return;

      try {
        if (!isRefresh) setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentDashboard(studentId);
        setDashboardData(data);
      } catch (error) {
        console.error("Error loading student profile:", error);
        setErrorMessage("Failed to load profile details.");
      } finally {
        setIsLoading(false);
        if (isRefresh) setIsRefreshing(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfileData(true);
  };

  const enrollments = dashboardData?.enrollments ?? [];
  const recentFeedback = dashboardData?.recentFeedback ?? [];
  const activities = dashboardData?.activities ?? [];
  const nextModules = dashboardData?.nextModules ?? [];

  const resumeCount =
    (dashboardData?.resumeAssignments?.length ?? 0) +
    (dashboardData?.resumeQuizzes?.length ?? 0) +
    (dashboardData?.resumeModules?.length ?? 0);

  const averageProgress = useMemo(
    () => calculateAverageProgress(enrollments),
    [enrollments]
  );

  const nextUpItems = useMemo(() => {
    const now = new Date();
    return nextModules
      .map((item) => buildNextUpItem(item, now))
      .filter((item): item is NextUpItem => Boolean(item))
      .slice(0, 3);
  }, [nextModules]);

  const userInitial =
    user?.full_name?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U";

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={styles.emptyText}>Sign in to view your profile.</Text>
      </View>
    );
  }

  if (isLoading && !dashboardData) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {user.full_name}
                </Text>
                <View style={styles.rolePill}>
                  <Text style={styles.roleText}>Student</Text>
                </View>
              </View>
              <Text style={styles.emailText} numberOfLines={1}>
                {user.email}
              </Text>
              <Text style={styles.lastActiveText}>
                Last active {formatTimeAgo(user.last_active)}
              </Text>
            </View>
          </View>
          <Text style={styles.bioText}>
            {user.bio || "Add a short bio to share your learning goals."}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Member since</Text>
              <Text style={styles.metaValue}>{formatDate(user.created_at)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Active courses</Text>
              <Text style={styles.metaValue}>{enrollments.length}</Text>
            </View>
          </View>
        </View>

        {errorMessage && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <StatCard
            label="Courses"
            value={enrollments.length}
            icon="book-open"
            tone="primary"
          />
          <StatCard
            label="Avg progress"
            value={`${averageProgress}%`}
            icon="trending-up"
            tone="success"
          />
          <StatCard
            label="In progress"
            value={resumeCount}
            icon="play-circle"
            tone="accent"
          />
          <StatCard
            label="Upcoming"
            value={nextModules.length}
            icon="calendar"
            tone="warning"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next up</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/calendar` as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>Calendar</Text>
              <Feather name="arrow-right" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {nextUpItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming items yet.</Text>
            </View>
          ) : (
            nextUpItems.map((item) => {
              const badgeStyle = item.isOverdue
                ? styles.badgeOverdue
                : item.isDueSoon
                ? styles.badgeSoon
                : styles.badgeNeutral;
              const badgeText = item.isOverdue
                ? "Overdue"
                : item.isDueSoon
                ? "Due soon"
                : item.statusLabel;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.nextUpCard}
                  onPress={() => router.push(item.actionHref as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.nextUpIcon}>
                    <Feather
                      name={getTypeIconName(item.type)}
                      size={18}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.nextUpContent}>
                    <Text style={styles.nextUpTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.nextUpMeta} numberOfLines={1}>
                      {item.courseLabel}
                    </Text>
                    <View style={styles.nextUpFooter}>
                      <View style={[styles.badge, badgeStyle]}>
                        <Text style={styles.badgeText}>{badgeText}</Text>
                      </View>
                      <Text style={styles.nextUpTime}>{item.timeLabel}</Text>
                    </View>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={theme.mutedForeground}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent feedback</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/courses` as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>Courses</Text>
              <Feather name="arrow-right" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {recentFeedback.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No feedback yet.</Text>
            </View>
          ) : (
            recentFeedback.slice(0, 2).map((item, index) => (
              <FeedbackCard key={`${item.kind}-${index}`} item={item} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
          </View>
          {activities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent activity.</Text>
            </View>
          ) : (
            activities.slice(0, 3).map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.activityItem}>
                <View style={styles.activityTimeline}>
                  <View style={styles.activityDot} />
                  {index !== Math.min(activities.length, 3) - 1 && (
                    <View style={styles.activityLine} />
                  )}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{item.description}</Text>
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
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/courses` as any)
              }
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Feather name="book" size={18} color={theme.primary} />
              </View>
              <Text style={styles.actionText}>My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/calendar` as any)
              }
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Feather name="calendar" size={18} color={theme.primary} />
              </View>
              <Text style={styles.actionText}>Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logout()}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={18} color={theme.destructive} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.foreground,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: theme.foreground,
  },
  rolePill: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.primary,
  },
  emailText: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  lastActiveText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  bioText: {
    fontSize: 13,
    color: theme.foreground,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    color: theme.mutedForeground,
    letterSpacing: 0.6,
  },
  metaValue: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: theme.destructive,
    fontSize: 12,
  },
  statsGrid: {
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
    borderRadius: 16,
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
  emptyCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  emptyText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  nextUpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  nextUpIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  nextUpContent: {
    flex: 1,
    gap: 4,
  },
  nextUpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  nextUpMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  nextUpFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nextUpTime: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.foreground,
  },
  badgeOverdue: {
    backgroundColor: "rgba(239, 68, 68, 0.18)",
  },
  badgeSoon: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  badgeNeutral: {
    backgroundColor: theme.secondary,
  },
  feedbackCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 8,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
    flex: 1,
  },
  feedbackMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  feedbackPreview: {
    fontSize: 12,
    color: theme.foreground,
    lineHeight: 18,
  },
  feedbackDate: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
  },
  activityTimeline: {
    alignItems: "center",
    width: 18,
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
    marginVertical: 4,
  },
  activityContent: {
    flex: 1,
    gap: 6,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  activityText: {
    fontSize: 13,
    color: theme.foreground,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityMetaText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  activityBadge: {
    backgroundColor: theme.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activityBadgeText: {
    fontSize: 10,
    color: theme.mutedForeground,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flexBasis: 150,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.destructive,
  },
});
