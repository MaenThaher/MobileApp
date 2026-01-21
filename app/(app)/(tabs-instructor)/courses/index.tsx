import {
  background,
  border,
  card as cardColor,
  foreground,
  mutedForeground,
  primary,
  secondary,
} from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getInstructorCourses } from "@/services/instructorService";
import { Course } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CourseCard = ({
  course,
  onPress,
  index,
}: {
  course: Course;
  onPress: (courseId: string) => void;
  index: number;
}) => {
  // Color cycling logic in web was based on nth child color cycling logic
  // Because, nth child is not supported in React Native StyleSheet
  // [https://stackoverflow.com/questions/74023589/is-there-any-way-to-use-nth-child-or-last-child-in-react-native-styled-componen]
  // Could have used expanded style sheets or a library, but this is a simple solution.
  const getIconColor = (idx: number) => {
    const colors = [
      {
        bg: "rgba(59, 130, 246, 0.15)",
        text: "#60a5fa",
        border: "rgba(59, 130, 246, 0.2)",
      }, // Blue
      {
        bg: "rgba(16, 185, 129, 0.15)",
        text: "#34d399",
        border: "rgba(16, 185, 129, 0.2)",
      }, // Emerald
      {
        bg: "rgba(245, 158, 11, 0.15)",
        text: "#fbbf24",
        border: "rgba(245, 158, 11, 0.2)",
      }, // Amber
      {
        bg: "rgba(244, 63, 94, 0.15)",
        text: "#fb7185",
        border: "rgba(244, 63, 94, 0.2)",
      }, // Rose
    ];
    return colors[idx % colors.length];
  };

  const theme = getIconColor(index);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(course.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
        >
          <Feather name="book" size={24} color={theme.text} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.courseName} numberOfLines={1}>
            {course.name}
          </Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{course.code}</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={mutedForeground} />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.semesterContainer}>
          <Text style={styles.semesterText}>{course.semester || "N/A"}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="users" size={14} color={mutedForeground} />
            <Text style={styles.statText}>{course.student_count || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="file-text" size={14} color={mutedForeground} />
            <Text style={styles.statText}>{course.total_assignments || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function InstructorCourses() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getInstructorCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Courses</Text>
        <Text style={styles.subtitle}>
          Manage your curriculum and student cohorts.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={mutedForeground}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {loading ? (
        <ActivityIndicator size="large" color={primary} />
      ) : (
        <>
          <Feather
            name="book-open"
            size={48}
            color={mutedForeground}
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.emptyText}>No courses found</Text>
          <Text style={styles.emptySubtext}>
            {search
              ? "Try a different search term"
              : "You haven't created any courses yet"}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CourseCard
            course={item}
            index={index}
            onPress={(id) =>
              router.push(`/(app)/(tabs-instructor)/courses/${id}` as any)
            }
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primary}
            colors={[primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    minHeight: "100%",
  },
  headerContainer: {
    marginBottom: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: foreground,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: mutedForeground,
    lineHeight: 22,
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: cardColor,
    borderRadius: 100,
    paddingLeft: 48,
    paddingRight: 20,
    color: foreground,
    fontSize: 16,
    borderWidth: 1,
    borderColor: border,
  },
  // Card Styles
  card: {
    backgroundColor: cardColor,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  courseName: {
    fontSize: 17,
    fontWeight: "600",
    color: foreground,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  codeText: {
    fontSize: 12,
    fontWeight: "700",
    color: mutedForeground,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: border,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 12,
  },
  semesterContainer: {
    backgroundColor: secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: border,
  },
  semesterText: {
    fontSize: 13,
    fontWeight: "500",
    color: foreground,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: mutedForeground,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: foreground,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: mutedForeground,
  },
});
