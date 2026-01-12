// Enum types matching database ENUMs
export type UserRole = "student" | "instructor" | "admin";
export type AssignmentStatus = "draft" | "published" | "closed";
export type SubmissionStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";
export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "active" | "archived" | "draft";
export type ModuleType = "Lecture" | "Lab" | "Quiz" | "Assignment" | "Slides";
export type ModuleStatus = "Published" | "Draft";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

// Profile - matches profiles table
export interface Profile {
  id: string; // UUID
  role: UserRole; // NOT NULL DEFAULT 'student'
  full_name: string; // NOT NULL (DB uses full_name, not fullName)
  email: string; // NOT NULL UNIQUE
  avatar_url: string | null;
  bio: string | null;
  last_active: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
  google_sub: string | null; // Google OIDC subject identifier
}

// Course - matches courses table
export interface Course {
  id: string; // UUID
  code: string; // NOT NULL UNIQUE
  name: string; // NOT NULL
  description: string | null;
  semester: string | null;
  instructor_id: string; // UUID NOT NULL
  status: CourseStatus; // NOT NULL DEFAULT 'active'
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
  // Aggregated fields (from views)
  student_count?: number; // From course_enrollments
  total_assignments?: number; // From assignments
  total_modules?: number; // From course_modules
  published_modules?: number; // From course_modules
  // Optional fields for admin views (from joins)
  instructor_name?: string | null; // From profiles join
  instructor_email?: string | null; // From profiles join
}

// Assignment - matches assignments table
export interface Assignment {
  id: string; // UUID
  course_id: string; // UUID NOT NULL (required in DB)
  title: string; // NOT NULL
  description: string | null;
  instructions: string | null;
  due_date: string | null; // TIMESTAMPTZ
  max_points: number; // NOT NULL DEFAULT 100
  status: AssignmentStatus; // NOT NULL DEFAULT 'draft'
  template_id: string | null; // UUID
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL

  //added from migration
  attachment_url: string | null;

  // Aggregated fields (from views)
  ungraded_count?: number; // From submissions
  submission_count?: number; // From submissions
  graded_count?: number; // From submissions
  course_code?: string; // From courses join
  course_name?: string; // From courses join
  student_count?: number; // From course_enrollments
}

// Submission - matches submissions table
export interface Submission {
  id: string; // UUID
  assignment_id: string; // UUID NOT NULL
  student_id: string; // UUID NOT NULL
  circuit_id: string | null; // UUID
  status: SubmissionStatus; // NOT NULL DEFAULT 'not_started'
  submitted_at: string | null; // TIMESTAMPTZ
  grade: number | null; // DECIMAL(5,2)
  feedback: string | null;
  graded_at: string | null; // TIMESTAMPTZ
  graded_by: string | null; // UUID
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL

  //new fields from migration
  content?: string;
  attachment_url?: string;
  // Aggregated field (from join)
  student_name?: string | null; // From profiles join
}

// CourseModule - matches course_modules table
export interface CourseModule {
  id: string; // UUID
  course_id: string; // UUID NOT NULL
  title: string; // NOT NULL
  type: ModuleType; // NOT NULL
  status: ModuleStatus; // NOT NULL DEFAULT 'Draft'
  content: string | null;
  order_index: number | null;
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
  attachment_url: string | null;
  starts_at: string | null; // TIMESTAMPTZ
  ends_at: string | null; // TIMESTAMPTZ
  template_id?: string | null; // UUID - for Lab modules
}

// Quiz Question - matches quiz_questions table
export interface QuizQuestion {
  id: string; // UUID
  module_id: string; // UUID NOT NULL
  question_text: string; // NOT NULL
  question_type: "multiple_choice" | "true_false" | "short_answer"; // NOT NULL
  options: string[] | null; // JSONB - For multiple choice: ["Option A", "Option B", "Option C", "Option D"]
  correct_answer: string; // NOT NULL - For MC: "A", for T/F: "true"/"false", for short: the answer
  points: number; // NOT NULL DEFAULT 1
  order_index: number; // NOT NULL
  explanation: string | null; // Optional: shown after answering
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

// Quiz Attempt - matches quiz_attempts table
export interface QuizAttempt {
  id: string; // UUID
  module_id: string; // UUID NOT NULL
  student_id: string; // UUID NOT NULL
  score: number | null; // DECIMAL(5,2)
  max_score: number | null; // INTEGER
  started_at: string; // TIMESTAMPTZ NOT NULL
  completed_at: string | null; // TIMESTAMPTZ
  // Aggregated fields (from joins)
  student_name?: string; // From profiles join
  module_title?: string; // From course_modules join
}

// Quiz Answer - matches quiz_answers table
export interface QuizAnswer {
  id: string; // UUID
  attempt_id: string; // UUID NOT NULL
  question_id: string; // UUID NOT NULL
  student_answer: string; // NOT NULL
  is_correct: boolean | null;
  points_earned: number | null; // DECIMAL(5,2)
  answered_at: string; // TIMESTAMPTZ NOT NULL
  // Aggregated fields (from joins)
  question_text?: string; // From quiz_questions join
  correct_answer?: string; // From quiz_questions join
}

// Slide Deck - matches slide_decks table
export interface SlideDeck {
  id: string; // UUID
  deck_id: string; // TEXT UNIQUE NOT NULL
  filename: string; // TEXT NOT NULL
  file_type: "pdf" | "pptx"; // TEXT NOT NULL
  attachment_url: string | null;
  total_slides: number | null;
  uploaded_at: string; // TIMESTAMPTZ NOT NULL
  uploaded_by: string | null; // UUID
  metadata: any; // JSONB
}

// CircuitTemplate - matches circuit_templates table
export interface CircuitTemplate {
  id: string; // UUID
  name: string; // NOT NULL
  description: string | null;
  course_id: string | null; // UUID
  difficulty: TemplateDifficulty; // NOT NULL DEFAULT 'beginner'
  circuit_data: any; // JSONB NOT NULL
  thumbnail_url: string | null;
  is_public: boolean; // NOT NULL DEFAULT TRUE
  created_by: string; // UUID NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

// ActivityLogEntry - matches activity_log table
export interface ActivityLogEntry {
  id: string; // UUID
  user_id: string | null; // UUID
  course_id: string | null; // UUID
  assignment_id: string | null; // UUID
  template_id: string | null; // UUID
  module_id: string | null; // UUID
  activity_type: string; // NOT NULL
  description: string; // NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL
  // Aggregated fields (from joins)
  course_code?: string; // From courses join
  course_name?: string; // From courses join
}

// Chat - matches chats table
export interface Chat {
  id: string; // UUID
  user_id: string; // UUID NOT NULL
  name: string; // NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL
  updated_at: string; // TIMESTAMPTZ NOT NULL
}

// Message - matches messages table
export interface Message {
  id: string; // UUID
  chat_id: string; // UUID NOT NULL
  role: "USER" | "AI"; // NOT NULL CHECK
  content: string; // NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL
  metadata?: any; // JSONB
}

// RAG types (for chatbot)
export interface RAGSource {
  page: number;
  source: string;
}

export interface RAGResponse {
  answer: string;
  question: string;
  sources: RAGSource[];
  used_queries: string[];
}

// EXTRA MOBILE TYPES
export interface AxiosAPIError {
  error: string;
  message?: string;
}
