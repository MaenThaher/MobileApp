import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export default function AttachmentsModal({
  visible,
  onClose,
  selectedDeckIds,
}: any) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Attachments</Text>

          <Text>{selectedDeckIds.length} selected</Text>

          <Pressable onPress={onClose} style={styles.btn}>
            <Text style={{ color: "#fff" }}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#020617",
    width: "90%",
    padding: 16,
    borderRadius: 12,
  },
  title: { fontSize: 18, color: "#fff", marginBottom: 12 },
  btn: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
  },
});
