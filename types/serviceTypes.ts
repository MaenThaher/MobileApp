import {
  ActivityLogEntry,
  Assignment,
  AssignmentStatus,
  CircuitTemplate,
  Course,
  CourseModule,
} from ".";

export interface InstructorDashboardData {
  activeCourses: Course[];
  assignments: Assignment[];
  activities: ActivityLogEntry[];
}

export interface InstructorSubmissionItem {
  id: string;
  type: "assignment" | "quiz";
  // Assignment submission fields
  assignment_id: string | null;
  assignment_title: string | null;
  assignment_due_date: string | null;
  assignment_max_points: number | null;
  // Quiz attempt fields
  quiz_module_id: string | null;
  quiz_title: string | null;
  quiz_ends_at: string | null;
  quiz_max_score: number | null;
  // Common fields
  student_id: string;
  student_name: string | null;
  course_id: string;
  course_code: string | null;
  course_name: string | null;
  status: string;
  submitted_at: string | null;
  completed_at: string | null;
  grade: number | null;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
}

export interface CourseDetail {
  course: Course;
  modules: CourseModule[];
  assignments: Assignment[];
  templates: CircuitTemplate[];
}

export interface AssignmentFormValues {
  title: string;
  description?: string;
  instructions?: string;
  due_date: string;
  max_points: number;
  status: AssignmentStatus;
  template_id?: string;
  attachment_url?: string;
}
