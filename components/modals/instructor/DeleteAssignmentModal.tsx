import { deleteInstructorAssignment } from "@/services/instructorService";
import type { Assignment } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { DangerModal } from "../DangerModal";

export interface DeleteAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  instructorId: string;
  assignment?: Assignment | null;
  onSubmitted?: (assignmentId: string) => void;
}

async function onDelete(
  courseId: string,
  assignmentId: string,
  instructorId: string
) {
  await deleteInstructorAssignment(instructorId, assignmentId);
}

export function DeleteAssignmentModal({
  visible,
  onClose,
  courseId,
  instructorId,
  assignment,
  onSubmitted,
}: DeleteAssignmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleConfirm = useCallback(async () => {
    if (!assignment || !instructorId) return;

    setIsSubmitting(true);
    try {
      await onDelete(courseId, assignment.id, instructorId);

      if (onSubmitted) {
        onSubmitted(assignment.id);
      }

      onClose();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [assignment, courseId, instructorId, onSubmitted, onClose]);

  if (!assignment) return null;

  const warningText = `Are you sure you want to delete "${assignment.title}"? This action cannot be undone and will permanently remove the assignment and all associated submissions.`;

  return (
    <DangerModal
      visible={visible}
      onClose={onClose}
      title="Delete Assignment"
      warningText={warningText}
      confirmButtonText="Delete Assignment"
      cancelButtonText="Cancel"
      onConfirm={handleConfirm}
      isSubmitting={isSubmitting}
    />
  );
}

export default DeleteAssignmentModal;
