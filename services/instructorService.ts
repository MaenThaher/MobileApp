import { API_BASE_URL } from "@/lib/config";
import { Course } from "@/types";
import {
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
