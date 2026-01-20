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
const API_COURSES = `${API_BASE}/api/admin/courses`;
const API_TEACHER_SEARCH = `${API_BASE}/api/admin/teachers/search`;

/* ================= TYPES ================= */
type Course = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: string | null;
  instructor_id: string;
  instructor_name?: string | null;
  status: "active" | "archived" | "draft";
};

type Instructor = {
  id: string;
  full_name: string;
  email: string;
};

/* ================= HELPERS ================= */
function getStatusDisplay(status: Course["status"]) {
  if (status === "active") return "Active";
  if (status === "archived") return "Archived";
  return "Draft";
}

/* ================= MAIN SCREEN ================= */
export default function AdminCoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  // Fetch courses
  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await axios.get(API_COURSES);
      setCourses(res.data);
    } catch (e) {
      console.log("Fetch courses error", e);
      Alert.alert("Error", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Course Catalog</Text>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => setCreateOpen(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Create</Text>
        </Pressable>
      </View>

      {/* Courses Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Code</Text>
            <Text style={styles.headerCell}>Semester</Text>
            <Text style={styles.headerCell}>Instructor</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>

          <FlatList
            data={courses}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.code}</Text>
                <Text style={styles.cell}>{item.semester || "—"}</Text>
                <Text style={styles.cell}>{item.instructor_name || "—"}</Text>
                <Text style={styles.cell}>{getStatusDisplay(item.status)}</Text>
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
        <CourseModal
          isOpen={createOpen}
          title="Create Course"
          onClose={() => setCreateOpen(false)}
          onSuccess={fetchCourses}
        />
      )}
      {editing && (
        <CourseModal
          isOpen
          title="Edit Course"
          course={editing}
          onClose={() => setEditing(null)}
          onSuccess={fetchCourses}
        />
      )}
      {deleting && (
        <DeleteModal
          course={deleting}
          onClose={() => setDeleting(null)}
          onSuccess={fetchCourses}
        />
      )}
    </View>
  );
}

/* ================= COURSE MODAL ================= */
function CourseModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  course,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  course?: Course;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Course["status"]>("active");

  const [search, setSearch] = useState("");
  const [foundInstructor, setFoundInstructor] = useState<Instructor | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setName(course.name);
      setCode(course.code);
      setSemester(course.semester || "");
      setDescription(course.description || "");
      setStatus(course.status);
      setFoundInstructor({
        id: course.instructor_id,
        full_name: course.instructor_name || "",
        email: "",
      });
      setSearch(course.instructor_name || "");
      setSearchError(null);
    } else {
      setName("");
      setCode("");
      setSemester("");
      setDescription("");
      setStatus("active");
      setFoundInstructor(null);
      setSearch("");
      setSearchError(null);
    }
  }, [course, isOpen]);

  async function searchInstructor() {
    if (!search.trim()) {
      setSearchError("Enter instructor ID, email, or name");
      setFoundInstructor(null);
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const res = await axios.get(
        `${API_TEACHER_SEARCH}?q=${encodeURIComponent(search.trim())}`,
      );

      if (res.status === 200 && res.data) {
        setFoundInstructor(res.data);
        setSearchError(null);
      } else {
        setFoundInstructor(null);
        setSearchError("Instructor not found");
      }
    } catch (err: any) {
      console.log(err);
      setFoundInstructor(null);
      setSearchError(err.response?.data?.error || "Instructor not found");
    } finally {
      setSearching(false);
    }
  }

  async function saveCourse() {
    if (!name || !code || !foundInstructor) {
      Alert.alert(
        "Error",
        "Please fill all required fields and select an instructor",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        semester: semester.trim() || null,
        description: description.trim() || null,
        instructor_id: foundInstructor.id,
        status,
      };

      if (course) {
        // Update existing course
        await axios.patch(`${API_COURSES}`, { ...payload, id: course.id });
      } else {
        // Create new course
        await axios.post(API_COURSES, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to save course",
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
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Code"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Semester"
            value={semester}
            onChangeText={setSemester}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />

          {/* Instructor Search */}
          <TextInput
            style={styles.input}
            placeholder="Search instructor (ID or email)"
            value={search}
            onChangeText={setSearch}
            editable={!saving && !searching}
          />
          <Pressable
            style={styles.primaryBtn}
            onPress={searchInstructor}
            disabled={searching || saving}
          >
            <Text style={{ color: "#fff" }}>
              {searching ? "Searching..." : "Search Instructor"}
            </Text>
          </Pressable>
          {searchError && (
            <Text style={{ color: "red", marginVertical: 4 }}>
              {searchError}
            </Text>
          )}
          {foundInstructor && (
            <Text style={{ marginVertical: 8 }}>
              Selected: {foundInstructor.full_name} (
              {foundInstructor.email || "no email"})
            </Text>
          )}

          {/* Save / Cancel */}
          <Pressable
            style={styles.primaryBtn}
            onPress={saveCourse}
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
  course,
  onClose,
  onSuccess,
}: {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await axios.delete(API_COURSES, { data: { id: course.id } });
      onSuccess();
      onClose();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            Delete {course.name}?
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
