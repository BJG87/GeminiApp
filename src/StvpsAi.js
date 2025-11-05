
/**
 * StvpsAi - A simplified Gemini API library for Google Apps Script
 * 
 * Features:
 * - Simple text and structured JSON prompts
 * - Image and file support (PDF, audio, video)
 * - Chat mode with context
 * - File upload API to avoid large inline transfers
 * - Automatic retry with exponential backoff
 * - Clear error messages
 */

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base error class for StvpsAi
 */
class StvpsAiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StvpsAiError';
  }
}

/**
 * Error for API request failures
 */
class StvpsAiApiError extends StvpsAiError {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'StvpsAiApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Error for invalid input parameters
 */
class StvpsAiValidationError extends StvpsAiError {
  constructor(message) {
    super(message);
    this.name = 'StvpsAiValidationError';
  }
}

// ============================================================================
// FILE MANAGER - Handles uploading files to Gemini Files API
// ============================================================================

/**
 * Manages file uploads to the Gemini Files API
 * Files uploaded here can be referenced by URI instead of sending inline data
 */
class _StvpsAiFileManager {
  /**
   * @param {string} apiKey - Google AI API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.uploadBaseUrl = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
    this.filesBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/files';
  }

  /**
   * Upload a file from a URL to the Gemini Files API
   * This allows you to reference large files by URI instead of sending inline
   * 
   * IMPORTANT: Apps Script has UrlFetchApp limitations (~20 second timeout, 50MB size limit).
   * For large files (>10MB), use uploadDriveFile() instead which is faster and more reliable.
   * 
   * @param {string} url - URL of the file to upload
   * @param {string} mimeType - MIME type (e.g., 'audio/mpeg', 'video/mp4', 'application/pdf')
   * @param {string} [displayName] - Optional display name for the file
   * @returns {Object} File object with properties: name, uri, mimeType, sizeBytes, createTime, etc.
   * @throws {StvpsAiApiError} If upload fails
   * 
   * @example
   * // For small files (images, short audio)
   * const fileManager = new StvpsAiFileManager('YOUR_API_KEY');
   * const file = fileManager.uploadFromUrl(
   *   'https://example.com/image.jpg',
   *   'image/jpeg'
   * );
   * 
   * @example
   * // For large files, use Drive instead (RECOMMENDED)
   * const driveFile = DriveApp.getFileById('YOUR_FILE_ID');
   * const file = fileManager.uploadDriveFile(driveFile);
   */
  uploadFromUrl(url, mimeType, displayName) {
    try {
      // Fetch the file from URL
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: false });
      const fileData = response.getContent();

      return this._uploadBytesSimple(fileData, mimeType, displayName || this._getFileNameFromUrl(url));
    } catch (error) {
      throw new StvpsAiApiError(
        `Failed to fetch file from URL: ${error.message}`,
        0,
        null
      );
    }
  }

  /**
   * Upload a Drive file to the Gemini Files API
   * 
   * @param {GoogleAppsScript.Drive.File|Blob} file - Drive file or Blob
   * @param {string} [displayName] - Optional display name
   * @returns {Object} File object with uri property
   * @throws {StvpsAiApiError} If upload fails
   * 
   * @example
   * const file = DriveApp.getFileById('FILE_ID');
   * const uploadedFile = fileManager.uploadDriveFile(file);
   */
  uploadDriveFile(file, displayName) {
    const blob = file.getBlob ? file.getBlob() : file;
    const bytes = blob.getBytes();
    const mimeType = blob.getContentType();
    const name = displayName || blob.getName();

    return this._uploadBytesSimple(bytes, mimeType, name);
  }

  /**
   * Internal method to upload file bytes using resumable upload
   * @private
   */
  _uploadBytesSimple(bytes, mimeType, displayName) {
    // Use resumable upload - this is the standard way for the Gemini Files API
    const boundary = '----StvpsAiBoundary' + Utilities.getUuid();
    
    // Step 1: Create resumable session with metadata
    const metadata = {
      file: {
        displayName: displayName
      }
    };
    
    // Build initial request with metadata
    const initialUrl = this.uploadBaseUrl + '?key=' + this.apiKey;
    const initialOptions = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(metadata),
      muteHttpExceptions: true,
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'X-Goog-Upload-Header-Content-Length': bytes.length
      }
    };
    
    const initialResponse = this._makeRequestWithRetry(initialUrl, initialOptions);
    
    if (initialResponse.getResponseCode() !== 200) {
      const responseText = initialResponse.getContentText();
      let errorMsg = 'Unknown error';
      try {
        const data = JSON.parse(responseText);
        errorMsg = data.error?.message || errorMsg;
      } catch (e) {
        errorMsg = responseText.substring(0, 200);
      }
      throw new StvpsAiApiError(
        `Failed to start resumable upload: ${errorMsg}`,
        initialResponse.getResponseCode(),
        responseText
      );
    }
    
    // Get upload URL from response header
    const headers = initialResponse.getHeaders();
    const uploadUrl = headers['X-Goog-Upload-URL'] || headers['x-goog-upload-url'];
    
    if (!uploadUrl) {
      throw new StvpsAiApiError(
        'No upload URL returned in response',
        500,
        initialResponse.getContentText()
      );
    }
    
    // Step 2: Upload file content
    const uploadOptions = {
      method: 'post',
      contentType: mimeType,
      payload: bytes,
      muteHttpExceptions: true,
      headers: {
        'X-Goog-Upload-Command': 'upload, finalize',
        'X-Goog-Upload-Offset': '0'
      }
    };
    
    const uploadResponse = UrlFetchApp.fetch(uploadUrl, uploadOptions);
    
    if (uploadResponse.getResponseCode() !== 200) {
      const responseText = uploadResponse.getContentText();
      let errorMsg = 'Unknown error';
      try {
        const data = JSON.parse(responseText);
        errorMsg = data.error?.message || errorMsg;
      } catch (e) {
        errorMsg = responseText.substring(0, 200);
      }
      throw new StvpsAiApiError(
        `File upload failed: ${errorMsg}`,
        uploadResponse.getResponseCode(),
        responseText
      );
    }
    
    const uploadedFile = JSON.parse(uploadResponse.getContentText()).file;
    return uploadedFile;
  }

  /**
   * Get file metadata
   * @param {string} fileName - Name of the file (e.g., 'files/abc123')
   * @returns {Object} File metadata
   */
  getFile(fileName) {
    const url = `${this.filesBaseUrl}/${fileName.replace('files/', '')}?key=${this.apiKey}`;
    const response = this._makeRequestWithRetry(url, { method: 'get', muteHttpExceptions: true });

    if (response.getResponseCode() !== 200) {
      const data = JSON.parse(response.getContentText());
      throw new StvpsAiApiError(
        `Failed to get file: ${data.error?.message || 'Unknown error'}`,
        response.getResponseCode(),
        data
      );
    }

    return JSON.parse(response.getContentText());
  }

  /**
   * Delete a file
   * @param {string} fileName - Name of the file (e.g., 'files/abc123')
   */
  deleteFile(fileName) {
    const url = `${this.filesBaseUrl}/${fileName.replace('files/', '')}?key=${this.apiKey}`;
    const options = {
      method: 'delete',
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options); // Don't use retry for delete - fast fail

    if (response.getResponseCode() !== 200 && response.getResponseCode() !== 204) {
      const data = JSON.parse(response.getContentText());
      throw new StvpsAiApiError(
        `Failed to delete file: ${data.error?.message || 'Unknown error'}`,
        response.getResponseCode(),
        data
      );
    }
  }

  /**
   * Delete multiple files (useful for cleanup)
   * @param {Array<string>} fileNames - Array of file names to delete
   * @param {boolean} [showProgress=false] - Show progress during deletion
   * @returns {Object} Result with success and failed arrays
   */
  deleteFiles(fileNames, showProgress = false) {
    const results = {
      success: [],
      failed: []
    };

    const total = fileNames.length;
    for (let i = 0; i < total; i++) {
      const fileName = fileNames[i];
      
      if (showProgress && (i % 10 === 0 || i === total - 1)) {
        console.log(`Deleting files: ${i + 1}/${total}`);
      }
      
      try {
        this.deleteFile(fileName);
        results.success.push(fileName);
      } catch (error) {
        results.failed.push({ fileName, error: error.message });
      }
    }

    return results;
  }

  /**
   * Delete all files (use with caution!)
   * @param {number} [maxFiles=100] - Maximum number of files to delete
   * @returns {Object} Result with deleted count and any errors
   */
  deleteAllFiles(maxFiles = 100) {
    const filesList = this.listFiles(maxFiles);
    const fileNames = (filesList.files || []).map(f => f.name);
    
    if (fileNames.length === 0) {
      return { deleted: 0, failed: [] };
    }

    console.log(`Found ${fileNames.length} files to delete...`);
    const results = this.deleteFiles(fileNames, true); // Show progress
    return {
      deleted: results.success.length,
      failed: results.failed
    };
  }

  /**
   * List all uploaded files
   * @param {number} [pageSize=10] - Number of files to return
   * @returns {Object} Object with files array and nextPageToken
   */
  listFiles(pageSize = 10) {
    const url = `${this.filesBaseUrl}?key=${this.apiKey}&pageSize=${pageSize}`;
    const response = this._makeRequestWithRetry(url, { method: 'get', muteHttpExceptions: true });

    if (response.getResponseCode() !== 200) {
      const data = JSON.parse(response.getContentText());
      throw new StvpsAiApiError(
        `Failed to list files: ${data.error?.message || 'Unknown error'}`,
        response.getResponseCode(),
        data
      );
    }

    return JSON.parse(response.getContentText());
  }

  /**
   * Extract filename from URL
   * @private
   */
  _getFileNameFromUrl(url) {
    try {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      return fileName || 'uploaded_file';
    } catch (e) {
      return 'uploaded_file';
    }
  }

  /**
   * Make HTTP request with exponential backoff retry
   * @private
   */
  _makeRequestWithRetry(url, options, maxRetries = 5) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();

        // Success
        if (statusCode >= 200 && statusCode < 300) {
          return response;
        }

        // Retryable errors: 429 (rate limit), 500-599 (server errors)
        if (statusCode === 429 || statusCode >= 500) {
          lastError = new Error(`HTTP ${statusCode}: ${response.getContentText()}`);

          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = Math.pow(2, attempt) * 1000;
          Utilities.sleep(delay);
          continue;
        }

        // Non-retryable error
        return response;

      } catch (error) {
        lastError = error;
        // Network errors are retryable
        const delay = Math.pow(2, attempt) * 1000;
        Utilities.sleep(delay);
      }
    }

    throw new StvpsAiApiError(
      `Request failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`,
      0,
      null
    );
  }
}

// ============================================================================
// CHAT SESSION
// ============================================================================

/**
 * Represents a chat session with context
 */
class _StvpsAiChat {
  /**
   * @param {_StvpsAi} ai - Parent AI instance
   * @param {Object} [options] - Chat options
   * @param {Array} [options.history] - Initial chat history
   * @param {string} [options.systemInstruction] - System instruction for the chat
   */
  constructor(ai, options = {}) {
    this.ai = ai;
    this.history = options.history || [];
    this.systemInstruction = options.systemInstruction;
  }

  /**
   * Send a text message in the chat
   * 
   * @param {string} text - The message text
   * @param {Object} [options] - Options
   * @param {Object} [options.schema] - JSON schema for structured response
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const chat = ai.startChat();
   * const response = chat.sendMessage('Hello!');
   * console.log(response);
   */
  sendMessage(text, options = {}) {
    return this._sendMessage([{ text: text }], options);
  }

  /**
   * Send a message with an image
   * 
   * @param {string} text - The message text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object} image - Image file, URL, or file URI object
   * @param {Object} [options] - Options
   * @param {Object} [options.schema] - JSON schema for structured response
   * @param {string} [options.mimeType] - MIME type (required for URLs)
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const chat = ai.startChat();
   * const response = chat.sendMessageWithImage('What is this?', imageUrl, { mimeType: 'image/jpeg' });
   */
  sendMessageWithImage(text, image, options = {}) {
    const imagePart = this.ai._prepareFilePart(image, 'image', options.mimeType);
    return this._sendMessage([{ text: text }, imagePart], options);
  }

  /**
   * Send a message with a file (PDF, audio, video, etc.)
   * 
   * @param {string} text - The message text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object} file - File, URL, or file URI object
   * @param {Object} [options] - Options
   * @param {Object} [options.schema] - JSON schema for structured response
   * @param {string} [options.mimeType] - MIME type (required for URLs)
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const chat = ai.startChat();
   * const response = chat.sendMessageWithFile('Transcribe this', audioFile);
   */
  sendMessageWithFile(text, file, options = {}) {
    const filePart = this.ai._prepareFilePart(file, 'file', options.mimeType);
    return this._sendMessage([{ text: text }, filePart], options);
  }

  /**
   * Get chat history
   * @returns {Array} Array of content objects
   */
  getHistory() {
    return this.history;
  }

  /**
   * Internal method to send message with parts
   * @private
   */
  _sendMessage(parts, options = {}) {
    // Add user message to history
    this.history.push({
      role: 'user',
      parts: parts
    });

    // Prepare request
    const request = {
      contents: this.history,
      generationConfig: {}
    };

    if (this.systemInstruction) {
      request.systemInstruction = {
        parts: [{ text: this.systemInstruction }]
      };
    }

    if (options.schema) {
      request.generationConfig.responseSchema = options.schema;
      request.generationConfig.responseMimeType = 'application/json';
    }

    // Make request
    const response = this.ai._makeRequest('generateContent', request);

    // Add model response to history
    if (response.candidates && response.candidates[0]?.content) {
      this.history.push(response.candidates[0].content);
    }

    // Return formatted response
    return this.ai._formatResponse(response, options.schema);
  }
}

// ============================================================================
// MAIN AI CLASS
// ============================================================================

/**
 * Main StvpsAi class for interacting with Google's Gemini API
 */
class _StvpsAi {
  /**
   * @param {string} apiKey - Google AI API key
   * @param {string} [model='gemini-2.5-flash'] - Model to use
   */
  constructor(apiKey, model = 'gemini-2.5-flash') {
    if (!apiKey) {
      throw new StvpsAiValidationError('API key is required');
    }

    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.fileManager = new _StvpsAiFileManager(apiKey);
  }

  /**
   * Send a simple text prompt
   * 
   * @param {string} text - The prompt text
   * @param {Object} [options] - Options
   * @param {Object} [options.schema] - JSON schema for structured response
   * @param {string} [options.model] - Override default model
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const ai = StvpsAi.newInstance('YOUR_API_KEY');
   * const response = ai.prompt('Explain quantum computing');
   * console.log(response);
   * 
   * @example
   * // With structured JSON
   * const response = ai.prompt('List 3 colors', {
   *   schema: {
   *     type: 'object',
   *     properties: {
   *       colors: { type: 'array', items: { type: 'string' } }
   *     },
   *     required: ['colors']
   *   }
   * });
   * console.log(response.colors);
   */
  prompt(text, options = {}) {
    const request = {
      contents: [{
        parts: [{ text: text }]
      }],
      generationConfig: {}
    };

    if (options.schema) {
      request.generationConfig.responseSchema = options.schema;
      request.generationConfig.responseMimeType = 'application/json';
    }

    const response = this._makeRequest('generateContent', request, options.model);
    return this._formatResponse(response, options.schema);
  }

  /**
   * Send a prompt with an image
   * 
   * @param {string} text - The prompt text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object} image - Image as Drive file, Blob, URL string, or file URI object {uri: string, mimeType: string}
   * @param {Object} [options] - Options
   * @param {Object} [options.schema] - JSON schema for structured response
   * @param {string} [options.model] - Override default model
   * @param {string} [options.mimeType] - MIME type (required if image is a URL string)
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * // With Drive file
   * const file = DriveApp.getFileById('FILE_ID');
   * const response = ai.promptWithImage('What is in this image?', file);
   * 
   * @example
   * // With URL (will be uploaded to Files API)
   * const response = ai.promptWithImage('Describe this', 'https://example.com/image.jpg', {
   *   mimeType: 'image/jpeg'
   * });
   * 
   * @example
   * // With pre-uploaded file URI
   * const uploadedFile = ai.uploadFile('https://example.com/image.jpg', 'image/jpeg');
   * const response = ai.promptWithImage('Describe this', {
   *   uri: uploadedFile.uri,
   *   mimeType: uploadedFile.mimeType
   * });
   */
  promptWithImage(text, image, options = {}) {
    const imagePart = this._prepareFilePart(image, 'image', options.mimeType);

    const request = {
      contents: [{
        parts: [{ text: text }, imagePart]
      }],
      generationConfig: {}
    };

    if (options.schema) {
      request.generationConfig.responseSchema = options.schema;
      request.generationConfig.responseMimeType = 'application/json';
    }

    const response = this._makeRequest('generateContent', request, options.model);
    return this._formatResponse(response, options.schema);
  }

  /**
   * Send a prompt with a file (PDF, audio, video, etc.)
   * 
   * @param {string} text - The prompt text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object} file - File as Drive file, Blob, URL string, or file URI object
   * @param {Object} [options] - Options
   * @param {string} options.mimeType - MIME type (required if file is a URL string)
   * @param {Object} [options.schema] - JSON schema for structured response
   * @param {string} [options.model] - Override default model
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * // Transcribe audio
   * const response = ai.promptWithFile('Transcribe this audio', audioFile, {
   *   mimeType: 'audio/mpeg'
   * });
   * 
   * @example
   * // Analyze PDF with structured output
   * const response = ai.promptWithFile('Summarize this document', pdfFile, {
   *   mimeType: 'application/pdf',
   *   schema: {
   *     type: 'object',
   *     properties: {
   *       summary: { type: 'string' },
   *       keyPoints: { type: 'array', items: { type: 'string' } }
   *     },
   *     required: ['summary', 'keyPoints']
   *   }
   * });
   */
  promptWithFile(text, file, options = {}) {
    const filePart = this._prepareFilePart(file, 'file', options.mimeType);

    const request = {
      contents: [{
        parts: [{ text: text }, filePart]
      }],
      generationConfig: {}
    };

    if (options.schema) {
      request.generationConfig.responseSchema = options.schema;
      request.generationConfig.responseMimeType = 'application/json';
    }

    const response = this._makeRequest('generateContent', request, options.model);
    return this._formatResponse(response, options.schema);
  }

  /**
   * Start a chat session
   * 
   * @param {Object} [options] - Chat options
   * @param {Array} [options.history] - Initial chat history
   * @param {string} [options.systemInstruction] - System instruction
   * @returns {_StvpsAiChat} Chat session instance
   * 
   * @example
   * const chat = ai.startChat({
   *   systemInstruction: 'You are a helpful coding assistant.'
   * });
   * 
   * const response1 = chat.sendMessage('How do I sort an array in JavaScript?');
   * const response2 = chat.sendMessage('Can you show me an example?');
   */
  startChat(options = {}) {
    return new _StvpsAiChat(this, options);
  }

  /**
   * Upload a file from URL to Files API
   * Returns a file object with URI that can be reused
   * 
   * @param {string} url - URL of the file
   * @param {string} mimeType - MIME type
   * @param {string} [displayName] - Optional display name
   * @returns {Object} File object with uri, name, mimeType, etc.
   * 
   * @example
   * const file = ai.uploadFile('https://example.com/large-video.mp4', 'video/mp4');
   * // Later use the file URI
   * const response = ai.promptWithFile('Describe this video', {
   *   uri: file.uri,
   *   mimeType: file.mimeType
   * });
   */
  uploadFile(url, mimeType, displayName) {
    return this.fileManager.uploadFromUrl(url, mimeType, displayName);
  }

  /**
   * Upload a Drive file to Files API
   * 
   * @param {GoogleAppsScript.Drive.File|Blob} file - Drive file or Blob
   * @param {string} [displayName] - Optional display name
   * @returns {Object} File object with uri
   * 
   * @example
   * const driveFile = DriveApp.getFileById('FILE_ID');
   * const uploadedFile = ai.uploadDriveFile(driveFile);
   * const response = ai.promptWithFile('Analyze this', {
   *   uri: uploadedFile.uri,
   *   mimeType: uploadedFile.mimeType
   * });
   */
  uploadDriveFile(file, displayName) {
    return this.fileManager.uploadDriveFile(file, displayName);
  }

  /**
   * Get access to the file manager for advanced operations
   * @returns {_StvpsAiFileManager} File manager instance
   */
  getFileManager() {
    return this.fileManager;
  }

  // ==========================================================================
  // INTERNAL METHODS
  // ==========================================================================

  /**
   * Prepare a file part for the API request
   * Handles Drive files, Blobs, URLs, and file URI objects
   * @private
   */
  _prepareFilePart(file, type = 'file', mimeType) {
    // Already a file URI object
    if (file && typeof file === 'object' && file.uri && file.mimeType) {
      return {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri
        }
      };
    }

    // URL string - upload to Files API first
    if (typeof file === 'string') {
      if (!mimeType) {
        throw new StvpsAiValidationError(
          'mimeType is required when providing a URL string. ' +
          'Example: ai.promptWithFile(text, url, { mimeType: "audio/mpeg" })'
        );
      }

      // Upload to Files API and get URI
      const uploadedFile = this.fileManager.uploadFromUrl(file, mimeType);
      return {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri
        }
      };
    }

    // Drive file or Blob - convert to inline data
    const blob = file.getBlob ? file.getBlob() : file;
    const bytes = blob.getBytes();
    const base64Data = Utilities.base64Encode(bytes);
    const detectedMimeType = blob.getContentType();

    return {
      inlineData: {
        mimeType: detectedMimeType,
        data: base64Data
      }
    };
  }

  /**
   * Make API request with retry logic
   * @private
   */
  _makeRequest(task, body, model) {
    const modelName = model || this.model;
    const url = `${this.baseUrl}/models/${modelName}:${task}?key=${this.apiKey}`;

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    };

    const maxRetries = 5;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();
        const responseText = response.getContentText();

        // Success
        if (statusCode === 200) {
          return JSON.parse(responseText);
        }

        // Parse error response
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: { message: responseText } };
        }

        // Retryable errors
        if (statusCode === 429 || statusCode >= 500) {
          const errorMessage = errorData.error?.message || 'Unknown error';
          lastError = new StvpsAiApiError(
            `API request failed (${statusCode}): ${errorMessage}`,
            statusCode,
            errorData
          );

          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
          Utilities.sleep(delay);
          continue;
        }

        // Non-retryable error
        const errorMessage = errorData.error?.message || 'Unknown error';
        throw new StvpsAiApiError(
          `API request failed (${statusCode}): ${errorMessage}. ` +
          `Please check your request parameters and API key.`,
          statusCode,
          errorData
        );

      } catch (error) {
        if (error instanceof StvpsAiApiError) {
          throw error;
        }

        // Network error - retry
        lastError = error;
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Network error, retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        Utilities.sleep(delay);
      }
    }

    throw new StvpsAiApiError(
      `Request failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}. ` +
      `This could be due to rate limits or service outages. Please try again later.`,
      0,
      null
    );
  }

  /**
   * Format API response
   * @private
   */
  _formatResponse(response, schema) {
    // Check for blocking or errors
    if (response.promptFeedback?.blockReason) {
      throw new StvpsAiApiError(
        `Response was blocked: ${response.promptFeedback.blockReason}. ` +
        `${response.promptFeedback.blockReasonMessage || ''}`,
        400,
        response
      );
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new StvpsAiApiError(
        'No response candidates returned. The request may have been blocked or invalid.',
        400,
        response
      );
    }

    const candidate = response.candidates[0];

    // Only check finishReason if it's a problematic one (not STOP)
    if (candidate.finishReason && 
        !['STOP', 'MAX_TOKENS', 'FINISH_REASON_UNSPECIFIED'].includes(candidate.finishReason)) {
      throw new StvpsAiApiError(
        `Response generation stopped: ${candidate.finishReason}. ` +
        `${candidate.finishMessage || ''}`,
        400,
        response
      );
    }

    // Extract text from parts
    const parts = candidate.content?.parts || [];
    let text = '';

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      }
    }

    // Parse JSON if schema was provided
    if (schema) {
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new StvpsAiApiError(
          `Failed to parse JSON response: ${e.message}. Response text: ${text.substring(0, 200)}...`,
          500,
          response
        );
      }
    }

    return text;
  }
}

// ============================================================================
// FACTORY AND EXPORTS
// ============================================================================

/**
 * Create a new StvpsAi instance
 * 
 * @param {string} apiKey - Google AI API key
 * @param {string} [model='gemini-2.5-flash'] - Model to use
 * @returns {_StvpsAi} StvpsAi instance
 * 
 * @example
 * const ai = StvpsAi.newInstance('YOUR_API_KEY');
 * 
 * @example
 * const ai = StvpsAi.newInstance('YOUR_API_KEY', 'gemini-1.5-pro');
 */
function newInstance(apiKey, model) {
  return new _StvpsAi(apiKey, model);
}

// Export the factory function and classes
var StvpsAi = {
  newInstance: newInstance,
  Error: StvpsAiError,
  ApiError: StvpsAiApiError,
  ValidationError: StvpsAiValidationError
};
