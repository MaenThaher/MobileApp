import {
  CreateAssignmentModal,
  DeleteAssignmentModal,
  EditAssignmentModal,
} from "@/components/modals";
import * as colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getInstructorCourseDetails } from "@/services/instructorService";
import type { Assignment, CircuitTemplate } from "@/types";
import { formatDate } from "@/utils/generalUtils";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AssignmentsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = id as string;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [templates, setTemplates] = useState<CircuitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States for the modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    try {
      // We use getInstructorCourseDetails as it returns both assignments and templates
      const data: any = await getInstructorCourseDetails(courseId);
      if (data) {
        setAssignments(data.assignments || []);
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleDelete = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  const handleManage = (assignment: Assignment) => {
    router.push(
      `/(app)/(tabs-instructor)/courses/${courseId}/assignments/${assignment.id}`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "#10b981"; // Emerald-500
      case "draft":
        return colors.mutedForeground;
      case "closed":
        return colors.destructive;
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return "rgba(16, 185, 129, 0.1)";
      case "draft":
        return colors.secondary;
      case "closed":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return colors.secondary;
    }
  };

  // Render Item
  const renderAssignmentItem = ({
    item,
    index,
  }: {
    item: Assignment;
    index: number;
  }) => {
    // Color cycling for icons
    const iconColors = ["#60a5fa", "#34d399", "#fbbf24", "#fb7185"];
    const iconColor = iconColors[index % iconColors.length];
    const iconBg = `${iconColor}15`; // 15% opacity
    const iconBorder = `${iconColor}33`; // 20% opacity approx

    const submissionRate = item.student_count
      ? (item.submission_count || 0) / item.student_count
      : 0;
    const progressPercent = `${Math.min(submissionRate * 100, 100)}%`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: iconBg, borderColor: iconBorder },
            ]}
          >
            <Feather name="file-text" size={24} color={iconColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Feather
                  name="calendar"
                  size={12}
                  color={colors.mutedForeground}
                />
                <Text style={styles.metaText}>
                  Due {formatDate(item.due_date)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBg(item.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: parseFloat(progressPercent),
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>
              {item.submission_count || 0}
            </Text>
            /{item.student_count || 0} submitted
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => handleManage(item)}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleEdit(item)}
            >
              <Feather name="edit-2" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Feather name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={20}
            color={colors.mutedForeground}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assignments..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredAssignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather
              name="file-text"
              size={48}
              color={colors.muted}
              style={{ opacity: 0.5 }}
            />
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try a different search term"
                : "Create a new assignment to get started"}
            </Text>
          </View>
        }
      />

      <CreateAssignmentModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseId={courseId}
        instructorId={user?.id || ""}
        templates={templates}
        onSubmitted={() => {
          onRefresh();
        }}
      />

      <EditAssignmentModal
        visible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAssignment(null);
        }}
        courseId={courseId}
        instructorId={user?.id || ""}
        initialValues={selectedAssignment}
        templates={templates}
        onSubmitted={() => {
          onRefresh();
        }}
      />

      <DeleteAssignmentModal
        visible={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        courseId={courseId}
        instructorId={user?.id || ""}
        onSubmitted={() => {
          onRefresh();
        }}
      />
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.background,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: colors.foreground,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statsContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.secondary,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "right",
  },
  statsHighlight: {
    color: colors.foreground,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});
