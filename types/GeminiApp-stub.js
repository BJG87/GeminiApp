/**
 * GeminiApp Library Stub for IntelliSense
 * 
 * INSTRUCTIONS:
 * 1. Add the GeminiApp library to your Apps Script project (Script ID: YOUR_SCRIPT_ID)
 * 2. Copy this entire file into your project
 * 3. Rename it to something like "GeminiApp-autocomplete"
 * 4. DO NOT call any functions from this file - it's only for autocomplete
 * 5. Use the actual library: const ai = GeminiApp.newInstance(apiKey)
 * 
 * This file provides IntelliSense/autocomplete when using the GeminiApp library.
 */

/**
 * @typedef {Object} PromptOptions
 * @property {Object} [schema] - JSON schema for structured output
 * @property {string} [model] - Override default model
 */

/**
 * @typedef {Object} FileOptions
 * @property {string|Array<string>} [mimeType] - MIME type(s) for file(s)
 * @property {Object} [schema] - JSON schema for structured output
 * @property {string} [model] - Override default model
 */

/**
 * @typedef {Object} UploadedFile
 * @property {string} uri - File URI for use in prompts
 * @property {string} name - File name/ID
 * @property {string} mimeType - File MIME type
 */

/**
 * @typedef {Object} DeleteResult
 * @property {Array<string>} deleted - Successfully deleted file names
 * @property {Array<{name: string, error: string}>} failed - Failed deletions
 */

/**
 * @typedef {Object} FileInfo
 * @property {string} name - File name/ID
 * @property {string} uri - File URI
 * @property {string} mimeType - File MIME type
 * @property {number} sizeBytes - File size in bytes
 * @property {string} createTime - Creation timestamp
 */

/**
 * @typedef {_GeminiAppInstanceStub} GeminiAppInstance
 */

/**
 * @typedef {_ChatSessionStub} ChatSession
 */

/**
 * Instance method stubs (for autocomplete)
 * @class
 */
class _GeminiAppInstanceStub {
  /**
   * Send a text-only prompt to the AI
   * @param {string} text - The prompt text
   * @param {PromptOptions} [options] - Optional configuration
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   * @example
   * const response = ai.prompt('Hello!');
   * const json = ai.prompt('List 3 colors', { schema: { colors: ['string'] } });
   */
  prompt(text, options) { return ''; }

  /**
   * Send a prompt with one or more images
   * @param {string} text - The prompt text
   * @param {Blob|string|Array<Blob|string>} images - Image(s) as Blob, URL, Drive ID, or array
   * @param {FileOptions} [options] - Optional configuration including mimeType
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   * @example
   * const response = ai.promptWithImage('What is in this image?', imageBlob);
   * const response = ai.promptWithImage('Compare these', [url1, url2], { mimeType: ['image/jpeg', 'image/png'] });
   */
  promptWithImage(text, images, options) { return ''; }

  /**
   * Send a prompt with one or more files (PDF, audio, video, etc.)
   * @param {string} text - The prompt text
   * @param {Blob|string|Object|Array<Blob|string|Object>} files - File(s) as Blob, URL, Drive ID, {uri, mimeType}, or array
   * @param {FileOptions} [options] - Optional configuration including mimeType
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   * @example
   * const response = ai.promptWithFile('Summarize this PDF', pdfBlob, { mimeType: 'application/pdf' });
   * const response = ai.promptWithFile('Transcribe', audioUrl, { mimeType: 'audio/mpeg' });
   */
  promptWithFile(text, files, options) { return ''; }

  /**
   * Start a new chat session
   * @returns {_ChatSessionStub} Chat session instance
   * @example
   * const chat = ai.startChat();
   * const response1 = chat.sendMessage('Hello!');
   * const response2 = chat.sendMessage('Tell me more');
   */
  startChat() { return new _ChatSessionStub(); }

  /**
   * Upload a file to Gemini API for reuse
   * @param {Blob|string} file - File as Blob or Drive ID
   * @param {string} displayName - Display name for the file
   * @param {string} [mimeType] - MIME type (required for URLs, optional for Drive IDs)
   * @returns {UploadedFile} Uploaded file info
   * @example
   * const uploaded = ai.uploadFile(blob, 'mydoc.pdf', 'application/pdf');
   * const response = ai.promptWithFile('Summarize', { uri: uploaded.uri, mimeType: uploaded.mimeType });
   */
  uploadFile(file, displayName, mimeType) { return { uri: '', name: '', mimeType: '' }; }

  /**
   * Upload a file from URL to Gemini API
   * @param {string} url - URL to file
   * @param {string} displayName - Display name for the file
   * @param {string} [mimeType] - MIME type (required)
   * @returns {UploadedFile} Uploaded file info
   */
  uploadFileFromUrl(url, displayName, mimeType) { return { uri: '', name: '', mimeType: '' }; }

  /**
   * Delete an uploaded file
   * @param {string} fileName - File name/ID to delete
   * @returns {void}
   */
  deleteFile(fileName) { }

  /**
   * Delete multiple uploaded files
   * @param {Array<string>} fileNames - Array of file names/IDs
   * @param {boolean} [continueOnError=true] - Continue deleting if one fails
   * @returns {DeleteResult} Deletion results
   */
  deleteFiles(fileNames, continueOnError) { return { deleted: [], failed: [] }; }

  /**
   * Delete all uploaded files
   * @param {number} [batchSize=10] - Number of files to delete per batch
   * @returns {{deleted: number, failed: number}} Deletion statistics
   */
  deleteAllFiles(batchSize) { return { deleted: 0, failed: 0 }; }

  /**
   * List all uploaded files
   * @param {number} [pageSize=100] - Number of files per page
   * @returns {Array<FileInfo>} Array of file information
   */
  listFiles(pageSize) { return []; }
}

/**
 * Chat session method stubs (for autocomplete)
 * @class
 */
class _ChatSessionStub {
  /**
   * Send a text message in the chat
   * @param {string} text - The message text
   * @param {ChatOptions} [options] - Optional configuration
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   * @example
   * const response = chat.sendMessage('What is 5 + 5?');
   */
  sendMessage(text, options) { return ''; }

  /**
   * Send a message with one or more images
   * @param {string} text - The message text
   * @param {Blob|string|Array<Blob|string>} images - Image(s) as Blob, URL, Drive ID, or array
   * @param {ChatFileOptions} [options] - Optional configuration including mimeType
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   */
  sendMessageWithImage(text, images, options) { return ''; }

  /**
   * Send a message with one or more files
   * @param {string} text - The message text
   * @param {Blob|string|Object|Array<Blob|string|Object>} files - File(s) as Blob, URL, Drive ID, {uri, mimeType}, or array
   * @param {ChatFileOptions} [options] - Optional configuration including mimeType
   * @returns {(string|Object)} Response text or parsed JSON object (JSON if schema provided)
   */
  sendMessageWithFile(text, files, options) { return ''; }
}

/**
 * Create a new GeminiApp instance
 * 
 * @example
 * const ai = GeminiApp.newInstance('your-api-key');
 * const response = ai.prompt('Hello!');
 * 
 * @example
 * const ai = GeminiApp.newInstance('your-api-key', 'gemini-2.5-pro');
 * const json = ai.prompt('List 3 colors', { schema: { colors: ['string'] } });
 * 
 * @param {string} apiKey - Google AI API key
 * @param {string} [model='gemini-2.5-flash'] - Model to use
 * @returns {_GeminiAppInstanceStub} GeminiApp instance
 */
function newInstance(apiKey, model) {
  return new _GeminiAppInstanceStub();
}

// Export the GeminiApp namespace for autocomplete
var GeminiApp = {
  newInstance: newInstance
};
