import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  timestamp: Date;
  type?: "message" | "system" | "question";
}

export interface Viewer {
  id: string;
  username: string;
  avatarUrl?: string;
  joinedAt: Date;
  isHost?: boolean;
}

interface UseLiveSessionOptions {
  sessionId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  isHost?: boolean;
}

export function useLiveSession({
  sessionId,
  userId,
  username,
  avatarUrl,
  isHost = false,
}: UseLiveSessionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initialize the realtime channel
  useEffect(() => {
    if (!sessionId || !userId) return;

    const channelName = `live_session_${sessionId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: userId },
        broadcast: { self: true },
      },
    });

    // Handle presence sync
    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState();
      const viewerList: Viewer[] = [];

      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          viewerList.push({
            id: presence.userId,
            username: presence.username,
            avatarUrl: presence.avatarUrl,
            joinedAt: new Date(presence.joinedAt),
            isHost: presence.isHost,
          });
        });
      });

      setViewers(viewerList);
    });

    // Handle presence join
    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      newPresences.forEach((presence: any) => {
        // Add system message for new viewer
        if (presence.userId !== userId) {
          const systemMessage: ChatMessage = {
            id: `system_join_${Date.now()}_${presence.userId}`,
            userId: "system",
            username: "System",
            content: `${presence.username} joined the session`,
            timestamp: new Date(),
            type: "system",
          };
          setMessages((prev) => [...prev, systemMessage]);
        }
      });
    });

    // Handle presence leave
    channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        const systemMessage: ChatMessage = {
          id: `system_leave_${Date.now()}_${presence.userId}`,
          userId: "system",
          username: "System",
          content: `${presence.username} left the session`,
          timestamp: new Date(),
          type: "system",
        };
        setMessages((prev) => [...prev, systemMessage]);
      });
    });

    // Handle broadcast messages (chat)
    channel.on("broadcast", { event: "chat_message" }, ({ payload }) => {
      const message: ChatMessage = {
        id: payload.id,
        userId: payload.userId,
        username: payload.username,
        avatarUrl: payload.avatarUrl,
        content: payload.content,
        timestamp: new Date(payload.timestamp),
        type: payload.type || "message",
      };
      setMessages((prev) => [...prev, message]);
    });

    // Handle hand raise events
    channel.on("broadcast", { event: "hand_raised" }, ({ payload }) => {
      const systemMessage: ChatMessage = {
        id: `hand_${Date.now()}_${payload.userId}`,
        userId: "system",
        username: "System",
        content: `✋ ${payload.username} raised their hand`,
        timestamp: new Date(),
        type: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        
        // Track user presence
        await channel.track({
          userId,
          username,
          avatarUrl,
          isHost,
          joinedAt: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [sessionId, userId, username, avatarUrl, isHost]);

  // Send a chat message
  const sendMessage = useCallback(
    async (content: string, type: "message" | "question" = "message") => {
      if (!channelRef.current || !content.trim()) return;

      const message = {
        id: `msg_${Date.now()}_${userId}`,
        userId,
        username,
        avatarUrl,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        type,
      };

      await channelRef.current.send({
        type: "broadcast",
        event: "chat_message",
        payload: message,
      });
    },
    [userId, username, avatarUrl]
  );

  // Raise hand
  const raiseHand = useCallback(async () => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: "broadcast",
      event: "hand_raised",
      payload: {
        userId,
        username,
      },
    });
  }, [userId, username]);

  // Update viewer count in database
  useEffect(() => {
    if (!sessionId || !isHost) return;

    const updateViewerCount = async () => {
      await supabase
        .from("live_sessions")
        .update({ viewer_count: viewers.length })
        .eq("id", sessionId);
    };

    updateViewerCount();
  }, [viewers.length, sessionId, isHost]);

  return {
    messages,
    viewers,
    isConnected,
    sendMessage,
    raiseHand,
    viewerCount: viewers.length,
  };
}
