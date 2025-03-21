import pako from 'pako';
import type { Message } from '../types/chat';

const CHAT_HISTORY_KEY = 'chatHistory';
const MAX_STORAGE_SIZE = 2 * 1024 * 1024; // 2MB

function getStringByteSize(data: Uint8Array | string): number {
  return new Blob([data]).size;
}

export function compressChatHistory(chatHistory: Message[]): Uint8Array {
  let json = JSON.stringify(chatHistory);
  let compressed = pako.deflate(json);

  while (getStringByteSize(compressed) > MAX_STORAGE_SIZE && chatHistory.length > 0) {
    console.log('Compressed size exceeds 2MB, trimming history:', getStringByteSize(compressed));
    chatHistory.shift(); // Remove oldest message
    json = JSON.stringify(chatHistory);
    compressed = pako.deflate(json);
  }

  return compressed;
}

export function compressChatHistoryForTransport(chatHistory: Message[]): string {
  const compressed = compressChatHistory(chatHistory);
  return btoa(String.fromCharCode(...compressed));
}

export function decompressChatHistory(compressed: Uint8Array): Message[] {
  try {
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString) as Message[];
  } catch (error) {
    console.error('Error decompressing chat history:', error);
    return [];
  }
}

export function decompressChatHistoryFromTransport(compressed: string): Message[] {
  const binaryString = atob(compressed);
  const binary = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    binary[i] = binaryString.charCodeAt(i);
  }
  return decompressChatHistory(binary);
}

export function loadChatHistory(): Message[] {
  const compressed = localStorage.getItem(CHAT_HISTORY_KEY);
  if (compressed) {
    return decompressChatHistoryFromTransport(compressed);
  }
  const emptyHistory: Message[] = [];
  localStorage.setItem(CHAT_HISTORY_KEY, compressChatHistoryForTransport(emptyHistory));
  return emptyHistory;
}

export function saveChatHistory(chatHistory: Message[]) {
  localStorage.setItem(CHAT_HISTORY_KEY, compressChatHistoryForTransport(chatHistory));
}
