"use client";

import { useEffect, useRef } from "react";

type EmojiPickerProps = {
    open: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
};

const EMOJIS = [
    "😊",
    "😂",
    "😍",
    "😘",
    "😉",
    "😎",
    "🤔",
    "🙄",
    "😮",
    "😢",
    "😭",
    "😱",
    "😡",
    "😌",
    "😴",
    "😷",
    "👍",
    "👎",
    "👌",
    "✌️",
    "👊",
    "❤️",
    "💔",
    "👏",
    "🚀",
    "✨",
    "🎉",
    "🎆",
    "🌈",
    "🌸",
    "🌺",
    "🎁",
];

export default function EmojiPicker({ open, onSelect, onClose }: EmojiPickerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg p-4 shadow-lg z-10 w-80"
        >
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {EMOJIS.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(emoji)}
                        className="p-2 text-lg hover:bg-secondary rounded cursor-pointer transition-colors"
                        aria-label={`Insert ${emoji}`}
                        type="button"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
