"use client";

import { Message } from "./ChatRoom";
import { MessageBubble } from "./MessageBubble";
import { RefObject } from "react";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, currentUserId, messagesEndRef }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10" />
        </div>
        <p className="text-lg font-medium">Chưa có tin nhắn</p>
        <p className="text-sm mt-1">Hãy gửi tin nhắn đầu tiên!</p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-4">
            <div className="text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
              {group.date}
            </div>
          </div>
          {group.messages.map((message, index) => {
            const prevMessage = index > 0 ? group.messages[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.user_id === currentUserId}
                showAvatar={showAvatar}
              />
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
