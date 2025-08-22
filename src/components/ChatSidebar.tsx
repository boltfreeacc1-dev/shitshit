import React from 'react';
import { MessageSquare, Plus, Trash2, Settings } from 'lucide-react';
import { Chat } from '../types/chat';
import { UserSettings } from '../types/settings';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  settings: UserSettings;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  settings,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onOpenSettings
}) => {
  return (
    <div className="w-80 bg-gray-950/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50">
        <div className="space-y-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/60 text-gray-300 rounded-lg hover:bg-gray-700/60 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Chat History</h3>
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeChat?.id === chat.id
                  ? 'bg-purple-600/20 border border-purple-500/30'
                  : 'hover:bg-gray-900/50'
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{chat.title}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              No chat history yet.<br />Start a new conversation!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};