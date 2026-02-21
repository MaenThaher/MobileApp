import { theme } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type QuestionStatus = {
  id: string;
  order_index: number;
  status: "answered" | "unanswered";
};

type QuizSidebarProps = {
  questions: QuestionStatus[];
  currentIndex: number;
  flaggedQuestions: Set<string>;
  onNavigate: (index: number) => void;
};

export default function QuizSidebar({
  questions,
  currentIndex,
  flaggedQuestions,
  onNavigate,
}: QuizSidebarProps) {
  const sortedQuestions = [...questions].sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questions</Text>

      <View style={styles.grid}>
        {sortedQuestions.map((question) => {
          const isCurrent = question.order_index === currentIndex;
          const isAnswered = question.status === "answered";
          const isFlagged = flaggedQuestions.has(question.id);

          const buttonStyles = [
            styles.gridButton,
            isCurrent && styles.gridButtonCurrent,
            !isCurrent && isAnswered && styles.gridButtonAnswered,
          ];

          return (
            <TouchableOpacity
              key={question.id}
              onPress={() => onNavigate(question.order_index)}
              style={buttonStyles}
              activeOpacity={0.7}
            >
              <Text style={styles.gridButtonText}>{question.order_index}</Text>
              {isFlagged && (
                <View style={styles.flagIndicator}>
                  <Feather
                    name="flag"
                    size={10}
                    color={theme.primaryForeground}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotCurrent]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotAnswered]} />
          <Text style={styles.legendText}>Answered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotUnanswered]} />
          <Text style={styles.legendText}>Unanswered</Text>
        </View>
        <View style={styles.legendItem}>
          <Feather name="flag" size={12} color={theme.primary} />
          <Text style={styles.legendText}>Flagged</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  gridButtonCurrent: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  gridButtonAnswered: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  gridButtonText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  flagIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.secondary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  legendDotCurrent: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  legendDotAnswered: {
    backgroundColor: "rgba(16, 185, 129, 0.6)",
    borderColor: "rgba(16, 185, 129, 1)",
  },
  legendDotUnanswered: {
    backgroundColor: theme.secondary,
    borderColor: theme.border,
  },
  legendText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
