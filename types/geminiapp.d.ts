
// ========================================
// Core Types
// ========================================

/**
 * Schema definition for structured JSON responses
 */
interface GeminiAppSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: {
    [key: string]: GeminiAppSchema;
  };
  items?: GeminiAppSchema;
  description?: string;
  required?: string[];
  enum?: any[];
}

/**
 * File part for multi-modal prompts (images, PDFs, audio, video)
 */
interface GeminiAppFilePart {
  /** URL, Google Drive file ID, or Drive URL */
  url?: string;
  /** MIME type (required for URLs, optional for Drive IDs) */
  mimeType?: string;
  /** Inline base64 data */
  inlineData?: {
    data: string;
    mimeType: string;
  };
  /** File URI from uploaded file */
  uri?: string;
}

/**
 * Options for prompts with files
 */
interface GeminiAppFileOptions {
  /** MIME type (required for URLs) */
  mimeType?: string;
  /** Schema for structured JSON output */
  schema?: GeminiAppSchema;
}

/**
 * Options for basic prompts
 */
interface GeminiAppPromptOptions {
  /** Schema for structured JSON output */
  schema?: GeminiAppSchema;
}

/**
 * Uploaded file metadata
 */
interface GeminiAppUploadedFile {
  /** File name */
  name: string;
  /** File URI for use in API calls */
  uri: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Creation timestamp */
  createTime: string;
  /** Expiration timestamp */
  expirationTime: string;
  /** SHA-256 hash */
  sha256Hash: string;
  /** Processing state */
  state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

/**
 * File list response
 */
interface GeminiAppFileListResponse {
  files: GeminiAppUploadedFile[];
  nextPageToken?: string;
}


/**
 * Message in chat history
 */
interface GeminiAppChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: any; fileData?: any }>;
}

// ========================================
// Chat Session Interface
// ========================================

/**
 * Chat session for multi-turn conversations
 */
interface GeminiAppChatSession {
  /**
   * Send a text message in the chat
   * @param text - The message text
   * @param options - Optional schema for structured output
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessage(text: string, options?: GeminiAppPromptOptions): string | object;

  /**
   * Send a message with a single image
   * @param text - The message text
   * @param image - Image URL, Drive ID, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithImage(text: string, image: string | GeminiAppFilePart, options?: GeminiAppFileOptions): string | object;

  /**
   * Send a message with multiple images
   * @param text - The message text
   * @param images - Array of image URLs, Drive IDs, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithImages(text: string, images: (string | GeminiAppFilePart)[], options?: GeminiAppFileOptions): string | object;

  /**
   * Send a message with a single file
   * @param text - The message text
   * @param file - File URL, Drive ID, or file part
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithFile(text: string, file: string | GeminiAppFilePart, options?: GeminiAppFileOptions): string | object;

  /**
   * Send a message with multiple files
   * @param text - The message text
   * @param files - Array of file URLs, Drive IDs, or file parts
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithFiles(text: string, files: (string | GeminiAppFilePart)[], options?: GeminiAppFileOptions): string | object;

  /**
   * Get the conversation history
   * @returns Array of message objects
   */
  getHistory(): GeminiAppChatMessage[];

  /**
   * Clear the conversation history
   */
  clearHistory(): void;
}

// ========================================
// Main AI Instance Interface
// ========================================

/**
 * Main GeminiApp instance for interacting with Google Gemini API
 */
interface GeminiAppInstance {
  // ========================================
  // Simple Prompts
  // ========================================

  /**
   * Send a simple text prompt
   * @param text - The prompt text
   * @param options - Optional schema for structured output
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.prompt("Tell me a joke");
   * const structured = ai.prompt("List 3 colors", { schema: colorSchema });
   */
  prompt(text: string, options?: GeminiAppPromptOptions): string | object;

  // ========================================
  // Prompts with Images
  // ========================================

  /**
   * Send a prompt with a single image
   * @param text - The prompt text
   * @param image - Image URL, Drive ID, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithImage("What's in this image?", imageUrl, { mimeType: "image/jpeg" });
   */
  promptWithImage(text: string, image: string | GeminiAppFilePart, options?: GeminiAppFileOptions): string | object;

  /**
   * Send a prompt with multiple images
   * @param text - The prompt text
   * @param images - Array of image URLs, Drive IDs, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithImages("Compare these images", [url1, url2], { mimeType: "image/jpeg" });
   */
  promptWithImages(text: string, images: (string | GeminiAppFilePart)[], options?: GeminiAppFileOptions): string | object;

  // ========================================
  // Prompts with Files
  // ========================================

  /**
   * Send a prompt with a single file (PDF, audio, video, etc.)
   * @param text - The prompt text
   * @param file - File URL, Drive ID, Drive URL, or file part
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithFile("Transcribe this", audioUrl, { mimeType: "audio/mpeg" });
   * const driveResponse = ai.promptWithFile("Summarize this doc", driveFileId);
   */
  promptWithFile(text: string, file: string | GeminiAppFilePart, options?: GeminiAppFileOptions): string | object;

  /**
   * Send a prompt with multiple files
   * @param text - The prompt text
   * @param files - Array of file URLs, Drive IDs, or file parts
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithFiles("Analyze these docs", [pdf1, pdf2], { mimeType: "application/pdf" });
   */
  promptWithFiles(text: string, files: (string | GeminiAppFilePart)[], options?: GeminiAppFileOptions): string | object;

  // ========================================
  // Chat Sessions
  // ========================================

  /**
   * Start a new chat session
   * @returns ChatSession object
   * @example
   * const chat = ai.startChat();
   * const response1 = chat.sendMessage("Hello");
   * const response2 = chat.sendMessage("Tell me more");
   */
  startChat(): GeminiAppChatSession;

  // ========================================
  // File Management
  // ========================================

  /**
   * Upload a file to Gemini API for reuse
   * @param file - URL, Drive ID, Drive URL, GoogleAppsScript.Base.Blob, or base64 string
   * @param options - Optional mimeType (required for URLs)
   * @returns Uploaded file metadata
   * @example
   * const uploaded = ai.uploadFile(driveFileId);
   * const response = ai.promptWithFile("Analyze this", { uri: uploaded.uri, mimeType: uploaded.mimeType });
   */
  uploadFile(file: string | GoogleAppsScript.Base.Blob, options?: { mimeType?: string }): GeminiAppUploadedFile;

  /**
   * Get metadata for an uploaded file
   * @param fileName - File name (e.g., "files/abc123")
   * @returns File metadata
   */
  getFile(fileName: string): GeminiAppUploadedFile;

  /**
   * List all uploaded files
   * @param pageSize - Number of files per page (default: 10)
   * @param pageToken - Token for pagination
   * @returns List of files and optional next page token
   */
  listFiles(pageSize?: number, pageToken?: string): GeminiAppFileListResponse;

  /**
   * Delete an uploaded file
   * @param fileName - File name (e.g., "files/abc123")
   */
  deleteFile(fileName: string): void;

  /**
   * Delete all uploaded files
   * @param batchSize - Number of files to delete at once (default: 5)
   */
  deleteAllFiles(batchSize?: number): void;
}

// ========================================
// Main Library Interface
// ========================================

/**
 * GeminiApp Library - Main entry point
 */
interface GeminiAppLibrary {
  /**
   * Create a new GeminiApp instance
   * @param apiKey - Your Gemini API key
   * @param model - Optional model name (default: "gemini-2.0-flash-exp")
   * @returns AI instance
   * @example
   * const ai = GeminiApp.newInstance('YOUR_API_KEY');
   * const response = ai.prompt('Hello!');
   */
  newInstance(apiKey: string, model?: string): GeminiAppInstance;

  /**
   * List all uploaded files (standalone helper)
   */
  listUploadedFiles(): void;

  /**
   * Delete all uploaded files (standalone helper)
   */
  cleanupAllFiles(): void;
}

// ========================================
// Global Declaration
// ========================================

/**
 * GeminiApp global variable (available when library is added to Apps Script project)
 */
declare namespace GeminiApp {
  /**
   * Create a new GeminiApp instance
   * @param apiKey - Your Gemini API key
   * @param model - Optional model name (default: "gemini-2.0-flash-exp")
   * @returns AI instance
   * @example
   * const ai = GeminiApp.newInstance('YOUR_API_KEY');
   * const response = ai.prompt('Hello!');
   */
  function newInstance(apiKey: string, model?: string): GeminiAppInstance;

  /**
   * List all uploaded files (standalone helper)
   */
  function listUploadedFiles(): void;

  /**
   * Delete all uploaded files (standalone helper)
   */
  function cleanupAllFiles(): void;
}

