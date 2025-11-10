
/**
 * GeminiApp - A simplified Gemini API library for Google Apps Script
 * 
 * Features:
 * - Simple text and structured JSON prompts
 * - Image and file support (PDF, audio, video) - SINGLE OR MULTIPLE (arrays supported!)
 * - Google Workspace file support (Docs, Sheets, Slides) - automatically converted to PDF
 * - Supports BOTH public URLs and private Google Workspace files (user must have access)
 * - Chat mode with context
 * - File upload API to avoid large inline transfers
 * - Automatic retry with exponential backoff
 * - Clear error messages

 * 
 * @example Basic usage
 * const ai = GeminiApp.newInstance(apiKey);
 * const response = ai.prompt('Hello, how are you?');
 * 
 * @example Structured output
 * const ai = GeminiApp.newInstance(apiKey);
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'number' }
 *   }
 * };
 * const data = ai.prompt('Extract person info', { schema });
 * 
 * @example With single image
 * const ai = GeminiApp.newInstance(apiKey);
 * const response = ai.promptWithImage('What is in this image?', imageBlob);
 * 
 * @example With multiple images
 * const ai = GeminiApp.newInstance(apiKey);
 * const response = ai.promptWithImage('Compare these images', [image1, image2, image3]);
 * 
 * @example With private Google Doc (user must have access)
 * const ai = GeminiApp.newInstance(apiKey);
 * const response = ai.promptWithFile(
 *   'Summarize this document',
 *   'https://docs.google.com/document/d/YOUR_DOC_ID/edit',
 *   { mimeType: 'application/pdf' }
 * );
 * 
 * @example Chat mode
 * const ai = GeminiApp.newInstance(apiKey);
 * const chat = ai.startChat();
 * chat.sendMessage('Hello');
 * chat.sendMessage('Tell me more');
 * 

 * RETURN TYPES:
 * -------------
 * All methods return:
 * - string: when NO schema is provided (plain text response)
 * - Object: when schema is provided (parsed JSON object)
 * 
 * This applies to ALL prompt and chat methods:
 * - prompt() / sendMessage()
 * - promptWithImage() / sendMessageWithImage()
 * - promptWithFile() / sendMessageWithFile()
 * 
 * IMPORTANT: Schema Parameter Placement
 * --------------------------------------
 * For methods with multiple parameters, the schema ALWAYS goes in the OPTIONS parameter (last):
 * 
 * CORRECT:
 *   ai.promptWithFile(text, file, { schema })  ✓
 *   chat.sendMessageWithFile(text, file, { schema })  ✓
 * 
 * INCORRECT:
 *   ai.promptWithFile(text, { file, schema })  ✗
 *   chat.sendMessageWithFile(text, { file, schema })  ✗
 * 
 * @typedef {Object} FileInput
 * @property {string} uri - File URI from uploadFile() or uploadDriveFile()
 * @property {string} mimeType - MIME type (e.g., 'audio/mpeg', 'video/mp4')
 * 
 * @typedef {Object} PromptOptions
 * @property {Object} [schema] - JSON schema for structured output
 * @property {string|Array<string>} [mimeType] - MIME type(s) for file/image URLs (single or array)
 * @property {number} [temperature] - Controls randomness (0-1)
 * @property {number} [maxOutputTokens] - Maximum response tokens
 * @property {number} [topP] - Nucleus sampling parameter
 * @property {number} [topK] - Top-k sampling parameter
 */

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base error class for GeminiApp
 */
class GeminiAppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GeminiAppError';
  }
}

/**
 * Error for API request failures
 */
class GeminiAppApiError extends GeminiAppError {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'GeminiAppApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Error for invalid input parameters
 */
class GeminiAppValidationError extends GeminiAppError {
  constructor(message) {
    super(message);
    this.name = 'GeminiAppValidationError';
  }
}

// ============================================================================
// FILE MANAGER - Handles uploading files to Gemini Files API
// ============================================================================

/**
 * Manages file uploads to the Gemini Files API
 * Files uploaded here can be referenced by URI instead of sending inline data
 */
class _GeminiAppFileManager {
  /**
   * @param {string} apiKey - Google AI API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.uploadBaseUrl = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
    this.filesBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/files';
  }

  /**
   * Upload a file from a URL or Google Workspace file ID to the Gemini Files API
   * This allows you to reference large files by URI instead of sending inline
   * 
   * IMPORTANT: Apps Script has UrlFetchApp limitations (~20 second timeout, 50MB size limit).
   * For large files (>10MB), use uploadDriveFile() instead which is faster and more reliable.
   * 
   * Supports:
   * - Public URLs (fetched via UrlFetchApp)
   * - Private Google Drive files (accessed via DriveApp using URL or file ID)
   * - Private Google Docs/Sheets/Slides (accessed via appropriate Apps Script services, exported as PDF)
   * 
   * @param {string} urlOrFileId - URL of the file to upload OR a Google Workspace file ID
   * @param {string} mimeType - MIME type (e.g., 'audio/mpeg', 'video/mp4', 'application/pdf')
   * @param {string} [displayName] - Optional display name for the file
   * @returns {Object} File object with properties: name, uri, mimeType, sizeBytes, createTime, etc.
   * @throws {GeminiAppApiError} If upload fails
   * 
   * @example
   * // For small files (images, short audio)
   * const fileManager = new GeminiAppFileManager('YOUR_API_KEY');
   * const file = fileManager.uploadFromUrl(
   *   'https://example.com/image.jpg',
   *   'image/jpeg'
   * );
   * 
   * @example
   * // For large files, use Drive instead (RECOMMENDED)
   * const driveFile = DriveApp.getFileById('YOUR_FILE_ID');
   * const file = fileManager.uploadDriveFile(driveFile);
   * 
   * @example
   * // Private Google Drive file using URL (user must have access)
   * const file = fileManager.uploadFromUrl(
   *   'https://drive.google.com/file/d/YOUR_FILE_ID/view',
   *   'audio/mpeg'
   * );
   * 
   * @example
   * // Private Google Drive file using file ID directly
   * const file = fileManager.uploadFromUrl(
   *   'YOUR_FILE_ID',
   *   'audio/mpeg'
   * );
   */
  uploadFromUrl(urlOrFileId, mimeType, displayName) {
    try {
      // Check if this is just a file ID (no URL protocol)
      let fileId = null;
      let url = urlOrFileId;

      if (!urlOrFileId.includes('://')) {
        // Looks like a bare file ID, treat as Google Drive file
        fileId = urlOrFileId;
      } else {
        // Try to extract file ID from URL
        fileId = this._extractGoogleFileId(urlOrFileId);
      }

      if (fileId) {
        // Handle Google Workspace files (both public and private)
        return this._uploadGoogleWorkspaceFile(url, fileId, mimeType, displayName);
      }

      // For non-Google URLs, fetch directly
      const response = UrlFetchApp.fetch(urlOrFileId, { muteHttpExceptions: false });
      const fileData = response.getContent();

      return this._uploadBytesSimple(fileData, mimeType, displayName || this._getFileNameFromUrl(urlOrFileId));
    } catch (error) {
      throw new GeminiAppApiError(
        `Failed to fetch file from URL: ${error.message}`,
        0,
        null
      );
    }
  }

  /**
   * Handle uploading Google Workspace files (Docs, Sheets, Slides, Drive)
   * Supports both public and private files
   * @private
   */
  _uploadGoogleWorkspaceFile(url, fileId, mimeType, displayName) {
    try {
      let blob;
      let finalMimeType = mimeType;
      let finalDisplayName = displayName;

      // If url is null/empty, we're working with just a file ID - treat as Drive file
      if (!url || !url.includes('://')) {
        const file = DriveApp.getFileById(fileId);
        blob = file.getBlob();
        const driveFileMimeType = file.getMimeType();

        // Check if it's a Google Workspace file type and export as PDF
        if (driveFileMimeType === 'application/vnd.google-apps.document') {
          const doc = DocumentApp.openById(fileId);
          blob = doc.getAs('application/pdf');
          finalMimeType = 'application/pdf';
          finalDisplayName = finalDisplayName || doc.getName() + '.pdf';
        } else if (driveFileMimeType === 'application/vnd.google-apps.spreadsheet') {
          const spreadsheet = SpreadsheetApp.openById(fileId);
          blob = DriveApp.getFileById(fileId).getAs('application/pdf');
          finalMimeType = 'application/pdf';
          finalDisplayName = finalDisplayName || spreadsheet.getName() + '.pdf';
        } else if (driveFileMimeType === 'application/vnd.google-apps.presentation') {
          const presentation = SlidesApp.openById(fileId);
          blob = DriveApp.getFileById(fileId).getAs('application/pdf');
          finalMimeType = 'application/pdf';
          finalDisplayName = finalDisplayName || presentation.getName() + '.pdf';
        } else {
          // Regular Drive file
          finalMimeType = mimeType || driveFileMimeType;
          finalDisplayName = finalDisplayName || file.getName();
        }
      }
      // Google Docs - export as PDF
      else if (url.includes('docs.google.com/document')) {
        const doc = DocumentApp.openById(fileId);
        blob = doc.getAs('application/pdf');
        finalMimeType = 'application/pdf';
        finalDisplayName = finalDisplayName || doc.getName() + '.pdf';
      }
      // Google Sheets - export as PDF
      else if (url.includes('docs.google.com/spreadsheets')) {
        const spreadsheet = SpreadsheetApp.openById(fileId);
        blob = DriveApp.getFileById(fileId).getAs('application/pdf');
        finalMimeType = 'application/pdf';
        finalDisplayName = finalDisplayName || spreadsheet.getName() + '.pdf';
      }
      // Google Slides - export as PDF
      else if (url.includes('docs.google.com/presentation')) {
        const presentation = SlidesApp.openById(fileId);
        blob = DriveApp.getFileById(fileId).getAs('application/pdf');
        finalMimeType = 'application/pdf';
        finalDisplayName = finalDisplayName || presentation.getName() + '.pdf';
      }
      // Google Drive file
      else if (url.includes('drive.google.com')) {
        const file = DriveApp.getFileById(fileId);
        blob = file.getBlob();
        finalMimeType = mimeType || file.getMimeType();
        finalDisplayName = finalDisplayName || file.getName();
      }
      else {
        // Not a recognized Google Workspace URL, try fetching directly
        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: false });
        blob = response.getBlob();
        finalDisplayName = finalDisplayName || this._getFileNameFromUrl(url);
      }

      const bytes = blob.getBytes();
      return this._uploadBytesSimple(bytes, finalMimeType, finalDisplayName);

    } catch (error) {
      // If we don't have access, throw a helpful error
      if (error.message && error.message.includes('No item with the given ID')) {
        throw new GeminiAppApiError(
          `Cannot access Google Workspace file. Please ensure:\n` +
          `1. You have permission to access the file\n` +
          `2. The file ID is correct\n` +
          `3. The file hasn't been deleted\n` +
          `Original error: ${error.message}`,
          403,
          null
        );
      }
      throw error;
    }
  }

  /**
   * Extract Google file ID from various URL formats
   * @private
   */
  _extractGoogleFileId(url) {
    // Try different patterns
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,           // /d/FILE_ID
      /id=([a-zA-Z0-9_-]+)/,             // ?id=FILE_ID
      /\/file\/d\/([a-zA-Z0-9_-]+)/,     // /file/d/FILE_ID
      /\/folders\/([a-zA-Z0-9_-]+)/,     // /folders/FOLDER_ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Upload a Drive file to the Gemini Files API
   * 
   * @param {GoogleAppsScript.Drive.File|Blob} file - Drive file or Blob
   * @param {string} [displayName] - Optional display name
   * @returns {Object} File object with uri property
   * @throws {GeminiAppApiError} If upload fails
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
    const boundary = '----GeminiAppBoundary' + Utilities.getUuid();

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
      throw new GeminiAppApiError(
        `Failed to start resumable upload: ${errorMsg}`,
        initialResponse.getResponseCode(),
        responseText
      );
    }

    // Get upload URL from response header
    const headers = initialResponse.getHeaders();
    const uploadUrl = headers['X-Goog-Upload-URL'] || headers['x-goog-upload-url'];

    if (!uploadUrl) {
      throw new GeminiAppApiError(
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
      throw new GeminiAppApiError(
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
      throw new GeminiAppApiError(
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
    const cleanFileName = fileName.replace('files/', '');
    const url = `${this.filesBaseUrl}/${cleanFileName}?key=${this.apiKey}`;
    const options = {
      method: 'delete',
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();

      // Success
      if (statusCode === 200 || statusCode === 204) {
        return { success: true };
      }

      // Already deleted / not found - treat as success
      if (statusCode === 404) {
        return { success: true, alreadyDeleted: true };
      }

      // Other errors
      const responseText = response.getContentText();
      let errorMsg = 'Unknown error';
      try {
        const data = JSON.parse(responseText);
        errorMsg = data.error?.message || errorMsg;
      } catch (e) {
        errorMsg = responseText;
      }

      throw new GeminiAppApiError(
        `Failed to delete file: ${errorMsg}`,
        statusCode,
        responseText
      );
    } catch (error) {
      // If it's already our error, re-throw
      if (error instanceof GeminiAppApiError) {
        throw error;
      }
      // Network timeout or other error
      throw new GeminiAppApiError(
        `Delete request failed: ${error.message}`,
        0,
        error.toString()
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

      if (showProgress && (i % 5 === 0 || i === total - 1)) {
        console.log(`Deleting files: ${i + 1}/${total}`);
      }

      try {
        const result = this.deleteFile(fileName);
        results.success.push(fileName);

        // Delay to avoid rate limiting
        if (i < total - 1) {
          Utilities.sleep(1000); // 1 second between deletes to avoid rate limits
        }
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

    // Filter out files that are still processing
    const files = filesList.files || [];
    const activeFiles = [];
    const processingFiles = [];

    for (const file of files) {
      if (file.state === 'PROCESSING') {
        processingFiles.push(file.name);
      } else {
        activeFiles.push(file.name);
      }
    }

    if (processingFiles.length > 0) {
      console.log(`Skipping ${processingFiles.length} files that are still processing`);
    }

    if (activeFiles.length === 0) {
      return {
        deleted: 0,
        failed: processingFiles.map(name => ({ fileName: name, error: 'File is still processing' }))
      };
    }

    const results = this.deleteFiles(activeFiles, true); // Show progress

    // Add processing files to failed list
    processingFiles.forEach(name => {
      results.failed.push({ fileName: name, error: 'File is still processing' });
    });

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
      throw new GeminiAppApiError(
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

    throw new GeminiAppApiError(
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
class _GeminiAppChat {
  /**
   * @param {_GeminiApp} ai - Parent AI instance
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
   * @param {string} text The message text
   * @param {{schema: Object}} [options] Options for the request
   * @param {Object} [options.schema] JSON schema for structured response
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
   * @param {string} text The message text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object|Array} image Image file(s), URL(s), file ID(s), or file URI object(s)
   * @param {{schema: Object, mimeType: string|Array<string>}} [options] Options for the request
   * @param {Object} [options.schema] JSON schema for structured response
   * @param {string|Array<string>} [options.mimeType] MIME type (required for URLs and file IDs, or array for multiple)
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const chat = ai.startChat();
   * const response = chat.sendMessageWithImage('What is this?', imageUrl, { mimeType: 'image/jpeg' });
   * 
   * @example
   * // With file ID
   * const response = chat.sendMessageWithImage('What is this?', 'FILE_ID_HERE', { mimeType: 'image/jpeg' });
   * 
   * @example
   * // Multiple images
   * const response = chat.sendMessageWithImage('Compare these', [img1, img2], { mimeType: ['image/jpeg', 'image/png'] });
   * 
   * @example
   * // With structured output
   * const schema = { type: 'object', properties: { objects: { type: 'array', items: { type: 'string' } } } };
   * const response = chat.sendMessageWithImage('List objects in image', imageBlob, { schema });
   */
  sendMessageWithImage(text, image, options = {}) {
    const parts = [{ text: text }];

    // Handle array of images
    if (Array.isArray(image)) {
      const mimeTypes = Array.isArray(options.mimeType) ? options.mimeType : [];
      image.forEach((img, index) => {
        const mimeType = mimeTypes[index] || options.mimeType;
        const imagePart = this.ai._prepareFilePart(img, 'image', mimeType);
        parts.push(imagePart);
      });
    } else {
      // Single image
      const imagePart = this.ai._prepareFilePart(image, 'image', options.mimeType);
      parts.push(imagePart);
    }

    return this._sendMessage(parts, options);
  }

  /**
   * Send a message with a file (PDF, audio, video, etc.)
   * 
   * @param {string} text The message text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object|Array} file File(s), URL(s), file ID(s), or file URI object(s)
   * @param {{schema: Object, mimeType: string|Array<string>}} [options] Options for the request
   * @param {Object} [options.schema] JSON schema for structured response
   * @param {string|Array<string>} [options.mimeType] MIME type (required for URLs and file IDs, or array for multiple)
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const chat = ai.startChat();
   * const response = chat.sendMessageWithFile('Transcribe this', audioFile);
   * 
   * @example
   * // With file ID
   * const response = chat.sendMessageWithFile('Transcribe this', 'FILE_ID_HERE', { mimeType: 'audio/mpeg' });
   * 
   * @example
   * // Multiple files
   * const response = chat.sendMessageWithFile('Compare these', [file1, file2], { mimeType: ['audio/mpeg', 'audio/wav'] });
   * 
   * @example
   * // With structured output (schema)
   * const uploadedFile = ai.uploadFile(myBlob, 'audio/mpeg');
   * const schema = { type: 'object', properties: { transcription: { type: 'string' } } };
   * const response = chat.sendMessageWithFile(
   *   'Transcribe this audio',
   *   { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType },
   *   { schema }  // Schema goes in third parameter, not second!
   * );
   */
  sendMessageWithFile(text, file, options = {}) {
    const parts = [{ text: text }];

    // Handle array of files
    if (Array.isArray(file)) {
      const mimeTypes = Array.isArray(options.mimeType) ? options.mimeType : [];
      file.forEach((f, index) => {
        const mimeType = mimeTypes[index] || options.mimeType;
        const filePart = this.ai._prepareFilePart(f, 'file', mimeType);
        parts.push(filePart);
      });
    } else {
      // Single file
      const filePart = this.ai._prepareFilePart(file, 'file', options.mimeType);
      parts.push(filePart);
    }

    return this._sendMessage(parts, options);
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
 * Main GeminiApp class for interacting with Google's Gemini API
 * @class
 * @implements {GeminiAppInstance}
 */
class _GeminiApp {
  /**
   * @param {string} apiKey - Google AI API key
   * @param {string} [model='gemini-2.5-flash'] - Model to use
   */
  constructor(apiKey, model = 'gemini-2.5-flash') {
    if (!apiKey) {
      throw new GeminiAppValidationError('API key is required');
    }

    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.fileManager = new _GeminiAppFileManager(apiKey);
  }

  /**
   * Send a simple text prompt
   * 
   * @param {string} text The prompt text
   * @param {{schema: Object, model: string}} [options] Options for the request
   * @param {Object} [options.schema] JSON schema for structured response
   * @param {string} [options.model] Override default model
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * const ai = GeminiApp.newInstance('YOUR_API_KEY');
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
  /**
   * Send a prompt with an image
   * 
   * @param {string} text The prompt text
   * @param {Blob|string|Array<Blob|string>} image Image(s) as Blob, URL string, file ID string, or array of any
   * @param {{mimeType: string|Array<string>, schema: Object, model: string}} [options] Options for the request
   * @param {string|Array<string>} [options.mimeType] MIME type (required if image is a URL or file ID string, or array of mimeTypes if multiple images)
   * @param {Object} [options.schema] JSON schema for structured response
   * @param {string} [options.model] Override default model
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * // Analyze single image
   * const response = ai.promptWithImage('What is in this image?', imageBlob);
   * console.log(response);
   * 
   * @example
   * // With URL
   * const response = ai.promptWithImage(
   *   'Describe this image', 
   *   'https://example.com/image.jpg',
   *   { mimeType: 'image/jpeg' }
   * );
   * 
   * @example
   * // With Google Drive file ID
   * const response = ai.promptWithImage(
   *   'Describe this image', 
   *   '1abc-XyZ123_FileID',
   *   { mimeType: 'image/jpeg' }
   * );
   * 
   * @example
   * // With multiple images
   * const response = ai.promptWithImage(
   *   'Compare these images',
   *   [url1, url2],
   *   { mimeType: ['image/jpeg', 'image/png'] }
   * );
   */
  promptWithImage(text, image, options = {}) {
    const parts = [{ text: text }];

    // Handle array of images
    if (Array.isArray(image)) {
      const mimeTypes = Array.isArray(options.mimeType) ? options.mimeType : [];
      image.forEach((img, index) => {
        const mimeType = mimeTypes[index] || options.mimeType;
        const imagePart = this._prepareFilePart(img, 'image', mimeType);
        parts.push(imagePart);
      });
    } else {
      // Single image
      const imagePart = this._prepareFilePart(image, 'image', options.mimeType);
      parts.push(imagePart);
    }

    const request = {
      contents: [{
        parts: parts
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
   * Supports Google Workspace files (Docs, Sheets, Slides) - automatically converted to PDF
   * 
   * @param {string} text The prompt text
   * @param {GoogleAppsScript.Drive.File|Blob|string|Object|Array} file File(s) as Drive file, Blob, URL string, file ID string, file URI object, or array of any
   * @param {{mimeType: string|Array<string>, schema: Object, model: string}} options Options for the request
   * @param {string|Array<string>} options.mimeType MIME type (required if file is a URL or file ID string, or array of mimeTypes if multiple files)
   * @param {Object} [options.schema] JSON schema for structured response
   * @param {string} [options.model] Override default model
   * @returns {string|Object} Response text or parsed JSON if schema provided
   * 
   * @example
   * // Transcribe audio from URL
   * const response = ai.promptWithFile('Transcribe this audio', audioUrl, {
   *   mimeType: 'audio/mpeg'
   * });
   * 
   * @example
   * // Use Google Drive file ID directly
   * const response = ai.promptWithFile('Transcribe this audio', '1PqLDLIz-ZNnl5lDZSssf0BbTylzrW8GC', {
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
   * 
   * @example
   * // Google Doc (automatically converted to PDF)
   * const response = ai.promptWithFile(
   *   'Summarize this document',
   *   'https://docs.google.com/document/d/YOUR_DOC_ID/edit',
   *   { mimeType: 'application/pdf' }
   * );
   * 
   * @example
   * // Multiple files
   * const response = ai.promptWithFile(
   *   'Compare these documents',
   *   [pdfUrl1, pdfUrl2],
   *   { mimeType: ['application/pdf', 'application/pdf'] }
   * );
   */
  promptWithFile(text, file, options = {}) {
    const parts = [{ text: text }];

    // Handle array of files
    if (Array.isArray(file)) {
      const mimeTypes = Array.isArray(options.mimeType) ? options.mimeType : [];
      file.forEach((f, index) => {
        const mimeType = mimeTypes[index] || options.mimeType;
        const filePart = this._prepareFilePart(f, 'file', mimeType);
        parts.push(filePart);
      });
    } else {
      // Single file
      const filePart = this._prepareFilePart(file, 'file', options.mimeType);
      parts.push(filePart);
    }

    const request = {
      contents: [{
        parts: parts
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
   * @param {{history: Array, systemInstruction: string}} [options] Chat options
   * @param {Array} [options.history] Initial chat history
   * @param {string} [options.systemInstruction] System instruction
   * @returns {_GeminiAppChat} Chat session instance
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
    return new _GeminiAppChat(this, options);
  }

  /**
   * Upload a file from URL or Drive ID to Files API
   * Returns a file object with URI that can be reused
   * 
   * @param {string} urlOrId URL of the file or Google Drive file ID
   * @param {string} [mimeType] MIME type (required for URLs, not needed for Drive IDs)
   * @param {string} [displayName] Optional display name
   * @returns {Object} File object with uri, name, mimeType, etc.
   * 
   * @example
   * // From URL
   * const file = ai.uploadFile('https://example.com/large-video.mp4', 'video/mp4');
   * 
   * // From Drive ID (mimeType not needed)
   * const file = ai.uploadFile('1abc...xyz');
   * 
   * // Later use the file URI
   * const response = ai.promptWithFile('Describe this video', {
   *   uri: file.uri,
   *   mimeType: file.mimeType
   * });
   */
  uploadFile(urlOrId, mimeType, displayName) {
    // Check if it's a Drive file ID (not a URL)
    if (this._isDriveFileId(urlOrId)) {
      try {
        const driveFile = DriveApp.getFileById(urlOrId);
        return this.fileManager.uploadDriveFile(driveFile, displayName);
      } catch (e) {
        throw new GeminiAppValidationError(`Failed to access Drive file with ID '${urlOrId}': ${e.message}`);
      }
    }

    // It's a URL
    return this.fileManager.uploadFromUrl(urlOrId, mimeType, displayName);
  }

  /**
   * Upload a Drive file to Files API
   * 
   * @param {GoogleAppsScript.Drive.File|Blob} file Drive file or Blob
   * @param {string} [displayName] Optional display name
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
   * Delete a file from the Files API
   * 
   * @param {string} fileUri File URI or name (e.g., 'files/abc123' or full URI)
   * @returns {Object} Result with success property
   * 
   * @example
   * const file = ai.uploadFile('https://example.com/image.jpg', 'image/jpeg');
   * // ... use the file ...
   * ai.deleteFile(file.name); // or ai.deleteFile(file.uri)
   */
  deleteFile(fileUri) {
    // Extract file name from URI if needed
    const fileName = fileUri.includes('/') ? fileUri.split('/').pop() : fileUri;
    return this.fileManager.deleteFile(fileName);
  }

  /**
   * Get access to the file manager for advanced operations
   * @returns {_GeminiAppFileManager} File manager instance
   */
  getFileManager() {
    return this.fileManager;
  }

  // ==========================================================================
  // INTERNAL METHODS
  // ==========================================================================

  /**
   * Prepare a file part for the API request
   * Handles Drive files, Blobs, URLs, file IDs, and file URI objects
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

    // String input - could be URL or file ID
    if (typeof file === 'string') {
      // Check if it's a plain file ID (no slashes, just alphanumeric and dashes)
      const isPlainFileId = /^[a-zA-Z0-9_-]+$/.test(file) && !file.includes('/') && !file.includes('.');

      // Check if it's a Google Workspace URL (docs, sheets, slides, drive)
      const isWorkspaceUrl = file.includes('docs.google.com/') ||
        file.includes('sheets.google.com/') ||
        file.includes('slides.google.com/') ||
        file.includes('drive.google.com/');

      if (isPlainFileId || isWorkspaceUrl) {
        // It's a Google Workspace file ID or URL - use DriveApp directly
        // No mimeType needed - detected automatically during upload
        try {
          let driveFile;
          if (isPlainFileId) {
            driveFile = DriveApp.getFileById(file);
          } else {
            // Extract file ID from Google Workspace URL
            const fileIdMatch = file.match(/[-\w]{25,}/);
            if (!fileIdMatch) {
              throw new Error('Could not extract file ID from Google Workspace URL');
            }
            driveFile = DriveApp.getFileById(fileIdMatch[0]);
          }

          const uploadedFile = this.fileManager.uploadDriveFile(driveFile);
          return {
            fileData: {
              mimeType: uploadedFile.mimeType,
              fileUri: uploadedFile.uri
            }
          };
        } catch (error) {
          throw new GeminiAppApiError(
            `Cannot access Google Drive file '${file}'. Please ensure:\n` +
            `1. You have permission to access the file\n` +
            `2. The file ID/URL is correct\n` +
            `3. The file hasn't been deleted\n` +
            `Original error: ${error.message}`,
            403,
            null
          );
        }
      }

      // It's a regular URL (not Google Workspace) - mimeType is required
      if (!mimeType) {
        throw new GeminiAppValidationError(
          'mimeType is required when providing a URL or file ID string. ' +
          'Example: ai.promptWithFile(text, url, { mimeType: "audio/mpeg" })'
        );
      }

      // Upload URL to Files API (handles both public URLs and private Google Workspace files)
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
          lastError = new GeminiAppApiError(
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
        throw new GeminiAppApiError(
          `API request failed (${statusCode}): ${errorMessage}. ` +
          `Please check your request parameters and API key.`,
          statusCode,
          errorData
        );

      } catch (error) {
        if (error instanceof GeminiAppApiError) {
          throw error;
        }

        // Network error - retry
        lastError = error;
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Network error, retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        Utilities.sleep(delay);
      }
    }

    throw new GeminiAppApiError(
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
      throw new GeminiAppApiError(
        `Response was blocked: ${response.promptFeedback.blockReason}. ` +
        `${response.promptFeedback.blockReasonMessage || ''}`,
        400,
        response
      );
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new GeminiAppApiError(
        'No response candidates returned. The request may have been blocked or invalid.',
        400,
        response
      );
    }

    const candidate = response.candidates[0];

    // Only check finishReason if it's a problematic one (not STOP)
    if (candidate.finishReason &&
      !['STOP', 'MAX_TOKENS', 'FINISH_REASON_UNSPECIFIED'].includes(candidate.finishReason)) {
      throw new GeminiAppApiError(
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
        throw new GeminiAppApiError(
          `Failed to parse JSON response: ${e.message}. Response text: ${text.substring(0, 200)}...`,
          500,
          response
        );
      }
    }

    return text;
  }

  /**
   * Check if a string is a Google Drive file ID (not a URL)
   * @private
   * @param {string} str - String to check
   * @returns {boolean} True if it's a Drive file ID
   */
  _isDriveFileId(str) {
    // Drive IDs are typically 25-50 alphanumeric characters with hyphens/underscores
    // and don't contain slashes, colons, or dots (which URLs have)
    return /^[A-Za-z0-9_-]{20,}$/.test(str) &&
      !str.includes('/') &&
      !str.includes(':') &&
      !str.includes('.');
  }

  /**
   * Check if a URL is a Google Workspace URL
   * @private
   * @param {string} url - URL to check
   * @returns {boolean} True if it's a Google Workspace URL
   */
  _isGoogleWorkspaceUrl(url) {
    return url.includes('docs.google.com/') ||
      url.includes('drive.google.com/') ||
      url.includes('sheets.google.com/') ||
      url.includes('slides.google.com/') ||
      url.includes('forms.google.com/');
  }
}

// ============================================================================
// FACTORY AND EXPORTS
// ============================================================================

/**
 * Create a new GeminiApp instance
 * 
 * @param {string} apiKey - Google AI API key
 * @param {string} [model='gemini-2.5-flash'] - Model to use
 * @returns {{
 *   prompt: function(string, {schema: Object=, model: string=}=): (string|Object),
 *   promptWithImage: function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object),
 *   promptWithFile: function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object),
 *   startChat: function(): {
 *     sendMessage: function(string, {schema: Object=}=): (string|Object),
 *     sendMessageWithImage: function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object),
 *     sendMessageWithFile: function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object),
 *     history: Array<Object>
 *   },
 *   uploadFile: function(Blob, string, string=): Object,
 *   uploadFileFromUrl: function(string, string, string=): Object,
 *   deleteFile: function(string): Object,
 *   deleteFiles: function(Array<string>, boolean=): Object,
 *   deleteAllFiles: function(number=): Object,
 *   listFiles: function(number=): Object,
 *   fileManager: Object
 * }} GeminiApp instance with prompt methods
 * 
 * @example
 * const ai = GeminiApp.newInstance('YOUR_API_KEY');
 * 
 * @example
 * const ai = GeminiApp.newInstance('YOUR_API_KEY', 'gemini-1.5-pro');
 */
function newInstance(apiKey, model) {
  return new _GeminiApp(apiKey, model);
}

/**
 * @typedef {Object} ChatSession
 * @property {function(string, {schema: Object=}=): (string|Object)} sendMessage - Send a text message in chat. Returns text or JSON if schema provided.
 * @property {function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object)} sendMessageWithImage - Send message with image(s). Returns text or JSON if schema provided.
 * @property {function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object)} sendMessageWithFile - Send message with file(s). Returns text or JSON if schema provided.
 * @property {Array<Object>} history - Chat history array
 */

/**
 * @typedef {Object} GeminiAppInstance
 * @property {function(string, {schema: Object=, model: string=}=): (string|Object)} prompt - Send a simple text prompt. Returns text or JSON object if schema provided.
 * @property {function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object)} promptWithImage - Send a prompt with one or more images. Returns text or JSON object if schema provided.
 * @property {function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object)} promptWithFile - Send a prompt with one or more files (PDF, audio, video). Returns text or JSON object if schema provided.
 * @property {function(): ChatSession} startChat - Start a new chat session. Returns ChatSession with sendMessage(), sendMessageWithImage(), sendMessageWithFile() methods.
 * @property {function(Blob, string, string=): Object} uploadFile - Upload a file (Blob) to Files API. Returns {uri, mimeType, name} for reuse in prompts.
 * @property {function(string, string, string=): Object} uploadFileFromUrl - Upload file from URL or Drive file ID. Returns {uri, mimeType, name}.
 * @property {function(string): Object} deleteFile - Delete an uploaded file by name. Returns deletion status.
 * @property {function(Array<string>, boolean=): Object} deleteFiles - Delete multiple files. Returns {success: Array, failed: Array}.
 * @property {function(number=): Object} deleteAllFiles - Delete all uploaded files (max 100). Returns {deleted: number, failed: Array}.
 * @property {function(number=): Object} listFiles - List uploaded files. Returns {files: Array, nextPageToken: string}.
 * @property {Object} fileManager - File manager instance for advanced file operations
 */

/**
 * GeminiApp - Simplified Gemini API library
 * 
 * @namespace
 * @property {Function} newInstance - Create a new GeminiApp instance
 * @property {GeminiAppError} Error - Base error class
 * @property {GeminiAppApiError} ApiError - API error class
 * @property {GeminiAppValidationError} ValidationError - Validation error class
 * 
 * @example
 * const ai = GeminiApp.newInstance('YOUR_API_KEY');
 * const response = ai.prompt('Hello!');
 */
var GeminiApp = {
  newInstance: newInstance,
  Error: GeminiAppError,
  ApiError: GeminiAppApiError,
  ValidationError: GeminiAppValidationError
};
