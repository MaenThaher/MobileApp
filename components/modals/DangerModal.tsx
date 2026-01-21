import * as colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BaseModal } from "./BaseModal";

export interface DangerModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  warningText: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
}

/**
 * DangerModal - Confirmation modal for destructive actions
 *
 * Mapping Notes:
 * - Web: DangerModalBase.tsx
 * - RN: DangerModal.tsx
 *
 * Fields Preserved:
 * - title, warningText, confirmButtonText, cancelButtonText
 * - onConfirm callback, isSubmitting state
 *
 * Mobile Adaptations:
 * - Uses BaseModal as foundation
 * - Warning icon with danger color
 * - Large touch targets for buttons
 * - Loading indicator during submission
 * - Backdrop press disabled during submission
 */
export function DangerModal({
  visible,
  onClose,
  title,
  warningText,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  onConfirm,
  isSubmitting = false,
}: DangerModalProps) {
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title={title}
      showCloseButton={false}
      closeOnBackdropPress={!isSubmitting}
      scrollable={false}
      footerContent={
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={isSubmitting}
            accessibilityLabel={cancelButtonText}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.deleteButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={isSubmitting}
            accessibilityLabel={confirmButtonText}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.deleteButtonText}>{confirmButtonText}</Text>
            )}
          </Pressable>
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.warningIconContainer}>
          <Ionicons name="warning" size={48} color={colors.destructive} />
        </View>
        <Text style={styles.warningText}>{warningText}</Text>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingVertical: 8,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.destructive}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  warningText: {
    fontSize: 16,
    color: colors.foreground,
    textAlign: "center",
    lineHeight: 24,
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
  deleteButton: {
    backgroundColor: colors.destructive,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default DangerModal;
