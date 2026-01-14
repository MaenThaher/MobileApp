import { EditCourseModal } from "@/components/modals/instructor/EditCourseModal";
import * as colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getInstructorCourseDetails } from "@/services/instructorService";
import { CourseDetail } from "@/types/serviceTypes";
import { getModuleIcon } from "@/utils/uiUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const TAB_WIDTH = width / 3;

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "modules" | "assignments" | "templates"
  >("modules");

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const fetchCourseDetails = useCallback(async () => {
    if (!id) return;
    try {
      const courseData = await getInstructorCourseDetails(id as string);
      setData(courseData as any);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourseDetails();
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this course: ${data?.course.name} (${data?.course.code})`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !data) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Course not found</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchCourseDetails}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { course, modules = [], assignments = [], templates = [] } = data;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {course.code}
          </Text>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Feather name="share" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(true)}
              style={styles.headerButton}
            >
              <Feather name="edit-2" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.badges}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{course.code}</Text>
              </View>
              {course.semester && (
                <View style={styles.semesterBadge}>
                  <Text style={styles.semesterText}>{course.semester}</Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      course.status === "active"
                        ? "rgba(16, 185, 129, 0.15)"
                        : colors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        course.status === "active"
                          ? "#10b981"
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {course.status}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{course.name}</Text>

            {course.description && (
              <Text style={styles.description} numberOfLines={3}>
                {course.description}
              </Text>
            )}

            {/* Quick Stats - Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              <View style={styles.statChip}>
                <Feather name="users" size={14} color={colors.primary} />
                <Text style={styles.statChipText}>
                  {course.student_count ?? 0} Students
                </Text>
              </View>
              <View style={styles.statChip}>
                <Feather name="file-text" size={14} color={colors.accent} />
                <Text style={styles.statChipText}>
                  {course.total_assignments ?? 0} Assignments
                </Text>
              </View>
              <View style={styles.statChip}>
                <Feather name="book-open" size={14} color="#10b981" />
                <Text style={styles.statChipText}>
                  {modules.length} Modules
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "modules" && styles.activeTab]}
              onPress={() => setActiveTab("modules")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "modules" && styles.activeTabText,
                ]}
              >
                Modules
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "assignments" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("assignments")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "assignments" && styles.activeTabText,
                ]}
              >
                Tasks
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "templates" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("templates")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "templates" && styles.activeTabText,
                ]}
              >
                Templates
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {activeTab === "modules" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Course Content</Text>
                <TouchableOpacity style={styles.iconBtn}>
                  <Feather
                    name="plus-circle"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {modules.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather
                    name="layers"
                    size={48}
                    color={colors.muted}
                    style={{ opacity: 0.5 }}
                  />
                  <Text style={styles.emptyStateText}>No modules yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Add a module to get started
                  </Text>
                </View>
              ) : (
                <View style={styles.cardList}>
                  {modules.map((module, index) => (
                    <View key={module.id} style={styles.moduleCard}>
                      <TouchableOpacity
                        style={styles.moduleHeader}
                        onPress={() => toggleModule(module.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.moduleIconContainer,
                            {
                              backgroundColor:
                                index % 2 === 0
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(139, 92, 246, 0.1)",
                            },
                          ]}
                        >
                          <Feather
                            name={getModuleIcon(module.type) as any}
                            size={20}
                            color={
                              index % 2 === 0 ? colors.primary : colors.accent
                            }
                          />
                        </View>
                        <View style={styles.moduleInfo}>
                          <Text style={styles.moduleTitle}>{module.title}</Text>
                          <View style={styles.moduleMeta}>
                            <Text style={styles.moduleType}>{module.type}</Text>
                            <View
                              style={[
                                styles.dot,
                                {
                                  backgroundColor:
                                    module.status === "Published"
                                      ? "#10b981"
                                      : colors.muted,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    module.status === "Published"
                                      ? "#10b981"
                                      : colors.muted,
                                },
                              ]}
                            >
                              {module.status}
                            </Text>
                          </View>
                        </View>
                        <Feather
                          name={
                            expandedModules.has(module.id)
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={20}
                          color={colors.muted}
                        />
                      </TouchableOpacity>

                      {expandedModules.has(module.id) && (
                        <View style={styles.moduleActions}>
                          <TouchableOpacity style={styles.actionItem}>
                            <Feather
                              name="edit-2"
                              size={16}
                              color={colors.foreground}
                            />
                            <Text style={styles.actionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.actionItem}>
                            <Feather
                              name="trash-2"
                              size={16}
                              color={colors.destructive}
                            />
                            <Text
                              style={[
                                styles.actionText,
                                { color: colors.destructive },
                              ]}
                            >
                              Delete
                            </Text>
                          </TouchableOpacity>
                          {module.attachment_url && (
                            <TouchableOpacity style={styles.actionItem}>
                              <Feather
                                name="external-link"
                                size={16}
                                color={colors.primary}
                              />
                              <Text
                                style={[
                                  styles.actionText,
                                  { color: colors.primary },
                                ]}
                              >
                                Open
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "assignments" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Assignments</Text>
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() =>
                    router.push(
                      `/(app)/(tabs-instructor)/courses/${id}/assignments`
                    )
                  }
                >
                  <Text style={styles.linkBtnText}>View All</Text>
                  <Feather
                    name="arrow-right"
                    size={14}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {assignments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather
                    name="check-circle"
                    size={48}
                    color={colors.muted}
                    style={{ opacity: 0.5 }}
                  />
                  <Text style={styles.emptyStateText}>No assignments yet</Text>
                </View>
              ) : (
                <View style={styles.cardList}>
                  {assignments.map((assignment) => (
                    <TouchableOpacity
                      key={assignment.id}
                      style={styles.assignmentCard}
                      activeOpacity={0.7}
                    >
                      <View style={styles.assignmentTop}>
                        <View style={styles.dateBox}>
                          <Text style={styles.dateMonth}>
                            {assignment.due_date
                              ? new Date(assignment.due_date).toLocaleString(
                                  "default",
                                  { month: "short" }
                                )
                              : "No due date"}
                          </Text>
                          <Text style={styles.dateDay}>
                            {assignment.due_date
                              ? new Date(assignment.due_date).getDate()
                              : "--"}
                          </Text>
                        </View>
                        <View style={styles.assignmentContent}>
                          <Text style={styles.assignmentTitle}>
                            {assignment.title}
                          </Text>
                          <Text style={styles.assignmentSubtitle}>
                            {assignment.submission_count ?? 0} /{" "}
                            {assignment.student_count ?? 0} submitted
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor:
                                assignment.status === "published"
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : colors.secondary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              {
                                color:
                                  assignment.status === "published"
                                    ? "#10b981"
                                    : colors.mutedForeground,
                              },
                            ]}
                          >
                            {assignment.status}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.assignmentFooter}>
                        <TouchableOpacity 
                          style={styles.gradeBtn}
                          onPress={() => router.push(`/(app)/(tabs-instructor)/courses/${id}/assignments/${assignment.id}`)}
                        >
                          <Text style={styles.gradeBtnText}>
                            Grade Submissions
                          </Text>
                          <Feather
                            name="chevron-right"
                            size={14}
                            color={colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "templates" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Circuit Templates</Text>
                <TouchableOpacity style={styles.iconBtn}>
                  <Feather
                    name="plus-circle"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {templates.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather
                    name="cpu"
                    size={48}
                    color={colors.muted}
                    style={{ opacity: 0.5 }}
                  />
                  <Text style={styles.emptyStateText}>
                    No templates available
                  </Text>
                </View>
              ) : (
                <View style={styles.gridList}>
                  {templates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={styles.templateCard}
                      activeOpacity={0.8}
                    >
                      <View style={styles.templateIcon}>
                        <Feather name="cpu" size={24} color={colors.accent} />
                      </View>
                      <Text style={styles.templateName} numberOfLines={2}>
                        {template.name}
                      </Text>
                      {template.description && (
                        <Text style={styles.templateDesc} numberOfLines={2}>
                          {template.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {data && (
        <EditCourseModal
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          instructorId={user?.id || ""}
          initialValues={course}
          onSubmitted={() => {
            onRefresh();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerSafe: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerRightButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.foreground,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  hero: {
    padding: 24,
    backgroundColor: colors.card,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
    // Add subtle shadow or border
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  heroContent: {
    gap: 12,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  codeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  semesterBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  semesterText: {
    color: colors.mutedForeground,
    fontWeight: "600",
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.foreground,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.foreground,
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.mutedForeground,
  },
  activeTabText: {
    color: colors.foreground,
  },

  // Content
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  iconBtn: {
    padding: 4,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkBtnText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  // Modules
  cardList: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  moduleHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 4,
  },
  moduleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moduleType: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "500",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moduleActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.secondary,
    padding: 8,
  },
  actionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.foreground,
  },

  // Assignments
  assignmentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  assignmentTop: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateBox: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  dateMonth: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    color: colors.mutedForeground,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.foreground,
  },
  assignmentContent: {
    flex: 1,
    justifyContent: "center",
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 4,
  },
  assignmentSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  assignmentFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  gradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  gradeBtnText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  // Templates
  gridList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  templateCard: {
    width: (width - 48 - 16) / 2, // 2 cols, padding 24*2, gap 16
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  templateName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  templateDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
  },

  // Common
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  emptyStateText: {
    marginTop: 16,
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateSubtext: {
    marginTop: 4,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 16,
    marginBottom: 12,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: "600",
  },
});
