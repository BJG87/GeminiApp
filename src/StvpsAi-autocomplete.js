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
 * StvpsAi instance with all methods
 * @class
 */
class StvpsAiInstance {
  /**
   * Send a simple text prompt
   * @param {string} text - The prompt text
   * @param {PromptOptions} [options] - Optional parameters (schema, temperature, etc.)
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  prompt(text, options) {}

  /**
   * Send a prompt with an image
   * @param {string} text - The prompt text
   * @param {Blob|string} imageInput - Image as Blob or URL string
   * @param {PromptOptions} [options] - Optional parameters
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  promptWithImage(text, imageInput, options) {}

  /**
   * Send a prompt with a file (PDF, audio, video, etc.)
   * @param {string} text - The prompt text
   * @param {FileInput|Blob|string} fileInput - File as {uri, mimeType}, Blob, or URL
   * @param {PromptOptions} [options] - Optional parameters
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  promptWithFile(text, fileInput, options) {}

  /**
   * Start a chat session with context
   * @param {Object} [options] - Optional chat configuration
   * @returns {ChatSession} Chat session instance
   */
  startChat(options) {}

  /**
   * Upload a file from URL to Gemini Files API
   * @param {string} url - URL of the file
   * @param {string} mimeType - MIME type (e.g., 'audio/mpeg')
   * @param {string} [displayName] - Optional display name
   * @returns {UploadedFile} Uploaded file info with uri property
   */
  uploadFile(url, mimeType, displayName) {}

  /**
   * Upload a Drive file to Gemini Files API
   * @param {GoogleAppsScript.Drive.File|Blob} file - Drive file or Blob
   * @param {string} [displayName] - Optional display name
   * @returns {UploadedFile} Uploaded file info with uri property
   */
  uploadDriveFile(file, displayName) {}

  /**
   * Get file manager for advanced file operations
   * @returns {FileManager} File manager instance
   */
  getFileManager() {}
}

/**
 * Chat session with context
 * @class
 */
class ChatSession {
  /**
   * Send a text message in the chat
   * @param {string} text - Message text
   * @param {PromptOptions} [options] - Optional parameters
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  sendMessage(text, options) {}

  /**
   * Send a message with an image
   * @param {string} text - Message text
   * @param {Blob|string} imageInput - Image as Blob or URL
   * @param {PromptOptions} [options] - Optional parameters
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  sendMessageWithImage(text, imageInput, options) {}

  /**
   * Send a message with a file
   * @param {string} text - Message text
   * @param {FileInput|Blob|string} fileInput - File input
   * @param {PromptOptions} [options] - Optional parameters
   * @returns {string|Object} Text response or JSON object if schema provided
   */
  sendMessageWithFile(text, fileInput, options) {}

  /**
   * Get chat history
   * @returns {Array} Array of message objects
   */
  getHistory() {}

  /**
   * Clear chat history
   */
  clearHistory() {}
}

/**
 * File manager for file operations
 * @class
 */
class FileManager {
  /**
   * Upload file from URL
   * @param {string} url - File URL
   * @param {string} mimeType - MIME type
   * @param {string} [displayName] - Display name
   * @returns {UploadedFile} Uploaded file info
   */
  uploadFromUrl(url, mimeType, displayName) {}

  /**
   * Upload Drive file
   * @param {GoogleAppsScript.Drive.File|Blob} file - Drive file or Blob
   * @param {string} [displayName] - Display name
   * @returns {UploadedFile} Uploaded file info
   */
  uploadDriveFile(file, displayName) {}

  /**
   * List uploaded files
   * @param {number} [maxResults] - Maximum number of files to return
   * @returns {Object} Object with files array
   */
  listFiles(maxResults) {}

  /**
   * Delete a file
   * @param {string} fileName - File name (e.g., 'files/abc123')
   */
  deleteFile(fileName) {}

  /**
   * Delete multiple files
   * @param {Array<string>} fileNames - Array of file names
   * @param {boolean} [showProgress] - Show progress during deletion
   * @returns {Object} Result with success and failed arrays
   */
  deleteFiles(fileNames, showProgress) {}

  /**
   * Delete all uploaded files
   * @param {number} [maxFiles] - Maximum files to delete (default: 100)
   * @returns {Object} Result with deleted count and failed array
   */
  deleteAllFiles(maxFiles) {}
}

/**
 * Main StvpsAi namespace
 * @namespace StvpsAi
 */
var StvpsAi = {
  /**
   * Create a new StvpsAi instance
   * @param {string} apiKey - Google AI API key
   * @param {string} [model='gemini-2.5-flash'] - Model to use
   * @returns {StvpsAiInstance} StvpsAi instance
   * 
   * @example
   * const ai = StvpsAi.newInstance('YOUR_API_KEY');
   * const response = ai.prompt('Hello!');
   * 
   * @example
   * const ai = StvpsAi.newInstance('YOUR_API_KEY', 'gemini-1.5-pro');
   */
  newInstance: function(apiKey, model) {},
  
  /** Base error class */
  Error: StvpsAiError,
  
  /** API error class */
  ApiError: StvpsAiApiError,
  
  /** Validation error class */
  ValidationError: StvpsAiValidationError
};
