import React, { useState, useCallback, useEffect } from "react";
import { DangerModal } from "../DangerModal";
import type { Course } from "@/types";

export interface DeleteCourseAdminModalProps {
  visible: boolean;
  onClose: () => void;
  initialValues?: Course | null;
  onSubmitted?: (courseId: string) => void;
}

// Placeholder delete function
async function onDeletePlaceholder(courseId: string) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("DELETE placeholder - deleteCourse", courseId);
}

/**
 * DeleteCourseAdminModal - Confirmation modal for deleting a course
 *
 * Mapping Notes:
 * - Web: DeleteCourseAdminModal.tsx
 * - RN: admin/DeleteCourseAdminModal.tsx
 *
 * Fields Preserved:
 * - course (Course object with id, name, code)
 *
 * Mobile Adaptations:
 * - Uses DangerModal base component
 * - Dynamic warning text with course name and code
 * - Loading state during deletion
 */
export function DeleteCourseAdminModal({
  visible,
  onClose,
  initialValues,
  onSubmitted,
}: DeleteCourseAdminModalProps) {
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
      console.error("Error deleting course:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [initialValues, onSubmitted, onClose]);

  if (!initialValues) return null;

  const warningText = `Are you sure you want to delete "${initialValues.name}" (${initialValues.code})? This action cannot be undone and will permanently remove the course and all associated data.`;

  return (
    <DangerModal
      visible={visible}
      onClose={onClose}
      title="Delete Course"
      warningText={warningText}
      confirmButtonText="Delete Course"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
    />
  );
}

export default DeleteCourseAdminModal;
