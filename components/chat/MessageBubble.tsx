"use client";

import { Message } from "./ChatRoom";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name: string): string {
  return name
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

// Generate a consistent color from user id
function getAvatarColor(userId: string): string {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-blue-500",
    "from-pink-500 to-rose-500",
    "from-teal-500 to-green-500",
    "from-yellow-500 to-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const displayName = message.profiles?.display_name || message.profiles?.email || "Unknown";
  const avatarColor = getAvatarColor(message.user_id);

  return (
    <>
      <div
        className={`flex gap-2 message-enter ${isOwn ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}
      >
        {/* Avatar */}
        <div className="w-8 flex-shrink-0">
          {showAvatar && !isOwn && (
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
            >
              {getInitials(displayName)}
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
          {showAvatar && !isOwn && (
            <span className="text-xs text-muted-foreground mb-1 ml-1 font-medium">
              {displayName}
            </span>
          )}

          <div
            className={`rounded-2xl px-3.5 py-2 ${
              isOwn
                ? "bg-primary text-primary-foreground rounded-tr-md"
                : "bg-muted rounded-tl-md"
            }`}
          >
            {/* Text message */}
            {message.type === "text" && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            )}

            {/* Image message */}
            {message.type === "image" && message.file_url && (
              <div className="space-y-1">
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words mb-2">
                    {message.content}
                  </p>
                )}
                <img
                  src={message.file_url}
                  alt={message.file_name || "Image"}
                  className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageExpanded(true)}
                />
              </div>
            )}

            {/* File message */}
            {message.type === "file" && message.file_url && (
              <div className="space-y-1">
                {message.content && (
                  <p className="text-sm whitespace-pre-wrap break-words mb-2">
                    {message.content}
                  </p>
                )}
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                    isOwn
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-background hover:bg-background/80"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isOwn ? "bg-white/20" : "bg-primary/10"
                  }`}>
                    <FileText className={`w-5 h-5 ${isOwn ? "text-white" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {message.file_name || "File"}
                    </p>
                    {message.file_size && (
                      <p className={`text-xs ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                        {formatFileSize(message.file_size)}
                      </p>
                    )}
                  </div>
                  <Download className={`w-4 h-4 flex-shrink-0 ${isOwn ? "text-white/70" : "text-muted-foreground"}`} />
                </a>
              </div>
            )}

            <span
              className={`text-[10px] mt-1 block ${
                isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}
            >
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {imageExpanded && message.file_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setImageExpanded(false)}
        >
          <img
            src={message.file_url}
            alt={message.file_name || "Image"}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
