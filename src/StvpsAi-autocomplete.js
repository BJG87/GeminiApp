/**
 * StvpsAi Autocomplete Helper
 * 
 * Include this file in your Apps Script project to get IntelliSense/autocomplete
 * for the StvpsAi library. This file contains only JSDoc type definitions and
 * doesn't execute any code.
 * 
 * USAGE:
 * 1. Copy this file to your Apps Script project
 * 2. Don't call any functions from this file
 * 3. Your editor will now provide autocomplete for StvpsAi methods
 */

/**
 * @typedef {Object} FileInput
 * @property {string} uri - File URI from uploadFile() or uploadDriveFile()
 * @property {string} mimeType - MIME type (e.g., 'audio/mpeg', 'video/mp4', 'image/jpeg')
 */

/**
 * @typedef {Object} PromptOptions
 * @property {Object} [schema] - JSON schema for structured output
 * @property {number} [temperature] - Controls randomness (0-1, default: 1)
 * @property {number} [maxOutputTokens] - Maximum response tokens
 * @property {number} [topP] - Nucleus sampling parameter (0-1)
 * @property {number} [topK] - Top-k sampling parameter
 */

/**
 * @typedef {Object} UploadedFile
 * @property {string} name - File name/ID (e.g., 'files/abc123')
 * @property {string} uri - File URI for use in prompts
 * @property {string} mimeType - File MIME type
 * @property {number} sizeBytes - File size in bytes
 * @property {string} createTime - Creation timestamp
 * @property {string} displayName - Display name
 */

/**
 * @typedef {Object} StvpsAiInstance
 * @property {function(string, PromptOptions=): (string|Object)} prompt - Send a simple text prompt
 * @property {function(string, (Blob|string|Array<Blob|string>), PromptOptions=): (string|Object)} promptWithImage - Send a prompt with image(s)
 * @property {function(string, (FileInput|Blob|string|Array<FileInput|Blob|string>), PromptOptions=): (string|Object)} promptWithFile - Send a prompt with file(s)
 * @property {function(Object=): ChatSession} startChat - Start a chat session
 * @property {function(string, string=, string=): UploadedFile} uploadFile - Upload a file from URL or Drive ID
 * @property {function((GoogleAppsScript.Drive.File|Blob), string=): UploadedFile} uploadDriveFile - Upload a Drive file
 * @property {function(string): Object} deleteFile - Delete an uploaded file
 * @property {function(): FileManager} getFileManager - Get file manager instance
 */

/**
 * @typedef {Object} ChatSession
 * @property {function(string, PromptOptions=): (string|Object)} sendMessage - Send a text message
 * @property {function(string, (Blob|string), PromptOptions=): (string|Object)} sendMessageWithImage - Send message with image
 * @property {function(string, (FileInput|Blob|string), PromptOptions=): (string|Object)} sendMessageWithFile - Send message with file
 * @property {function(): Array} getHistory - Get chat history
 * @property {function(): void} clearHistory - Clear chat history
 */

/**
 * @typedef {Object} FileManager
 * @property {function(string, string, string=): UploadedFile} uploadFromUrl - Upload file from URL
 * @property {function((GoogleAppsScript.Drive.File|Blob), string=): UploadedFile} uploadDriveFile - Upload Drive file
 * @property {function(number=): Object} listFiles - List uploaded files
 * @property {function(string): void} deleteFile - Delete a file
 * @property {function(Array<string>, boolean=): Object} deleteFiles - Delete multiple files
 * @property {function(number=): Object} deleteAllFiles - Delete all uploaded files
 */

/**
 * @typedef {Object} JobQueueConfig
 * @property {string} id - Unique job ID
 * @property {string} type - Job type identifier
 * @property {string} handler - Function name to call for processing
 * @property {Object} data - Job data to pass to handler
 */

/**
 * @typedef {Object} JobQueue
 * @property {function(): void} processJobs - Process pending jobs (called by trigger)
 * @property {function(JobQueueConfig): void} addJob - Add a single job to queue
 * @property {function(Array<JobQueueConfig>): void} addJobs - Add multiple jobs to queue
 * @property {function(number): void} setMaxConcurrentJobs - Set max concurrent jobs (1-10)
 * @property {function(): number} getMaxConcurrentJobs - Get max concurrent jobs
 * @property {function(): void} startProcessingJobs - Start job processing trigger
 * @property {function(): void} stopProcessingJobs - Stop job processing trigger
 * @property {function(): Object} getQueueStats - Get queue statistics
 * @property {function(): Array} listFailedJobs - List all failed jobs
 * @property {function(): void} clearFailedJobs - Clear failed jobs list
 * @property {function(string): boolean} removeFailedJob - Remove specific failed job
 */

/**
 * Main StvpsAi namespace - DO NOT CALL ANYTHING FROM THIS FILE
 * This file only provides IntelliSense/autocomplete support
 * @namespace StvpsAiAutocomplete
 */
