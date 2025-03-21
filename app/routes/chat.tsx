import { useEffect, useRef, useState } from 'react';
import { data, useFetcher } from 'react-router';
import pako from 'pako';

import type { Route } from './+types/chat';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import type { Message } from '../types/chat';
import { getChatbotResponse } from '~/lib/chat-api';

const CHAT_HISTORY_KEY = 'chatHistory';

function compressChatHistory(chatHistory: Message[]) {
  return pako.deflate(JSON.stringify(chatHistory));
}

function compressChatHistoryForTransport(chatHistory: Message[]): string {
  const compressed = compressChatHistory(chatHistory);
  return btoa(String.fromCharCode(...compressed));
}

function decompressChatHistory(compressed: Uint8Array): Message[] {
  try {
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString) as Message[];
  } catch (error) {
    console.error('Error decompressing chat history:', error);
    return [];
  }
}

function decompressChatHistoryFromTransport(compressed: string): Message[] {
  const binaryString = atob(compressed);
  const binary = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    binary[i] = binaryString.charCodeAt(i);
  }
  return decompressChatHistory(binary);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const message = formData.get('message');
  const timestamp = formData.get('timestamp');
  const compressedHistory = formData.get('compressedHistory');

  const chatHistory = compressedHistory ? decompressChatHistoryFromTransport(compressedHistory as string) : [];

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

  return data({ chatHistory: compressChatHistoryForTransport(chatHistory) });
}

export default function Chat() {
  const fetcher = useFetcher();
  const submitting = fetcher.state !== 'idle';
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Load initial chat history from localStorage
  useEffect(() => {
    const compressed = localStorage.getItem(CHAT_HISTORY_KEY);
    if (compressed) {
      const storedHistory = decompressChatHistoryFromTransport(compressed);
      setChatHistory(storedHistory);
    } else {
      localStorage.setItem(CHAT_HISTORY_KEY, compressChatHistoryForTransport([]));
    }
  }, []);

  useEffect(() => {
    if (fetcher.data?.chatHistory && !submitting) {
      const newHistory = decompressChatHistoryFromTransport(fetcher.data.chatHistory);
      localStorage.setItem(CHAT_HISTORY_KEY, fetcher.data.chatHistory);
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
          {chatHistory &&
            chatHistory.map((message) =>
              message.sender === 'assistant' ? (
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
            )}
          {submitting && fetcher.formData?.get('message') && (
            <>
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-lg bg-primary text-primary-foreground p-3">
                  <p className="text-sm">{fetcher.formData.get('message') as string}</p>
                  <span className="text-xs mt-1 block opacity-80">
                    {new Date(Number(fetcher.formData.get('timestamp'))).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
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
                const compressedHistory = compressChatHistoryForTransport(chatHistory);
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
