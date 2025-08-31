"use client";

import { create } from "zustand";

type UIState = {
  assistantTyping: boolean;
  reflecting: boolean;
  vibe: "Curious" | "Supportive" | "Direct";
  setTyping: (v: boolean) => void;
  setReflecting: (v: boolean) => void;
  setVibe: (v: UIState["vibe"]) => void;
};

export const useUIStore = create<UIState>((set) => ({
  assistantTyping: false,
  reflecting: false,
  vibe: "Curious",
  setTyping: (assistantTyping) => set({ assistantTyping }),
  setReflecting: (reflecting) => set({ reflecting }),
  setVibe: (vibe) => set({ vibe }),
}));