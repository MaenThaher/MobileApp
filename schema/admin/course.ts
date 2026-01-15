import * as yup from "yup";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createCourseSchema = yup.object({
  code: yup
    .string()
    .required("Course code is required")
    .min(2, "Course code must be at least 2 characters"),
  name: yup
    .string()
    .required("Course name is required")
    .min(3, "Course name must be at least 3 characters"),
  description: yup.string().nullable().notRequired(),
  semester: yup.string().nullable().notRequired(),
  instructor_search: yup
    .string()
    .required("Instructor is required")
    .test(
      "is-uuid-or-email",
      "Enter a valid instructor ID (UUID) or email",
      (value) => {
        if (!value) return false;
        const trimmed = value.trim();
        return (
          uuidRegex.test(trimmed) || yup.string().email().isValidSync(trimmed)
        );
      }
    ),
  status: yup
    .string()
    .oneOf(["active", "archived", "draft"], "Invalid status")
    .default("active"),
});

export type CreateCourseSchema = yup.InferType<typeof createCourseSchema>;
// Edit uses the same schema as create
export type EditCourseSchema = CreateCourseSchema;
