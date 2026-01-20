// import { Course } from "@/types";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Modal from "react-native-modal";

// interface DeleteCourseAdminModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
//   course: Course | null;
// }

// export function DeleteCourseAdminModal({
//   isVisible,
//   onClose,
//   onSuccess,
//   course,
// }: DeleteCourseAdminModalProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isVisible || !course) {
//       setIsSubmitting(false);
//       setError(null);
//     }
//   }, [isVisible, course]);

//   const handleDelete = async () => {
//     if (!course) return;

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axios.delete("/api/admin/courses", {
//         data: { id: course.id },
//       });
//       if (response.status === 200) {
//         setIsSubmitting(false);
//         if (onSuccess) onSuccess();
//         onClose();
//       }
//     } catch (err: any) {
//       console.error(err);
//       setError(
//         err.response?.data?.message ||
//           err.response?.data?.error ||
//           "Failed to delete course. Please try again.",
//       );
//       setIsSubmitting(false);
//     }
//   };

//   if (!course) return null;

//   return (
//     <Modal
//       isVisible={isVisible}
//       onBackdropPress={() => !isSubmitting && onClose()}
//     >
//       <View style={styles.modal}>
//         <Text style={styles.title}>Delete Course</Text>
//         <Text style={styles.warning}>
//           Are you sure you want to delete {course.name} ({course.code})? This
//           action cannot be undone.
//         </Text>
//         {error && <Text style={styles.error}>{error}</Text>}

//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.button, styles.deleteButton]}
//             onPress={handleDelete}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Delete</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, styles.cancelButton]}
//             onPress={onClose}
//             disabled={isSubmitting}
//           >
//             <Text style={styles.buttonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modal: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 12,
//   },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   warning: { fontSize: 16, marginBottom: 10 },
//   error: { color: "red", marginBottom: 10 },
//   actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
//   button: {
//     padding: 12,
//     borderRadius: 8,
//     minWidth: 100,
//     alignItems: "center",
//   },
//   deleteButton: { backgroundColor: "red" },
//   cancelButton: { backgroundColor: "gray" },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });
