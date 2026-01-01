import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email")
    .matches(/@najah\.edu$/, "Email must be a najah.edu address"),
  password: yup
    .string()
    .required("Password is required")
    .min(4, "Password must be at least 4 characters"),
});

export type LoginSchema = yup.InferType<typeof loginSchema>;

export const signupSchema = yup
  .object({
    name: yup
      .string()
      .required("Full name is required")
      .min(5, "Full name must be at least 5 characters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Enter a valid email")
      .matches(/@najah\.edu$/, "Email must be a najah.edu address"),
    role: yup
      .string()
      .oneOf(["student", "instructor"], "Select a role")
      .required("Select a role"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirm: yup
      .string()
      .required("Confirm your password")
      .oneOf([yup.ref("password")], "Passwords do not match"),
  })
  .required();

export type SignupSchema = yup.InferType<typeof signupSchema>;
