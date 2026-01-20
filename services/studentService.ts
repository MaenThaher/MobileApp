import { API_BASE_URL } from "@/lib/config";
import type { QuizAttempt, Submission } from "@/types";
import type {
  StudentAssignmentDetailData,
  StudentCalendarData,
  StudentCourseAssignmentsData,
  StudentCourseDetail,
  StudentCourseOverview,
  StudentDashboardData,
  StudentQuizDate,
  StudentQuizQuestionCombined,
} from "@/types/serviceTypes";
import axios from "axios";

export async function getStudentCalendar(
  studentId: string
): Promise<StudentCalendarData> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/student/calendar`, {
      params: { studentId },
    });
    return response.data as StudentCalendarData;
  } catch (error) {
    console.error("Error fetching student calendar:", error);
    throw error;
  }
}

export async function getStudentCourses(
  studentId: string
): Promise<StudentCourseOverview[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/student/courses`, {
      params: { studentId },
    });
    return response.data as StudentCourseOverview[];
  } catch (error) {
    console.error("Error fetching student courses:", error);
    throw error;
  }
}

export async function getStudentDashboard(
  studentId: string
): Promise<StudentDashboardData> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/student/dashboard`, {
      params: { studentId },
    });
    return response.data as StudentDashboardData;
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    throw error;
  }
}

export async function getStudentCourseDetail(
  courseId: string,
  studentId: string
): Promise<StudentCourseDetail> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}`,
      {
        params: { studentId },
      }
    );
    return response.data as StudentCourseDetail;
  } catch (error) {
    console.error("Error fetching student course detail:", error);
    throw error;
  }
}

export async function getStudentAssignmentDetail(
  courseId: string,
  assignmentId: string,
  studentId: string
): Promise<StudentAssignmentDetailData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}/assignments/${assignmentId}`,
      { params: { studentId } }
    );
    return response.data as StudentAssignmentDetailData;
  } catch (error) {
    console.error("Error fetching student assignment detail:", error);
    throw error;
  }
}

export async function updateStudentAssignmentSubmission(payload: {
  courseId: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachmentUrl: string | null;
  circuitId: string | null;
  action: "draft" | "submit";
}): Promise<Submission> {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/student/courses/${payload.courseId}/assignments/${payload.assignmentId}`,
      {
        studentId: payload.studentId,
        content: payload.content,
        attachmentUrl: payload.attachmentUrl,
        circuitId: payload.circuitId,
        action: payload.action,
      }
    );
    return response.data.submission as Submission;
  } catch (error) {
    console.error("Error updating student submission:", error);
    throw error;
  }
}

export async function getStudentCourseAssignments(
  courseId: string,
  studentId: string
): Promise<StudentCourseAssignmentsData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}/assignments`,
      { params: { studentId } }
    );
    return response.data as StudentCourseAssignmentsData;
  } catch (error) {
    console.error("Error fetching student course assignments:", error);
    throw error;
  }
}

export async function getStudentQuizDate(
  courseId: string,
  quizId: string
): Promise<StudentQuizDate> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}/modules/${quizId}/date`
    );
    return response.data as StudentQuizDate;
  } catch (error) {
    console.error("Error fetching quiz date:", error);
    throw error;
  }
}

export async function getStudentQuizAttempt(
  courseId: string,
  quizId: string,
  studentId: string
): Promise<QuizAttempt> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}/modules/${quizId}/attempt`,
      {
        params: { studentId },
      }
    );
    return response.data as QuizAttempt;
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    throw error;
  }
}

export async function initStudentQuizAttempt(
  courseId: string,
  quizId: string,
  studentId: string
): Promise<QuizAttempt> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/student/courses/${courseId}/modules/${quizId}/attempt`,
      { studentId }
    );
    return response.data as QuizAttempt;
  } catch (error) {
    console.error("Error initializing quiz attempt:", error);
    throw error;
  }
}

export async function getStudentQuizQuestionCombined(
  courseId: string,
  quizId: string,
  attemptId: string,
  orderIndex: number
): Promise<StudentQuizQuestionCombined> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/student/courses/${courseId}/modules/${quizId}/questions/combined`,
      {
        params: { orderIndex, attemptId },
      }
    );
    return response.data as StudentQuizQuestionCombined;
  } catch (error) {
    console.error("Error fetching quiz question:", error);
    throw error;
  }
}

export async function submitStudentQuizAnswer(payload: {
  courseId: string;
  quizId: string;
  attemptId: string;
  questionId: string;
  answer: string;
}): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/api/student/courses/${payload.courseId}/modules/${payload.quizId}/questions`,
      {
        attemptId: payload.attemptId,
        questionId: payload.questionId,
        answer: payload.answer,
      }
    );
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    throw error;
  }
}

export async function finishStudentQuizAttempt(payload: {
  courseId: string;
  quizId: string;
  attemptId: string;
}): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/api/student/courses/${payload.courseId}/modules/${payload.quizId}/finish`,
      { attemptId: payload.attemptId }
    );
  } catch (error) {
    console.error("Error finishing quiz:", error);
    throw error;
  }
}
