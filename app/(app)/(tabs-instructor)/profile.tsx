import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
  getInstructorDashboard,
  getInstructorSubmissions,
} from "@/services/instructorService";
import type {
  InstructorDashboardData,
  InstructorSubmissionItem,
} from "@/types/serviceTypes";
import { formatDate, formatTimeAgo } from "@/utils/generalUtils";
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

const ReviewCard = ({ item }: { item: InstructorSubmissionItem }) => {
  const router = useRouter();
  const isAssignment = item.type === "assignment";
  const title = isAssignment ? item.assignment_title : item.quiz_title;
  const timestamp = item.submitted_at || item.completed_at || null;
  const isDisabled = !isAssignment || !item.assignment_id || !item.course_id;

  const handlePress = () => {
    if (isDisabled || !item.assignment_id || !item.course_id) return;
    router.push(
      `/(app)/(tabs-instructor)/courses/${item.course_id}/assignments/${item.assignment_id}/submission/${item.id}` as any
    );
  };

  return (
    <TouchableOpacity
      style={[styles.reviewCard, isDisabled && styles.reviewCardDisabled]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewType}>
          <Feather
            name={isAssignment ? "file-text" : "check-circle"}
            size={14}
            color={theme.mutedForeground}
          />
          <Text style={styles.reviewTypeText}>
            {isAssignment ? "Assignment" : "Quiz"}
          </Text>
        </View>
        <Text style={styles.reviewTime}>{formatTimeAgo(timestamp)}</Text>
      </View>
      <Text style={styles.reviewTitle} numberOfLines={2}>
        {title || "Untitled submission"}
      </Text>
      <View style={styles.reviewMeta}>
        <Text style={styles.reviewMetaText} numberOfLines={1}>
          {item.student_name || "Student"} • {item.course_code || "Course"}
        </Text>
        {!isDisabled && (
          <Feather
            name="chevron-right"
            size={16}
            color={theme.mutedForeground}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function InstructorProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<InstructorDashboardData | null>(null);
  const [submissions, setSubmissions] = useState<InstructorSubmissionItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const instructorId = user?.id ?? null;

  const fetchProfileData = useCallback(
    async (isRefresh = false) => {
      if (!instructorId) return;

      try {
        if (!isRefresh) setIsLoading(true);
        setErrorMessage(null);
        const [dashboard, pending] = await Promise.all([
          getInstructorDashboard(instructorId),
          getInstructorSubmissions(instructorId),
        ]);
        setDashboardData(dashboard);
        setSubmissions(pending);
      } catch (error) {
        console.error("Error loading instructor profile:", error);
        setErrorMessage("Failed to load profile details.");
      } finally {
        setIsLoading(false);
        if (isRefresh) setIsRefreshing(false);
      }
    },
    [instructorId]
  );

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProfileData(true);
  };

  const activeCourses = dashboardData?.activeCourses ?? [];
  const assignments = dashboardData?.assignments ?? [];
  const activities = dashboardData?.activities ?? [];

  const totalStudents = useMemo(
    () =>
      activeCourses.reduce(
        (sum, course) => sum + (course.student_count ?? 0),
        0
      ),
    [activeCourses]
  );

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
                  <Text style={styles.roleText}>Instructor</Text>
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
            {user.bio ||
              "Highlight your teaching focus, office hours, and research areas."}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Member since</Text>
              <Text style={styles.metaValue}>{formatDate(user.created_at)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Active courses</Text>
              <Text style={styles.metaValue}>{activeCourses.length}</Text>
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
            value={activeCourses.length}
            icon="book-open"
            tone="primary"
          />
          <StatCard
            label="Students"
            value={totalStudents}
            icon="users"
            tone="success"
          />
          <StatCard
            label="Assignments"
            value={assignments.length}
            icon="clipboard"
            tone="accent"
          />
          <StatCard
            label="Pending review"
            value={submissions.length}
            icon="alert-circle"
            tone="warning"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Needs review</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() =>
                router.push(`/(app)/(tabs-instructor)/submissions` as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>Submissions</Text>
              <Feather name="arrow-right" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {submissions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending submissions.</Text>
            </View>
          ) : (
            submissions.slice(0, 3).map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active courses</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() =>
                router.push(`/(app)/(tabs-instructor)/courses` as any)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>Courses</Text>
              <Feather name="arrow-right" size={14} color={theme.primary} />
            </TouchableOpacity>
          </View>
          {activeCourses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active courses yet.</Text>
            </View>
          ) : (
            activeCourses.slice(0, 2).map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() =>
                  router.push(
                    `/(app)/(tabs-instructor)/courses/${course.id}` as any
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.courseHeader}>
                  <View style={styles.courseIcon}>
                    <Feather name="book-open" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.courseBadge}>
                    <Text style={styles.courseBadgeText}>{course.code}</Text>
                  </View>
                </View>
                <Text style={styles.courseName} numberOfLines={2}>
                  {course.name}
                </Text>
                <View style={styles.courseMetaRow}>
                  <View style={styles.courseMetaItem}>
                    <Feather
                      name="users"
                      size={14}
                      color={theme.mutedForeground}
                    />
                    <Text style={styles.courseMetaText}>
                      {course.student_count ?? 0} Students
                    </Text>
                  </View>
                  <View style={styles.courseMetaItem}>
                    <Feather
                      name="file-text"
                      size={14}
                      color={theme.mutedForeground}
                    />
                    <Text style={styles.courseMetaText}>
                      {course.total_assignments ?? 0} Assign.
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
                router.push(`/(app)/(tabs-instructor)/courses` as any)
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
                router.push(`/(app)/(tabs-instructor)/submissions` as any)
              }
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                <Feather name="inbox" size={18} color={theme.primary} />
              </View>
              <Text style={styles.actionText}>Submissions</Text>
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
  reviewCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 8,
  },
  reviewCardDisabled: {
    opacity: 0.6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewTypeText: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  reviewTime: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  reviewMetaText: {
    fontSize: 12,
    color: theme.mutedForeground,
    flex: 1,
  },
  courseCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    gap: 10,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  courseBadge: {
    backgroundColor: theme.secondary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  courseBadgeText: {
    fontSize: 11,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  courseName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  courseMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  courseMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  courseMetaText: {
    fontSize: 12,
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
