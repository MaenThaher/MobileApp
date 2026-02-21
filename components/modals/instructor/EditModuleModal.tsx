import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BaseModal } from "../BaseModal";
import * as colors from "@/constants/colors";
import type {
  CourseModule,
  ModuleType,
  ModuleStatus,
  CircuitTemplate,
} from "@/types";

// Form values type
interface EditModuleFormValues {
  title: string;
  type: ModuleType;
  status: ModuleStatus;
  content?: string;
  attachment_url?: string;
  starts_at?: string;
  ends_at?: string;
  template_id?: string;
}

export interface EditModuleModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  instructorId: string;
  initialValues?: CourseModule | null;
  templates?: CircuitTemplate[];
  onSubmitted?: (data: EditModuleFormValues) => void;
}

// Placeholder submit function
async function onSubmitPlaceholder(
  courseId: string,
  moduleId: string,
  instructorId: string,
  formData: EditModuleFormValues
) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("SUBMIT placeholder - editModule", {
    courseId,
    moduleId,
    instructorId,
    formData,
  });
}

/**
 * EditModuleModal - Edit existing course module
 *
 * Mapping Notes:
 * - Web: EditModuleModal.tsx
 * - RN: instructor/EditModuleModal.tsx
 *
 * Fields Preserved:
 * - title*, type*, status
 * - content, attachment_url
 * - starts_at, ends_at (for Quiz)
 * - template_id (for Lab)
 *
 * Mobile Adaptations:
 * - Pre-fills form with existing module data
 * - Conditional field rendering based on module type
 * - Native pickers and date pickers
 */
export function EditModuleModal({
  visible,
  onClose,
  courseId,
  instructorId,
  initialValues,
  templates = [],
  onSubmitted,
}: EditModuleModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [moduleType, setModuleType] = useState<ModuleType>("Lecture");
  const [status, setStatus] = useState<ModuleStatus>("Draft");
  const [content, setContent] = useState("");
  const [templateId, setTemplateId] = useState<string>("");

  // Quiz-specific state
  const [startsAt, setStartsAt] = useState<Date | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sort templates by name
  const templateOptions = useMemo(
    () => [...templates].sort((a, b) => a.name.localeCompare(b.name)),
    [templates]
  );

  // Pre-fill form when modal opens
  useEffect(() => {
    if (visible && initialValues) {
      setTitle(initialValues.title || "");
      setModuleType(initialValues.type || "Lecture");
      setStatus(initialValues.status || "Draft");
      setContent(initialValues.content || "");
      setTemplateId(initialValues.template_id || "");
      setStartsAt(
        initialValues.starts_at ? new Date(initialValues.starts_at) : null
      );
      setEndsAt(initialValues.ends_at ? new Date(initialValues.ends_at) : null);
      setErrors({});
    }
  }, [visible, initialValues]);

  // Reset form
  const resetForm = useCallback(() => {
    setTitle("");
    setModuleType("Lecture");
    setStatus("Draft");
    setContent("");
    setTemplateId("");
    setStartsAt(null);
    setEndsAt(null);
    setErrors({});
  }, []);

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return "Select date";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Date picker handlers
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
      if (selectedDate) {
        setStartsAt(selectedDate);
        setShowStartTimePicker(true);
      }
    } else {
      if (selectedDate) setStartsAt(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime && startsAt) {
      const newDate = new Date(startsAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartsAt(newDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
      if (selectedDate) {
        setEndsAt(selectedDate);
        setShowEndTimePicker(true);
      }
    } else {
      if (selectedDate) setEndsAt(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime && endsAt) {
      const newDate = new Date(endsAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndsAt(newDate);
    }
  };

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!moduleType) {
      newErrors.type = "Module type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, moduleType]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate() || !initialValues) return;

    setIsSubmitting(true);
    try {
      const formData: EditModuleFormValues = {
        title: title.trim(),
        type: moduleType,
        status,
        content: content.trim() || undefined,
        template_id: templateId || undefined,
        starts_at: startsAt?.toISOString(),
        ends_at: endsAt?.toISOString(),
      };

      await onSubmitPlaceholder(
        courseId,
        initialValues.id,
        instructorId,
        formData
      );

      if (onSubmitted) {
        onSubmitted(formData);
      }

      resetForm();
      onClose();
    } catch (error: any) {
      setErrors({
        root: error.message || "Failed to update module. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    initialValues,
    title,
    moduleType,
    status,
    content,
    templateId,
    startsAt,
    endsAt,
    courseId,
    instructorId,
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

  if (!initialValues) return null;

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title="Edit Module"
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
              <Text style={styles.submitButtonText}>Update Module</Text>
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

      {/* Title Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Introduction to Circuits"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      {/* Module Type Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Module Type <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={moduleType}
            onValueChange={(value) => setModuleType(value as ModuleType)}
            enabled={!isSubmitting}
            style={styles.picker}
            dropdownIconColor={colors.foreground}
          >
            <Picker.Item label="Lecture" value="Lecture" />
            <Picker.Item label="Lab" value="Lab" />
            <Picker.Item label="Quiz" value="Quiz" />
            <Picker.Item label="Assignment" value="Assignment" />
            <Picker.Item label="Slides" value="Slides" />
          </Picker>
        </View>
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
      </View>

      {/* Status Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value as ModuleStatus)}
            enabled={!isSubmitting}
            style={styles.picker}
            dropdownIconColor={colors.foreground}
          >
            <Picker.Item label="Draft" value="Draft" />
            <Picker.Item label="Published" value="Published" />
          </Picker>
        </View>
      </View>

      {/* Lecture-specific fields */}
      {moduleType === "Lecture" && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Add lecture notes or description..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Lecture Video (Optional)</Text>
            <View style={styles.fileUploadPlaceholder}>
              <Text style={styles.fileUploadText}>
                Video upload available in future update
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Slides-specific fields */}
      {moduleType === "Slides" && (
        <View style={styles.field}>
          <Text style={styles.label}>Slides File (Optional)</Text>
          <View style={styles.fileUploadPlaceholder}>
            <Text style={styles.fileUploadText}>
              Slides upload available in future update
            </Text>
          </View>
        </View>
      )}

      {/* Quiz-specific fields */}
      {moduleType === "Quiz" && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Add quiz description..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          {/* Start Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Start Date & Time</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  !startsAt && styles.dateButtonPlaceholder,
                ]}
              >
                {formatDate(startsAt)}
              </Text>
            </Pressable>

            {showStartDatePicker && (
              <DateTimePicker
                value={startsAt || new Date()}
                mode={Platform.OS === "ios" ? "datetime" : "date"}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleStartDateChange}
              />
            )}
            {showStartTimePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={startsAt || new Date()}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          {/* End Date */}
          <View style={styles.field}>
            <Text style={styles.label}>End Date & Time</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  !endsAt && styles.dateButtonPlaceholder,
                ]}
              >
                {formatDate(endsAt)}
              </Text>
            </Pressable>

            {showEndDatePicker && (
              <DateTimePicker
                value={endsAt || new Date()}
                mode={Platform.OS === "ios" ? "datetime" : "date"}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndDateChange}
              />
            )}
            {showEndTimePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={endsAt || new Date()}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </View>
        </>
      )}

      {/* Lab-specific fields */}
      {moduleType === "Lab" && (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Add lab description..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Circuit Template</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={templateId}
                onValueChange={(value) => setTemplateId(value)}
                enabled={!isSubmitting && templateOptions.length > 0}
                style={styles.picker}
                dropdownIconColor={colors.foreground}
              >
                <Picker.Item label="No template" value="" />
                {templateOptions.map((template) => (
                  <Picker.Item
                    key={template.id}
                    label={template.name}
                    value={template.id}
                  />
                ))}
              </Picker>
            </View>
            {templateOptions.length === 0 && (
              <Text style={styles.helperText}>
                No circuit templates available for this course
              </Text>
            )}
          </View>
        </>
      )}

      {/* Assignment info box */}
      {moduleType === "Assignment" && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Assignment modules are managed through the Assignments section.
          </Text>
        </View>
      )}
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
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: colors.input,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.foreground,
  },
  dateButtonPlaceholder: {
    color: colors.muted,
  },
  fileUploadPlaceholder: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: colors.input,
  },
  fileUploadText: {
    fontSize: 14,
    color: colors.muted,
  },
  infoBox: {
    padding: 16,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  infoText: {
    fontSize: 14,
    color: colors.foreground,
    textAlign: "center",
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

export default EditModuleModal;
