import { FileUploadField } from "@/components/FileUploadField";
import * as colors from "@/constants/colors";
import { postInstructorAssignment } from "@/services/instructorService";
import type { AssignmentStatus, CircuitTemplate } from "@/types";
import { AssignmentFormValues } from "@/types/serviceTypes";
import { formatDate } from "@/utils/generalUtils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BaseModal } from "../BaseModal";

export interface CreateAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  instructorId: string;
  templates?: CircuitTemplate[];
  onSubmitted?: (data: AssignmentFormValues) => void;
}

async function onSubmitPlace(
  courseId: string,
  instructorId: string,
  formData: AssignmentFormValues
) {
  await postInstructorAssignment(courseId, formData, instructorId);
}

export function CreateAssignmentModal({
  visible,
  onClose,
  courseId,
  instructorId,
  templates = [],
  onSubmitted,
}: CreateAssignmentModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [maxPoints, setMaxPoints] = useState("100");
  const [status, setStatus] = useState<AssignmentStatus>("draft");
  const [templateId, setTemplateId] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sort templates by name
  const templateOptions = [...templates].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setInstructions("");
    setDueDate(null);
    setMaxPoints("100");
    setStatus("draft");
    setTemplateId("");
    setAttachmentUrl(null);
    setErrors({});
  }, []);

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (selectedDate) {
        setDueDate(selectedDate);
        // Show time picker after date on Android
        setShowTimePicker(true);
      }
    } else {
      // iOS uses inline picker
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }
  };

  // Handle time change (Android)
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && dueDate) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!dueDate) {
      newErrors.due_date = "Due date is required";
    }

    const points = parseInt(maxPoints, 10);
    if (isNaN(points) || points < 1) {
      newErrors.max_points = "Max points must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, dueDate, maxPoints]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData: AssignmentFormValues = {
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        due_date: dueDate!.toISOString(),
        max_points: parseInt(maxPoints, 10),
        status,
        template_id: templateId || undefined,
        attachment_url: attachmentUrl || undefined,
      };

      await onSubmitPlace(courseId, instructorId, formData);

      if (onSubmitted) {
        onSubmitted(formData);
      }

      resetForm();
      onClose();
    } catch (error: any) {
      setErrors({
        root: error.message || "Failed to create assignment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    title,
    description,
    instructions,
    dueDate,
    maxPoints,
    status,
    templateId,
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

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title="Create New Assignment"
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
              <Text style={styles.submitButtonText}>Create Assignment</Text>
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
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Lab 3: Series Circuits"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Due Date <Text style={styles.required}>*</Text>
        </Text>
        <Pressable
          style={[styles.dateButton, errors.due_date && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
          disabled={isSubmitting}
        >
          <Text
            style={[
              styles.dateButtonText,
              !dueDate && styles.dateButtonPlaceholder,
            ]}
          >
            {formatDate(dueDate?.toISOString() ?? null)}
          </Text>
        </Pressable>
        {errors.due_date && (
          <Text style={styles.errorText}>{errors.due_date}</Text>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode={Platform.OS === "ios" ? "datetime" : "date"}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Max Points</Text>
        <TextInput
          style={[styles.input, errors.max_points && styles.inputError]}
          value={maxPoints}
          onChangeText={setMaxPoints}
          placeholder="100"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          editable={!isSubmitting}
        />
        {errors.max_points && (
          <Text style={styles.errorText}>{errors.max_points}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(value) => setStatus(value as AssignmentStatus)}
            enabled={!isSubmitting}
            style={styles.picker}
            dropdownIconColor={colors.foreground}
          >
            <Picker.Item label="Draft" value="draft" />
            <Picker.Item label="Published" value="published" />
            <Picker.Item label="Closed" value="closed" />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the assignment objectives..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={[styles.input, styles.textAreaLarge]}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Provide detailed instructions..."
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Template</Text>
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
      </View>

      <FileUploadField
        title="Supporting File (Optional)"
        hint="PDF, DOCX, Images, ZIP/RAR up to 5MB"
        selectButtonText="Select File"
        hasFileButtonText="Change File"
        uploadEndpoint="/api/storage/assignments"
        storageBucket="assignments"
        formData={{ courseId }}
        maxFileSizeBytes={5 * 1024 * 1024} // 5MB
        maxFileSizeErrorMessage="File must be smaller than 5MB"
        acceptedMimeTypes={[
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/zip",
          "application/x-rar-compressed",
        ]}
        acceptedMimeTypePrefixes={["image/"]}
        unsupportedFileTypeErrorMessage="Please select a PDF, DOCX, Image, ZIP, or RAR file"
        uploadErrorFallback="Failed to upload file. Please try again."
        deleteErrorFallback="Failed to delete file. Please try again."
        disabled={isSubmitting}
        initialUrl={attachmentUrl}
        onUrlChange={setAttachmentUrl}
      />
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
  textAreaLarge: {
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

export default CreateAssignmentModal;
