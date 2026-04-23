"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MessageSquare, Users } from "lucide-react";

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Message {
  id: number;
  room_id: string;
  user_id: string;
  content: string | null;
  type: "text" | "image" | "file";
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  profiles: Profile;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface ChatRoomProps {
  currentUser: User;
  currentProfile: Profile | null;
  room: Room;
  initialMessages: Message[];
}

export function ChatRoom({ currentUser, currentProfile, room, initialMessages }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [joinNotifications, setJoinNotifications] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          // Fetch the complete message with profile
          const { data: newMessage } = await supabase
            .from("messages")
            .select(`
              *,
              profiles:user_id (
                id,
                email,
                display_name,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (newMessage) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage as Message];
            });
          }
        }
      )
      .subscribe();

    // Presence for online users
    const presenceChannel = supabase.channel(`presence:${room.id}`, {
      config: { presence: { key: currentUser.id } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key !== currentUser.id && newPresences.length > 0) {
          const joinedName = (newPresences[0] as { display_name?: string }).display_name || "Someone";
          setJoinNotifications((prev) => [...prev, `${joinedName} đã tham gia`]);
          // Auto remove notification after 3s
          setTimeout(() => {
            setJoinNotifications((prev) => prev.slice(1));
          }, 3000);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: currentUser.id,
            display_name: currentProfile?.display_name || currentUser.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, currentUser.id]);

  const handleSendMessage = async (content: string, type: "text" | "image" | "file" = "text", fileUrl?: string, fileName?: string, fileSize?: number) => {
    const messageData: Record<string, unknown> = {
      room_id: room.id,
      user_id: currentUser.id,
      content: type === "text" ? content : (content || null),
      type,
      file_url: fileUrl || null,
      file_name: fileName || null,
      file_size: fileSize || null,
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error sending message:", error);
    } else if (data) {
      // Cập nhật UI ngay lập tức cho người gửi
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">
              {room.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{onlineUsers.length} online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {currentProfile?.display_name || currentUser.email}
          </span>
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </header>

      {/* Join notifications */}
      {joinNotifications.length > 0 && (
        <div className="px-4 py-1 space-y-1">
          {joinNotifications.map((notif, i) => (
            <div
              key={i}
              className="text-xs text-center py-1.5 px-3 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 message-enter"
            >
              {notif}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        roomId={room.id}
      />
    </div>
  );
}
