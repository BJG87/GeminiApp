/**
 * StvpsAi Library Stub for IntelliSense
 * 
 * INSTRUCTIONS:
 * 1. Add the StvpsAi library to your Apps Script project (Script ID: YOUR_SCRIPT_ID)
 * 2. Copy this entire file into your project
 * 3. Rename it to something like "StvpsAi-autocomplete"
 * 4. DO NOT call any functions from this file - it's only for autocomplete
 * 5. Use the actual library: const ai = StvpsAi.newInstance(apiKey)
 * 
 * This file provides IntelliSense/autocomplete when using the StvpsAi library.
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
 * @typedef {_StvpsAiInstanceStub} StvpsAiInstance
 */

/**
 * @typedef {_ChatSessionStub} ChatSession
 */

/**
 * Instance method stubs (for autocomplete)
 * @class
 */
class _StvpsAiInstanceStub {
  /**
   * Send a text-only prompt to the AI
   * @param {string} text - The prompt text
   * @param {PromptOptions} [options] - Optional configuration
   * @returns {string|Object} Response text or parsed JSON object
   * @example
   * const response = ai.prompt('Hello!');
   * const json = ai.prompt('List 3 colors', { schema: { colors: ['string'] } });
   */
  prompt(text, options) {}
  
  /**
   * Send a prompt with one or more images
   * @param {string} text - The prompt text
   * @param {Blob|string|Array<Blob|string>} images - Image(s) as Blob, URL, Drive ID, or array
   * @param {FileOptions} [options] - Optional configuration including mimeType
   * @returns {string|Object} Response text or parsed JSON object
   * @example
   * const response = ai.promptWithImage('What is in this image?', imageBlob);
   * const response = ai.promptWithImage('Compare these', [url1, url2], { mimeType: ['image/jpeg', 'image/png'] });
   */
  promptWithImage(text, images, options) {}
  
  /**
   * Send a prompt with one or more files (PDF, audio, video, etc.)
   * @param {string} text - The prompt text
   * @param {Blob|string|Object|Array<Blob|string|Object>} files - File(s) as Blob, URL, Drive ID, {uri, mimeType}, or array
   * @param {FileOptions} [options] - Optional configuration including mimeType
   * @returns {string|Object} Response text or parsed JSON object
   * @example
   * const response = ai.promptWithFile('Summarize this PDF', pdfBlob, { mimeType: 'application/pdf' });
   * const response = ai.promptWithFile('Transcribe', audioUrl, { mimeType: 'audio/mpeg' });
   */
  promptWithFile(text, files, options) {}
  
  /**
   * Start a new chat session
   * @returns {_ChatSessionStub} Chat session instance
   * @example
   * const chat = ai.startChat();
   * const response1 = chat.sendMessage('Hello!');
   * const response2 = chat.sendMessage('Tell me more');
   */
  startChat() {}
  
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
  uploadFile(file, displayName, mimeType) {}
  
  /**
   * Upload a file from URL to Gemini API
   * @param {string} url - URL to file
   * @param {string} displayName - Display name for the file
   * @param {string} [mimeType] - MIME type (required)
   * @returns {UploadedFile} Uploaded file info
   */
  uploadFileFromUrl(url, displayName, mimeType) {}
  
  /**
   * Delete an uploaded file
   * @param {string} fileName - File name/ID to delete
   * @returns {void}
   */
  deleteFile(fileName) {}
  
  /**
   * Delete multiple uploaded files
   * @param {Array<string>} fileNames - Array of file names/IDs
   * @param {boolean} [continueOnError=true] - Continue deleting if one fails
   * @returns {DeleteResult} Deletion results
   */
  deleteFiles(fileNames, continueOnError) {}
  
  /**
   * Delete all uploaded files
   * @param {number} [batchSize=10] - Number of files to delete per batch
   * @returns {{deleted: number, failed: number}} Deletion statistics
   */
  deleteAllFiles(batchSize) {}
  
  /**
   * List all uploaded files
   * @param {number} [pageSize=100] - Number of files per page
   * @returns {Array<FileInfo>} Array of file information
   */
  listFiles(pageSize) {}
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
   * @returns {string|Object} Response text or parsed JSON object
   * @example
   * const response = chat.sendMessage('What is 5 + 5?');
   */
  sendMessage(text, options) {}
  
  /**
   * Send a message with one or more images
   * @param {string} text - The message text
   * @param {Blob|string|Array<Blob|string>} images - Image(s) as Blob, URL, Drive ID, or array
   * @param {ChatFileOptions} [options] - Optional configuration including mimeType
   * @returns {string|Object} Response text or parsed JSON object
   */
  sendMessageWithImage(text, images, options) {}
  
  /**
   * Send a message with one or more files
   * @param {string} text - The message text
   * @param {Blob|string|Object|Array<Blob|string|Object>} files - File(s) as Blob, URL, Drive ID, {uri, mimeType}, or array
   * @param {ChatFileOptions} [options] - Optional configuration including mimeType
   * @returns {string|Object} Response text or parsed JSON object
   */
  sendMessageWithFile(text, files, options) {}
}

/**
 * Create a new StvpsAi instance
 * 
 * @example
 * const ai = StvpsAi.newInstance('your-api-key');
 * const response = ai.prompt('Hello!');
 * 
 * @example
 * const ai = StvpsAi.newInstance('your-api-key', 'gemini-2.5-pro');
 * const json = ai.prompt('List 3 colors', { schema: { colors: ['string'] } });
 * 
 * @param {string} apiKey - Google AI API key
 * @param {string} [model='gemini-2.5-flash'] - Model to use
 * @returns {_StvpsAiInstanceStub} StvpsAi instance
 */
function newInstance(apiKey, model) {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.newInstance() from the library.');
}

/**
 * Add a job to the queue for background processing
 * 
 * @example
 * StvpsAi.addJob({ type: 'transcribe', fileId: '123' });
 * 
 * @param {Object} jobData - Job data/payload
 * @returns {string} Job ID
 */
function addJob(jobData) {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.addJob() from the library.');
}

/**
 * Add multiple jobs to the queue
 * 
 * @example
 * StvpsAi.addJobs([{ type: 'process', id: 1 }, { type: 'process', id: 2 }]);
 * 
 * @param {Array<Object>} jobs - Array of job data
 * @returns {Array<string>} Array of job IDs
 */
function addJobs(jobs) {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.addJobs() from the library.');
}

/**
 * Get queue statistics
 * 
 * @example
 * const stats = StvpsAi.getQueueStats();
 * console.log(stats.pending + ' jobs pending');
 * 
 * @returns {{pending: number, completed: number, failed: number}} Queue statistics
 */
function getQueueStats() {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.getQueueStats() from the library.');
}

/**
 * Get failed jobs list
 * 
 * @example
 * const failed = StvpsAi.getFailedJobs();
 * failed.forEach(job => console.log(job.error));
 * 
 * @returns {Array<{id: string, data: Object, error: string, timestamp: string}>} Failed jobs
 */
function getFailedJobs() {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.getFailedJobs() from the library.');
}

/**
 * Clear all failed jobs
 * 
 * @example
 * StvpsAi.clearFailedJobs();
 * 
 * @returns {void}
 */
function clearFailedJobs() {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.clearFailedJobs() from the library.');
}

/**
 * Start job queue processing (creates a time-driven trigger)
 * 
 * @example
 * StvpsAi.startJobQueue();
 * 
 * @returns {void}
 */
function startJobQueue() {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.startJobQueue() from the library.');
}

/**
 * Stop job queue processing (removes triggers)
 * 
 * @example
 * StvpsAi.stopJobQueue();
 * 
 * @returns {void}
 */
function stopJobQueue() {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.stopJobQueue() from the library.');
}

/**
 * Set maximum concurrent jobs
 * 
 * @example
 * StvpsAi.setMaxConcurrentJobs(3); // Allow 3 jobs to run simultaneously
 * 
 * @param {number} max - Maximum concurrent jobs (1-10)
 * @returns {void}
 */
function setMaxConcurrentJobs(max) {
  throw new Error('This is a stub file for autocomplete only. Use StvpsAi.setMaxConcurrentJobs() from the library.');
}

// Export the StvpsAi namespace for autocomplete
var StvpsAi = {
  newInstance: newInstance,
  addJob: addJob,
  addJobs: addJobs,
  getQueueStats: getQueueStats,
  getFailedJobs: getFailedJobs,
  clearFailedJobs: clearFailedJobs,
  startJobQueue: startJobQueue,
  stopJobQueue: stopJobQueue,
  setMaxConcurrentJobs: setMaxConcurrentJobs
};
