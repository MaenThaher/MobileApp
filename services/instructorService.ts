//Some general terminology
// GET -> fetch data
// POST -> create data
// PATCH / PUT -> update data
// DELETE -> delete data
// That's how I'll name the functions so writing the components makes a bit more sense vs the API docs

import { CreateAssignmentFormValues } from "@/components/modals/instructor/CreateAssignmentModal";
import { API_BASE_URL } from "@/lib/config";
import { Assignment, Course } from "@/types";
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

//PAYLOAD
// {
//   "title": "Assignment 1",
//   "description": "Complete the following exercises",
//   "instructions": "Submit your work by the due date",
//   "dueDate": "2024-01-20T23:59:59Z",
//   "maxPoints": 100,
//   "status": "published",
//   "templateId": null,
//   "attachmentUrl": "https://...",
//   "instructorId": "uuid"
// }
export async function postInstructorAssignment(
  courseId: string,
  assignment: CreateAssignmentFormValues,
  instructorId: string
): Promise<Assignment> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/instructor/courses/${courseId}/assignments`,
      {
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.due_date,
        maxPoints: assignment.max_points,
        status: assignment.status,
        templateId: assignment.template_id,
        attachmentUrl: assignment.attachment_url,
        instructorId: instructorId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting instructor assignment:", error);
    throw error;
  }
}

export async function patchInstructorAssignment(
  courseId: string,
  assignmentId: string,
  assignment: Assignment,
  instructorId: string
): Promise<Assignment> {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/instructor/courses/${courseId}/assignments/${assignmentId}`,
      {
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.due_date,
        maxPoints: assignment.max_points,
        status: assignment.status,
        templateId: assignment.template_id,
        attachmentUrl: assignment.attachment_url,
        instructorId: instructorId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error patching instructor assignment:", error);
    throw error;
  }
}

export async function deleteInstructorAssignment(
  instructorId: string,
  assignmentId: string
): Promise<void> {
  try {
    await axios.delete(
      `${API_BASE_URL}/api/instructor/assignments/${assignmentId}`,
      {
        data: {
          instructorId,
        },
      }
    );
  } catch (error) {
    console.error("Error deleting instructor assignment:", error);
    throw error;
  }
}
