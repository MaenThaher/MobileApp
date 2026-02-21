import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BaseModal } from "../BaseModal";
import * as colors from "@/constants/colors";

// Form values type
interface CreateTeacherFormValues {
  full_name: string;
  email: string;
  password: string;
}

export interface CreateTeacherAdminModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitted?: (data: CreateTeacherFormValues) => void;
}

// Placeholder submit function
async function onSubmitPlaceholder(formData: CreateTeacherFormValues) {
  // TODO: connect to backend/service later
  await new Promise((r) => setTimeout(r, 400));
  console.log("SUBMIT placeholder - createTeacher", formData);
}

/**
 * CreateTeacherAdminModal - Create new teacher account
 *
 * Mapping Notes:
 * - Web: CreateTeacherAdminModal.tsx
 * - RN: admin/CreateTeacherAdminModal.tsx
 *
 * Fields Preserved:
 * - full_name* (required)
 * - email* (required)
 * - password* (required, min 6 chars)
 *
 * Mobile Adaptations:
 * - Single column vertical layout
 * - Inline validation errors
 * - KeyboardAvoidingView from BaseModal
 * - Secure text entry for password
 * - Touch-friendly input fields
 */
export function CreateTeacherAdminModal({
  visible,
  onClose,
  onSubmitted,
}: CreateTeacherAdminModalProps) {
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form
  const resetForm = useCallback(() => {
    setFullName("");
    setEmail("");
    setPassword("");
    setErrors({});
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, email, password]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData: CreateTeacherFormValues = {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      };

      await onSubmitPlaceholder(formData);

      if (onSubmitted) {
        onSubmitted(formData);
      }

      resetForm();
      onClose();
    } catch (error: any) {
      setErrors({
        root: error.message || "Failed to create teacher. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, fullName, email, password, onSubmitted, resetForm, onClose]);

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
      title="Create New Teacher"
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
              <Text style={styles.submitButtonText}>Create Teacher</Text>
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

      {/* Full Name Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Full Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.full_name && styles.inputError]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter teacher's full name"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.full_name && (
          <Text style={styles.errorText}>{errors.full_name}</Text>
        )}
      </View>

      {/* Email Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Email <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter teacher's email"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isSubmitting}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <Text style={styles.helperText}>
          Password must be at least 6 characters long
        </Text>
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

export default CreateTeacherAdminModal;
