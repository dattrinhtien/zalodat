"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { FileUpload } from "./FileUpload";

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: "text" | "image" | "file",
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ) => Promise<void>;
  roomId: string;
}

export function MessageInput({ onSendMessage, roomId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed, "text");
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleFileUploaded = async (
    type: "image" | "file",
    fileUrl: string,
    fileName: string,
    fileSize: number
  ) => {
    await onSendMessage("", type, fileUrl, fileName, fileSize);
    setShowFileUpload(false);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="relative border-t border-border bg-card/80 backdrop-blur-sm">
      {/* Emoji Picker Popup */}
      {showEmoji && (
        <div className="absolute bottom-full left-4 mb-2 z-20">
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        </div>
      )}

      {/* File Upload Popup */}
      {showFileUpload && (
        <div className="absolute bottom-full left-4 mb-2 z-20">
          <FileUpload
            roomId={roomId}
            onFileUploaded={handleFileUploaded}
            onClose={() => setShowFileUpload(false)}
          />
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        {/* Attach button */}
        <button
          onClick={() => {
            setShowFileUpload(!showFileUpload);
            setShowEmoji(false);
          }}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          title="Đính kèm file"
          type="button"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji button */}
        <button
          onClick={() => {
            setShowEmoji(!showEmoji);
            setShowFileUpload(false);
          }}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
          title="Emoji"
          type="button"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
            rows={1}
            className="w-full resize-none bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60 max-h-[120px]"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          title="Gửi"
          type="button"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
