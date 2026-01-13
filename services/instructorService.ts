import { API_BASE_URL } from "@/lib/config";
import { Course } from "@/types";
import {
  CourseDetail,
  InstructorDashboardData,
  InstructorSubmissionItem,
} from "@/types/serviceTypes";
import axios from "axios";

export async function getInstructorDashboard(
  instructorId: string
): Promise<InstructorDashboardData> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/instructor/dashboard`,
      {
        params: { instructorId },
      }
    );
    return response.data as InstructorDashboardData;
  } catch (error) {
    console.error("Error fetching instructor dashboard:", error);
    throw error;
  }
}

export async function getInstructorCourses(
  instructorId: string
): Promise<Course[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/instructor/courses`, {
      params: { instructorId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw error;
  }
}

export async function getInstructorSubmissions(
  instructorId: string
): Promise<InstructorSubmissionItem[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/instructor/submissions`,
      {
        params: { instructorId },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor submissions:", error);
    throw error;
  }
}

export async function getInstructorCourseDetails(
  courseId: string
): Promise<Course> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/instructor/courses/${courseId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor course details:", error);
    throw error;
  }
}
//PAYLOAD
// {
//   "code": "CS101",
//   "name": "Introduction to Computer Science Updated",
//   "description": "Updated description",
//   "semester": "Spring 2024",
//   "status": "active",
//   "instructorId": "uuid"
// }

export async function patchInstructorCourseDetails(
  courseId: string,
  course: Course
): Promise<CourseDetail> {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/instructor/courses/${courseId}`,
      {
        code: course.code,
        name: course.name,
        description: course.description,
        semester: course.semester,
        status: course.status,
        instructorId: course.instructor_id,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting instructor course details:", error);
    throw error;
  }
}
