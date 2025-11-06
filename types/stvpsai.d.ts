/**
 * StvpsAi - TypeScript Type Definitions
 * A simple, streamlined Google Apps Script library for Gemini API
 * 
 * Usage with clasp:
 * 1. Place this file in your project's types/ folder
 * 2. Reference it in your .gs files with JSDoc:
 *    // @ts-check
 *    /// <reference path="./types/stvpsai.d.ts" />
 * 3. Your IDE will provide full autocomplete and type checking
 */

declare namespace StvpsAi {
  // ========================================
  // Core Types
  // ========================================

  /**
   * Schema definition for structured JSON responses
   */
  interface Schema {
    type: 'object' | 'array' | 'string' | 'number' | 'boolean';
    properties?: {
      [key: string]: Schema;
    };
    items?: Schema;
    description?: string;
    required?: string[];
    enum?: any[];
  }

  /**
   * File part for multi-modal prompts (images, PDFs, audio, video)
   */
  interface FilePart {
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
  interface FileOptions {
    /** MIME type (required for URLs) */
    mimeType?: string;
    /** Schema for structured JSON output */
    schema?: Schema;
  }

  /**
   * Options for basic prompts
   */
  interface PromptOptions {
    /** Schema for structured JSON output */
    schema?: Schema;
  }

  /**
   * Uploaded file metadata
   */
  interface UploadedFile {
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
  interface FileListResponse {
    files: UploadedFile[];
    nextPageToken?: string;
  }

  /**
   * Job in the queue
   */
  interface Job {
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
  interface FailedJob {
    job: Job;
    reason: string;
    timestamp: number;
  }

  /**
   * Queue statistics
   */
  interface QueueStats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    maxConcurrent: number;
  }

  // ========================================
  // Main AI Class
  // ========================================

  /**
   * Main StvpsAi class for interacting with Google Gemini API
   */
  class AI {
    /**
     * Create a new StvpsAi instance
     * @param apiKey - Your Gemini API key
     * @param model - Model name (default: "gemini-2.0-flash-exp")
     */
    constructor(apiKey: string, model?: string);

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
    prompt(text: string, options?: PromptOptions): string | object;

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
    promptWithImage(text: string, image: string | FilePart, options?: FileOptions): string | object;

    /**
     * Send a prompt with multiple images
     * @param text - The prompt text
     * @param images - Array of image URLs, Drive IDs, or inline data
     * @param options - Optional mimeType and schema
     * @returns Text response or parsed JSON object if schema provided
     * @example
     * const response = ai.promptWithImages("Compare these images", [url1, url2], { mimeType: "image/jpeg" });
     */
    promptWithImages(text: string, images: (string | FilePart)[], options?: FileOptions): string | object;

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
    promptWithFile(text: string, file: string | FilePart, options?: FileOptions): string | object;

    /**
     * Send a prompt with multiple files
     * @param text - The prompt text
     * @param files - Array of file URLs, Drive IDs, or file parts
     * @param options - Required mimeType for URLs, optional schema
     * @returns Text response or parsed JSON object if schema provided
     * @example
     * const response = ai.promptWithFiles("Analyze these docs", [pdf1, pdf2], { mimeType: "application/pdf" });
     */
    promptWithFiles(text: string, files: (string | FilePart)[], options?: FileOptions): string | object;

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
    startChat(): ChatSession;

    // ========================================
    // File Management
    // ========================================

    /**
     * Upload a file to Gemini API for reuse
     * @param file - URL, Drive ID, Drive URL, Blob, or base64 string
     * @param options - Optional mimeType (required for URLs)
     * @returns Uploaded file metadata
     * @example
     * const uploaded = ai.uploadFile(driveFileId);
     * const response = ai.promptWithFile("Analyze this", { uri: uploaded.uri, mimeType: uploaded.mimeType });
     */
    uploadFile(file: string | GoogleAppsScript.Base.Blob, options?: { mimeType?: string }): UploadedFile;

    /**
     * Get metadata for an uploaded file
     * @param fileName - File name (e.g., "files/abc123")
     * @returns File metadata
     */
    getFile(fileName: string): UploadedFile;

    /**
     * List all uploaded files
     * @param pageSize - Number of files per page (default: 10)
     * @param pageToken - Token for pagination
     * @returns List of files and optional next page token
     */
    listFiles(pageSize?: number, pageToken?: string): FileListResponse;

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
  // Chat Session Class
  // ========================================

  /**
   * Chat session for multi-turn conversations
   */
  class ChatSession {
    /**
     * Send a text message in the chat
     * @param text - The message text
     * @param options - Optional schema for structured output
     * @returns Text response or parsed JSON object if schema provided
     * @example
     * const response = chat.sendMessage("What's 2+2?");
     * const structured = chat.sendMessage("List the steps", { schema: stepsSchema });
     */
    sendMessage(text: string, options?: PromptOptions): string | object;

    /**
     * Send a message with a single image
     * @param text - The message text
     * @param image - Image URL, Drive ID, or inline data
     * @param options - Optional mimeType and schema
     * @returns Text response or parsed JSON object if schema provided
     */
    sendMessageWithImage(text: string, image: string | FilePart, options?: FileOptions): string | object;

    /**
     * Send a message with multiple images
     * @param text - The message text
     * @param images - Array of image URLs, Drive IDs, or inline data
     * @param options - Optional mimeType and schema
     * @returns Text response or parsed JSON object if schema provided
     */
    sendMessageWithImages(text: string, images: (string | FilePart)[], options?: FileOptions): string | object;

    /**
     * Send a message with a single file
     * @param text - The message text
     * @param file - File URL, Drive ID, or file part
     * @param options - Required mimeType for URLs, optional schema
     * @returns Text response or parsed JSON object if schema provided
     */
    sendMessageWithFile(text: string, file: string | FilePart, options?: FileOptions): string | object;

    /**
     * Send a message with multiple files
     * @param text - The message text
     * @param files - Array of file URLs, Drive IDs, or file parts
     * @param options - Required mimeType for URLs, optional schema
     * @returns Text response or parsed JSON object if schema provided
     */
    sendMessageWithFiles(text: string, files: (string | FilePart)[], options?: FileOptions): string | object;

    /**
     * Get the conversation history
     * @returns Array of message objects
     */
    getHistory(): Array<{
      role: 'user' | 'model';
      parts: Array<{ text?: string; inlineData?: any; fileData?: any }>;
    }>;

    /**
     * Clear the conversation history
     */
    clearHistory(): void;
  }

  // ========================================
  // Job Queue System
  // ========================================

  namespace JobQueue {
    /**
     * Set maximum number of concurrent jobs (default: 1)
     * @param max - Maximum concurrent jobs
     */
    function setMaxConcurrentJobs(max: number): void;

    /**
     * Get maximum concurrent jobs setting
     */
    function getMaxConcurrentJobs(): number;

    /**
     * Add a single job to the queue
     * @param jobData - Job data to process
     * @returns Job ID
     */
    function addJob(jobData: any): string;

    /**
     * Add multiple jobs to the queue
     * @param jobsData - Array of job data
     * @returns Array of job IDs
     */
    function addJobs(jobsData: any[]): string[];

    /**
     * Process jobs in the queue
     * Note: User must implement processJobs() function that calls StvpsAi.JobQueue.processJobsInternal()
     */
    function processJobsInternal(): void;

    /**
     * Stop processing jobs (removes trigger)
     */
    function stopProcessingJobs(): void;

    /**
     * Get statistics about the job queue
     */
    function getQueueStats(): QueueStats;

    /**
     * Get list of failed jobs
     */
    function getFailedJobs(): FailedJob[];

    /**
     * Clear all failed jobs
     */
    function clearFailedJobs(): void;

    /**
     * Get a specific job by ID
     */
    function getJob(jobId: string): Job | null;

    /**
     * Get all jobs with a specific status
     */
    function getJobsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): Job[];

    /**
     * Clear completed jobs from the queue
     */
    function clearCompletedJobs(): void;

    /**
     * Clear all jobs from the queue
     */
    function clearAllJobs(): void;
  }

  // ========================================
  // Utility Functions
  // ========================================

  /**
   * List all uploaded files (standalone helper)
   */
  function listUploadedFiles(): void;

  /**
   * Delete all uploaded files (standalone helper)
   */
  function cleanupAllFiles(): void;
}

// ========================================
// Global Namespace Export
// ========================================

/**
 * Create a new StvpsAi instance
 * @param apiKey - Your Gemini API key
 * @param model - Optional model name (default: "gemini-2.0-flash-exp")
 */
declare function newStvpsAiInstance(apiKey: string, model?: string): StvpsAi.AI;

/**
 * Example Schema Definitions
 */
declare namespace StvpsAiSchemas {
  /** Simple color list schema */
  const ColorListSchema: StvpsAi.Schema;
  
  /** Recipe schema with ingredients and steps */
  const RecipeSchema: StvpsAi.Schema;
  
  /** Analysis schema with summary and key points */
  const AnalysisSchema: StvpsAi.Schema;
}
