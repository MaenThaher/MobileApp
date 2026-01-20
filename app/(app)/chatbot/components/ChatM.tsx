import { FlatList } from "react-native";
import ChatMessage from "./ChatMessage";

export default function ChatMessagesContainer({ messages }: any) {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ChatMessage message={item} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
}
