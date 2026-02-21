import React, { useState, useCallback, useEffect } from "react";
import { DangerModal } from "../DangerModal";
import type { Profile } from "@/types";

export interface DeleteStudentAdminModalProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: Profile | null;
  onSubmitted?: (studentId: string) => void;
}

// Placeholder delete function
async function onDeletePlaceholder(studentId: string) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("DELETE placeholder - deleteStudent", studentId);
}

/**
 * DeleteStudentAdminModal - Confirmation modal for deleting a student
 *
 * Mapping Notes:
 * - Web: DeleteStudentAdminModal.tsx
 * - RN: admin/DeleteStudentAdminModal.tsx
 *
 * Fields Preserved:
 * - student (Profile object with id, full_name)
 *
 * Mobile Adaptations:
 * - Uses DangerModal base component
 * - Dynamic warning text with student name
 * - Loading state during deletion
 */
export function DeleteStudentAdminModal({
  visible,
  onClose,
  initialValues,
  onSubmitted,
}: DeleteStudentAdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleConfirm = useCallback(async () => {
    if (!initialValues) return;

    setIsSubmitting(true);
    try {
      await onDeletePlaceholder(initialValues.id);

      if (onSubmitted) {
        onSubmitted(initialValues.id);
      }

      onClose();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [initialValues, onSubmitted, onClose]);

  if (!initialValues) return null;

  const warningText = `Are you sure you want to delete "${initialValues.full_name}"? This action cannot be undone and will permanently remove the student account and all associated data.`;

  return (
    <DangerModal
      visible={visible}
      onClose={onClose}
      title="Delete Student"
      warningText={warningText}
      confirmButtonText="Delete Student"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
    />
  );
}

export default DeleteStudentAdminModal;
