import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentCourses } from "@/services/studentService";
import type { StudentCourseOverview } from "@/types/serviceTypes";
import { clampNumber } from "@/utils/generalUtils";
import {
  getCourseDeadlineLabel,
  getCourseDeadlineMeta,
} from "@/utils/studentStatusHelpers";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentCoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<StudentCourseOverview[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const studentId = user?.id ?? null;

  useEffect(() => {
    if (!studentId) return;

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentCourses(studentId);
        setCourses(data);
      } catch (error) {
        console.error("Error fetching student courses:", error);
        setErrorMessage("Failed to load courses.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [studentId]);


  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>My Courses</Text>
            <Text style={styles.subtitle}>
              Track your progress, grades, and the next deadlines across your
              active courses.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() =>
              router.push(`/(app)/(tabs-student)/courses/join` as any)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.joinButtonText}>Join Course</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={theme.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses by name or code..."
            placeholderTextColor={theme.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {errorMessage && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active courses</Text>
            <Text style={styles.emptyText}>
              Join a course to see assignments, quizzes, and progress tracking.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(`/(app)/(tabs-student)/courses/join` as any)
              }
            >
              <Text style={styles.primaryButtonText}>Join a Course</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.courseList}>
            {filteredCourses.map((course) => {
              const deadlineLabel = getCourseDeadlineLabel(course);
              const deadlineMeta = getCourseDeadlineMeta(course);
              const progressValue = clampNumber(
                Math.round(course.progress ?? 0),
                0,
                100
              );

              return (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <View style={styles.courseIcon}>
                      <Feather
                        name="book-open"
                        size={18}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.courseHeaderText}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      <View style={styles.courseCodeRow}>
                        <Text style={styles.courseCode}>{course.code}</Text>
                        {(course.is_new || course.has_overdue) && (
                          <View style={styles.badgeRow}>
                            {course.is_new && (
                              <View style={[styles.badge, styles.badgeNew]}>
                                <Text style={styles.badgeText}>New</Text>
                              </View>
                            )}
                            {course.has_overdue && (
                              <View
                                style={[styles.badge, styles.badgeOverdue]}
                              >
                                <Text style={styles.badgeText}>Overdue</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Semester</Text>
                      <Text style={styles.metaValue}>
                        {course.semester || "-"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Instructor</Text>
                      <Text style={styles.metaValue}>
                        {course.instructor_name || "Instructor TBD"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>{progressValue}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progressValue}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.deadlineRow}>
                    <Text style={styles.deadlineTitle}>{deadlineLabel}</Text>
                    {deadlineMeta ? (
                      <Text
                        style={[
                          styles.deadlineMeta,
                          course.has_overdue && styles.deadlineMetaOverdue,
                        ]}
                      >
                        {deadlineMeta}
                      </Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      router.push(
                        `/(app)/(tabs-student)/courses/${course.id}` as any
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>Open</Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={theme.primaryForeground}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
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
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.foreground,
  },
  subtitle: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  joinButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinButtonText: {
    color: theme.primaryForeground,
    fontSize: 12,
    fontWeight: "600",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.foreground,
    fontSize: 13,
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
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.foreground,
  },
  emptyText: {
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
  courseList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 14,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  courseHeaderText: {
    flex: 1,
    gap: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  courseCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  courseCode: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.foreground,
  },
  badgeNew: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  badgeOverdue: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
  },
  metaValue: {
    fontSize: 13,
    color: theme.foreground,
  },
  progressRow: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  progressValue: {
    fontSize: 12,
    color: theme.foreground,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.secondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
  },
  deadlineRow: {
    gap: 4,
  },
  deadlineTitle: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  deadlineMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  deadlineMetaOverdue: {
    color: theme.destructive,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primaryForeground,
  },
});
