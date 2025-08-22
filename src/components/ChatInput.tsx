import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2, Search, Upload, FileText, Eye } from 'lucide-react';

import { X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, uploadedFiles?: File[]) => void;
  onDeepSearch?: (query: string, files?: File[]) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onDeepSearch, isLoading }) => {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      if (isDeepSearchMode && onDeepSearch) {
        onDeepSearch(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      } else {
        onSendMessage(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      }
      setMessage('');
      setUploadedFiles([]);
      setShowFileUpload(false);
      setIsDeepSearchMode(false);
    }
  };

  const handleDeepSearch = () => {
    // Auto-send Deep Search with current message
    if (message.trim() && !isLoading && onDeepSearch) {
      onDeepSearch(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
      setMessage('');
      setUploadedFiles([]);
      setShowFileUpload(false);
      setIsDeepSearchMode(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setUploadedFiles(prev => [...prev, file]);
          setShowFileUpload(true);
        }
        break;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      setShowFileUpload(true);
    }
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className={`p-4 border-t border-gray-800/50 bg-gray-950/80 backdrop-blur-xl transition-all duration-200 ${
        isDragOver ? 'bg-purple-900/20 border-purple-500/50' : ''
      } ${isDeepSearchMode ? 'bg-orange-900/20 border-orange-500/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Deep Search Mode Indicator */}

      {/* Drag and Drop Indicator */}
      {isDragOver && (
        <div className="mb-3 p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Drop files here to upload</span>
          </div>
        </div>
      )}
      {/* File Upload Area */}
      {showFileUpload && (
        <div className="mb-4 p-3 bg-gray-900/60 border border-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">File Upload</h4>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx,.zip,.rar,.7z,.tar,.gz,.json,.csv,.xml,.html,.md,.py,.js,.ts,.jsx,.tsx,.css,.scss,.less,.sql,.log"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 text-gray-300 rounded-lg hover:bg-gray-700/60 transition-all cursor-pointer text-sm border border-gray-600/50 hover:border-gray-500/50"
          >
            <Upload className="w-4 h-4" />
            Choose Files (ZIP, PDF, TXT, Code files, etc.)
          </label>
          
          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-400">
                Uploaded Files ({uploadedFiles.length}):
              </p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800/40 rounded border border-gray-600/30">
                  <div className="flex items-center gap-2">
                    {file.name.toLowerCase().endsWith('.zip') ? (
                      <div className="w-4 h-4 text-purple-400 font-bold text-xs flex items-center justify-center">📦</div>
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <p className="text-sm text-white truncate max-w-48">
                        {file.name.toLowerCase().endsWith('.zip') && '📦 '}
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                        {file.name.toLowerCase().endsWith('.zip') && ' (ZIP Archive)'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Type your message... (Ctrl+V to paste images)"
            disabled={isLoading}
            className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none transition-all duration-200 min-h-[50px] max-h-32 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* File Upload Toggle */}
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`flex-shrink-0 w-12 h-12 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
              showFileUpload || uploadedFiles.length > 0
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                : 'bg-gray-700/60 hover:bg-gray-600/60 text-gray-300'
            }`}
            title="Upload files"
          >
            <Upload className="w-5 h-5" />
            {uploadedFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {uploadedFiles.length}
              </span>
            )}
          </button>

          {/* Deep Search Button */}
          <button
            onClick={() => {
              if (message.trim() && !isLoading) {
                onDeepSearch?.(message.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined);
                setMessage('');
                setUploadedFiles([]);
                setShowFileUpload(false);
              }
            }}
            disabled={isLoading}
            className={`flex-shrink-0 w-12 h-12 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl ${
              !message.trim() 
                ? 'bg-gray-700/60 opacity-50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
            }`}
            title="Deep Search - Comprehensive AI Analysis"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          {/* Regular Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 text-white rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};