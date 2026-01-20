import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ChatInput({
  onSend,
  disabled,
  onOpenAttachments,
  attachmentCount,
}: any) {
  const [text, setText] = useState("");

  return (
    <View style={styles.container}>
      <Pressable onPress={onOpenAttachments} disabled={disabled}>
        <MaterialIcons name="attach-file" size={24} color="#fff" />
        {attachmentCount > 0 && (
          <Text style={styles.badge}>{attachmentCount}</Text>
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask something..."
        placeholderTextColor="#94a3b8"
      />

      <Pressable
        onPress={() => {
          onSend(text);
          setText("");
        }}
        disabled={disabled}
      >
        <Feather name="send" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: "#fff",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
});
