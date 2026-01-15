import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    createUserSchema,
    type CreateStudentSchema,
} from "@/schema/admin/user";

export interface CreateStudentAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStudentAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStudentAdminModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentSchema>({
    resolver: yupResolver(createUserSchema),
    mode: "onSubmit",
  });

  async function onSubmit(data: CreateStudentSchema) {
    try {
      const response = await axios.post("/api/admin/students", {
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      if (response.status === 201) {
        reset();
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create student. Please try again.";
      setError("root", { message: errorMessage });
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Create New Student</Text>

          {errors.root && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTextRoot}>
                {errors.root.message}
              </Text>
            </View>
          )}

          {/* Full Name */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter student's full name"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.full_name && (
              <Text style={styles.errorText}>
                {errors.full_name.message}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter student's email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.formField}>
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>
                {errors.password.message}
              </Text>
            )}
            <Text style={styles.helperText}>
              Password must be at least 6 characters long
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Create Student
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, styles.outlineButton]}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#fdecea",
    borderColor: "#d32f2f",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTextRoot: {
    color: "#d32f2f",
    fontSize: 14,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  required: {
    color: "#d32f2f",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginTop: 4,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  outlineButtonText: {
    fontWeight: "500",
  },
});
