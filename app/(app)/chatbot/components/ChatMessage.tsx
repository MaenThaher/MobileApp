import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";

export default function ChatMessage({ message }: any) {
  const isUser = message.role === "USER";

  return (
    <View style={[styles.row, isUser ? styles.user : styles.ai]}>
      <FontAwesome5 name={isUser ? "user" : "robot"} size={16} color="#fff" />
      <View style={styles.bubble}>
        <Markdown>{message.content || "Thinking..."}</Markdown>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 6, gap: 8 },
  user: { justifyContent: "flex-end" },
  ai: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%",
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 10,
  },
});
