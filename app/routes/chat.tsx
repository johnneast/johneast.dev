import { data } from "react-router";
import type { Route } from "./+types/chat";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { commitSession, getSession } from "../session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return data({
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  });
}

export default function Chat() {
  const startTime = new Date(Date.UTC(2025, 2, 18, 12, 0, 0));
  const messages = Array.from({ length: 50 }, (_, i) => [
    {
      sender: "assistant",
      content: `This is assistant message ${i + 1}`,
      timestamp: new Date(startTime.getTime() + i * 1000 * 60)
    },
    {
      sender: "user", 
      content: `This is user message ${i + 1}`,
      timestamp: new Date(startTime.getTime() + (i + 1) * 1000 * 60)
    }
  ]).flat();

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
          {messages.map((message, index) => (
            message.sender === "assistant" ? (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg bg-muted p-3">
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs mt-1 block opacity-80">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="border-t p-4">
        <form className="flex gap-2">
          <Input
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
