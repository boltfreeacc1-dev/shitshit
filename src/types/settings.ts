export interface UserSettings {
  userAvatar: string;
  botAvatar: string;
  userName: string;
  botName: string;
  customUserAvatar?: string;
  customBotAvatar?: string;
  useCrossChat: boolean;
}

export const defaultSettings: UserSettings = {
  userAvatar: '👤',
  botAvatar: '🤖',
  userName: 'You',
  botName: 'D00M Studios',
  useCrossChat: false
};

export const avatarOptions = {
  user: ['👤', '😊', '😎', '🧑‍💻', '👨‍💻', '👩‍💻', '🦸', '🦸‍♀️', '🦸‍♂️', '🧙‍♂️', '🧙‍♀️', '👑', '🎭', '🎨', '🎯'],
  bot: ['🤖', '🔥', '⚡', '💀', '👾', '🎮', '🚀', '⭐', '💎', '🔮', '🎪', '🎭', '🎨', '🎯', '🎲']
};