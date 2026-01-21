import * as colors from "@/constants/colors";
import { API_BASE_URL } from "@/lib/config";
import {
  deriveFileNameFromUrl,
  deriveSupabasePathFromUrl,
} from "@/utils/generalUtils";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type FileUploadClearOptions = { deleteRemote?: boolean };

export interface FileUploadHandle {
  clear: (options?: FileUploadClearOptions) => Promise<boolean>;
}

export interface FileUploadFieldProps {
  active?: boolean;
  title: string;
  hint?: string;
  accept?: string;
  uploadEndpoint: string;
  deleteEndpoint?: string;
  storageBucket?: string;
  formData?: Record<string, string>;
  disabled?: boolean;
  maxFileSizeBytes?: number;
  maxFileSizeErrorMessage?: string;
  acceptedMimeTypes?: string[];
  acceptedMimeTypePrefixes?: string[];
  unsupportedFileTypeErrorMessage?: string;
  uploadErrorFallback?: string;
  deleteErrorFallback?: string;
  selectButtonText: string;
  uploadingButtonText?: string;
  hasFileButtonText?: string;
  showCurrentFileHint?: boolean;
  currentFileHintPrefix?: string;
  currentFileFallbackName?: string;
  initialUrl?: string | null;
  initialFileName?: string | null;
  initialPath?: string | null;
  onUrlChange?: (url: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
}

export const FileUploadField = forwardRef<
  FileUploadHandle,
  FileUploadFieldProps
>(function FileUploadField(
  {
    active = true,
    title,
    hint,
    accept,
    uploadEndpoint,
    deleteEndpoint,
    storageBucket,
    formData,
    disabled = false,
    maxFileSizeBytes,
    maxFileSizeErrorMessage,
    acceptedMimeTypes,
    acceptedMimeTypePrefixes,
    unsupportedFileTypeErrorMessage,
    uploadErrorFallback = "Failed to upload file",
    deleteErrorFallback = "Failed to delete file",
    selectButtonText,
    uploadingButtonText = "Uploading...",
    hasFileButtonText,
    showCurrentFileHint = false,
    currentFileHintPrefix = "Current file:",
    currentFileFallbackName = "Uploaded file",
    initialUrl = null,
    initialFileName = null,
    initialPath = null,
    onUrlChange,
    onBusyChange,
  },
  ref
) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [removingFile, setRemovingFile] = useState(false);
  const isMountedRef = useRef(true);

  const isBusy = uploading || removingFile;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onBusyChange?.(isBusy);
  }, [isBusy, onBusyChange]);

  useEffect(() => {
    if (!initialUrl) {
      setFileUrl(null);
      setFileName(null);
      setFilePath(null);
      setUploadError(null);
      return;
    }

    setFileUrl(initialUrl);
    setFileName(initialFileName ?? deriveFileNameFromUrl(initialUrl));

    const derivedPath =
      initialPath ??
      (storageBucket
        ? deriveSupabasePathFromUrl(initialUrl, storageBucket)
        : null);
    setFilePath(derivedPath);
    setUploadError(null);
  }, [initialFileName, initialPath, initialUrl, storageBucket]);

  const validateSelectedFile = useMemo(() => {
    const hasTypeRules =
      (acceptedMimeTypes?.length ?? 0) > 0 ||
      (acceptedMimeTypePrefixes?.length ?? 0) > 0;

    return (file: { size: number; mimeType?: string }): string | null => {
      if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
        return maxFileSizeErrorMessage ?? "File is too large";
      }

      if (!hasTypeRules) return null;
      if (!file.mimeType)
        return unsupportedFileTypeErrorMessage ?? "Unsupported file type";

      const prefixAllowed =
        acceptedMimeTypePrefixes?.some((prefix) =>
          file.mimeType!.startsWith(prefix)
        ) ?? false;
      if (prefixAllowed) return null;

      const exactAllowed = acceptedMimeTypes?.includes(file.mimeType) ?? false;
      if (exactAllowed) return null;

      return unsupportedFileTypeErrorMessage ?? "Unsupported file type";
    };
  }, [
    acceptedMimeTypes,
    acceptedMimeTypePrefixes,
    maxFileSizeBytes,
    maxFileSizeErrorMessage,
    unsupportedFileTypeErrorMessage,
  ]);

  async function uploadFile(file: {
    uri: string;
    name: string;
    size: number;
    mimeType?: string;
  }) {
    const validationError = validateSelectedFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    onBusyChange?.(true);
    setUploading(true);

    try {
      const payload = new FormData();
      // @ts-ignore - FormData.append works with file objects in React Native
      payload.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });

      if (formData) {
        for (const [key, value] of Object.entries(formData)) {
          payload.append(key, value);
        }
      }

      // Ensure endpoint includes localhost:3000
      const fullEndpoint = uploadEndpoint.startsWith("http")
        ? uploadEndpoint
        : `${API_BASE_URL}${uploadEndpoint}`;

      const response = await axios.post(fullEndpoint, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data?.url as string | undefined;
      const path = response.data?.path as string | undefined;

      if (!url) {
        throw new Error("Upload response did not include a file URL");
      }

      if (!isMountedRef.current) return;

      setFileName(file.name);
      setFileUrl(url);
      setFilePath(path ?? null);
      onUrlChange?.(url);
    } catch (error: any) {
      console.error("Upload error:", error);
      if (isMountedRef.current) {
        setUploadError(
          error.response?.data?.error || error.message || uploadErrorFallback
        );
        setFileName(null);
        setFileUrl(null);
        setFilePath(null);
        onUrlChange?.(null);
      }
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
        onBusyChange?.(removingFile);
      }
    }
  }

  async function clearFile(
    options: FileUploadClearOptions = {}
  ): Promise<boolean> {
    const { deleteRemote = false } = options;
    const currentPath = filePath;

    if (deleteRemote && currentPath) {
      if (isMountedRef.current) {
        onBusyChange?.(true);
        setRemovingFile(true);
      }
      try {
        // Ensure endpoint includes localhost:3000
        const fullEndpoint = (deleteEndpoint ?? uploadEndpoint).startsWith(
          "http"
        )
          ? deleteEndpoint ?? uploadEndpoint
          : `${API_BASE_URL}${deleteEndpoint ?? uploadEndpoint}`;

        await axios.delete(fullEndpoint, {
          data: { path: currentPath },
        });
      } catch (error: any) {
        console.error("Error deleting file:", error);
        if (isMountedRef.current) {
          setUploadError(
            error.response?.data?.error || error.message || deleteErrorFallback
          );
          setRemovingFile(false);
        }
        return false;
      }
      if (isMountedRef.current) {
        setRemovingFile(false);
        onBusyChange?.(uploading);
      }
    }

    if (isMountedRef.current) {
      setFileName(null);
      setFileUrl(null);
      setFilePath(null);
      setUploadError(null);
      onUrlChange?.(null);
    }

    return true;
  }

  useImperativeHandle(
    ref,
    () => ({
      clear: clearFile,
    }),
    [clearFile]
  );

  async function handleSelectFile() {
    if (disabled || isBusy) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: accept || "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      await uploadFile({
        uri: file.uri,
        name: file.name,
        size: file.size ?? 0,
        mimeType: file.mimeType,
      });
    } catch (error) {
      console.error("File selection error:", error);
      setUploadError("Failed to select file");
    }
  }

  function handleRemoveFile() {
    if (disabled || removingFile) return;

    Alert.alert(
      "Remove File",
      "Are you sure you want to remove this file? This will delete it from the server.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => void clearFile({ deleteRemote: true }),
        },
      ]
    );
  }

  const buttonLabel = uploading
    ? uploadingButtonText
    : fileUrl && hasFileButtonText
    ? hasFileButtonText
    : selectButtonText;

  if (!active) return null;

  return (
    <View style={styles.container}>
      <View style={styles.uploadBox}>
        <Text style={styles.uploadTitle}>{title}</Text>
        {hint && <Text style={styles.uploadHint}>{hint}</Text>}
        {showCurrentFileHint && fileUrl && (
          <Text style={styles.uploadHint}>
            {currentFileHintPrefix} {fileName || currentFileFallbackName}
          </Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.uploadButton,
            (disabled || uploading) && styles.uploadButtonDisabled,
            pressed && !disabled && !uploading && styles.uploadButtonPressed,
          ]}
          onPress={handleSelectFile}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.uploadButtonText}>{buttonLabel}</Text>
            </>
          )}
        </Pressable>

        {fileName && (
          <View style={styles.fileRow}>
            <Ionicons
              name="document-outline"
              size={20}
              color={colors.primary}
              style={styles.fileIcon}
            />
            <Text style={styles.fileName} numberOfLines={2}>
              {fileName}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                (disabled || removingFile) && styles.removeButtonDisabled,
                pressed &&
                  !disabled &&
                  !removingFile &&
                  styles.removeButtonPressed,
              ]}
              onPress={handleRemoveFile}
              disabled={disabled || removingFile}
            >
              {removingFile ? (
                <ActivityIndicator size="small" color={colors.destructive} />
              ) : (
                <Text style={styles.removeButtonText}>Remove</Text>
              )}
            </Pressable>
          </View>
        )}

        {uploadError && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={colors.destructive}
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{uploadError}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: `${colors.primary}99`, // 60% opacity
    borderRadius: 12,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}0A`, // 4% opacity
    gap: 12,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  uploadButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  uploadButtonPressed: {
    backgroundColor: `${colors.primary}E6`, // 90% opacity
    transform: [{ scale: 0.98 }],
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: `${colors.primary}1A`, // 10% opacity
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    marginTop: 4,
    width: "100%",
  },
  fileIcon: {
    flexShrink: 0,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonPressed: {
    backgroundColor: `${colors.destructive}1A`, // 10% opacity
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.destructive,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  errorIcon: {
    flexShrink: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.destructive,
    flex: 1,
  },
});

export default FileUploadField;
