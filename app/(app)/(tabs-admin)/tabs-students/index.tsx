import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

/* 🔴 CHANGE TO YOUR SERVER IP */
const API_BASE = "http://192.168.0.110:3000";
const API_STUDENTS = `${API_BASE}/api/admin/students`;

/* ================= TYPES ================= */
type Student = {
  id: string;
  full_name: string;
  email: string;
};

/* ================= MAIN SCREEN ================= */
export default function AdminStudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await axios.get(API_STUDENTS);
      setStudents(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => setCreateOpen(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Create</Text>
        </Pressable>
      </View>

      {/* Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Email</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>

          <FlatList
            data={students}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.full_name}</Text>
                <Text style={styles.cell}>{item.email}</Text>
                <View style={[styles.cell, styles.actions]}>
                  <Pressable onPress={() => setEditing(item)}>
                    <Text>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={styles.dangerBtn}
                    onPress={() => setDeleting(item)}
                  >
                    <Text style={{ color: "#fff" }}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      {createOpen && (
        <CreateStudentModal
          isOpen
          onClose={() => setCreateOpen(false)}
          onSuccess={fetchStudents}
        />
      )}

      {editing && (
        <EditStudentModal
          isOpen
          student={editing}
          onClose={() => setEditing(null)}
          onSuccess={fetchStudents}
        />
      )}

      {deleting && (
        <DeleteStudentModal
          isOpen
          student={deleting}
          onClose={() => setDeleting(null)}
          onSuccess={fetchStudents}
        />
      )}
    </View>
  );
}

/* ================= CREATE STUDENT ================= */
function CreateStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setSaving(true);
    try {
      await axios.post(API_STUDENTS, {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create student",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Create Student</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={styles.primaryBtn}
            onPress={create}
            disabled={saving}
          >
            <Text style={{ color: "#fff" }}>
              {saving ? "Creating..." : "Create"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.dangerBtn}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={{ color: "#fff" }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ================= EDIT STUDENT ================= */
function EditStudentModal({
  isOpen,
  student,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState(student.full_name);
  const [email, setEmail] = useState(student.email);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!fullName || !email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    setSaving(true);
    try {
      await axios.patch(API_STUDENTS, {
        id: student.id,
        full_name: fullName.trim(),
        email: email.trim(),
        password: password || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update student",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Edit Student</Text>

          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="New password (optional)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable style={styles.primaryBtn} onPress={save} disabled={saving}>
            <Text style={{ color: "#fff" }}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.dangerBtn}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={{ color: "#fff" }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ================= DELETE STUDENT ================= */
function DeleteStudentModal({
  isOpen,
  student,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await axios.delete(API_STUDENTS, { data: { id: student.id } });
      onSuccess();
      onClose();
    } catch {
      Alert.alert("Error", "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text>Delete {student.full_name}?</Text>

          <Pressable
            style={styles.dangerBtn}
            onPress={remove}
            disabled={deleting}
          >
            <Text style={{ color: "#fff" }}>
              {deleting ? "Deleting..." : "Delete"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.primaryBtn}
            onPress={onClose}
            disabled={deleting}
          >
            <Text style={{ color: "#fff" }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: { width: 180, fontWeight: "700" },
  row: { flexDirection: "row", paddingVertical: 6 },
  cell: { width: 180 },
  actions: { flexDirection: "row", gap: 8 },
  primaryBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", marginLeft: 6 },
  dangerBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  modal: { backgroundColor: "#fff", margin: 16, padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
