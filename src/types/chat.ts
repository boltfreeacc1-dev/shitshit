export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  hasAttachments?: boolean;
  isDeepSearch?: boolean;
  sources?: string[];
  isLoading?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}