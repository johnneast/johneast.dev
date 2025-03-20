type Message = {
  sender: "user" | "assistant";
  content: string;
  timestamp: number;
}

export type { Message };
