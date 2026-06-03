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
      const formattedMembers: TeamChatMember[] = (data.members || []).map((m: any) => ({
        id: m.id.toString(),
        name: m.fullName,
        initials: m.initials,
        role: m.role || "Student",
        online: true,
      }));
      setMembers(formattedMembers);
      membersRef.current = formattedMembers;

      const formattedMessages: TeamChatMessage[] = (data.messages || []).map((msg: any) => {
        const member = formattedMembers.find(m => m.id === msg.authorId?.toString());
        return {
          id: msg.id.toString(),
          backendId: msg.id,
          authorId: msg.authorId,
          author: msg.authorName || "Unknown",
          initials: member?.initials || (msg.authorName || "Unknown").substring(0, 2).toUpperCase(),
          role: member?.role || "Student",
          content: msg.content,
          timestamp: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "sent",
          isEdited: msg.isEdited,
          isDeletedForAll: msg.isDeletedForAll,
          isPinned: msg.isPinned,
          parentMessageId: msg.parentMessageId,
          reactions: msg.reactions || [],
        };
      });
      setMessages(formattedMessages);
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
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://innotrack-aneshpdxd6habnd6.uaenorth-01.azurewebsites.net";
    const hubUrl = `${BASE_URL.replace(/\/$/, '')}/hubs/chat`;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    newConnection.on("ReceiveMessage", (...args: any[]) => {
      if (!isSubscribed) return;

      let data = args[0];
      if (args.length >= 3 && typeof args[0] === 'number') {
        data = { senderId: args[0], content: args[1], sentAt: args[2] };
      }
      if (!data) return;

      const senderId = data.senderId || data.SenderId;
      const content = data.content || data.Content;
      const sentAt = data.sentAt || data.SentAt || new Date().toISOString();

      const member = membersRef.current.find(m => m.id === senderId?.toString());

      const authorName = member?.name || data.authorName || data.AuthorName || "Unknown";

      const newMsg: TeamChatMessage = {
        id: (data.id || `msg-${Date.now()}-${Math.random()}`).toString(),
        backendId: data.id,
        authorId: senderId,
        author: authorName,
        initials: member?.initials || authorName.substring(0, 2).toUpperCase(),
        role: member?.role || "Professor",
        content: content,
        timestamp: new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEdited: data.isEdited,
        isDeletedForAll: data.isDeletedForAll,
        isPinned: data.isPinned,
        parentMessageId: data.parentMessageId,
        reactions: data.reactions || [],
      };

      setMessages((prev) => {
        const duplicateIdx = prev.findIndex(m => m.content === newMsg.content && !m.backendId);
        if (duplicateIdx !== -1) {
          const arr = [...prev];
          arr[duplicateIdx] = { ...arr[duplicateIdx], backendId: newMsg.backendId, timestamp: newMsg.timestamp, status: "sent" };
          return arr;
        }
        if (newMsg.backendId && prev.some((m) => m.backendId === newMsg.backendId)) return prev;
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

    const startConnection = async () => {
      try {
        await newConnection.start();
        if (teamId) {
          await newConnection.invoke("JoinTeamChat", teamId);
        }
      } catch (err) {
        console.error("SignalR Connection Error:", err);
      }
    };

    startConnection();

    newConnection.onreconnected(async () => {
      if (teamId) {
        try {
          await newConnection.invoke("JoinTeamChat", teamId);
        } catch (e) {
          console.error("Failed to rejoin group after reconnect", e);
        }
      }
    });

    return () => {
      isSubscribed = false;
      newConnection.stop();
    };
  }, [teamId]);

  const sendMessage = async (content: string) => {
    if (!teamId || !content.trim()) return;

    // Optimistic UI update
    const userStr = localStorage.getItem("user");
    let authorName = "Professor";
    let authorId = 0;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        authorName = u.name || "Professor";
        authorId = u.id || 0;
      } catch (e) {}
    }

    const currentMember = membersRef.current.find((m) => m.id === authorId.toString());
    const initials = currentMember?.initials || authorName.substring(0, 2).toUpperCase();

    const tempId = `msg-${Date.now()}-${Math.random()}`;
    const optimisticMsg: TeamChatMessage = {
      id: tempId,
      authorId,
      author: authorName,
      initials,
      role: "Professor",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const data = await professorApi.sendChatMessage(teamId, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, backendId: data.id, status: "sent" } : m))
      );
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message.");
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: "error" } : m)));
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
