import { ActivityLogEntry, Assignment, Course } from ".";

export interface InstructorDashboardData {
  activeCourses: Course[];
  assignments: Assignment[];
  activities: ActivityLogEntry[];
}
