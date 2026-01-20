import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

/* 🔴 CHANGE TO YOUR SERVER IP */
const API_URL = "http://192.168.0.110:3000/api/admin/analytics";

/* ================= TYPES ================= */

type CoursePopularity = {
  courseId: string;
  courseCode: string;
  courseName: string;
  studentCount: number;
  assignmentCount: number;
  submissionCount: number;
  averageGrade: number | null;
};

type SubmissionTrend = {
  date: string;
  notStarted: number;
  inProgress: number;
  submitted: number;
  graded: number;
};

/* ================= SCREEN ================= */

export default function AdminAnalyticsScreen() {
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalAssignments: 0,
    publishedAssignments: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
    totalChats: 0,
    totalMessages: 0,
  });

  const [userEngagement, setUserEngagement] = useState({
    dailyActive: 0,
    weeklyActive: 0,
    monthlyActive: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    usersByRole: { students: 0, instructors: 0, admins: 0 },
  });

  const [coursePopularity, setCoursePopularity] = useState<CoursePopularity[]>(
    [],
  );

  const [submissionTrends, setSubmissionTrends] = useState<SubmissionTrend[]>(
    [],
  );

  const [submissionStatus, setSubmissionStatus] = useState({
    notStarted: 0,
    inProgress: 0,
    submitted: 0,
    graded: 0,
    total: 0,
  });

  const [chatStats, setChatStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    averageMessagesPerChat: 0,
    uniqueUsersWithChats: 0,
    messagesToday: 0,
    messagesThisWeek: 0,
    messagesThisMonth: 0,
    userMessages: 0,
    aiMessages: 0,
  });

  const [courseStatus, setCourseStatus] = useState({
    active: 0,
    archived: 0,
    draft: 0,
  });

  const [assignmentStatus, setAssignmentStatus] = useState({
    draft: 0,
    published: 0,
    closed: 0,
  });

  /* ================= FETCH ================= */

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setOverview({
          totalUsers: data.overviewMetrics.total_users,
          activeUsers: data.overviewMetrics.active_users,
          totalCourses: data.overviewMetrics.total_courses,
          activeCourses: data.overviewMetrics.active_courses,
          totalAssignments: data.overviewMetrics.total_assignments,
          publishedAssignments: data.overviewMetrics.published_assignments,
          totalSubmissions: data.overviewMetrics.total_submissions,
          gradedSubmissions: data.overviewMetrics.graded_submissions,
          totalChats: data.overviewMetrics.total_chats,
          totalMessages: data.overviewMetrics.total_messages,
        });

        setUserEngagement(data.userEngagement);
        setCoursePopularity(data.coursePopularity || []);
        setSubmissionTrends(data.submissionTrends || []);
        setSubmissionStatus(data.submissionStatus);
        setChatStats(data.chatStats);
        setCourseStatus(data.courseStatus);
        setAssignmentStatus(data.assignmentStatus);
      })
      .catch((e) => console.log("Analytics Error:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Analytics Dashboard</Text>
      <Text style={styles.subtitle}>
        Platform usage statistics and engagement metrics
      </Text>

      {/* OVERVIEW */}
      <Section title="Overview">
        <Grid>
          <Metric
            icon="users"
            label="Users"
            value={overview.totalUsers}
            sub={`${overview.activeUsers} active`}
          />
          <Metric
            icon="book"
            label="Courses"
            value={overview.totalCourses}
            sub={`${overview.activeCourses} active`}
          />
          <Metric
            icon="file-text"
            label="Assignments"
            value={overview.totalAssignments}
            sub={`${overview.publishedAssignments} published`}
          />
          <Metric
            icon="check-circle"
            label="Submissions"
            value={overview.totalSubmissions}
            sub={`${overview.gradedSubmissions} graded`}
          />
          <Metric
            icon="message-square"
            label="Chats"
            value={overview.totalChats}
            sub={`${overview.totalMessages} messages`}
          />
        </Grid>
      </Section>

      {/* USER ENGAGEMENT */}
      <Section title="User Engagement">
        <Card title="Active Users">
          <Row label="Daily" value={userEngagement.dailyActive} />
          <Row label="Weekly" value={userEngagement.weeklyActive} />
          <Row label="Monthly" value={userEngagement.monthlyActive} />
        </Card>
      </Section>

      {/* COURSE POPULARITY */}
      <Section title="Course Popularity">
        {coursePopularity.map((c) => (
          <ListRow
            key={c.courseId}
            title={`${c.courseCode} - ${c.courseName}`}
            subtitle={`Students: ${c.studentCount} | Avg: ${c.averageGrade ?? "N/A"}%`}
          />
        ))}
      </Section>

      {/* SUBMISSION STATUS */}
      <Section title="Submission Status">
        <Grid>
          <Metric
            icon="clock"
            label="Not Started"
            value={submissionStatus.notStarted}
          />
          <Metric
            icon="activity"
            label="In Progress"
            value={submissionStatus.inProgress}
          />
          <Metric
            icon="upload"
            label="Submitted"
            value={submissionStatus.submitted}
          />
          <Metric icon="check" label="Graded" value={submissionStatus.graded} />
        </Grid>
      </Section>

      {/* SUBMISSION TRENDS (FIXED: value now used) */}
      <Section title="Submission Trends">
        {submissionTrends.map((t) => (
          <Card key={t.date} title={t.date}>
            <Row label="Not Started" value={t.notStarted} />
            <Row label="In Progress" value={t.inProgress} />
            <Row label="Submitted" value={t.submitted} />
            <Row label="Graded" value={t.graded} />
          </Card>
        ))}
      </Section>

      {/* CHAT STATS */}
      <Section title="Chat & AI Usage">
        <Card title="Messages">
          <Row label="User" value={chatStats.userMessages} />
          <Row label="AI" value={chatStats.aiMessages} />
          <Row label="Today" value={chatStats.messagesToday} />
        </Card>
      </Section>

      {/* COURSE & ASSIGNMENT STATUS */}
      <Section title="Course & Assignment Status">
        <Card title="Courses">
          <Row label="Active" value={courseStatus.active} />
          <Row label="Archived" value={courseStatus.archived} />
          <Row label="Draft" value={courseStatus.draft} />
        </Card>

        <Card title="Assignments">
          <Row label="Draft" value={assignmentStatus.draft} />
          <Row label="Published" value={assignmentStatus.published} />
          <Row label="Closed" value={assignmentStatus.closed} />
        </Card>
      </Section>
    </ScrollView>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.grid}>{children}</View>
);

const Metric = ({ icon, label, value, sub }: any) => (
  <View style={styles.card}>
    <Feather name={icon} size={20} />
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    {sub && <Text style={styles.cardSub}>{sub}</Text>}
  </View>
);

const Card = ({ title, children }: any) => (
  <View style={styles.bigCard}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text>{label}</Text>
    <Text style={styles.bold}>{value}</Text>
  </View>
);

const ListRow = ({ title, subtitle }: any) => (
  <View style={styles.listRow}>
    <Text style={styles.bold}>{title}</Text>
    <Text style={styles.small}>{subtitle}</Text>
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: "#f8fafc" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#64748b", marginBottom: 20 },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  bigCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardTitle: { fontWeight: "600", marginBottom: 8 },
  cardLabel: { marginTop: 6, color: "#475569" },
  cardValue: { fontSize: 20, fontWeight: "bold" },
  cardSub: { fontSize: 12, color: "#64748b" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  bold: { fontWeight: "600" },
  small: { fontSize: 12, color: "#64748b" },

  listRow: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
});
