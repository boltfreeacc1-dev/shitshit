# D00M Studios AI Chat System

A modern AI chat application with advanced file processing and Deep Search capabilities.

## Features

- **Modern Chat Interface**: Beautiful, responsive chat UI with customizable avatars
- **Cross-Chat Memory**: AI can reference previous conversations for better context
- **Deep Search Mode**: Enhanced AI analysis with comprehensive responses
- **File Upload Support**: Process ZIP files, text files, code files, and more
- **Advanced File Processing**: Extract and analyze content from ZIP archives
- **Persistent Storage**: Chat history and settings saved locally
- **Customizable Profiles**: Custom avatars and names for both user and bot

## File Upload & Processing

### Supported File Types
- **Text Files**: .txt, .md, .json, .csv, .xml, .html, .css
- **Code Files**: .js, .ts, .jsx, .tsx, .py, .java, .cpp, .c, .h, .sql
- **Config Files**: .yml, .yaml, .ini, .conf, .env, .gitignore
- **Archive Files**: .zip (with full content extraction)
- **Other**: .log, .dockerfile, .sh, .bat, .ps1, .php, .rb, .go, .rs

### ZIP File Processing
The application can extract and analyze content from ZIP archives:
- Automatically extracts text-based files from ZIP archives
- Processes multiple files simultaneously
- Maintains file structure information
- Handles nested directories within ZIP files
- Supports large ZIP files (up to 50MB total)

### Deep Search Mode
Activate Deep Search for enhanced AI analysis:
- **Comprehensive Analysis**: More detailed and thorough responses
- **Multiple Perspectives**: Explores topics from different angles
- **Enhanced Context**: Uses more advanced AI parameters
- **File Integration**: Combines uploaded file content with search queries
- **Extended Responses**: Longer, more detailed explanations

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Servers

#### Web App
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Usage Guide

### Basic Chat
1. Type your message in the input field
2. Press Enter or click the Send button
3. The AI will respond with contextual information

### File Upload
1. Click the Upload button (📁) to toggle file upload area
2. Select files or drag and drop them
3. Supported formats include ZIP, text files, and code files
4. Files are automatically processed and analyzed

### Deep Search
1. Type your query in the input field
2. Optionally upload relevant files
3. Click the Deep Search button (🔍) instead of Send
4. Get comprehensive, detailed analysis with multiple perspectives

### Cross-Chat Memory
1. Enable in Settings → AI Features
2. AI will remember context from previous conversations
3. Provides more personalized and contextual responses

## Configuration

The application uses Google's Gemini AI API. Make sure to configure your API key in `src/services/geminiApi.ts`.

## Storage

- Chat history and settings are stored in browser cookies
- Discord linking data is stored in localStorage
- All data persists across browser sessions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details