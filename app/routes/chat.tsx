import { useEffect, useRef, useState } from 'react';
import { data, useFetcher } from 'react-router';

import type { Route } from './+types/chat';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import type { Message } from '../types/chat';
import { getChatbotResponse } from '~/lib/chat-api';
import { compressChatHistory, decompressChatHistory, loadChatHistory, saveChatHistory } from '~/lib/chat-history';
import ChatMessage from '~/components/chat-message';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const message = formData.get('message');
  const timestamp = formData.get('timestamp');
  const compressedHistory = formData.get('compressedHistory');

  const chatHistory = compressedHistory ? decompressChatHistory(compressedHistory as string) : [];

  const userMessage: Message = {
    sender: 'user',
    content: message as string,
    timestamp: Number(timestamp),
  };

  const chatResponse = await getChatbotResponse(message as string, chatHistory);

  const response: Message = {
    sender: 'assistant',
    content: chatResponse,
    timestamp: Date.now(),
  };

  chatHistory.push(userMessage);
  chatHistory.push(response);

  return data({ chatHistory: compressChatHistory(chatHistory) });
}

export default function Chat() {
  const fetcher = useFetcher();
  const submitting = fetcher.state !== 'idle';
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Load initial chat history from localStorage
  useEffect(() => {
    setChatHistory(loadChatHistory());
  }, []);

  useEffect(() => {
    if (fetcher.data?.chatHistory && !submitting) {
      const newHistory = decompressChatHistory(fetcher.data.chatHistory);
      saveChatHistory(newHistory);
      setChatHistory(newHistory);
    }
  }, [fetcher.data, submitting]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory, fetcher.formData]);

  return (
    <div className="h-full flex flex-col max-h-[inherit]">
      {/* Chat Header */}
      <div className="border-b p-4 shrink-0">
        <h2 className="text-lg font-semibold">Chat with me</h2>
        <p className="text-sm text-muted-foreground">
          Ask about my experience or anything else you'd like to know about me.
        </p>
      </div>

      {/* Chat Messages Area */}
      <div ref={messagesEndRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="flex flex-col space-y-2">
          {chatHistory && chatHistory.map((message) => <ChatMessage key={message.timestamp} {...message} />)}

          {submitting && fetcher.formData?.get('message') && (
            <>
              <ChatMessage
                content={fetcher.formData.get('message') as string}
                sender="user"
                timestamp={Number(fetcher.formData.get('timestamp'))}
              />
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg bg-muted p-3 flex items-center space-x-1">
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
              </div>
            </>
          )}
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
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            size="icon"
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault();
              if (message) {
                const compressedHistory = compressChatHistory(chatHistory);
                const timestamp = Date.now();
                fetcher.submit({ message, compressedHistory, timestamp }, { method: 'post' });
                setMessage('');
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-send"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
              <path d="m21.854 2.147-10.94 10.939" />
            </svg>
            <span className="sr-only">Send message</span>
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
