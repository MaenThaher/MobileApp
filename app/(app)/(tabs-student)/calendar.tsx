import { theme } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getStudentCalendar } from "@/services/studentService";
import type {
  StudentAssignment,
  StudentCalendarData,
  StudentQuiz,
} from "@/types/serviceTypes";
import { formatDate } from "@/utils/generalUtils";
import { formatCourseName } from "@/utils/uiUtils";
import {
  CalendarEvent,
  ViewMode,
  WEEKDAYS,
  addDays,
  formatDayKey,
  getCourseColor,
  getMonthGridDates,
  getWeekDates,
  getStartOfWeek,
  startOfDay,
  getAssignmentStatus,
  getAssignmentAction,
  getQuizAction,
  getQuizStatus,
  getEventLabel,
} from "@/utils/calendarUtils";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentCalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [calendarData, setCalendarData] =
    useState<StudentCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [focusedDate, setFocusedDate] = useState<Date>(new Date());

  const studentId = user?.id ?? null;
  const assignments = calendarData?.assignments ?? [];
  const quizzes = calendarData?.quizzes ?? [];

  useEffect(() => {
    if (!studentId) return;

    const fetchCalendar = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await getStudentCalendar(studentId);
        setCalendarData(data);
      } catch (error) {
        console.error("Error fetching student calendar:", error);
        setErrorMessage("Failed to load calendar data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendar();
  }, [studentId]);

  const events = useMemo<CalendarEvent[]>(() => {
    const now = new Date();
    const items: CalendarEvent[] = [];

    assignments.forEach((assignment: StudentAssignment) => {
      if (!assignment.due_date) return;
      const dueDate = new Date(assignment.due_date);
      if (Number.isNaN(dueDate.getTime())) return;

      const status = getAssignmentStatus(
        dueDate,
        assignment.submission_status,
        now
      );
      const actionLabel = getAssignmentAction(
        status,
        assignment.submission_status
      );

      const actionHref = assignment.course_id
        ? `/(app)/(tabs-student)/courses/${assignment.course_id}/assignments/${assignment.id}`
        : "";

      items.push({
        id: assignment.id,
        kind: "assignment",
        title: assignment.title,
        course_id: assignment.course_id ?? null,
        course_code: assignment.course_code ?? null,
        course_name: assignment.course_name ?? null,
        due_at: assignment.due_date ?? null,
        starts_at: null,
        ends_at: null,
        status,
        actionLabel,
        actionHref,
        eventDate: dueDate,
      });
    });

    quizzes.forEach((quiz: StudentQuiz) => {
      const startsAt = quiz.starts_at ? new Date(quiz.starts_at) : null;
      const endsAt = quiz.ends_at ? new Date(quiz.ends_at) : null;
      const status = getQuizStatus(quiz, now);

      let eventDate = startsAt ?? endsAt;
      if (startsAt && now.getTime() >= startsAt.getTime() && endsAt) {
        eventDate = endsAt;
      }

      if (!eventDate || Number.isNaN(eventDate.getTime())) return;

      const actionLabel = getQuizAction(quiz, now, status);
      const actionHref = quiz.course_id
        ? `/(app)/(tabs-student)/courses/${quiz.course_id}/modules/${quiz.id}/quiz`
        : "";

      items.push({
        id: quiz.id,
        kind: "quiz",
        title: quiz.title,
        course_id: quiz.course_id ?? null,
        course_code: quiz.course_code ?? null,
        course_name: quiz.course_name ?? null,
        due_at: null,
        starts_at: quiz.starts_at ?? null,
        ends_at: quiz.ends_at ?? null,
        status,
        actionLabel,
        actionHref,
        eventDate,
      });
    });

    return items.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }, [assignments, quizzes]);

  const calendarDates = useMemo(() => {
    return viewMode === "month"
      ? getMonthGridDates(focusedDate)
      : getWeekDates(focusedDate);
  }, [focusedDate, viewMode]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const key = formatDayKey(event.eventDate);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    });
    map.forEach((list) => {
      list.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
    });
    return map;
  }, [events]);

  const visibleRange = useMemo(() => {
    if (calendarDates.length === 0) {
      return { start: new Date(), end: new Date() };
    }
    const start = startOfDay(calendarDates[0]);
    const end = addDays(startOfDay(calendarDates[calendarDates.length - 1]), 1);
    return { start, end };
  }, [calendarDates]);

  const visibleEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.eventDate.getTime() >= visibleRange.start.getTime() &&
        event.eventDate.getTime() < visibleRange.end.getTime()
    );
  }, [events, visibleRange]);

  const todayItems = useMemo(() => {
    const now = new Date();
    const todayKey = formatDayKey(now);
    return events.filter((event) => {
      if (formatDayKey(event.eventDate) === todayKey) return true;
      if (event.kind === "quiz" && event.starts_at && event.ends_at) {
        const start = new Date(event.starts_at);
        const end = new Date(event.ends_at);
        return (
          now.getTime() >= start.getTime() && now.getTime() <= end.getTime()
        );
      }
      return false;
    });
  }, [events]);

  const monthLabel = focusedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekStart = getStartOfWeek(focusedDate);
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

  const handlePrev = () => {
    setFocusedDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : addDays(prev, -7)
    );
  };

  const handleNext = () => {
    setFocusedDate((prev) =>
      viewMode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        : addDays(prev, 7)
    );
  };

  const handleToday = () => {
    setFocusedDate(new Date());
  };

  const handleOpenEvent = (event: CalendarEvent) => {
    if (!event.actionHref) return;
    router.push(event.actionHref as any);
  };

  const renderEventChip = (event: CalendarEvent) => {
    const courseKey = event.course_code || event.course_id || event.id;
    const courseColor = getCourseColor(courseKey);
    return (
      <TouchableOpacity
        key={`${event.kind}-${event.id}`}
        style={styles.eventChip}
        onPress={() => handleOpenEvent(event)}
        activeOpacity={0.7}
      >
        <View style={[styles.eventDot, { backgroundColor: courseColor }]} />
        <Text style={styles.eventText} numberOfLines={1}>
          {event.kind === "assignment" ? "A:" : "Q:"} {event.title}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconBox}>
              <Feather name="calendar" size={24} color={theme.primary} />
            </View>
            <View>
              <Text style={styles.title}>Student Calendar</Text>
              <Text style={styles.subtitle}>
                Track deadlines, quiz windows, and what is happening this week.
              </Text>
            </View>
          </View>
          <View style={styles.dateBadge}>
            <Feather name="calendar" size={14} color={theme.mutedForeground} />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {errorMessage && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              {viewMode === "month" ? monthLabel : weekLabel}
            </Text>
            <View style={styles.calendarControls}>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === "month" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setViewMode("month")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      viewMode === "month" && styles.toggleTextActive,
                    ]}
                  >
                    Month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === "week" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setViewMode("week")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      viewMode === "week" && styles.toggleTextActive,
                    ]}
                  >
                    Week
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.navGroup}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrev}
                >
                  <Feather
                    name="chevron-left"
                    size={18}
                    color={theme.foreground}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handleNext}
                >
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={theme.foreground}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={handleToday}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayCell}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDates.map((date) => {
              const dayKey = formatDayKey(date);
              const dayEvents = eventsByDate.get(dayKey) ?? [];
              const isToday = formatDayKey(new Date()) === dayKey;
              const isOutside =
                viewMode === "month" && date.getMonth() !== focusedDate.getMonth();

              const displayEvents = dayEvents.slice(0, 2);
              const overflowCount =
                dayEvents.length > displayEvents.length
                  ? dayEvents.length - displayEvents.length
                  : 0;

              return (
                <View
                  key={dayKey}
                  style={[
                    styles.dayCell,
                    viewMode === "week" && styles.dayCellWeek,
                    isToday && styles.dayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isOutside && styles.dayOutside,
                      isToday && styles.dayNumberToday,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <View style={styles.eventList}>
                    {displayEvents.map(renderEventChip)}
                    {overflowCount > 0 && (
                      <Text style={styles.eventMore}>+{overflowCount} more</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Items</Text>
          {visibleEvents.length > 0 ? (
            <View style={styles.upcomingList}>
              {visibleEvents.map((event) => {
                const statusLabel =
                  event.status === "overdue"
                    ? "Overdue"
                    : event.status === "completed"
                    ? "Completed"
                    : "Upcoming";
                const statusStyle =
                  event.status === "overdue"
                    ? styles.statusOverdue
                    : event.status === "completed"
                    ? styles.statusCompleted
                    : styles.statusUpcoming;

                const timeLabel =
                  event.kind === "assignment"
                    ? `Due ${formatDate(event.due_at ?? undefined)}`
                    : `Window ${
                        event.starts_at
                          ? formatDate(event.starts_at)
                          : "TBD"
                      } - ${event.ends_at ? formatDate(event.ends_at) : "TBD"}`;

                return (
                  <View
                    key={`${event.kind}-${event.id}-list`}
                    style={styles.upcomingCard}
                  >
                    <Text style={styles.upcomingTitle}>
                      {event.kind === "assignment" ? "Assignment" : "Quiz"}:{" "}
                      {event.title}
                    </Text>
                    <View style={styles.upcomingMeta}>
                      <Text style={[styles.statusBadge, statusStyle]}>
                        {statusLabel}
                      </Text>
                      <Text style={styles.metaText}>
                        {formatCourseName(
                          event.course_code,
                          event.course_name
                        )}
                      </Text>
                      <Text style={styles.metaText}>{timeLabel}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionLink}
                      onPress={() => handleOpenEvent(event)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionLinkText}>
                        {event.actionLabel}
                      </Text>
                      <Feather
                        name="arrow-right"
                        size={14}
                        color={theme.primary}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events in this view.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.todayCard}>
            {todayItems.length > 0 ? (
              todayItems.map((event) => (
                <View
                  key={`${event.kind}-${event.id}-today`}
                  style={styles.todayItem}
                >
                  <Text style={styles.todayTitle}>{event.title}</Text>
                  <Text style={styles.todayMeta}>
                    {formatCourseName(event.course_code, event.course_name)}
                  </Text>
                  <Text style={styles.todayMeta}>{getEventLabel(event)}</Text>
                  <TouchableOpacity
                    style={styles.actionLink}
                    onPress={() => handleOpenEvent(event)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionLinkText}>
                      {event.actionLabel}
                    </Text>
                    <Feather
                      name="arrow-right"
                      size={14}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No tasks today.</Text>
            )}
          </View>
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
    paddingBottom: 32,
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.foreground,
  },
  subtitle: {
    fontSize: 13,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  dateBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  errorState: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.destructive,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    color: theme.destructive,
    fontSize: 13,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  calendarHeader: {
    gap: 12,
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
  },
  calendarControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: theme.secondary,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: theme.card,
  },
  toggleText: {
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: theme.foreground,
  },
  navGroup: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.secondary,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.secondary,
  },
  todayButtonText: {
    fontSize: 12,
    color: theme.foreground,
    fontWeight: "600",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 11,
    color: theme.mutedForeground,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    minHeight: 72,
    padding: 6,
    borderRadius: 8,
  },
  dayCellWeek: {
    minHeight: 96,
  },
  dayToday: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  dayNumber: {
    fontSize: 12,
    color: theme.foreground,
    fontWeight: "600",
  },
  dayNumberToday: {
    color: theme.primary,
  },
  dayOutside: {
    color: theme.muted,
  },
  eventList: {
    marginTop: 6,
    gap: 4,
  },
  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.secondary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventText: {
    flex: 1,
    fontSize: 10,
    color: theme.foreground,
  },
  eventMore: {
    fontSize: 10,
    color: theme.mutedForeground,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 12,
  },
  upcomingList: {
    gap: 12,
  },
  upcomingCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
    marginBottom: 8,
  },
  upcomingMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "600",
    color: theme.foreground,
  },
  statusOverdue: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: theme.destructive,
  },
  statusCompleted: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
  },
  statusUpcoming: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: theme.primary,
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionLinkText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  todayCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    gap: 12,
  },
  todayItem: {
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  todayMeta: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
