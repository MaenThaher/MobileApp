import { Message } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import AttachmentsModal from "./components/AttachmentsModal";
import ChatInput from "./components/ChatInput";
import ChatMessagesContainer from "./components/ChatM";
import SideBar from "./components/SideBar";

/* -------------------------------------------------------------------------- */
/*                                   Screen                                   */
/* -------------------------------------------------------------------------- */

export default function ChatbotScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    typeof chatId === "string" ? chatId : null,
  );

  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);

  /* -------------------------------------------------------------------------- */
  /*                              Load chat history                             */
  /* -------------------------------------------------------------------------- */

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetch(`https://YOUR_API/api/chat?chatId=${id}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    if (currentChatId && !streaming) {
      loadMessages(currentChatId);
    }
  }, [currentChatId, streaming, loadMessages]);

  /* -------------------------------------------------------------------------- */
  /*                               Send message                                 */
  /* -------------------------------------------------------------------------- */

  const handleSend = async (text: string) => {
    if (!text.trim() || streaming) return;

    setStreaming(true);
    setLoading(true);

    const effectiveChatId = currentChatId ?? "temp-chat";

    /* --------------------------- temp USER message --------------------------- */
    const tempUser: Message = {
      id: `temp-user-${Date.now()}`,
      chat_id: effectiveChatId,
      role: "USER",
      content: text,
      created_at: new Date().toISOString(),
    };

    /* ---------------------------- temp AI message ----------------------------- */
    const tempAI: Message = {
      id: `temp-ai-${Date.now()}`,
      chat_id: effectiveChatId,
      role: "AI",
      content: "",
      metadata: { isThinking: true },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUser, tempAI]);

    /* ------------------------------ API request ------------------------------- */
    const res = await fetch("https://YOUR_API/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: currentChatId,
        message: text,
        deckIds: selectedDeckIds,
      }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      answer += decoder.decode(value);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAI.id ? { ...m, content: answer, metadata: {} } : m,
        ),
      );
    }

    setStreaming(false);
    setLoading(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* ------------------------------- Sidebar ------------------------------ */}
        <SideBar
          currentChatId={currentChatId}
          onSelect={(id: string) => setCurrentChatId(id)}
          onNew={() => {
            setCurrentChatId(null);
            setMessages([]);
          }}
        />

        {/* ------------------------------- Chat --------------------------------- */}
        <View style={styles.chatArea}>
          <ChatMessagesContainer messages={messages} />
          <ChatInput
            onSend={handleSend}
            disabled={loading}
            attachmentCount={selectedDeckIds.length}
            onOpenAttachments={() => setAttachmentsOpen(true)}
          />
        </View>

        {/* -------------------------- Attachments modal -------------------------- */}
        <AttachmentsModal
          visible={attachmentsOpen}
          onClose={() => setAttachmentsOpen(false)}
          selectedDeckIds={selectedDeckIds}
          onChangeSelectedDeckIds={setSelectedDeckIds}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
});
