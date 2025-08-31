export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  meta?: {
    pinned?: boolean;
    memoryScore?: number;
  };
};