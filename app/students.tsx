import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Profile } from "../types";
function getStatusDisplay(
  lastActive: string | null
): "Active" | "Recently Active" | "Inactive" {
  if (!lastActive) return "Inactive";

  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const hours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);

  if (hours < 1) return "Active";
  if (hours < 3) return "Recently Active";
  return "Inactive";
}

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Profile[]>([]);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null
  );
  const [editingStudentId, setEditingStudentId] = useState<string | null>(
    null
  );

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Profile }) => {
    const status = getStatusDisplay(item.last_active);

    return (
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.full_name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.badge,
              status === "Active" ? styles.active : styles.inactive,
            ]}
          >
            <Text style={styles.badgeText}>{status}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditingStudentId(item.id)}
          >
            <Text>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeletingStudentId(item.id)}
          >
            <Text style={{ color: "white" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#666" />

          <TextInput
            placeholder="Search students..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Text style={styles.createText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LIST ===== */}
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No students found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  header: { marginBottom: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: { flex: 1, padding: 8 },
  createBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createText: { color: "white", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  deleteBtn: { padding: 8, backgroundColor: "#dc2626", borderRadius: 6 },
  editBtn: { padding: 8, borderWidth: 1, borderRadius: 6 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  info: { marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "600" },
  email: { color: "#666" },
  statusRow: { marginVertical: 6 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  active: { backgroundColor: "#22c55e" },
  inactive: { backgroundColor: "#9ca3af" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  badgeText: { color: "white", fontSize: 12 },
});
