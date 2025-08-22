// File Processing Service for AI Chat
import JSZip from 'jszip';

export interface ProcessedFile {
  name: string;
  content: string;
  type: string;
  size: number;
  error?: string;
}

export class FileProcessor {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly SUPPORTED_TEXT_EXTENSIONS = [
    '.txt', '.md', '.json', '.csv', '.xml', '.html', '.css', '.js', '.ts', 
    '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.sql', '.log',
    '.yml', '.yaml', '.ini', '.conf', '.config', '.env', '.gitignore',
    '.dockerfile', '.sh', '.bat', '.ps1', '.php', '.rb', '.go', '.rs',
    '.swift', '.kt', '.scala', '.clj', '.hs', '.elm', '.vue', '.svelte'
  ];

  static async processFiles(files: File[]): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    let totalSize = 0;

    for (const file of files) {
      if (totalSize + file.size > this.MAX_TOTAL_SIZE) {
        results.push({
          name: file.name,
          content: '',
          type: file.type,
          size: file.size,
          error: 'Total file size limit exceeded (50MB)'
        });
        continue;
      }

      if (file.size > this.MAX_FILE_SIZE) {
        results.push({
          name: file.name,
          content: '',
          type: file.type,
          size: file.size,
          error: 'File too large (max 10MB per file)'
        });
        continue;
      }

      try {
        const processed = await this.processFile(file);
        results.push(...processed);
        totalSize += file.size;
      } catch (error) {
        results.push({
          name: file.name,
          content: '',
          type: file.type,
          size: file.size,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private static async processFile(file: File): Promise<ProcessedFile[]> {
    const extension = this.getFileExtension(file.name);
    
    // Handle ZIP files
    if (['.zip', '.jar', '.war'].includes(extension)) {
      return await this.processZipFile(file);
    }
    
    // Handle RAR files (limited support)
    if (['.rar', '.7z'].includes(extension)) {
      return [{
        name: file.name,
        content: '',
        type: file.type,
        size: file.size,
        error: 'RAR and 7Z files are not supported. Please use ZIP format.'
      }];
    }

    // Handle text-based files
    if (this.isTextFile(file.name) || file.type.startsWith('text/')) {
      const content = await this.readTextFile(file);
      return [{
        name: file.name,
        content,
        type: file.type,
        size: file.size
      }];
    }

    // Handle PDF files (basic text extraction)
    if (file.type === 'application/pdf' || extension === '.pdf') {
      return [{
        name: file.name,
        content: 'PDF file detected. Content extraction not available in this version.',
        type: file.type,
        size: file.size,
        error: 'PDF text extraction not implemented'
      }];
    }

    // Unsupported file type
    return [{
      name: file.name,
      content: '',
      type: file.type,
      size: file.size,
      error: 'Unsupported file type'
    }];
  }

  private static async processZipFile(file: File): Promise<ProcessedFile[]> {
    const results: ProcessedFile[] = [];
    
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Process each file in the ZIP
      for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
        if (zipEntry.dir) continue; // Skip directories
        
        try {
          // Check if it's a text file
          if (this.isTextFile(relativePath)) {
            const content = await zipEntry.async('text');
            results.push({
              name: `${file.name}/${relativePath}`,
              content,
              type: 'text/plain',
              size: content.length
            });
          } else {
            results.push({
              name: `${file.name}/${relativePath}`,
              content: '',
              type: 'unknown',
              size: 0,
              error: 'Binary file in ZIP - content not extracted'
            });
          }
        } catch (error) {
          results.push({
            name: `${file.name}/${relativePath}`,
            content: '',
            type: 'unknown',
            size: 0,
            error: `Error processing file in ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
      
      if (results.length === 0) {
        results.push({
          name: file.name,
          content: '',
          type: file.type,
          size: file.size,
          error: 'No readable files found in ZIP archive'
        });
      }
      
    } catch (error) {
      results.push({
        name: file.name,
        content: '',
        type: file.type,
        size: file.size,
        error: `Error reading ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    return results;
  }

  private static async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  private static isTextFile(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    return this.SUPPORTED_TEXT_EXTENSIONS.includes(extension);
  }

  static formatFileContent(files: ProcessedFile[]): string {
    let content = '\n=== UPLOADED FILES ANALYSIS ===\n\n';
    
    const successfulFiles = files.filter(f => !f.error && f.content);
    const failedFiles = files.filter(f => f.error);
    const zipFiles = files.filter(f => f.name.includes('/'));
    const regularFiles = files.filter(f => !f.name.includes('/') && !f.error && f.content);
    
    // Handle ZIP files specially
    if (zipFiles.length > 0) {
      const zipNames = new Set(zipFiles.map(f => f.name.split('/')[0]));
      content += `📦 ZIP ARCHIVE(S) UPLOADED: ${Array.from(zipNames).join(', ')}\n\n`;
      
      zipNames.forEach(zipName => {
        const filesInZip = zipFiles.filter(f => f.name.startsWith(zipName + '/'));
        content += `📁 Contents of ${zipName}:\n`;
        content += `   └── Extracted ${filesInZip.length} file(s)\n\n`;
        
        filesInZip.forEach((file, index) => {
          const relativePath = file.name.replace(zipName + '/', '');
          content += `--- FILE ${index + 1} FROM ZIP: ${relativePath} ---\n`;
          content += `📍 Full path: ${file.name}\n`;
          content += `📏 Size: ${this.formatFileSize(file.size)}\n`;
          content += `📄 Type: ${file.type || 'text/plain'}\n\n`;
          content += file.content;
          content += '\n\n--- END OF FILE FROM ZIP ---\n\n';
        });
      });
    }
    
    // Handle regular files
    if (regularFiles.length > 0) {
      content += `📄 REGULAR FILE(S) UPLOADED: ${regularFiles.length}\n\n`;
      
      regularFiles.forEach((file, index) => {
        content += `--- REGULAR FILE ${index + 1}: ${file.name} ---\n`;
        content += `📏 Size: ${this.formatFileSize(file.size)}\n`;
        content += `📄 Type: ${file.type || 'text/plain'}\n\n`;
        content += file.content;
        content += '\n\n--- END OF REGULAR FILE ---\n\n';
      });
    }
    
    if (failedFiles.length > 0) {
      content += `\n❌ FILES WITH ISSUES (${failedFiles.length}):\n`;
      failedFiles.forEach(file => {
        const isFromZip = file.name.includes('/') ? '📦 ' : '📄 ';
        content += `${isFromZip}${file.name}: ${file.error}\n`;
      });
      content += '\n';
    }
    
    content += '=== END OF FILES ===\n\n';
    
    if (zipFiles.length > 0) {
      content += '🔍 ANALYSIS REQUEST: Please analyze the contents of the uploaded ZIP archive(s) and the extracted files. ';
      content += 'Provide insights, summaries, or answer questions about the files and their relationships within the archive structure.';
    } else {
      content += '🔍 ANALYSIS REQUEST: Please analyze the above uploaded file contents and provide insights, summaries, or answer questions about them.';
    }
    
    return content;
  }

  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}