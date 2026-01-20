import QuizFinished from "@/components/student/quiz/QuizFinished";
import QuizNotStarted from "@/components/student/quiz/QuizNotStarted";
import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
  getStudentQuizAttempt,
  getStudentQuizDate,
} from "@/services/studentService";
import type { QuizAttempt } from "@/types";
import type { StudentQuizDate } from "@/types/serviceTypes";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentQuizHomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.courseId as string;
  const quizId = params.quizId as string;
  const studentId = user?.id ?? null;

  const [quizDate, setQuizDate] = useState<StudentQuizDate | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || !courseId || !quizId) return;

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [dateData, attemptData] = await Promise.all([
          getStudentQuizDate(courseId, quizId),
          getStudentQuizAttempt(courseId, quizId, studentId),
        ]);
        setQuizDate(dateData);
        setAttempt(attemptData);
      } catch (error: any) {
        console.error("Error fetching quiz data:", error);
        if (error?.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage("Failed to load quiz");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [studentId, courseId, quizId]);

  const currentDate = useMemo(() => new Date(), []);
  const startsAt = quizDate?.starts_at ? new Date(quizDate.starts_at) : null;
  const endsAt = quizDate?.ends_at ? new Date(quizDate.ends_at) : null;

  const isFinished =
    !!attempt?.completed_at || (!!endsAt && currentDate > endsAt);
  const shouldRedirect =
    !loading && !errorMessage && !!startsAt && !!endsAt && !isFinished;

  useEffect(() => {
    if (!shouldRedirect) return;
    if (startsAt && currentDate < startsAt) return;
    router.replace(
      `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz/question/1` as any
    );
  }, [shouldRedirect, startsAt, currentDate, courseId, quizId, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (errorMessage || !quizDate || !startsAt || !endsAt) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Feather name="alert-circle" size={32} color={theme.destructive} />
          </View>
          <Text style={styles.statusTitle}>Quiz Not Available</Text>
          <Text style={styles.statusDescription}>
            {errorMessage ||
              "This quiz is not currently available. It may be in draft status or has been removed."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (startsAt && currentDate < startsAt) {
    return <QuizNotStarted startsAt={startsAt} endsAt={endsAt} />;
  }

  if (isFinished) {
    return (
      <QuizFinished
        score={attempt?.score}
        maxScore={attempt?.max_score}
        completedAt={attempt?.completed_at ?? null}
        courseId={courseId}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Preparing quiz...</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: theme.mutedForeground,
  },
  statusCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.foreground,
  },
  statusDescription: {
    fontSize: 13,
    color: theme.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
});
