import React, { useState, useEffect, useRef } from 'react';
import { ChatSidebar } from './components/ChatSidebar';
import { Message } from './components/Message';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { SettingsModal } from './components/SettingsModal';
import { Chat, Message as MessageType } from './types/chat';
import { UserSettings } from './types/settings';
import { saveChatsToStorage, loadChatsFromStorage, generateChatTitle } from './utils/storage';
import { saveSettingsToStorage, loadSettingsFromStorage } from './utils/settingsStorage';
import { sendMessageToGemini } from './services/geminiApi';
import { MessageSquare, Search } from 'lucide-react';

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(loadSettingsFromStorage());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedChats = loadChatsFromStorage();
    setChats(savedChats);
    if (savedChats.length > 0) {
      setActiveChat(savedChats[0]);
    }
  }, []);

  useEffect(() => {
    saveChatsToStorage(chats);
  }, [chats]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = (): Chat => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newChat;
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setActiveChat(remainingChats.length > 0 ? remainingChats[0] : null);
    }
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const handleSendMessage = async (content: string, uploadedFiles?: File[], isDeepSearch: boolean = false) => {
    if (!activeChat) {
      const newChat = createNewChat();
      setActiveChat(newChat);
      setChats(prev => [newChat, ...prev]);
      
      // Update the new chat with the first message
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content,
        timestamp: new Date(),
        isUser: true,
        hasAttachments: uploadedFiles && uploadedFiles.length > 0,
        isDeepSearch: isDeepSearch,
      };
      
      const updatedNewChat = {
        ...newChat,
        title: generateChatTitle(content),
        messages: [userMessage],
        updatedAt: new Date(),
      };
      
      setActiveChat(updatedNewChat);
      setChats(prev => [updatedNewChat, ...prev.filter(chat => chat.id !== newChat.id)]);
      
      // Get AI response
      setIsLoading(true);
      try {
        const otherChats = settings.useCrossChat ? chats.filter(chat => chat.id !== newChat.id) : [];
        const { response: aiResponse, sources } = await sendMessageToGemini(content, [], otherChats, settings.useCrossChat, isDeepSearch, uploadedFiles);
        const aiMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          timestamp: new Date(),
          isUser: false,
          sources: sources,
        };
        
        const finalChat = {
          ...updatedNewChat,
          messages: [userMessage, aiMessage],
          updatedAt: new Date(),
        };
        
        setActiveChat(finalChat);
        setChats(prev => [finalChat, ...prev.filter(chat => chat.id !== newChat.id)]);
      } catch (error) {
        const errorMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          content: error instanceof Error ? error.message : 'An error occurred.',
          timestamp: new Date(),
          isUser: false,
        };
        
        const errorChat = {
          ...updatedNewChat,
          messages: [userMessage, errorMessage],
          updatedAt: new Date(),
        };
        
        setActiveChat(errorChat);
        setChats(prev => [errorChat, ...prev.filter(chat => chat.id !== newChat.id)]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isUser: true,
      hasAttachments: uploadedFiles && uploadedFiles.length > 0,
      isDeepSearch: isDeepSearch,
    };

    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, userMessage],
      updatedAt: new Date(),
    };

    setActiveChat(updatedChat);
    setChats(prev => [
      updatedChat,
      ...prev.filter(chat => chat.id !== activeChat.id)
    ]);

    setIsLoading(true);
    try {
      const otherChats = settings.useCrossChat ? chats.filter(chat => chat.id !== activeChat.id) : [];
      const { response: aiResponse, sources } = await sendMessageToGemini(content, activeChat.messages, otherChats, settings.useCrossChat, isDeepSearch, uploadedFiles);
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        timestamp: new Date(),
        isUser: false,
        sources: sources,
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date(),
      };

      setActiveChat(finalChat);
      setChats(prev => [
        finalChat,
        ...prev.filter(chat => chat.id !== activeChat.id)
      ]);
    } catch (error) {
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'An error occurred.',
        timestamp: new Date(),
        isUser: false,
      };

      const errorChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
        updatedAt: new Date(),
      };

      setActiveChat(errorChat);
      setChats(prev => [
        errorChat,
        ...prev.filter(chat => chat.id !== activeChat.id)
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepSearch = async (query: string, uploadedFiles?: File[]) => {
    await handleSendMessage(query, uploadedFiles, true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        settings={settings}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="flex-1 overflow-y-auto bg-black/20 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto">
                {activeChat.messages.map((message) => (
                  <Message key={message.id} message={message} settings={settings} hasAttachments={message.hasAttachments} />
                ))}
                {isLoading && <TypingIndicator settings={settings} />}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <ChatInput onSendMessage={handleSendMessage} onDeepSearch={handleDeepSearch} isLoading={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                {settings.botAvatar === 'custom' && settings.customBotAvatar ? (
                  <img
                    src={settings.customBotAvatar}
                    alt="Bot avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  settings.botAvatar
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome to {settings.botName} Chat</h2>
              <p className="text-gray-400 max-w-md">
                Start a conversation with your AI assistant. Upload files, use Deep Search, or just chat normally.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleNewChat}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start New Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        chats={chats}
      />
    </div>
  );
}

export default App;