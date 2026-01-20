import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Chat = {
  id: string;
  title: string;
};

type Props = {
  currentChatId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export default function SideBar({ currentChatId, onSelect, onNew }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  /* ------------------------------ Load chats ------------------------------ */
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://YOUR_API/api/chats");
      const data = await res.json();
      setChats(data ?? []);
    } catch (e) {
      console.error("Failed to load chats", e);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------- Render -------------------------------- */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>

        <Pressable onPress={onNew} style={styles.newBtn}>
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Chat list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const active = item.id === currentChatId;

            return (
              <Pressable
                onPress={() => onSelect(item.id)}
                style={[styles.chatItem, active && styles.chatItemActive]}
              >
                <Feather
                  name="message-square"
                  size={16}
                  color={active ? "#fff" : "#94a3b8"}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.chatText, active && styles.chatTextActive]}
                >
                  {item.title || "New Chat"}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    width: 280, // 🔑 IMPORTANT (otherwise invisible)
    backgroundColor: "#020617",
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
    paddingTop: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  newBtn: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 8,
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 8,
    marginBottom: 4,
  },

  chatItemActive: {
    backgroundColor: "#1e293b",
  },

  chatText: {
    color: "#94a3b8",
    flex: 1,
  },

  chatTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
});
