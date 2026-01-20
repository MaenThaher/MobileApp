import {
  ActivityLogEntry,
  Assignment,
  AssignmentStatus,
  CircuitTemplate,
  Course,
  CourseModule,
  CourseStatus,
  Profile,
  QuizQuestion,
  SlideDeck,
  Submission,
  SubmissionStatus
} from ".";

export interface InstructorDashboardData {
  activeCourses: Course[];
  assignments: Assignment[];
  activities: ActivityLogEntry[];
}

export interface InstructorAssignmentDetail extends Assignment {
  submissions?: Submission[];
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

export interface ExtendedSubmission extends Submission {
  student?: Profile;
  assignment?: Assignment & { course?: Course };
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

export type AutoGradeSubmissionInput = {
  assignment_attachment_url: string | null;
  max_points: number;
  description: string | null;
  instructions: string | null;
  submission_id: string;
  content: string | null;
  submission_attachment_url: string | null;
};

export type AutoGradeSubmissionResult = {
  grade: number | string;
  feedback: string | null;
};

// Student service types
export interface StudentEnrollmentSummary {
  course: Course;
  progress: number;
}

export interface StudentAssignment
  extends Omit<Assignment, "course_code" | "course_name"> {
  course_code?: string | null;
  course_name?: string | null;
  submission_status: SubmissionStatus | null;
  submission_id: string | null;
  submission_content?: string | null;
  submission_attachment_url?: string | null;
  submission_circuit_id?: string | null;
  submission_created_at?: string | null;
  submission_updated_at: string | null;
  submission_submitted_at?: string | null;
  submission_graded_at?: string | null;
  submission_grade?: number | null;
  submission_feedback?: string | null;
}

export interface StudentQuizAttemptInfo {
  id: string;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  max_score: number | null;
}

export interface StudentQuiz extends CourseModule {
  course_code: string | null;
  course_name: string | null;
  attempt: StudentQuizAttemptInfo | null;
  question_count: number;
  answered_count: number;
}

export interface StudentRecentFeedbackItem {
  kind: "assignment" | "quiz";
  title: string;
  course_id: string | null;
  course_code: string | null;
  course_name: string | null;
  grade: number | null;
  max_score: number | null;
  percent: number | null;
  feedback: string | null;
  date: string;
  submission_id: string | null;
  id: string | null; // assignment ID
  quiz_id: string | null;
}

export interface StudentResumeAssignmentItem {
  submission_id: string;
  assignment_id: string;
  course_id: string | null;
  title: string;
  course_code: string | null;
  course_name: string | null;
  updated_at: string | null;
}

export interface StudentResumeQuizItem {
  attempt_id: string;
  quiz_id: string;
  course_id: string | null;
  title: string;
  course_code: string | null;
  course_name: string | null;
  answered_count: number;
  question_count: number;
  started_at: string | null;
}

export interface StudentModuleItem {
  module_id: string;
  course_id: string;
  title: string;
  type: string;
  course_code: string | null;
  course_name: string | null;
  // For resume modules
  opened_at?: string;
  // For next modules
  order_index?: number | null;
  created_at?: string;
  // Assignment fields (for Assignment type modules)
  assignment_id?: string | null;
  due_date?: string | null;
  submission_status?: string | null;
  // Quiz fields (for Quiz type modules)
  quiz_attempt_id?: string | null;
  quiz_starts_at?: string | null;
  quiz_ends_at?: string | null;
}

export interface StudentDashboardData {
  enrollments: StudentEnrollmentSummary[];
  assignments: StudentAssignment[];
  quizzes: StudentQuiz[];
  recentFeedback: StudentRecentFeedbackItem[];
  resumeAssignments: StudentResumeAssignmentItem[];
  resumeQuizzes: StudentResumeQuizItem[];
  resumeModules: StudentModuleItem[];
  activities: ActivityLogEntry[];
  nextModules: StudentModuleItem[];
}

export interface StudentCalendarData {
  assignments: StudentAssignment[];
  quizzes: StudentQuiz[];
}

export type StudentCourseEventLabel = "due" | "opens" | "closes";

export interface StudentCourseNextEvent {
  kind: "assignment" | "quiz";
  title: string;
  date: string;
  label: StudentCourseEventLabel;
}

export interface StudentCourseOverview {
  // Course fields (flat from view)
  student_id: string;
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  instructor_id: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
  student_count: number;
  total_assignments: number;
  // Enrollment fields
  progress: number;
  // Instructor fields
  instructor_name: string | null;
  instructor_email: string | null;
  // Computed fields
  next_event: StudentCourseNextEvent | null;
  has_overdue: boolean;
  is_new: boolean;
}

export interface StudentCourseInstructorInfo {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface StudentCourseDetail {
  course: Course;
  progress: number;
  instructor: StudentCourseInstructorInfo | null;
  modules: CourseModule[];
  assignments: StudentAssignment[];
  quizzes: StudentQuiz[];
  slide_decks: SlideDeck[];
}

export interface StudentCourseAssignmentsCourse {
  id: string;
  code: string | null;
  name: string | null;
}

export interface StudentCourseAssignmentsData {
  course: StudentCourseAssignmentsCourse | null;
  assignments: StudentAssignment[];
}

export interface StudentAssignmentDetailData {
  course: StudentCourseAssignmentsCourse | null;
  assignment: StudentAssignment | null;
}


//EXTRAS (written in pages on web, and don't feel like refactoring ;( ))

export interface StudentQuizDate {
  starts_at: string | null;
  ends_at: string | null;
}

export type StudentQuizQuestionStatus = {
  id: string;
  order_index: number;
  status: "answered" | "unanswered";
};


export type StudentQuizQuestionCombined = {
  question: QuizQuestion | null;
  status: StudentQuizQuestionStatus[];
  isLast: boolean;
};
