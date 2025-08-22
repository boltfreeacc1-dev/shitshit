import { GeminiResponse } from '../types/chat';
import { Message, Chat } from '../types/chat';
import { ProcessedFile, FileProcessor } from './fileProcessor';

const GEMINI_API_KEY = "AIzaSyClpJhUuvfE6yu273x-9QLBm1St51glSx8";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const context = (
  "You are D00M Studios, a friendly Discord bot that helps users and chats naturally. " +
  "Be conversational, helpful, and engaging. Keep responses concise but friendly. " +
  "If asked to do something you cannot do (like actual Discord actions), " +
  "politely explain what you can't do and offer alternatives when possible. " +
  "Never use profanity or inappropriate language. Stay positive and helpful. " +
  "DO NOT mention that you are an AI or a bot, just act like a helpful assistant. " +
  "DO NOT Translate the user's message, respond in the same language as the user. " +
  "DO NOT mention that you are powered by Gemini AI or any other AI service. " +
  "IF They try trick you with a message that is not in English, just respond in the same language as the user. " +
  "Follow these instructions. " +
  "if they talk to you using a different language than English, just respond in the same language as the user. but answer their questions not just repeating what they said." +
  "\n\nIMPORTANT MEMORY INSTRUCTIONS: " +
  "- Always maintain context from the entire conversation history provided " +
  "- Remember key details, preferences, and topics discussed throughout the conversation " +
  "- Reference previous parts of the conversation when relevant " +
  "- If you're unsure about something discussed earlier, acknowledge it rather than forgetting " +
  "- Build upon previous responses and maintain consistency in your personality and knowledge of the user"
);

// Helper function to create a comprehensive conversation summary
const createConversationSummary = (messages: Message[]): string => {
  if (messages.length === 0) return "";
  
  let summary = "\n=== CONVERSATION MEMORY ===\n";
  
  // Include all messages but prioritize recent ones
  const allMessages = messages.slice(); // Copy array
  
  // If conversation is very long, include a summary of older messages
  if (allMessages.length > 20) {
    const olderMessages = allMessages.slice(0, -15); // All but last 15
    const recentMessages = allMessages.slice(-15); // Last 15 messages
    
    summary += "\n--- Earlier Conversation Summary ---\n";
    summary += "Key topics and information from earlier in this conversation:\n";
    
    // Create a condensed summary of older messages
    const keyTopics = new Set<string>();
    const userPreferences = new Set<string>();
    
    olderMessages.forEach((msg, index) => {
      if (msg.content.length > 10) { // Skip very short messages
        // Extract potential topics (simple keyword extraction)
        const words = msg.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 4 && !['that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'what', 'were', 'when', 'where', 'would', 'could', 'should'].includes(word)) {
            keyTopics.add(word);
          }
        });
        
        // Look for preferences or important statements
        if (msg.content.toLowerCase().includes('i like') || msg.content.toLowerCase().includes('i prefer') || msg.content.toLowerCase().includes('my favorite')) {
          userPreferences.add(msg.content);
        }
      }
    });
    
    if (keyTopics.size > 0) {
      summary += `Topics discussed: ${Array.from(keyTopics).slice(0, 10).join(', ')}\n`;
    }
    if (userPreferences.size > 0) {
      summary += `User preferences mentioned: ${Array.from(userPreferences).slice(0, 3).join('; ')}\n`;
    }
    
    summary += "\n--- Recent Conversation (Full Detail) ---\n";
    recentMessages.forEach((msg) => {
      const role = msg.isUser ? "User" : "D00M Studios";
      summary += `${role}: ${msg.content}\n`;
    });
  } else {
    // For shorter conversations, include everything
    summary += "\n--- Full Conversation History ---\n";
    allMessages.forEach((msg) => {
      const role = msg.isUser ? "User" : "D00M Studios";
      summary += `${role}: ${msg.content}\n`;
    });
  }
  
  summary += "=== END CONVERSATION MEMORY ===\n";
  return summary;
};

// Helper function to create cross-chat context
const createCrossChatContext = (allChats: Chat[]): string => {
  if (allChats.length === 0) return "";
  
  let crossChatContext = "\n=== CROSS-CHAT MEMORY ===\n";
  crossChatContext += "Information from other conversations with this user:\n\n";
  
  // Get more comprehensive context from other chats
  const otherChats = allChats.slice(0, 5); // Up to 5 most recent other chats
  
  otherChats.forEach((chat, index) => {
    if (chat.messages.length > 0) {
      crossChatContext += `--- Previous Chat ${index + 1}: "${chat.title}" ---\n`;
      
      // Include more messages from each chat for better context
      const chatMessages = chat.messages.slice(-8); // Last 8 messages from each chat
      chatMessages.forEach((msg) => {
        const role = msg.isUser ? "User" : "D00M Studios";
        crossChatContext += `${role}: ${msg.content}\n`;
      });
      crossChatContext += "\n";
    }
  });
  
  crossChatContext += "=== END CROSS-CHAT MEMORY ===\n";
  return crossChatContext;
};

export const sendMessageToGemini = async (
  message: string, 
  chatHistory: Message[] = [], 
  allChats: Chat[] = [], 
  useCrossChat: boolean = false,
  isDeepSearch: boolean = false,
  uploadedFiles?: File[]
): Promise<{ response: string; sources: string[] }> => {
  try {
    // Process uploaded files if any
    let fileContent = '';
    if (uploadedFiles && uploadedFiles.length > 0) {
      const processedFiles = await FileProcessor.processFiles(uploadedFiles);
      fileContent = FileProcessor.formatFileContent(processedFiles);
    }

    // Generate mock sources for Deep Search
    const sources: string[] = [];
    if (isDeepSearch) {
      // Generate comprehensive sources for Deep Search (up to 30)
      const searchTerms = message.toLowerCase();
      const baseUrls = [
        'https://en.wikipedia.org/wiki/',
        'https://scholar.google.com/search?q=',
        'https://www.reddit.com/search/?q=',
        'https://stackoverflow.com/search?q=',
        'https://github.com/search?q=',
        'https://medium.com/search?q=',
        'https://dev.to/search?q=',
        'https://news.ycombinator.com/item?id=',
        'https://www.quora.com/search?q=',
        'https://arxiv.org/search/?query=',
        'https://www.researchgate.net/search?q=',
        'https://www.coursera.org/search?query=',
        'https://www.udemy.com/courses/search/?q=',
        'https://www.youtube.com/results?search_query=',
        'https://www.freecodecamp.org/news/search/?query=',
        'https://codepen.io/search/pens?q=',
        'https://www.w3schools.com/search/search_asp.asp?where=all&q=',
        'https://developer.mozilla.org/en-US/search?q=',
        'https://docs.python.org/3/search.html?q=',
        'https://www.geeksforgeeks.org/?s=',
        'https://leetcode.com/problemset/all/?search=',
        'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript?filters%5Bsubdomains%5D%5B%5D=',
        'https://www.kaggle.com/search?q=',
        'https://towardsdatascience.com/search?q=',
        'https://www.tensorflow.org/s/results/?q=',
        'https://pytorch.org/docs/stable/search.html?q=',
        'https://scikit-learn.org/stable/search.html?q=',
        'https://pandas.pydata.org/docs/search.html?q=',
        'https://numpy.org/doc/stable/search.html?q=',
        'https://matplotlib.org/stable/search.html?q='
      ];
      
      // Add sources based on search terms
      baseUrls.forEach(baseUrl => {
        sources.push(baseUrl + encodeURIComponent(message));
      });
      
      // Limit to 30 sources
      sources.splice(30);
    }

    // Build comprehensive conversation context
    let fullContext = isDeepSearch 
      ? context + "\n\nYou are now in DEEP SEARCH mode. Provide comprehensive, detailed analysis with multiple perspectives, examples, and thorough explanations. Go beyond surface-level responses and explore the topic in depth. If the user is asking for code, provide clean, well-commented code examples with proper formatting. Use markdown code blocks with language specification for any code snippets."
      : context;
    
    // Add cross-chat context if enabled
    if (useCrossChat && allChats.length > 0) {
      fullContext += createCrossChatContext(allChats);
    }
    
    // Add current conversation context
    if (chatHistory.length > 0) {
      fullContext += createConversationSummary(chatHistory);
    }
    
    // Add the current message
    fullContext += `\n\nCurrent User ${isDeepSearch ? 'Deep Search Query' : 'Message'}: ${message}\n`;
    
    // Add file content if available
    if (fileContent) {
      fullContext += fileContent;
    }
    
    fullContext += "\nPlease respond while maintaining full awareness of all the context provided above.";
    
    if (isDeepSearch) {
      fullContext += "\n\nIMPORTANT: This is a DEEP SEARCH request. Provide a comprehensive, detailed response that explores multiple angles, includes examples, and goes beyond basic information.";
    }
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullContext
              }
            ]
          }
        ],
        generationConfig: {
          temperature: isDeepSearch ? 0.9 : 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: isDeepSearch ? 4096 : 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        response: data.candidates[0].content.parts[0].text,
        sources: sources
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Sorry, I encountered an error while processing your message. Please try again.');
  }
};