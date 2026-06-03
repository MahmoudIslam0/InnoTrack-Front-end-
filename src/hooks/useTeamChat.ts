import { useState, useEffect, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { studentApi, ChatMessageDetailDto, ChatMemberDto } from "@/lib/student-api";
import { toast } from "sonner";

export interface TeamChatMessage {
  id: string;
  backendId?: number;
  authorId: number;
  author: string;
  initials: string;
  role: string;
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "error";
  isEdited?: boolean;
  isDeletedForAll?: boolean;
  isPinned?: boolean;
  parentMessageId?: number | null;
  reactions?: { userId: number; emoji: string }[];
}

export interface TeamChatMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  online?: boolean;
}

export function useTeamChat(teamId: number | null) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [members, setMembers] = useState<TeamChatMember[]>([]);
  const [projectTitle, setProjectTitle] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const membersRef = useRef<TeamChatMember[]>([]);

  // Load initial history
  useEffect(() => {
    let isMounted = true;
    
    async function fetchHistory() {
      try {
        setIsLoading(true);
        const data = await studentApi.getTeamChat();
        if (isMounted) {
          const formattedMembers: TeamChatMember[] = data.members.map(m => ({
            id: m.id.toString(),
            name: m.fullName,
            initials: m.initials,
            role: (m.role as "Professor" | "Student") || "Student",
            online: true, // we could manage online presence with SignalR later
          }));
          setMembers(formattedMembers);
          membersRef.current = formattedMembers;
          setProjectTitle(data.projectTitle || "");
          
          const formattedMessages: TeamChatMessage[] = data.messages.map(msg => {
            const member = data.members.find(m => m.id === msg.authorId);
            return {
              id: msg.id.toString(),
              backendId: msg.id,
              authorId: msg.authorId,
              author: msg.authorName,
              initials: member?.initials || msg.authorName.substring(0, 2).toUpperCase(),
              role: (member?.role as "Professor" | "Student") || "Student",
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
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
        toast.error("Failed to load chat history");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (teamId) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [teamId]);

  // Establish SignalR connection
  useEffect(() => {
    if (!teamId) return;

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

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [teamId]);

  // Manage connection lifecycle and events
  useEffect(() => {
    if (!connection) return;

    connection.on("ReceiveMessage", (...args: any[]) => {
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
        status: "sent",
        parentMessageId: data.parentMessageId,
      };
      
      setMessages(prev => {
        const duplicateIdx = prev.findIndex(m => m.content === newMsg.content && !m.backendId);
        if (duplicateIdx !== -1) {
          const arr = [...prev];
          arr[duplicateIdx] = { ...arr[duplicateIdx], backendId: newMsg.backendId, timestamp: newMsg.timestamp, status: "sent" };
          return arr;
        }
        if (newMsg.backendId && prev.some(m => m.backendId === newMsg.backendId)) return prev;
        return [...prev, newMsg];
      });
    });

    connection.on("MessageEdited", (messageId: number, newContent: string) => {
      setMessages(prev => prev.map(m => m.backendId === messageId ? { ...m, content: newContent, isEdited: true } : m));
    });

    connection.on("MessageDeleted", (messageId: number) => {
      setMessages(prev => prev.map(m => m.backendId === messageId ? { ...m, isDeletedForAll: true, content: "This message was deleted", isPinned: false } : m));
    });

    connection.on("MessagePinned", (messageId: number) => {
      setMessages(prev => prev.map(m => m.backendId === messageId ? { ...m, isPinned: !m.isPinned } : m));
    });

    connection.on("ReactionAdded", (messageId: number, userId: number, emoji: string) => {
      setMessages(prev => prev.map(m => {
        if (m.backendId === messageId) {
          const reactions = m.reactions ? [...m.reactions] : [];
          const existingIdx = reactions.findIndex(r => r.userId === userId && r.emoji === emoji);
          if (existingIdx >= 0) {
            reactions.splice(existingIdx, 1); // Remove toggle
          } else {
            reactions.push({ userId, emoji });
          }
          return { ...m, reactions };
        }
        return m;
      }));
    });

    const joinTeamChat = async () => {
      try {
        const onlineUserIds = (await connection.invoke<number[]>("JoinTeamChat", teamId)) || [];
        
        // Update members with actual online status
        setMembers(prev => prev.map(m => ({ 
          ...m, 
          online: onlineUserIds.includes(parseInt(m.id))
        })));
        membersRef.current = membersRef.current.map(m => ({ 
          ...m, 
          online: onlineUserIds.includes(parseInt(m.id))
        }));

        setIsConnected(true);
      } catch (e) {
        console.error("Failed to join team chat room", e);
        toast.error("Failed to connect to live chat");
      }
    };

    if (connection.state === signalR.HubConnectionState.Connected) {
      joinTeamChat();
    } else {
      connection.start().then(joinTeamChat).catch((err) => {
        console.error("SignalR Connection Error: ", err);
        toast.error("Failed to connect to chat server");
      });
    }

    connection.onreconnected(() => {
      joinTeamChat();
    });

    connection.on("UserOnline", (userId: number) => {
      setMembers(prev => prev.map(m => m.id === userId.toString() ? { ...m, online: true } : m));
      membersRef.current = membersRef.current.map(m => m.id === userId.toString() ? { ...m, online: true } : m);
    });

    connection.on("UserOffline", (userId: number) => {
      setMembers(prev => prev.map(m => m.id === userId.toString() ? { ...m, online: false } : m));
      membersRef.current = membersRef.current.map(m => m.id === userId.toString() ? { ...m, online: false } : m);
    });

    connection.onreconnecting(() => setIsConnected(false));

    return () => {
      connection.off("ReceiveMessage");
      connection.off("MessageEdited");
      connection.off("MessageDeleted");
      connection.off("MessagePinned");
      connection.off("ReactionAdded");
    };
  }, [connection, teamId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Optimistic UI update so the sender sees it instantly
    const currentUserStr = localStorage.getItem("user");
    let authorName = "Me";
    let authorId = 0;
    if (currentUserStr) {
      try {
        const u = JSON.parse(currentUserStr);
        authorName = u.name || "Me";
        authorId = u.id || 0;
      } catch(e) {}
    }
    
    let userRole = "Member";
    const currentMember = membersRef.current.find(m => m.id === authorId.toString());
    if (currentMember) {
      userRole = currentMember.role;
    }
    
    const msgId = `msg-${Date.now()}-${Math.random()}`;
    const newMsg: TeamChatMessage = {
      id: msgId,
      authorId,
      author: authorName,
      initials: authorName.substring(0, 2).toUpperCase(),
      role: userRole,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sending",
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      if (connection && isConnected) {
        await connection.invoke("SendMessage", teamId, content);
      } else {
        // Fallback to REST
        await studentApi.sendChatMessage(content);
      }
      
      // Artificial delay to let the sending indicator show longer
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "sent" } : m));
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("Failed to send message. Please check your connection.");
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "error" } : m));
    }
  }, [connection, isConnected, teamId]);

  const editMessage = useCallback(async (messageId: number, newContent: string) => {
    if (!newContent.trim() || !connection || !isConnected) return;
    try {
      await connection.invoke("EditMessage", teamId, messageId, newContent);
    } catch (e) {
      toast.error("Failed to edit message");
    }
  }, [connection, isConnected, teamId]);

  const deleteMessage = useCallback(async (messageId: number, deleteForAll: boolean) => {
    if (!connection || !isConnected) return;
    try {
      if (!deleteForAll) {
        // Optimistically hide for me
        setMessages(prev => prev.filter(m => m.backendId !== messageId));
      }
      await connection.invoke("DeleteMessage", teamId, messageId, deleteForAll);
    } catch (e) {
      toast.error("Failed to delete message");
    }
  }, [connection, isConnected, teamId]);

  const togglePin = useCallback(async (messageId: number) => {
    if (!connection || !isConnected) return;
    try {
      await connection.invoke("TogglePin", teamId, messageId);
    } catch (e) {
      toast.error("Failed to pin message");
    }
  }, [connection, isConnected, teamId]);

  const reactToMessage = useCallback(async (messageId: number, emoji: string) => {
    if (!connection || !isConnected) return;
    try {
      await connection.invoke("ReactToMessage", teamId, messageId, emoji);
    } catch (e) {
      toast.error("Failed to react");
    }
  }, [connection, isConnected, teamId]);

  const replyToMessage = useCallback(async (parentMessageId: number, content: string) => {
    if (!content.trim() || !connection || !isConnected) return;
    try {
      await connection.invoke("ReplyToMessage", teamId, parentMessageId, content);
    } catch (e) {
      toast.error("Failed to reply");
    }
  }, [connection, isConnected, teamId]);

  return {
    messages,
    members,
    projectTitle,
    isConnected,
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    reactToMessage,
    replyToMessage,
  };
}
