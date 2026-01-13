import * as colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  footerContent?: React.ReactNode;
  scrollable?: boolean;
}

/**
 * BaseModal - Mobile-first modal component
 *
 * Mapping Notes:
 * - Web: BaseModal.tsx with HTMLDialogElement
 * - RN: Uses React Native Modal with slide animation
 *
 * Mobile Adaptations:
 * - KeyboardAvoidingView for input handling
 * - SafeAreaView for notch/status bar
 * - Android back button handling
 * - ScrollView for long content
 * - Touch-friendly close button (44px target)
 */
export function BaseModal({
  visible,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  closeOnBackdropPress = true,
  footerContent,
  scrollable = true,
}: BaseModalProps) {
  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [visible, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdropPress) {
      onClose();
    }
  }, [closeOnBackdropPress, onClose]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.headerTextContainer}>
                    {title && (
                      <Text
                        style={styles.title}
                        accessibilityRole="header"
                        numberOfLines={2}
                      >
                        {title}
                      </Text>
                    )}
                  </View>
                  {showCloseButton && (
                    <Pressable
                      onPress={onClose}
                      style={styles.closeButton}
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.foreground}
                      />
                    </Pressable>
                  )}
                </View>
              )}

              {description && (
                <Text style={styles.description}>{description}</Text>
              )}

              {scrollable ? (
                <ScrollView
                  style={styles.body}
                  contentContainerStyle={styles.bodyContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              ) : (
                <View style={styles.body}>{children}</View>
              )}

              {footerContent && (
                <View style={styles.footer}>{footerContent}</View>
              )}
            </SafeAreaView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    minHeight: 200,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.foreground,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: colors.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    paddingHorizontal: 20,
    paddingTop: 12,
    lineHeight: 20,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});

export default BaseModal;
