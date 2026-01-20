import { ActivityLogEntry, Assignment, Course } from ".";

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
// types/serviceTypes.ts
export interface AdminAiManagementData {
  overview: {
    totalChats: number;
    totalMessages: number;
    avgMessagesPerChat: number;
    uniqueUsersWithChats: number;
    messagesToday: number;
    messagesThisWeek: number;
    messagesThisMonth: number;
  };
  slides: {
    totalDecks: number;
    pdfDecks: number;
    pptxDecks: number;
    totalSlides: number;
    latestIngestAt: string | null;
  };
  documents: {
    totalDocuments: number;
    totalPages: number;
    totalChunks: number;
    latestIngestAt: string | null;
  };
  quality: {
    unknownCount: number;
    aiWithoutSources: number;
    avgAiLength: number;
    maxAiLength: number;
    sourceCoverage: number;
  };
  unknownMessages: {
    id: string;
    message: string;
    createdAt: string;
  }[];
}
