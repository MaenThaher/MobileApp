import React, { useState, useCallback, useEffect } from "react";
import { DangerModal } from "../DangerModal";
import type { CourseModule } from "@/types";

export interface DeleteModuleModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  instructorId: string;
  initialValues?: CourseModule | null;
  onSubmitted?: (moduleId: string) => void;
}

// Placeholder delete function
async function onDeletePlaceholder(
  courseId: string,
  moduleId: string,
  instructorId: string
) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("DELETE placeholder - deleteModule", {
    courseId,
    moduleId,
    instructorId,
  });
}

/**
 * DeleteModuleModal - Confirmation modal for deleting a module
 *
 * Mapping Notes:
 * - Web: DeleteModuleModal.tsx
 * - RN: instructor/DeleteModuleModal.tsx
 *
 * Fields Preserved:
 * - module (CourseModule object with id, title)
 * - courseId, instructorId for API call
 *
 * Mobile Adaptations:
 * - Uses DangerModal base component
 * - Dynamic warning text with module title
 * - Loading state during deletion
 */
export function DeleteModuleModal({
  visible,
  onClose,
  courseId,
  instructorId,
  initialValues,
  onSubmitted,
}: DeleteModuleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleConfirm = useCallback(async () => {
    if (!initialValues || !instructorId) return;

    setIsSubmitting(true);
    try {
      await onDeletePlaceholder(courseId, initialValues.id, instructorId);

      if (onSubmitted) {
        onSubmitted(initialValues.id);
      }

      onClose();
    } catch (error) {
      console.error("Error deleting module:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [initialValues, courseId, instructorId, onSubmitted, onClose]);

  if (!initialValues) return null;

  const warningText = `Are you sure you want to delete "${initialValues.title}"? This action cannot be undone and will permanently remove the module and all associated content.`;

  return (
    <DangerModal
      visible={visible}
      onClose={onClose}
      title="Delete Module"
      warningText={warningText}
      confirmButtonText="Delete Module"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
    />
  );
}

export default DeleteModuleModal;
