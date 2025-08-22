import React from 'react';
import { Paperclip, Search, ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react';
import { Message as MessageType } from '../types/chat';
import { UserSettings } from '../types/settings';

interface MessageProps {
  message: MessageType;
  settings: UserSettings;
  hasAttachments?: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, settings, hasAttachments }) => {
  const [showSources, setShowSources] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const getUserAvatar = () => {
    if (settings.userAvatar === 'custom' && settings.customUserAvatar) {
      return (
        <img
          src={settings.customUserAvatar}
          alt="User avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return <span className="text-lg">{settings.userAvatar}</span>;
  };

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

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessageContent = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // This is a code block
        const lines = part.split('\n');
        const language = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        const codeId = `code-${message.id}-${index}`;
        
        return (
          <div key={index} className="my-4 bg-gray-900/80 border border-gray-700/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/60 border-b border-gray-700/50">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {language || 'Code'}
              </span>
              <button
                onClick={() => copyToClipboard(code, codeId)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded transition-colors"
              >
                {copiedCode === codeId ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-gray-100 font-mono leading-relaxed">
                {code}
              </code>
            </pre>
          </div>
        );
      } else {
        // Regular text content - format markdown-style elements
        return (
          <div key={index} className="whitespace-pre-wrap">
            {formatTextContent(part)}
          </div>
        );
      }
    });
  };

  const formatTextContent = (text: string) => {
    // Handle bold text (**text**)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    
    // Handle italic text (*text*)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>');
    
    // Handle inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-800/60 text-purple-300 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Handle headers (## Header)
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>');
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-3 mb-2">$1</h3>');
    
    // Handle bullet points (- item or * item)
    formatted = formatted.replace(/^[-*] (.*)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-purple-400 mt-1">•</span><span>$1</span></div>');
    
    // Handle numbered lists (1. item)
    formatted = formatted.replace(/^\d+\. (.*)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-blue-400 font-medium">•</span><span>$1</span></div>');
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className={`flex gap-4 p-4 ${message.isUser ? 'bg-transparent' : 'bg-gray-900/40'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isUser 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
          : 'bg-gradient-to-r from-green-600 to-teal-600'
      }`}>
        {message.isUser ? getUserAvatar() : getBotAvatar()}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
            {message.isUser ? settings.userName : settings.botName}
          </span>
          {message.isUser && message.isDeepSearch && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full">
              <Search className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-orange-300">Deep Search</span>
            </div>
          )}
          {message.isUser && hasAttachments && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
              <Paperclip className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-300">Files attached</span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-gray-200 text-sm leading-relaxed">
          {formatMessageContent(message.content)}
        </div>
        {!message.isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t border-gray-700/50 pt-3">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>Sources researched ({message.sources.length})</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showSources && (
              <div className="mt-2 space-y-1">
                {message.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors p-2 bg-gray-800/40 rounded border border-gray-700/30 hover:border-gray-600/50"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{source}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};