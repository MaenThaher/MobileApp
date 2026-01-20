"use client";

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
const API_TEACHERS = `${API_BASE}/api/admin/teachers`;
const API_TEACHER_SEARCH = `${API_BASE}/api/admin/teachers/search`;

/* ================= TYPES ================= */
type Teacher = {
  id: string;
  full_name: string;
  email: string;
  last_active: string | null;
};

type Instructor = {
  id: string;
  full_name: string;
  email: string;
};

/* ================= HELPERS ================= */
function getStatusDisplay(lastActive: string | null) {
  if (!lastActive) return "Inactive";
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const hoursSinceActive =
    (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceActive < 1) return "Active";
  if (hoursSinceActive < 3) return "Recently Active";
  return "Inactive";
}

/* ================= MAIN SCREEN ================= */
export default function AdminTeachersScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState<Teacher | null>(null);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const res = await axios.get(API_TEACHERS);
      setTeachers(res.data);
    } catch (e) {
      console.log("Fetch teachers error", e);
      Alert.alert("Error", "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teachers</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => setCreateOpen(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Create</Text>
        </Pressable>
      </View>

      {/* Teachers Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Full Name</Text>
            <Text style={styles.headerCell}>Email</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>

          <FlatList
            data={teachers}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.full_name}</Text>
                <Text style={styles.cell}>{item.email}</Text>
                <Text style={styles.cell}>
                  {getStatusDisplay(item.last_active)}
                </Text>
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
        <TeacherModal
          isOpen={createOpen}
          title="Create Teacher"
          onClose={() => setCreateOpen(false)}
          onSuccess={fetchTeachers}
        />
      )}
      {editing && (
        <TeacherModal
          isOpen
          title="Edit Teacher"
          teacher={editing}
          onClose={() => setEditing(null)}
          onSuccess={fetchTeachers}
        />
      )}
      {deleting && (
        <DeleteModal
          teacher={deleting}
          onClose={() => setDeleting(null)}
          onSuccess={fetchTeachers}
        />
      )}
    </View>
  );
}

/* ================= TEACHER MODAL ================= */
function TeacherModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  teacher,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  teacher?: Teacher;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.full_name);
      setEmail(teacher.email);
      setPassword("");
    } else {
      setFullName("");
      setEmail("");
      setPassword("");
    }
  }, [teacher, isOpen]);

  async function saveTeacher() {
    if (!fullName || !email || (!teacher && !password)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim(),
      };
      // Only send password if creating OR user entered one
      if (!teacher || password) {
        payload.password = password;
      }

      if (teacher) {
        // Edit teacher
        await axios.patch(API_TEACHERS, { ...payload, id: teacher.id });
      } else {
        // Create teacher
        await axios.post(API_TEACHERS, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to save teacher",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>{title}</Text>

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
            placeholder={teacher ? "Leave empty to keep password" : "Password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={styles.primaryBtn}
            onPress={saveTeacher}
            disabled={saving}
          >
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
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ================= DELETE MODAL ================= */
function DeleteModal({
  teacher,
  onClose,
  onSuccess,
}: {
  teacher: Teacher;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await axios.delete(API_TEACHERS, { data: { id: teacher.id } });
      onSuccess();
      onClose();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to delete teacher");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            Delete {teacher.full_name}?
          </Text>
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
    paddingBottom: 6,
  },
  headerCell: { width: 120, fontWeight: "700" },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  cell: { width: 120 },
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
  modal: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
