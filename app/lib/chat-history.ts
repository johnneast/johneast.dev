import pako from 'pako';
import type { Message } from '../types/chat';

const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB

function getStringByteSize(data: Uint8Array | string): number {
  return new Blob([data]).size;
}

export function compressChatHistory(chatHistory: Message[]): string {
  let json = JSON.stringify(chatHistory);
  let compressed = pako.deflate(json);
  let base64 = btoa(String.fromCharCode(...compressed));

  while (getStringByteSize(base64) > MAX_STORAGE_SIZE && chatHistory.length > 0) {
    chatHistory.shift();
    json = JSON.stringify(chatHistory);
    compressed = pako.deflate(json);
    base64 = btoa(String.fromCharCode(...compressed));
  }

  return base64;
}

export function decompressChatHistory(compressed: string): Message[] {
  try {
    const binaryString = atob(compressed);
    const binary = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binary[i] = binaryString.charCodeAt(i);
    }
    const jsonString = pako.inflate(binary, { to: 'string' });
    return JSON.parse(jsonString) as Message[];
  } catch (error) {
    console.error('Error decompressing chat history:', error);
    return [];
  }
}

export function loadChatHistory(): Message[] {
  const compressed = localStorage.getItem(CHAT_HISTORY_KEY);
  if (compressed) {
    return decompressChatHistory(compressed);
  }
  const emptyHistory: Message[] = [];
  localStorage.setItem(CHAT_HISTORY_KEY, compressChatHistory(emptyHistory));
  return emptyHistory;
}

export function saveChatHistory(chatHistory: Message[]) {
  localStorage.setItem(CHAT_HISTORY_KEY, compressChatHistory(chatHistory));
}
