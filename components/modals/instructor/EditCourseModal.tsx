import * as colors from "@/constants/colors";
import type { Course, CourseStatus } from "@/types";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BaseModal } from "../BaseModal";

interface EditCourseFormValues {
  code: string;
  name: string;
  description?: string;
  semester?: string;
  status: CourseStatus;
}

export interface EditCourseModalProps {
  visible: boolean;
  onClose: () => void;
  instructorId: string;
  initialValues?: Course | null;
  onSubmitted?: (data: EditCourseFormValues) => void;
}

import { patchInstructorCourseDetails } from "@/services/instructorService";

async function onSubmit(
  courseId: string,
  instructorId: string,
  formData: EditCourseFormValues
) {
  // Convert formData to Course type (partial)
  const courseUpdate: any = {
    code: formData.code,
    name: formData.name,
    description: formData.description,
    semester: formData.semester,
    status: formData.status,
    instructor_id: instructorId, // Ensure casing matches backend expectation if needed
  };

  await patchInstructorCourseDetails(courseId, courseUpdate);
}

export function EditCourseModal({
  visible,
  onClose,
  instructorId,
  initialValues,
  onSubmitted,
}: EditCourseModalProps) {
  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState<CourseStatus>("active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  //  Prefill the data when the modal opens js like da web
  useEffect(() => {
    if (visible && initialValues) {
      setCode(initialValues.code || "");
      setName(initialValues.name || "");
      setDescription(initialValues.description || "");
      setSemester(initialValues.semester || "");
      setStatus(initialValues.status || "active");
      setErrors({});
    }
  }, [visible, initialValues]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = "Course code is required";
    if (!name.trim()) newErrors.name = "Course name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setCode("");
    setName("");
    setDescription("");
    setSemester("");
    setStatus("active");
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate() || !initialValues) return;

    setIsSubmitting(true);
    try {
      const formData: EditCourseFormValues = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || undefined,
        semester: semester.trim() || undefined,
        status,
      };

      await onSubmit(initialValues.id, instructorId, formData);
      onSubmitted?.(formData);

      resetForm();
      onClose();
    } catch (error: any) {
      setErrors({
        root: error.message || "Failed to update course. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  if (!initialValues) return null;

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title="Edit Course"
      closeOnBackdropPress={!isSubmitting}
      footerContent={
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.submitButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Update Course</Text>
            )}
          </Pressable>
        </View>
      }
    >
      {errors.root && (
        <View style={styles.rootError}>
          <Text style={styles.rootErrorText}>{errors.root}</Text>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>
          Course Code <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.code && styles.inputError]}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. CS101, ECE201"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        <Text style={styles.helperText}>
          Unique identifier for the course (e.g., CS101)
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Course Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Introduction to Computer Science"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value as CourseStatus)}
            enabled={!isSubmitting}
            style={styles.picker}
            dropdownIconColor={colors.foreground}
          >
            <Picker.Item label="Active" value="active" />
            <Picker.Item label="Draft" value="draft" />
            <Picker.Item label="Archived" value="archived" />
          </Picker>
        </View>
        {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Semester</Text>
        <TextInput
          style={styles.input}
          value={semester}
          onChangeText={setSemester}
          placeholder="e.g. Fall 2024, Spring 2025"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.semester && (
          <Text style={styles.errorText}>{errors.semester}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the course objectives, topics, and learning outcomes..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  rootError: {
    backgroundColor: `${colors.destructive}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rootErrorText: {
    color: colors.destructive,
    fontSize: 14,
    textAlign: "center",
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    marginBottom: 8,
  },
  required: {
    color: colors.destructive,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.input,
    overflow: "hidden",
  },
  picker: {
    height: 48,
    color: colors.foreground,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditCourseModal;
