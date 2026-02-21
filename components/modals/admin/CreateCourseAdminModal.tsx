import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { BaseModal } from "../BaseModal";
import * as colors from "@/constants/colors";
import type { Profile, CourseStatus } from "@/types";

// Form values type
interface CreateCourseFormValues {
  code: string;
  name: string;
  description?: string;
  semester?: string;
  status: CourseStatus;
  instructor_id: string;
}

// Found teacher type (simplified Profile)
interface FoundTeacher {
  id: string;
  full_name: string;
  email: string;
}

export interface CreateCourseAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: (data: CreateCourseFormValues) => void;
}

// Placeholder submit function
async function onSubmitPlaceholder(formData: CreateCourseFormValues) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("SUBMIT placeholder - createCourse", formData);
}

// Placeholder search teacher function
async function searchTeacherPlaceholder(
  query: string
): Promise<FoundTeacher | null> {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 300));
  console.log("SEARCH placeholder - searchTeacher", query);
  // Return mock data for testing
  return null;
}

/**
 * CreateCourseAdminModal - Create new course
 *
 * Mapping Notes:
 * - Web: CreateCourseAdminModal.tsx
 * - RN: admin/CreateCourseAdminModal.tsx
 *
 * Fields Preserved:
 * - code* (required)
 * - name* (required)
 * - description (optional)
 * - semester (optional)
 * - status (default: active)
 * - instructor_search* (required - search and select instructor)
 *
 * Mobile Adaptations:
 * - Single column vertical layout
 * - Native Picker for status dropdown
 * - Instructor search with text input + search button
 * - Found instructor display card
 * - Scrollable content for longer form
 */
export function CreateCourseAdminModal({
  visible,
  onClose,
  onSubmitted,
}: CreateCourseAdminModalProps) {
  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState("");
  const [status, setStatus] = useState<CourseStatus>("active");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [foundTeacher, setFoundTeacher] = useState<FoundTeacher | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teacherSearchError, setTeacherSearchError] = useState<string | null>(
    null
  );

  // Reset form
  const resetForm = useCallback(() => {
    setCode("");
    setName("");
    setDescription("");
    setSemester("");
    setStatus("active");
    setInstructorSearch("");
    setFoundTeacher(null);
    setErrors({});
    setTeacherSearchError(null);
  }, []);

  // Search teacher
  const handleSearchTeacher = useCallback(async () => {
    if (!instructorSearch.trim()) {
      setTeacherSearchError("Enter instructor ID, email, or name");
      setFoundTeacher(null);
      return;
    }

    setIsSearching(true);
    setTeacherSearchError(null);

    try {
      const result = await searchTeacherPlaceholder(instructorSearch.trim());
      if (result) {
        setFoundTeacher(result);
        setTeacherSearchError(null);
      } else {
        setFoundTeacher(null);
        setTeacherSearchError("Teacher not found. Try ID or email.");
      }
    } catch (error) {
      setFoundTeacher(null);
      setTeacherSearchError("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [instructorSearch]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = "Course code is required";
    }

    if (!name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!foundTeacher) {
      newErrors.instructor = "Please search and select an instructor";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [code, name, foundTeacher]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate() || !foundTeacher) return;

    setIsSubmitting(true);
    try {
      const formData: CreateCourseFormValues = {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        semester: semester.trim() || undefined,
        status,
        instructor_id: foundTeacher.id,
      };

      await onSubmitPlaceholder(formData);

      if (onSubmitted) {
        onSubmitted(formData);
      }

      resetForm();
      onClose();
    } catch (error: any) {
      setErrors({
        root: error.message || "Failed to create course. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    foundTeacher,
    code,
    name,
    description,
    semester,
    status,
    onSubmitted,
    resetForm,
    onClose,
  ]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }, [isSubmitting, resetForm, onClose]);

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title="Create New Course"
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
              (isSubmitting || !foundTeacher) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !foundTeacher}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Create Course</Text>
            )}
          </Pressable>
        </View>
      }
    >
      {/* Root Error */}
      {errors.root && (
        <View style={styles.rootError}>
          <Text style={styles.rootErrorText}>{errors.root}</Text>
        </View>
      )}

      {/* Course Code Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Course Code <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.code && styles.inputError]}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. ECOM2301"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
      </View>

      {/* Course Name Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Course Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Electrical Circuits I"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Description Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Course description..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>

      {/* Semester Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Semester</Text>
        <TextInput
          style={styles.input}
          value={semester}
          onChangeText={setSemester}
          placeholder="e.g. Spring 2024"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          editable={!isSubmitting}
        />
      </View>

      {/* Status Field */}
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
      </View>

      {/* Instructor Search Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Instructor <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[styles.input, styles.searchInput]}
            value={instructorSearch}
            onChangeText={setInstructorSearch}
            placeholder="Enter instructor ID or email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isSearching}
          />
          <Pressable
            style={[
              styles.searchButton,
              (isSearching || !instructorSearch.trim()) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSearchTeacher}
            disabled={isSearching || !instructorSearch.trim() || isSubmitting}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </Pressable>
        </View>
        {errors.instructor && (
          <Text style={styles.errorText}>{errors.instructor}</Text>
        )}
        {teacherSearchError && (
          <Text style={styles.errorText}>{teacherSearchError}</Text>
        )}

        {/* Found Teacher Card */}
        {foundTeacher && (
          <View style={styles.foundTeacherCard}>
            <Text style={styles.foundTeacherLabel}>Found:</Text>
            <Text style={styles.foundTeacherName}>{foundTeacher.full_name}</Text>
            <Text style={styles.foundTeacherEmail}>({foundTeacher.email})</Text>
          </View>
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
    height: 100,
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
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
  },
  foundTeacherCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  foundTeacherLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  foundTeacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  foundTeacherEmail: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
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

export default CreateCourseAdminModal;
