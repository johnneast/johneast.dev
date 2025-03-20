import { useEffect, useRef, useState } from "react";
import { data, useFetcher, type Session } from "react-router";
import LZString from "lz-string";

import type { Route } from "./+types/chat";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { commitSession, getSession, type SessionData } from "../session.server";
import type { Message } from "../types/chat";

const MAX_COOKIE_SIZE = 4096;

function compressChatHistory(chatHistory: Message[]) {
  let json = JSON.stringify(chatHistory);
  let compressed = LZString.compress(json);
  
  while (new Blob([compressed]).size > MAX_COOKIE_SIZE) {
    chatHistory.shift();
    json = JSON.stringify(chatHistory);
    compressed = LZString.compress(json);
  }

  return compressed;
}

function decompressChatHistory(compressed: string): Message[] {
  try {
    let json = LZString.decompress(compressed);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error decompressing chat history:", error);
    return [];
  }
}

function getChatHistory(session: Session<SessionData>) {
  return decompressChatHistory(session.get("chatHistory") || "");
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return data({
    chatHistory: getChatHistory(session)
  });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const chatHistory = getChatHistory(session);

  const formData = await request.formData();
  const message = formData.get("message");
  const timestamp = formData.get("timestamp");


  const userMessage: Message = {
    sender: "user",
    content: message as string,
    timestamp: Number(timestamp),
  };

  await new Promise(resolve => setTimeout(resolve, 1000));

  const assistantMessage: Message = {
    sender: "assistant",
    content: `Assistant response to user message: ${message}`,
    timestamp: Date.now(),
  };

  const newChatHistory = compressChatHistory([...chatHistory, userMessage, assistantMessage]);
  session.set("chatHistory", newChatHistory);

  return data(
    { chatHistory: newChatHistory },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    }
  );
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const submitting = fetcher.state !== "idle";
  const { chatHistory: initialChatHistory } = loaderData;
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>(initialChatHistory);

  useEffect(() => {
    const newChatHistory = [...initialChatHistory];
    if (fetcher.formData) {
      newChatHistory.push({
        sender: "user",
        content: fetcher.formData.get("message") as string,
        timestamp: Number(fetcher.formData.get("timestamp")),
      });
    }
    setChatHistory(newChatHistory);
  }, [fetcher.formData, initialChatHistory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className="h-full flex flex-col max-h-[inherit]">
      {/* Chat Header */}
      <div className="border-b p-4 shrink-0">
        <h2 className="text-lg font-semibold">Chat Demo</h2>
        <p className="text-sm text-muted-foreground">
          Ask me about my experience or anything else you'd like to know about me.
        </p>
      </div>

      {/* Chat Messages Area */}
      <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="flex flex-col space-y-2">
          {chatHistory &&  chatHistory.map((message) => (
            message.sender === "assistant" ? (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg bg-muted p-3">
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs mt-1 block opacity-80">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="border-t p-4 shrink-0">
        <fetcher.Form method="post" className="flex gap-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
            name="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <Button size="icon" disabled={submitting} onClick={(e) => {
            e.preventDefault();
            if (message) {
              const timestamp = Date.now();
              fetcher.submit({ message: message.trim(), timestamp }, { method: "post" });
              setMessage("");
            }
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
            <span className="sr-only">Send message</span>
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
