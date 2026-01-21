import QuizSidebar from "@/components/student/quiz/QuizSidebar";
import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import {
  finishStudentQuizAttempt,
  getStudentQuizQuestionCombined,
  initStudentQuizAttempt,
  submitStudentQuizAnswer,
} from "@/services/studentService";
import type { QuizQuestion } from "@/types";
import type { StudentQuizQuestionStatus } from "@/types/serviceTypes";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QuestionStatus = StudentQuizQuestionStatus;

export default function StudentQuizQuestionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params.courseId as string;
  const quizId = params.quizId as string;
  const indexParam = params.index as string;
  const currentIndex = useMemo(() => {
    const parsed = Number(indexParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [indexParam]);

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>(
    []
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!quizId) return;
    const loadFlags = async () => {
      try {
        const stored = await AsyncStorage.getItem(`quiz_flags_${quizId}`);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFlaggedQuestions(new Set(parsed));
        }
      } catch (error) {
        console.error("Failed to load quiz flags:", error);
      }
    };
    loadFlags();
  }, [quizId]);

  useEffect(() => {
    if (!quizId) return;
    const persistFlags = async () => {
      try {
        await AsyncStorage.setItem(
          `quiz_flags_${quizId}`,
          JSON.stringify(Array.from(flaggedQuestions))
        );
      } catch (error) {
        console.error("Failed to save quiz flags:", error);
      }
    };
    persistFlags();
  }, [flaggedQuestions, quizId]);

  const toggleFlag = () => {
    if (!question) return;
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user?.id || !courseId || !quizId) return;

    const initializeAttempt = async () => {
      try {
        const attempt = await initStudentQuizAttempt(
          courseId,
          quizId,
          user.id
        );

        if (attempt.completed_at) {
          router.replace(
            `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz` as any
          );
          return;
        }

        setAttemptId(attempt.id);
      } catch (error) {
        console.error("Error initializing quiz attempt:", error);
      }
    };

    initializeAttempt();
  }, [user?.id, courseId, quizId, router]);

  useEffect(() => {
    if (!attemptId || !courseId || !quizId) return;

    const loadQuestion = async () => {
      try {
        setLoading(true);
        const data = await getStudentQuizQuestionCombined(
          courseId,
          quizId,
          attemptId,
          currentIndex
        );

        if (!data.question) {
          setQuestion(null);
          setLoading(false);
          return;
        }

        setQuestion(data.question);
        setQuestionStatuses(data.status || []);
        setIsLastQuestion(data.isLast || false);
        setSelectedAnswer("");
        setSubmitted(false);
      } catch (error) {
        console.error("Error fetching quiz question:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [courseId, quizId, attemptId, currentIndex]);

  const handleSubmitAnswer = async () => {
    if (!attemptId || !question || !selectedAnswer.trim()) return;

    try {
      setSubmitting(true);
      await submitStudentQuizAnswer({
        courseId,
        quizId,
        attemptId,
        questionId: question.id,
        answer: selectedAnswer.trim(),
      });
      setSubmitted(true);

      const data = await getStudentQuizQuestionCombined(
        courseId,
        quizId,
        attemptId,
        currentIndex
      );
      setQuestionStatuses(data.status || []);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push(
      `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz/question/${
        currentIndex + 1
      }` as any
    );
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    try {
      await finishStudentQuizAttempt({ courseId, quizId, attemptId });
      router.push(
        `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz` as any
      );
    } catch (error) {
      console.error("Error finishing quiz:", error);
    }
  };

  const handleNavigate = (idx: number) => {
    router.push(
      `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz/question/${idx}` as any
    );
  };

  if (loading || !attemptId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.background} />
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.statusCard}>
          <Feather name="alert-circle" size={40} color={theme.mutedForeground} />
          <Text style={styles.statusTitle}>Question not found</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push(
                `/(app)/(tabs-student)/courses/${courseId}/modules/${quizId}/quiz` as any
              )
            }
          >
            <Text style={styles.primaryButtonText}>Back to Quiz Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isFlagged = flaggedQuestions.has(question.id);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionMeta}>
              <View style={styles.badgeRow}>
                <View style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>
                    Question {currentIndex}
                  </Text>
                </View>
                {isLastQuestion && (
                  <View style={styles.questionBadgeAlt}>
                    <Text style={styles.questionBadgeText}>Final Question</Text>
                  </View>
                )}
              </View>
              <Text style={styles.questionText}>{question.question_text}</Text>
            </View>
            <TouchableOpacity
              onPress={toggleFlag}
              style={[
                styles.flagButton,
                isFlagged && styles.flagButtonActive,
              ]}
              activeOpacity={0.7}
            >
              <Feather
                name="flag"
                size={18}
                color={isFlagged ? theme.primary : theme.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.questionBody}>
            {question.question_type === "multiple_choice" &&
              question.options && (
                <View style={styles.optionsGrid}>
                  {question.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => !submitted && setSelectedAnswer(option)}
                        style={[
                          styles.optionRow,
                          isSelected && styles.optionRowSelected,
                          submitted && styles.optionRowDisabled,
                        ]}
                        activeOpacity={0.7}
                      >
                        <View style={styles.radioIndicator}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

            {question.question_type === "true_false" && (
              <View style={styles.trueFalseGrid}>
                {["true", "false"].map((value) => {
                  const isSelected = selectedAnswer === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => !submitted && setSelectedAnswer(value)}
                      style={[
                        styles.optionRow,
                        styles.optionRowCentered,
                        isSelected && styles.optionRowSelected,
                        submitted && styles.optionRowDisabled,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionText}>
                        {value.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {question.question_type === "short_answer" && (
              <TextInput
                style={styles.textInput}
                placeholder="Type your answer here..."
                placeholderTextColor={theme.muted}
                value={selectedAnswer}
                onChangeText={(text) => !submitted && setSelectedAnswer(text)}
                editable={!submitted}
                multiline
              />
            )}
          </View>

          {submitted && question.explanation && (
            <View style={styles.feedbackSection}>
              <Feather name="check-circle" size={18} color="#10b981" />
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackTitle}>Answer Submitted</Text>
                <Text style={styles.feedbackText}>{question.explanation}</Text>
              </View>
            </View>
          )}

          <View style={styles.actionBar}>
            <TouchableOpacity
              onPress={() => {
                if (currentIndex > 1) {
                  handleNavigate(currentIndex - 1);
                }
              }}
              disabled={currentIndex <= 1}
              style={[
                styles.navButton,
                currentIndex <= 1 && styles.navButtonDisabled,
              ]}
            >
              <Feather name="chevron-left" size={16} color={theme.foreground} />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>

            {!submitted ? (
              <TouchableOpacity
                onPress={handleSubmitAnswer}
                disabled={!selectedAnswer.trim() || submitting}
                style={[
                  styles.primaryButton,
                  (!selectedAnswer.trim() || submitting) &&
                    styles.primaryButtonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? "Submitting..." : "Submit Answer"}
                </Text>
              </TouchableOpacity>
            ) : isLastQuestion ? (
              <TouchableOpacity
                onPress={handleFinish}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Finish Quiz</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleNext}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Next Question</Text>
                <Feather name="arrow-right" size={16} color={theme.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <QuizSidebar
          questions={questionStatuses}
          currentIndex={currentIndex}
          flaggedQuestions={flaggedQuestions}
          onNavigate={handleNavigate}
        />

        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Quiz Instructions</Text>
          <Text style={styles.instructionText}>
            You can move between questions freely using the grid. Flag questions
            to review them later. Your progress is saved automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 16,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  questionMeta: {
    flex: 1,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  questionBadge: {
    backgroundColor: theme.secondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionBadgeAlt: {
    backgroundColor: "rgba(129, 140, 248, 0.2)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionBadgeText: {
    fontSize: 11,
    color: theme.foreground,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    color: theme.foreground,
    fontWeight: "600",
    lineHeight: 22,
  },
  flagButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.secondary,
  },
  flagButtonActive: {
    borderColor: theme.primary,
  },
  questionBody: {
    gap: 12,
  },
  optionsGrid: {
    gap: 12,
  },
  trueFalseGrid: {
    flexDirection: "row",
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
  },
  optionRowCentered: {
    flex: 1,
    justifyContent: "center",
  },
  optionRowSelected: {
    borderColor: theme.primary,
    backgroundColor: "rgba(59, 130, 246, 0.16)",
  },
  optionRowDisabled: {
    opacity: 0.6,
  },
  radioIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.card,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
  },
  optionText: {
    color: theme.foreground,
    fontSize: 13,
    fontWeight: "600",
  },
  textInput: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    color: theme.foreground,
    backgroundColor: theme.input,
    textAlignVertical: "top",
  },
  feedbackSection: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  feedbackContent: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    fontSize: 13,
    color: theme.foreground,
    fontWeight: "600",
  },
  feedbackText: {
    fontSize: 12,
    color: theme.mutedForeground,
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: theme.white,
    fontSize: 13,
    fontWeight: "600",
  },
  instructionCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 8,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  instructionText: {
    fontSize: 12,
    color: theme.mutedForeground,
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
});
