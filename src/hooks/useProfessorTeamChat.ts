import { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { professorApi } from "@/lib/professor-api";
import { toast } from "sonner";
import { TeamChatMessage, TeamChatMember } from "@/app/_components/TeamChatWorkspace";

export function useProfessorTeamChat(teamId: number | null) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [members, setMembers] = useState<TeamChatMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const membersRef = useRef<TeamChatMember[]>([]);

  const fetchChat = useCallback(async () => {
    if (!teamId) return;
    setIsLoading(true);
    try {
      const data = await professorApi.getTeamChat(teamId);
      setMessages(data.messages || []);
      setMembers(data.members || []);
      membersRef.current = data.members || [];
    } catch (error) {
      console.error("Failed to fetch chat:", error);
      toast.error("Failed to load chat history.");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    if (!teamId) return;

    let isSubscribed = true;
    const token = localStorage.getItem("token");

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL || "https://localhost:7165"}/hubs/chat`, {
        accessTokenFactory: () => token || "",
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    newConnection.on("ReceiveMessage", (message: any) => {
      if (!isSubscribed) return;
      if (message.teamId !== teamId) return;

      const senderId = message.senderId;
      const member = membersRef.current.find(m => m.id === senderId?.toString());

      const newMsg: TeamChatMessage = {
        id: message.id.toString(),
        backendId: message.id,
        authorId: senderId,
        author: member?.name || message.senderName || "Unknown",
        initials: member?.initials || (message.senderName || "Unknown").substring(0, 2).toUpperCase(),
        role: member?.role || "Student",
        content: message.content,
        timestamp: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEdited: message.isEdited,
        isDeletedForAll: message.isDeletedForAll,
        isPinned: message.isPinned,
        parentMessageId: message.parentMessageId,
        reactions: message.reactions || [],
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    newConnection.on("MessageEdited", (messageId: number, newContent: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.backendId === messageId ? { ...m, content: newContent, isEdited: true } : m))
      );
    });

    newConnection.on("MessageDeleted", (messageId: number, deleteForAll: boolean) => {
      if (deleteForAll) {
        setMessages((prev) =>
          prev.map((m) => (m.backendId === messageId ? { ...m, isDeletedForAll: true, content: "" } : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.backendId !== messageId));
      }
    });

    newConnection.on("MessagePinned", (messageId: number, isPinned: boolean) => {
      setMessages((prev) => prev.map((m) => (m.backendId === messageId ? { ...m, isPinned } : m)));
    });

    newConnection.on("MessageReacted", (messageId: number, reaction: any) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.backendId !== messageId) return m;
          const updatedReactions = [...(m.reactions || [])];
          const existingIndex = updatedReactions.findIndex((r) => r.userId === reaction.userId);
          if (existingIndex >= 0) {
            updatedReactions[existingIndex] = reaction;
          } else {
            updatedReactions.push(reaction);
          }
          return { ...m, reactions: updatedReactions };
        })
      );
    });

    newConnection.start().catch((err) => console.error("SignalR Connection Error:", err));

    return () => {
      isSubscribed = false;
      newConnection.stop();
    };
  }, [teamId]);

  const sendMessage = async (content: string) => {
    if (!teamId) return;
    try {
      await professorApi.sendChatMessage(teamId, content);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message.");
    }
  };

  const editMessage = async (messageId: number, newContent: string) => {
    toast.error("Professor cannot edit messages yet.");
  };

  const deleteMessage = async (messageId: number, deleteForAll: boolean) => {
    toast.error("Professor cannot delete messages yet.");
  };

  const togglePin = async (messageId: number) => {
    toast.error("Professor cannot pin messages yet.");
  };

  const reactToMessage = async (messageId: number, emoji: string) => {
    toast.error("Professor cannot react to messages yet.");
  };

  const replyToMessage = async (parentMessageId: number, content: string) => {
    toast.error("Professor cannot reply to messages yet.");
  };

  return {
    messages,
    members,
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    reactToMessage,
    replyToMessage,
  };
}
