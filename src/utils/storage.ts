import { Chat } from '../types/chat';

const CHAT_STORAGE_KEY = 'ai_chat_history';

export const saveChatsToStorage = (chats: Chat[]): void => {
  try {
    const serializedChats = JSON.stringify(chats, (key, value) => {
      if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') {
        return new Date(value).toISOString();
      }
      return value;
    });
    document.cookie = `${CHAT_STORAGE_KEY}=${encodeURIComponent(serializedChats)}; max-age=${60 * 60 * 24 * 30}; path=/`; // 30 days
  } catch (error) {
    console.error('Failed to save chats to storage:', error);
  }
};

export const loadChatsFromStorage = (): Chat[] => {
  try {
    const cookies = document.cookie.split(';');
    const chatCookie = cookies.find(cookie => cookie.trim().startsWith(`${CHAT_STORAGE_KEY}=`));
    
    if (!chatCookie) return [];
    
    const cookieValue = chatCookie.split('=')[1];
    const decodedValue = decodeURIComponent(cookieValue);
    const parsedChats = JSON.parse(decodedValue);
    
    return parsedChats.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load chats from storage:', error);
    return [];
  }
};

export const generateChatTitle = (firstMessage: string): string => {
  const words = firstMessage.split(' ').slice(0, 6);
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
};