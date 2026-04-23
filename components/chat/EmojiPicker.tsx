"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: "😀 Mặt cười",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗",
      "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝",
      "🤑", "🤗", "🤭", "🤫", "🤔", "🫡", "🤐", "🤨",
      "😐", "😑", "😶", "🫥", "😏", "😒", "🙄", "😬",
      "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒",
    ],
  },
  {
    name: "😠 Cảm xúc",
    emojis: [
      "😤", "😠", "😡", "🤬", "😈", "👿", "💀", "☠️",
      "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖",
      "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿",
      "😾", "🫠", "🥳", "🥸", "😎", "🤓", "🧐", "😕",
      "🫤", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳",
      "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢",
    ],
  },
  {
    name: "👋 Cử chỉ",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳",
      "🫴", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟",
      "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️",
      "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏",
      "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "💪", "🦾",
    ],
  },
  {
    name: "❤️ Tim & Tình yêu",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓",
      "💗", "💖", "💘", "💝", "💟", "♥️", "💋", "💌",
      "💐", "🌹", "🌷", "🌸", "💮", "🏵️", "🌻", "🌺",
    ],
  },
  {
    name: "🎉 Vật & Hoạt động",
    emojis: [
      "🎉", "🎊", "🎈", "🎂", "🎁", "🎀", "🎗️", "🏆",
      "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🎾",
      "🎮", "🎯", "🎲", "🧩", "🎪", "🎭", "🎬", "🎤",
      "🎧", "🎵", "🎶", "🎸", "🥁", "🎹", "🎺", "🎻",
      "🔥", "⭐", "🌟", "✨", "💫", "🌈", "☀️", "🌙",
    ],
  },
  {
    name: "🍕 Đồ ăn",
    emojis: [
      "🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥚", "🍳",
      "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌮",
      "🍜", "🍝", "🍣", "🍱", "🥟", "🦐", "🍰", "🎂",
      "🍩", "🍪", "☕", "🍵", "🧋", "🥤", "🍺", "🍻",
    ],
  },
];

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium">Emoji</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-accent transition-colors"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={`text-lg p-1 rounded-lg flex-shrink-0 transition-colors ${
              activeCategory === i ? "bg-accent" : "hover:bg-accent/50"
            }`}
            type="button"
            title={cat.name}
          >
            {cat.emojis[0]}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 h-48 overflow-y-auto">
        <div className="emoji-grid">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onSelect(emoji)}
              type="button"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
