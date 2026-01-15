import * as yup from "yup";

export const createUserSchema = yup.object({
  full_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email")
    .matches(/@najah\.edu$/, "Email must be a najah.edu address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const editUserSchema = yup.object({
  full_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email")
    .matches(/@najah\.edu$/, "Email must be a najah.edu address"),
  password: yup
    .string()
    .test(
      "password-length",
      "Password must be at least 6 characters",
      (value) => !value || value.length >= 6
    ),
});

export type CreateTeacherSchema = yup.InferType<typeof createUserSchema>;
export type CreateStudentSchema = yup.InferType<typeof createUserSchema>;

export type EditStudentSchema = yup.InferType<typeof editUserSchema>;
export type EditTeacherSchema = yup.InferType<typeof editUserSchema>;
