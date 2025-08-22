import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Upload, Trash2, MessageCircle } from 'lucide-react';
import { UserSettings, avatarOptions } from '../types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  chats: any[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  chats
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);


  if (!isOpen) return null;

  const handleImageUpload = (file: File, type: 'user' | 'bot') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'user') {
        setLocalSettings(prev => ({ 
          ...prev, 
          customUserAvatar: result,
          userAvatar: 'custom'
        }));
      } else {
        setLocalSettings(prev => ({ 
          ...prev, 
          customBotAvatar: result,
          botAvatar: 'custom'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'bot') => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file, type);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeCustomAvatar = (type: 'user' | 'bot') => {
    if (type === 'user') {
      setLocalSettings(prev => ({ 
        ...prev, 
        customUserAvatar: undefined,
        userAvatar: '👤'
      }));
    } else {
      setLocalSettings(prev => ({ 
        ...prev, 
        customBotAvatar: undefined,
        botAvatar: '🤖'
      }));
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 w-full max-w-sm mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* User Settings */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Your Profile</h3>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={localSettings.userName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, userName: e.target.value }))}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Avatar</label>
              <div className="grid grid-cols-10 gap-1">
                {avatarOptions.user.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setLocalSettings(prev => ({ ...prev, userAvatar: avatar }))}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                      localSettings.userAvatar === avatar
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-gray-800/60 hover:bg-gray-700/60'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'user')}
                    className="hidden"
                    id="user-avatar-upload"
                  />
                  <label
                    htmlFor="user-avatar-upload"
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-300 rounded-lg hover:bg-gray-700/60 transition-all cursor-pointer text-xs"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Custom Avatar
                  </label>
                  {localSettings.customUserAvatar && (
                    <button
                      onClick={() => removeCustomAvatar('user')}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove custom avatar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {localSettings.customUserAvatar && (
                  <div className="flex items-center gap-2">
                    <img
                      src={localSettings.customUserAvatar}
                      alt="Custom user avatar"
                      className="w-6 h-6 rounded-lg object-cover border border-gray-700"
                    />
                    <span className="text-xs text-gray-400">Custom avatar uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bot Settings */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Bot Profile</h3>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={localSettings.botName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, botName: e.target.value }))}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                placeholder="Bot name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Avatar</label>
              <div className="grid grid-cols-10 gap-1">
                {avatarOptions.bot.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setLocalSettings(prev => ({ ...prev, botAvatar: avatar }))}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                      localSettings.botAvatar === avatar
                        ? 'bg-green-600 ring-2 ring-green-400'
                        : 'bg-gray-800/60 hover:bg-gray-700/60'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'bot')}
                    className="hidden"
                    id="bot-avatar-upload"
                  />
                  <label
                    htmlFor="bot-avatar-upload"
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-300 rounded-lg hover:bg-gray-700/60 transition-all cursor-pointer text-xs"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Custom Avatar
                  </label>
                  {localSettings.customBotAvatar && (
                    <button
                      onClick={() => removeCustomAvatar('bot')}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove custom avatar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {localSettings.customBotAvatar && (
                  <div className="flex items-center gap-2">
                    <img
                      src={localSettings.customBotAvatar}
                      alt="Custom bot avatar"
                      className="w-6 h-6 rounded-lg object-cover border border-gray-700"
                    />
                    <span className="text-xs text-gray-400">Custom avatar uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cross-Chat Memory Settings */}
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-white">Advanced Features</h3>
            <div className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">Cross-Chat Memory</h4>
                  <p className="text-gray-400 text-xs">Allow AI to learn from other conversations</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.useCrossChat}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, useCrossChat: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
              </label>
            </div>
            {localSettings.useCrossChat && (
              <div className="p-2 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-blue-300 text-xs">
                  <strong>Enabled:</strong> The AI can reference information from your other chat conversations to provide more contextual and personalized responses. This creates a more continuous experience across all your chats.
                </p>
              </div>
            )}
          </div>

        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-700/60 text-gray-300 rounded-lg hover:bg-gray-600/60 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};