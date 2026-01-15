import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Profile } from "../../types/index2";

export interface DeleteStudentAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  student: Profile | null;
}

export function DeleteStudentAdminModal({
  isOpen,
  onClose,
  onSuccess,
  student,
}: DeleteStudentAdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !student) {
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen, student]);

  async function handleDelete() {
    if (!student) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.delete("/api/admin/students", {
        data: { id: student.id },
      });

      if (response.status === 200) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete student. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!student) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Delete Student</Text>

          <Text style={styles.warning}>
            Are you sure you want to delete{" "}
            <Text style={styles.bold}>{student.full_name}</Text>?
            {"\n\n"}
            This action cannot be undone and will permanently remove the student
            account and all associated data.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteText}>Delete</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  warning: {
    fontSize: 14,
    color: "#444",
    marginBottom: 16,
  },
  bold: {
    fontWeight: "700",
  },
  error: {
    color: "#d32f2f",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },
});
