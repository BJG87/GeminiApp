
// ========================================
// Core Types
// ========================================

/**
 * Schema definition for structured JSON responses
 */
interface StvpsAiSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: {
    [key: string]: StvpsAiSchema;
  };
  items?: StvpsAiSchema;
  description?: string;
  required?: string[];
  enum?: any[];
}

/**
 * File part for multi-modal prompts (images, PDFs, audio, video)
 */
interface StvpsAiFilePart {
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
interface StvpsAiFileOptions {
  /** MIME type (required for URLs) */
  mimeType?: string;
  /** Schema for structured JSON output */
  schema?: StvpsAiSchema;
}

/**
 * Options for basic prompts
 */
interface StvpsAiPromptOptions {
  /** Schema for structured JSON output */
  schema?: StvpsAiSchema;
}

/**
 * Uploaded file metadata
 */
interface StvpsAiUploadedFile {
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
interface StvpsAiFileListResponse {
  files: StvpsAiUploadedFile[];
  nextPageToken?: string;
}

/**
 * Job in the queue
 */
interface StvpsAiJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  createdAt: number;
  processingStartedAt?: number;
  completedAt?: number;
  error?: string;
  retryCount?: number;
  result?: any;
}

/**
 * Failed job details
 */
interface StvpsAiFailedJob {
  job: StvpsAiJob;
  reason: string;
  timestamp: number;
}

/**
 * Queue statistics
 */
interface StvpsAiQueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  maxConcurrent: number;
}

/**
 * Message in chat history
 */
interface StvpsAiChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text?: string; inlineData?: any; fileData?: any }>;
}

// ========================================
// Chat Session Interface
// ========================================

/**
 * Chat session for multi-turn conversations
 */
interface StvpsAiChatSession {
  /**
   * Send a text message in the chat
   * @param text - The message text
   * @param options - Optional schema for structured output
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessage(text: string, options?: StvpsAiPromptOptions): string | object;

  /**
   * Send a message with a single image
   * @param text - The message text
   * @param image - Image URL, Drive ID, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithImage(text: string, image: string | StvpsAiFilePart, options?: StvpsAiFileOptions): string | object;

  /**
   * Send a message with multiple images
   * @param text - The message text
   * @param images - Array of image URLs, Drive IDs, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithImages(text: string, images: (string | StvpsAiFilePart)[], options?: StvpsAiFileOptions): string | object;

  /**
   * Send a message with a single file
   * @param text - The message text
   * @param file - File URL, Drive ID, or file part
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithFile(text: string, file: string | StvpsAiFilePart, options?: StvpsAiFileOptions): string | object;

  /**
   * Send a message with multiple files
   * @param text - The message text
   * @param files - Array of file URLs, Drive IDs, or file parts
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   */
  sendMessageWithFiles(text: string, files: (string | StvpsAiFilePart)[], options?: StvpsAiFileOptions): string | object;

  /**
   * Get the conversation history
   * @returns Array of message objects
   */
  getHistory(): StvpsAiChatMessage[];

  /**
   * Clear the conversation history
   */
  clearHistory(): void;
}

// ========================================
// Main AI Instance Interface
// ========================================

/**
 * Main StvpsAi instance for interacting with Google Gemini API
 */
interface StvpsAiInstance {
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
  prompt(text: string, options?: StvpsAiPromptOptions): string | object;

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
  promptWithImage(text: string, image: string | StvpsAiFilePart, options?: StvpsAiFileOptions): string | object;

  /**
   * Send a prompt with multiple images
   * @param text - The prompt text
   * @param images - Array of image URLs, Drive IDs, or inline data
   * @param options - Optional mimeType and schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithImages("Compare these images", [url1, url2], { mimeType: "image/jpeg" });
   */
  promptWithImages(text: string, images: (string | StvpsAiFilePart)[], options?: StvpsAiFileOptions): string | object;

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
  promptWithFile(text: string, file: string | StvpsAiFilePart, options?: StvpsAiFileOptions): string | object;

  /**
   * Send a prompt with multiple files
   * @param text - The prompt text
   * @param files - Array of file URLs, Drive IDs, or file parts
   * @param options - Required mimeType for URLs, optional schema
   * @returns Text response or parsed JSON object if schema provided
   * @example
   * const response = ai.promptWithFiles("Analyze these docs", [pdf1, pdf2], { mimeType: "application/pdf" });
   */
  promptWithFiles(text: string, files: (string | StvpsAiFilePart)[], options?: StvpsAiFileOptions): string | object;

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
  startChat(): StvpsAiChatSession;

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
  uploadFile(file: string | GoogleAppsScript.Base.Blob, options?: { mimeType?: string }): StvpsAiUploadedFile;

  /**
   * Get metadata for an uploaded file
   * @param fileName - File name (e.g., "files/abc123")
   * @returns File metadata
   */
  getFile(fileName: string): StvpsAiUploadedFile;

  /**
   * List all uploaded files
   * @param pageSize - Number of files per page (default: 10)
   * @param pageToken - Token for pagination
   * @returns List of files and optional next page token
   */
  listFiles(pageSize?: number, pageToken?: string): StvpsAiFileListResponse;

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
// Job Queue Interface
// ========================================

/**
 * Job queue system for background processing
 */
interface StvpsAiJobQueue {
  /**
   * Set maximum number of concurrent jobs (default: 1)
   * @param max - Maximum concurrent jobs
   */
  setMaxConcurrentJobs(max: number): void;

  /**
   * Get maximum concurrent jobs setting
   */
  getMaxConcurrentJobs(): number;

  /**
   * Add a single job to the queue
   * @param jobData - Job data to process
   * @returns Job ID
   */
  addJob(jobData: any): string;

  /**
   * Add multiple jobs to the queue
   * @param jobsData - Array of job data
   * @returns Array of job IDs
   */
  addJobs(jobsData: any[]): string[];

  /**
   * Process jobs in the queue
   * Note: User must implement processJobs() function that calls StvpsAi.JobQueue.processJobsInternal()
   */
  processJobsInternal(): void;

  /**
   * Stop processing jobs (removes trigger)
   */
  stopProcessingJobs(): void;

  /**
   * Get statistics about the job queue
   */
  getQueueStats(): StvpsAiQueueStats;

  /**
   * Get list of failed jobs
   */
  getFailedJobs(): StvpsAiFailedJob[];

  /**
   * Clear all failed jobs
   */
  clearFailedJobs(): void;

  /**
   * Get a specific job by ID
   */
  getJob(jobId: string): StvpsAiJob | null;

  /**
   * Get all jobs with a specific status
   */
  getJobsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): StvpsAiJob[];

  /**
   * Clear completed jobs from the queue
   */
  clearCompletedJobs(): void;

  /**
   * Clear all jobs from the queue
   */
  clearAllJobs(): void;
}

// ========================================
// Main Library Interface
// ========================================

/**
 * StvpsAi Library - Main entry point
 */
interface StvpsAiLibrary {
  /**
   * Create a new StvpsAi instance
   * @param apiKey - Your Gemini API key
   * @param model - Optional model name (default: "gemini-2.0-flash-exp")
   * @returns AI instance
   * @example
   * const ai = StvpsAi.newInstance('YOUR_API_KEY');
   * const response = ai.prompt('Hello!');
   */
  newInstance(apiKey: string, model?: string): StvpsAiInstance;

  /**
   * Job queue functionality
   */
  JobQueue: StvpsAiJobQueue;

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
 * StvpsAi global variable (available when library is added to Apps Script project)
 */
declare const StvpsAi: StvpsAiLibrary;

// ========================================
// Export for TypeScript modules
// ========================================

export {
  StvpsAiLibrary,
  StvpsAiInstance,
  StvpsAiChatSession,
  StvpsAiJobQueue,
  StvpsAiSchema,
  StvpsAiFilePart,
  StvpsAiFileOptions,
  StvpsAiPromptOptions,
  StvpsAiUploadedFile,
  StvpsAiFileListResponse,
  StvpsAiJob,
  StvpsAiFailedJob,
  StvpsAiQueueStats,
  StvpsAiChatMessage,
};
