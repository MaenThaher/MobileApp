import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getInstructorSubmissions } from "@/services/instructorService";
import { InstructorSubmissionItem } from "@/types/serviceTypes";
import { formatTimeAgo } from "@/utils/generalUtils";

type FilterType = "all" | "assignments" | "quizzes";

export default function InstructorSubmissionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<InstructorSubmissionItem[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const instructorId = user?.id || null;

  const fetchSubmissions = useCallback(async () => {
    if (!instructorId) return;
    try {
      // Only set main loading if not refreshing
      if (!isRefreshing) setIsLoading(true);
      const data = await getInstructorSubmissions(instructorId);
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // Ideally show a toast or error message here
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [instructorId, isRefreshing]);

  useEffect(() => {
    fetchSubmissions();
  }, [instructorId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSubmissions();
  };

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    if (filter === "assignments") {
      filtered = filtered.filter((item) => item.type === "assignment");
    } else if (filter === "quizzes") {
      filtered = filtered.filter((item) => item.type === "quiz");
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.student_name?.toLowerCase().includes(query) ||
          item.course_code?.toLowerCase().includes(query) ||
          item.course_name?.toLowerCase().includes(query) ||
          item.assignment_title?.toLowerCase().includes(query) ||
          item.quiz_title?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [submissions, search, filter]);

  const getTitle = (item: InstructorSubmissionItem) => {
    return item.type === "assignment" ? item.assignment_title : item.quiz_title;
  };

  const handlePressCard = (item: InstructorSubmissionItem) => {
    if (item.type === "assignment" && item.assignment_id) {
      // Navigate to assignment grading
      router.push(`/instructor/submissions/${item.id}` as any);
    } else if (item.type === "quiz" && item.quiz_module_id) {
      // Navigate to quiz review
      router.push(
        `/instructor/courses/${item.course_id}/quiz/${item.quiz_module_id}` as any
      );
    }
  };

  const renderItem = ({ item }: { item: InstructorSubmissionItem }) => {
    const isAssignment = item.type === "assignment";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handlePressCard(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            {isAssignment ? (
              <Feather
                name="file-text"
                size={16}
                color={theme.mutedForeground}
              />
            ) : (
              <Feather name="check" size={16} color={theme.mutedForeground} />
            )}
            <Text style={styles.typeText}>
              {isAssignment ? "Assignment" : "Quiz"}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {getTitle(item) || "Untitled"}
          </Text>
          <View style={styles.courseContainer}>
            <Feather
              name="book-open"
              size={14}
              color={theme.mutedForeground}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.courseText} numberOfLines={1}>
              {item.course_code} • {item.course_name}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.studentInfo}>
            <Feather name="user" size={16} color={theme.mutedForeground} />
            <Text style={styles.studentName} numberOfLines={1}>
              {item.student_name || "Unknown Student"}
            </Text>
          </View>

          <View style={styles.dateInfo}>
            <Feather
              name="clock"
              size={14}
              color={theme.mutedForeground}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.dateText}>
              {formatTimeAgo(item.submitted_at || item.completed_at)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Submissions</Text>
        <Text style={styles.subtitle}>Review and grade student work</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={20}
          color={theme.mutedForeground}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search student, course, title..."
          placeholderTextColor={theme.mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === "all" && styles.filterPillActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === "assignments" && styles.filterPillActive,
          ]}
          onPress={() => setFilter("assignments")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "assignments" && styles.filterTextActive,
            ]}
          >
            Assignments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === "quizzes" && styles.filterPillActive,
          ]}
          onPress={() => setFilter("quizzes")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "quizzes" && styles.filterTextActive,
            ]}
          >
            Quizzes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="file-text" size={48} color={theme.muted} />
      <Text style={styles.emptyTitle}>No submissions found</Text>
      <Text style={styles.emptyText}>
        {search || filter !== "all"
          ? "Try adjusting your search or filters."
          : "No submissions or quiz attempts yet."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading submissions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubmissions}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          keyboardShouldPersistTaps="handled"
          onScroll={Keyboard.dismiss}
        />
      )}
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.mutedForeground,
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  listHeader: {
    marginBottom: 20,
  },
  titleContainer: {
    marginVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.mutedForeground,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.foreground,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterPillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  filterTextActive: {
    color: theme.primaryForeground,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginLeft: 6,
    fontWeight: "500",
  },
  cardBody: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 4,
    lineHeight: 24,
  },
  courseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  courseText: {
    fontSize: 14,
    color: theme.mutedForeground,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    color: theme.foreground,
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: "center",
    maxWidth: 250,
    lineHeight: 20,
  },
});
