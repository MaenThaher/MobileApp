import { EditStudentSchema, editUserSchema } from "@/schema/admin/user";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Profile } from "../../types/index2";

export interface EditStudentAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  student: Profile | null;
}

export default function EditStudentAdminModal({
  isOpen,
  onClose,
  onSuccess,
  student,
}: EditStudentAdminModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditStudentSchema>({
    resolver: yupResolver(editUserSchema) as any,
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });



  useEffect(() => {
    if (student && isOpen) {
      reset({
        full_name: student.full_name,
        email: student.email,
        password: "",
      });
    }
  }, [student, isOpen, reset]);

  async function onSubmit(data: EditStudentSchema) {
    if (!student) return;

    try {
      await axios.patch("/api/admin/students", {
        id: student.id,
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        password: data.password?.trim() || "",
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError("root", {
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update student",
      });
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
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Edit Student</Text>

            {errors.root && (
              <Text style={styles.error}>{errors.root.message}</Text>
            )}

            {/* Full Name Field */}
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.full_name && (
              <Text style={styles.error}>{errors.full_name.message}</Text>
            )}

            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Password (optional)"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            <Text style={styles.helper}>
              Leave empty to keep current password (min 6 chars if changing)
            </Text>
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  keyboardView: {
    padding: 20,
    width: "100%",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  helper: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  cancelText: {
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});

