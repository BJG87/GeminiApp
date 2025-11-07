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
 * @typedef {Object} StvpsAiInstance
 * @property {function(string, {schema: Object=, model: string=}=): (string|Object)} prompt - Send a text-only prompt
 * @property {function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object)} promptWithImage - Send a prompt with image(s)
 * @property {function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=, model: string=}=): (string|Object)} promptWithFile - Send a prompt with file(s)
 * @property {function(): ChatSession} startChat - Start a chat session
 * @property {function(Blob|string, string, string=): {uri: string, name: string, mimeType: string}} uploadFile - Upload a file to Gemini API
 * @property {function(string, string, string=): {uri: string, name: string, mimeType: string}} uploadFileFromUrl - Upload a file from URL
 * @property {function(string): void} deleteFile - Delete an uploaded file
 * @property {function(Array<string>, boolean=): {deleted: Array<string>, failed: Array<{name: string, error: string}>}} deleteFiles - Delete multiple files
 * @property {function(number=): {deleted: number, failed: number}} deleteAllFiles - Delete all uploaded files
 * @property {function(number=): Array<{name: string, uri: string, mimeType: string, sizeBytes: number, createTime: string}>} listFiles - List uploaded files
 * @property {Object} fileManager - Direct access to file manager
 */

/**
 * @typedef {Object} ChatSession
 * @property {function(string, {schema: Object=}=): (string|Object)} sendMessage - Send a text message in chat
 * @property {function(string, (Blob|string|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object)} sendMessageWithImage - Send a message with image(s)
 * @property {function(string, (Blob|string|Object|Array), {mimeType: (string|Array)=, schema: Object=}=): (string|Object)} sendMessageWithFile - Send a message with file(s)
 * @property {Array<Object>} history - Chat history
 */

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
 * @returns {StvpsAiInstance} StvpsAi instance
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
