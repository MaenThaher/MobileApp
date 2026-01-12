import { API_BASE_URL } from "@/lib/config";
import { InstructorDashboardData } from "@/types/serviceTypes";
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
