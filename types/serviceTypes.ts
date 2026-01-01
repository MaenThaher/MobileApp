import { CreateAssignmentSchema } from "@/schema/instructor/assignment";
import type { AssignmentStatus, CourseStatus, UserRole } from "./index2";

// Admin service types

// what the RPC function returns
export interface DashboardAssignment {
  assignment_id: string;
  title: string;
  status: AssignmentStatus;
  due_date: string | null;
  max_points: number;
  template_id: string | null;
  created_at: string;
  updated_at: string;
  course_code?: string;
  course_name?: string;
  ungraded_count: number;
  submission_count: number;
  graded_count: number;
  is_overdue: boolean;
  days_until_due: number;
  attachment_url: string | null;
}

export interface DashboardActivity {
  activity_id: string;
  activity_type: string;
  description: string;
  user_id: string | null;
  course_id: string | null;
  assignment_id: string | null;
  template_id: string | null;
  created_at: string;
  course_code?: string;
  course_name?: string;
}

export interface DashboardCourseRow {
  course_id: string;
  course_code: string;
  course_name: string;
  course_status: CourseStatus;
  course_description: string | null;
  course_semester: string | null;
  course_created_at: string;
  course_updated_at: string;
  student_count: number;
  total_assignments: number;
  total_modules: number;
  published_modules: number;
  assignments: DashboardAssignment[] | null;
  activity: DashboardActivity[] | null;
}

//Auth service types

export interface JWTProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  last_active: string | null;
  iat?: number; //issued at
  exp?: number; //expires at
  [key: string]: any; // Add this index signature
  //note: this is a workaround to avoid type errors when using the JWT library
  //this covers all the needed signatures that we don't actually use, so type script does not complain
}

// Instructor service types
export interface CreateInstructorAssignmentInput
  extends CreateAssignmentSchema {
  course_id: string;
  instructor_id: string;
}
