import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getInstructorDashboard } from "@/services/instructorService";
import { InstructorDashboardData } from "@/types/serviceTypes";
import { formatDate } from "@/utils/generalUtils";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
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
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
}) => (
  <View style={[styles.statCard, { borderColor: theme.border }]}>
    <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
      <Feather name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

const CourseCard = ({
  course,
  onPress,
}: {
  course: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.courseCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.courseHeader}>
      <View style={styles.courseIcon}>
        <Feather name="book" size={20} color={theme.primary} />
      </View>
      <View style={styles.courseBadge}>
        <Text style={styles.courseBadgeText}>{course.code}</Text>
      </View>
    </View>
    <Text style={styles.courseName} numberOfLines={2}>
      {course.name}
    </Text>
    <View style={styles.courseFooter}>
      <View style={styles.courseStat}>
        <Feather name="users" size={14} color={theme.mutedForeground} />
        <Text style={styles.courseStatText}>
          {course.student_count ?? 0} Students
        </Text>
      </View>
      <View style={styles.courseStat}>
        <Feather name="file-text" size={14} color={theme.mutedForeground} />
        <Text style={styles.courseStatText}>
          {course.total_assignments ?? 0} Assign.
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const AssignmentCard = ({
  assignment,
  onPress,
}: {
  assignment: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.assignmentCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.assignmentBanner}>
      <Text style={styles.assignmentDue}>
        Due {formatDate(assignment.due_date)}
      </Text>
    </View>
    <View style={styles.assignmentBody}>
      <Text style={styles.assignmentTitle} numberOfLines={2}>
        {assignment.title}
      </Text>
      <Text style={styles.assignmentCourse}>
        {assignment.course_code ?? "Unknown Course"}
      </Text>
      <View style={styles.assignmentMeta}>
        <View style={styles.urgentBadge}>
          <Feather name="alert-triangle" size={12} color="#f59e0b" />
          <Text style={styles.urgentText}>
            {assignment.ungraded_count ?? 0} Ungraded
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.gradeButton} onPress={onPress}>
        <Text style={styles.gradeButtonText}>Grade Now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const ActivityItem = ({ item, isLast }: { item: any; isLast: boolean }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityTimeline}>
      <View style={styles.activityDot} />
      {!isLast && <View style={styles.activityLine} />}
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityText}>{item.description}</Text>
      <View style={styles.activityMeta}>
        <Text style={styles.activityTime}>{formatDate(item.created_at)}</Text>
        {item.course_code && (
          <View style={styles.activityCourseBadge}>
            <Text style={styles.activityCourseText}>{item.course_code}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

const SectionHeader = ({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
        <Text style={styles.sectionActionText}>{actionLabel}</Text>
        <Feather name="arrow-right" size={14} color={theme.primary} />
      </TouchableOpacity>
    )}
  </View>
);

// --- Main Screen ---

export default function InstructorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      if (user?.id) {
        const dashboardData = await getInstructorDashboard(user.id);
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const courses = data?.activeCourses ?? [];
  const assignments = data?.assignments ?? [];
  const activities = data?.activities ?? [];

  const totalStudents = courses.reduce(
    (acc, curr) => acc + (curr.student_count ?? 0),
    0
  );
  const pendingReviews = assignments.reduce(
    (acc, curr) => acc + (curr.ungraded_count ?? 0),
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.foreground}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Instructor Dashboard</Text>
            <Text style={styles.subtitle}>
              Overview of your courses & tasks
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <Feather name="calendar" size={12} color={theme.mutedForeground} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <StatCard
            label="Students"
            value={totalStudents}
            icon="users"
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.1)"
          />
          <StatCard
            label="Courses"
            value={courses.length}
            icon="book-open"
            color="#8b5cf6"
            bgColor="rgba(139, 92, 246, 0.1)"
          />
          <StatCard
            label="Pending"
            value={pendingReviews}
            icon="clock"
            color="#f59e0b"
            bgColor="rgba(245, 158, 11, 0.1)"
          />
        </ScrollView>

        <View style={styles.section}>
          <SectionHeader
            title="Active Courses"
            actionLabel="View All"
            onAction={() => router.push("/(app)/(tabs-instructor)/courses")}
          />
          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={40} color={theme.muted} />
              <Text style={styles.emptyStateText}>No active courses</Text>
            </View>
          ) : (
            <FlatList
              data={courses}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CourseCard
                  course={item}
                  onPress={() =>
                    router.push(
                      `/(app)/(tabs-instructor)/courses/${item.id}` as any
                    )
                  }
                />
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Needs Review" />
          {assignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="check-circle" size={40} color={theme.muted} />
              <Text style={styles.emptyStateText}>All caught up!</Text>
            </View>
          ) : (
            <FlatList
              data={assignments}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AssignmentCard
                  assignment={item}
                  onPress={() =>
                    router.push(
                      `/(app)/(tabs-instructor)/courses/${item.course_id}/assignments/${item.id}` as any
                    )
                  }
                />
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {activities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No recent activity</Text>
              </View>
            ) : (
              activities.map((item, index) => (
                <ActivityItem
                  key={index}
                  item={item}
                  isLast={index === activities.length - 1}
                />
              ))
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "500",
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 10, // Avoid clipping shadows
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.foreground,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.foreground,
    marginLeft: 20, // Align with content if not using SectionHeader
    marginBottom: 12,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: "500",
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  courseCard: {
    backgroundColor: theme.card,
    width: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  courseBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  courseBadgeText: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "500",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 12,
    height: 44, // roughly 2 lines
  },
  courseFooter: {
    flexDirection: "row",
    gap: 12,
  },
  courseStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  courseStatText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: theme.card,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: "dashed",
    gap: 8,
  },
  emptyStateText: {
    color: theme.mutedForeground,
    fontSize: 14,
  },
  assignmentCard: {
    backgroundColor: theme.card,
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  assignmentBanner: {
    height: 40,
    backgroundColor: theme.secondary,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  assignmentDue: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: "600",
  },
  assignmentBody: {
    padding: 16,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 4,
  },
  assignmentCourse: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: 12,
  },
  assignmentMeta: {
    flexDirection: "row",
    marginBottom: 16,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
  },
  gradeButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  gradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    marginHorizontal: 20,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
  },
  activityTimeline: {
    alignItems: "center",
    width: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
    marginTop: 6,
  },
  activityLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.border,
    marginVertical: 4,
  },
  activityContent: {
    flex: 1,
    paddingBottom: 24, // spacing between items
  },
  activityText: {
    fontSize: 14,
    color: theme.foreground,
    lineHeight: 20,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityTime: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  activityCourseBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityCourseText: {
    fontSize: 10,
    color: theme.mutedForeground,
  },
});
