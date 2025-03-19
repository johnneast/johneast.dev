import { useState } from "react";
import { data, useFetcher, type Session } from "react-router";
import type { Route } from "./+types/chat";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { commitSession, getSession, type SessionData } from "../session.server";
import type { Message } from "../types/chat";

function getChatHistory(session: Session<SessionData>) {
  return session.get("chatHistory") || [];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log(`loader session id: ${session.id}`);
  console.log(`loader server chat history: ${JSON.stringify(getChatHistory(session))}`);
  return data({
    chatHistory: getChatHistory(session)
  });
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log(`action session id: ${session.id}`);
  const chatHistory = getChatHistory(session);
  console.log(`action server chat history: ${JSON.stringify(chatHistory)}`);

  const formData = await request.formData();
  const message = formData.get("message");
  const timestamp = formData.get("timestamp");
  console.log(`Received message: ${message} at ${timestamp}`);

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

  const newChatHistory = [...chatHistory, userMessage, assistantMessage];
  console.log(`action server new chat history: ${JSON.stringify(newChatHistory)}`);
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
  const { chatHistory } = loaderData;
  const [message, setMessage] = useState("");

  console.log(`Browser chat history: ${JSON.stringify(chatHistory)}`);
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chat Demo</h2>
        <p className="text-sm text-muted-foreground">
          Ask me about my experience or anything else you'd like to know about me.
        </p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
          {fetcher.formData && (
            <div className="flex justify-end">
              <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
                <p className="text-sm">{fetcher.formData.get("message") as string}</p>
                <span className="text-xs mt-1 block opacity-80">
                  {new Date(Number(fetcher.formData.get("timestamp"))).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="border-t p-4">
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
              console.log(`Submitting message: ${message}`);
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
