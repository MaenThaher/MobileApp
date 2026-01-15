import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

/* ================= THEME ================= */

const theme = {
  pageBg: "#0B0E14",
  textMain: "#E6EAF2",
  textMuted: "#9AA4B2",
  border: "#1E2430",
  cardBg: "#111827",
  primary: "#6366F1",
  secondaryBg: "#1F2937",
};

/* ================= DEFAULT STATE ================= */

const EMPTY_OVERVIEW = {
  totalUsers: 0,
  activeUsers: 0,
  totalCourses: 0,
  activeCourses: 0,
  totalAssignments: 0,
  publishedAssignments: 0,
  totalSubmissions: 0,
  gradedSubmissions: 0,
};

/* ================= SCREEN ================= */

export default function AdminAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);

  useEffect(() => {
    // mock / fetch API here
    setTimeout(() => {
      setOverview({
        totalUsers: 1200,
        activeUsers: 860,
        totalCourses: 48,
        activeCourses: 32,
        totalAssignments: 210,
        publishedAssignments: 180,
        totalSubmissions: 5200,
        gradedSubmissions: 4100,
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textMuted, marginTop: 8 }}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page}>
      <View style={styles.container}>
        {/* HEADER */}
        <View>
          <Text style={styles.title}>Analytics Dashboard</Text>
          <Text style={styles.subtitle}>
            Platform overview & engagement
          </Text>
        </View>

        {/* OVERVIEW GRID */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="users"
            label="Total Users"
            value={overview.totalUsers}
            sub={`${overview.activeUsers} active`}
          />
          <MetricCard
            icon="book-open"
            label="Courses"
            value={overview.totalCourses}
            sub={`${overview.activeCourses} active`}
          />
          <MetricCard
            icon="file-text"
            label="Assignments"
            value={overview.totalAssignments}
            sub={`${overview.publishedAssignments} published`}
          />
          <MetricCard
            icon="check-circle"
            label="Submissions"
            value={overview.totalSubmissions}
            sub={`${overview.gradedSubmissions} graded`}
          />
        </View>
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Feather
          name={icon}
          size={20}
          color={theme.primary}
        />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>

      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.pageBg,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  center: {
    flex: 1,
    backgroundColor: theme.pageBg,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Header */
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },

  /* Grid */
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  /* Card */
  metricCard: {
    backgroundColor: theme.cardBg,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },

  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.textMain,
    marginTop: 8,
  },
  metricSub: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 4,
  },
});
