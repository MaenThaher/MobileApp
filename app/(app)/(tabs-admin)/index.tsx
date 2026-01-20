import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/* ================= TYPES ================= */

type AdminCard = {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: readonly [string, string, ...string[]];
  route: Href;
};

/* ================= DATA ================= */

const cards: readonly AdminCard[] = [
  {
    title: "Students",
    description: "Manage student accounts",
    icon: <Feather name="award" size={28} color="#fff" />,
    gradient: ["#3b82f6", "#60a5fa", "#2563eb"],
    route: "/tabs-students",
  },
  {
    title: "Teachers",
    description: "Manage instructors",
    icon: <Feather name="users" size={28} color="#fff" />,
    gradient: ["#6366f1", "#818cf8", "#4f46e5"],
    route: "/tabs-teacher",
  },
  {
    title: "Courses",
    description: "Oversee courses",
    icon: <Feather name="book-open" size={28} color="#fff" />,
    gradient: ["#8b5cf6", "#a78bfa", "#7c3aed"],
    route: "/tabs-courses",
  },
  {
    title: "Analytics",
    description: "View analytics",
    icon: <Feather name="bar-chart-2" size={28} color="#fff" />,
    gradient: ["#f59e0b", "#fbbf24", "#d97706"],
    route: "/tabs-analytic",
  },
  {
    title: "AI Management",
    description: "AI monitoring",
    icon: <Feather name="cpu" size={28} color="#fff" />,
    gradient: ["#06b6d4", "#22d3ee", "#0891b2"],
    route: "/tabs-ai",
  },
];

/* ================= SCREEN ================= */

export default function AdminDashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage courses, students, teachers, and analytics
        </Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable
            key={card.title}
            style={styles.card}
            onPress={() => router.push(card.route)}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.cardGradient}
            />

            <View style={styles.cardContent}>
              <View style={styles.iconBox}>{card.icon}</View>

              <View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </View>

              <View style={styles.actionRow}>
                <Text style={styles.actionText}>Open</Text>
                <Feather name="arrow-right" size={16} color="#e5e7eb" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 6,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  cardGradient: {
    height: 110,
    opacity: 0.35,
  },
  cardContent: {
    padding: 20,
    gap: 14,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  cardDescription: {
    fontSize: 14,
    color: "#cbd5f5",
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#e5e7eb",
    fontWeight: "500",
  },
});
