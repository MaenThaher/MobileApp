import React, { useState, useCallback, useEffect } from "react";
import { DangerModal } from "../DangerModal";
import type { Profile } from "@/types";

export interface DeleteTeacherAdminModalProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: Profile | null;
  onSubmitted?: (teacherId: string) => void;
}

// Placeholder delete function
async function onDeletePlaceholder(teacherId: string) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("DELETE placeholder - deleteTeacher", teacherId);
}

/**
 * DeleteTeacherAdminModal - Confirmation modal for deleting a teacher
 *
 * Mapping Notes:
 * - Web: DeleteTeacherAdminModal.tsx
 * - RN: admin/DeleteTeacherAdminModal.tsx
 *
 * Fields Preserved:
 * - teacher (Profile object with id, full_name)
 *
 * Mobile Adaptations:
 * - Uses DangerModal base component
 * - Dynamic warning text with teacher name
 * - Loading state during deletion
 */
export function DeleteTeacherAdminModal({
  visible,
  onClose,
  initialValues,
  onSubmitted,
}: DeleteTeacherAdminModalProps) {
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
      console.error("Error deleting teacher:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [initialValues, onSubmitted, onClose]);

  if (!initialValues) return null;

  const warningText = `Are you sure you want to delete "${initialValues.full_name}"? This action cannot be undone and will permanently remove the teacher account and all associated data.`;

  return (
    <DangerModal
      visible={visible}
      onClose={onClose}
      title="Delete Teacher"
      warningText={warningText}
      confirmButtonText="Delete Teacher"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
    />
  );
}

export default DeleteTeacherAdminModal;
