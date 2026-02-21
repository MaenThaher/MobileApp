import { theme } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuizNotStartedProps = {
  startsAt: Date;
  endsAt: Date | null;
  title?: string;
};

export default function QuizNotStarted({
  startsAt,
  endsAt,
  title = "Quiz Unavailable",
}: QuizNotStartedProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Feather name="lock" size={32} color={theme.mutedForeground} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>
            This quiz is currently locked. Please check back at the scheduled
            start time.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Feather name="calendar" size={18} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Opens</Text>
                <Text style={styles.infoValue}>
                  {startsAt.toLocaleString()}
                </Text>
              </View>
            </View>

            {endsAt && (
              <View style={styles.infoRow}>
                <Feather name="clock" size={18} color="#f59e0b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Closes</Text>
                  <Text style={styles.infoValue}>
                    {endsAt.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.footerText}>
          Current Server Time: {new Date().toLocaleString()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: theme.secondary,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  body: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.foreground,
  },
  description: {
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: theme.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: theme.foreground,
    marginTop: 2,
  },
  footerText: {
    padding: 16,
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
