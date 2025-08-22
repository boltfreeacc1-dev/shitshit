import { UserSettings, defaultSettings } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'ai_chat_settings';

export const saveSettingsToStorage = (settings: UserSettings): void => {
  try {
    const serializedSettings = JSON.stringify(settings);
    document.cookie = `${SETTINGS_STORAGE_KEY}=${encodeURIComponent(serializedSettings)}; max-age=${60 * 60 * 24 * 365}; path=/`; // 1 year
  } catch (error) {
    console.error('Failed to save settings to storage:', error);
  }
};

export const loadSettingsFromStorage = (): UserSettings => {
  try {
    const cookies = document.cookie.split(';');
    const settingsCookie = cookies.find(cookie => cookie.trim().startsWith(`${SETTINGS_STORAGE_KEY}=`));
    
    if (!settingsCookie) return defaultSettings;
    
    const cookieValue = settingsCookie.split('=')[1];
    const decodedValue = decodeURIComponent(cookieValue);
    const parsedSettings = JSON.parse(decodedValue);
    
    return { ...defaultSettings, ...parsedSettings };
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
    return defaultSettings;
  }
};