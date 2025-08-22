import React from 'react';
import { UserSettings } from '../types/settings';

interface TypingIndicatorProps {
  settings: UserSettings;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ settings }) => {
  const getBotAvatar = () => {
    if (settings.botAvatar === 'custom' && settings.customBotAvatar) {
      return (
        <img
          src={settings.customBotAvatar}
          alt="Bot avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return <span className="text-lg">{settings.botAvatar}</span>;
  };

  return (
    <div className="flex gap-4 p-4 bg-gray-900/40">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-lg">
        {getBotAvatar()}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">{settings.botName}</span>
          <span className="text-xs text-gray-500">typing...</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};