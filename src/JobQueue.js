// ============================================================================
// JOB QUEUE SYSTEM
// ============================================================================
// Generic job queue processor with concurrent job support
// 
// USAGE:
// 1. Set max concurrent jobs: setMaxConcurrentJobs(3)
// 2. Add jobs: addJob({ id: 'job-1', type: 'myType', handler: 'myFunction', data: {...} })
// 3. Jobs auto-process via 1-minute trigger
// 4. Trigger auto-stops when queue is empty
// ============================================================================

// ============================================================================
// JOB QUEUE CONFIGURATION
// ============================================================================

/**
 * Set the maximum number of concurrent jobs that can run
 * Default is 1 if not set
 * 
 * @param {number} maxConcurrent - Max concurrent jobs (1-10 recommended)
 * @example
 * JobQueue.setMaxConcurrentJobs(3); // Allow 3 jobs to run simultaneously
 */
function setMaxConcurrentJobs(maxConcurrent) {
  if (maxConcurrent < 1) {
    throw new Error('Max concurrent jobs must be at least 1');
  }
  PropertiesService.getScriptProperties().setProperty(
    'MAX_CONCURRENT_JOBS',
    maxConcurrent.toString()
  );
}

/**
 * Get the maximum number of concurrent jobs allowed
 * @returns {number} Max concurrent jobs
 */
function getMaxConcurrentJobs() {
  const props = PropertiesService.getScriptProperties();
  const max = props.getProperty('MAX_CONCURRENT_JOBS');
  return max ? parseInt(max) : 1; // Default to 1
}

// ============================================================================
// JOB QUEUE PROCESSING
// ============================================================================

/**
 * Start the job queue processor (creates a 1-minute trigger)
 */
function startProcessingJobs() {
  const triggers = ScriptApp.getProjectTriggers();
  const existingTrigger = triggers.find(
    (t) => t.getHandlerFunction() === "processJobs"
  );
  if (!existingTrigger) {
    ScriptApp.newTrigger("processJobs")
      .timeBased()
      .everyMinutes(1)
      .create();
    console.log('Job queue processor started');
  }
}

/**
 * Stop the job queue processor (removes the trigger)
 */
function stopProcessingJobs() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => {
    if (t.getHandlerFunction() === "processJobs") {
      ScriptApp.deleteTrigger(t);
    }
  });
  console.log('Job queue processor stopped');
}

/**
 * Get currently running jobs
 * @returns {Array<string>} Array of job IDs currently in progress
 */
function getRunningJobs() {
  const props = PropertiesService.getScriptProperties();
  const running = props.getProperty('RUNNING_JOBS');
  return running ? JSON.parse(running) : [];
}

/**
 * Set currently running jobs
 * @param {Array<string>} jobs - Array of job IDs
 */
function setRunningJobs(jobs) {
  PropertiesService.getScriptProperties().setProperty(
    'RUNNING_JOBS',
    JSON.stringify(jobs)
  );
}

/**
 * Get the job queue
 * @returns {Array<Object>} Array of job objects
 */
function getJobQueue() {
  const props = PropertiesService.getScriptProperties();
  const queue = props.getProperty('JOB_QUEUE');
  return queue ? JSON.parse(queue) : [];
}

/**
 * Save the job queue
 * @param {Array<Object>} queue - Job queue array
 */
function saveJobQueue(queue) {
  PropertiesService.getScriptProperties().setProperty(
    'JOB_QUEUE',
    JSON.stringify(queue)
  );
}

/**
 * Add a job to the queue
 * 
 * @param {Object} job - Job object with required properties
 * @param {string} job.id - Unique job ID
 * @param {string} job.type - Job type identifier
 * @param {Function} job.handler - Function name to execute (as string)
 * @param {Object} [job.data] - Job data/parameters
 * @returns {string} The job ID
 * 
 * @example
 * addJob({
 *   id: 'job-123',
 *   type: 'ai-analysis',
 *   handler: 'processAiAnalysis',
 *   data: { fileId: 'abc123', prompt: 'Analyze this' }
 * });
 */
function addJob(job) {
  if (!job.id || !job.type || !job.handler) {
    throw new Error('Job must have id, type, and handler properties');
  }
  
  const queue = getJobQueue();
  queue.push({
    id: job.id,
    type: job.type,
    handler: job.handler,
    data: job.data || {},
    createdAt: new Date().toISOString(),
    status: 'queued'
  });
  
  saveJobQueue(queue);
  startProcessingJobs(); // Ensure processor is running
  console.log(`Job ${job.id} added to queue`);
  return job.id;
}

/**
 * Add multiple jobs to the queue at once
 * 
 * @param {Array<Object>} jobs - Array of job objects
 * @returns {Array<string>} Array of job IDs
 * 
 * @example
 * addJobs([
 *   { id: 'job-1', type: 'ai-analysis', handler: 'processAiAnalysis', data: { prompt: 'Test 1' } },
 *   { id: 'job-2', type: 'ai-analysis', handler: 'processAiAnalysis', data: { prompt: 'Test 2' } }
 * ]);
 */
function addJobs(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new Error('Jobs must be a non-empty array');
  }
  
  // Validate all jobs first
  jobs.forEach((job, index) => {
    if (!job.id || !job.type || !job.handler) {
      throw new Error(`Job at index ${index} must have id, type, and handler properties`);
    }
  });
  
  // Add all jobs to queue
  const queue = getJobQueue();
  const jobIds = [];
  
  jobs.forEach(job => {
    queue.push({
      id: job.id,
      type: job.type,
      handler: job.handler,
      data: job.data || {},
      createdAt: new Date().toISOString(),
      status: 'queued'
    });
    jobIds.push(job.id);
  });
  
  saveJobQueue(queue);
  startProcessingJobs(); // Ensure processor is running
  console.log(`${jobs.length} jobs added to queue: ${jobIds.join(', ')}`);
  return jobIds;
}

/**
 * Process jobs from the queue
 * Called by trigger every minute
 */
function processJobs() {
  const maxConcurrent = getMaxConcurrentJobs();
  const runningJobs = getRunningJobs();
  const queue = getJobQueue();
  
  // If queue is empty and nothing running, stop the trigger
  if (queue.length === 0 && runningJobs.length === 0) {
    stopProcessingJobs();
    return;
  }
  
  // Check how many slots are available
  const availableSlots = maxConcurrent - runningJobs.length;
  if (availableSlots <= 0) {
    console.log(`Max concurrent jobs (${maxConcurrent}) reached. Waiting...`);
    return;
  }
  
  // Process jobs up to available slots
  const jobsToProcess = queue.splice(0, availableSlots);
  
  if (jobsToProcess.length === 0) {
    return;
  }
  
  // Mark jobs as running
  const newRunningJobs = [...runningJobs, ...jobsToProcess.map(j => j.id)];
  setRunningJobs(newRunningJobs);
  saveJobQueue(queue);
  
  // Process each job
  jobsToProcess.forEach(job => {
    try {
      console.log(`Processing job ${job.id} (${job.type})`);
      
      // Call the handler function
      if (typeof this[job.handler] === 'function') {
        this[job.handler](job);
      } else if (typeof global[job.handler] === 'function') {
        global[job.handler](job);
      } else {
        throw new Error(`Handler function '${job.handler}' not found`);
      }
      
      console.log(`Job ${job.id} completed successfully`);
      
    } catch (e) {
      console.error(`Job ${job.id} failed:`, e);
      
      // Add to failed jobs list
      addFailedJob({
        jobId: job.id,
        type: job.type,
        handler: job.handler,
        data: job.data,
        error: e.toString(),
        timestamp: new Date().toISOString()
      });
      
    } finally {
      // Remove from running jobs
      const currentRunning = getRunningJobs();
      const updatedRunning = currentRunning.filter(id => id !== job.id);
      setRunningJobs(updatedRunning);
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get current queue status
 * @returns {Object} Queue status with counts and job details
 * 
 * @example
 * const status = getQueueStatus();
 * console.log(`${status.queuedCount} queued, ${status.runningCount} running`);
 */
function getQueueStatus() {
  const queue = getJobQueue();
  const running = getRunningJobs();
  const maxConcurrent = getMaxConcurrentJobs();
  
  return {
    queuedCount: queue.length,
    runningCount: running.length,
    maxConcurrent: maxConcurrent,
    availableSlots: maxConcurrent - running.length,
    queuedJobs: queue.map(j => ({ id: j.id, type: j.type, createdAt: j.createdAt })),
    runningJobIds: running
  };
}

/**
 * Clear all jobs from the queue (does not affect running jobs)
 */
function clearJobQueue() {
  saveJobQueue([]);
  console.log('Job queue cleared');
}

/**
 * Clear running jobs list (use with caution - only if jobs are truly stuck)
 */
function clearRunningJobs() {
  setRunningJobs([]);
  console.log('Running jobs cleared');
}

// ============================================================================
// FAILED JOBS TRACKING
// ============================================================================

/**
 * Get the list of failed jobs
 * @returns {Array<Object>} Array of failed job objects
 */
function getFailedJobs() {
  const props = PropertiesService.getScriptProperties();
  const failed = props.getProperty('FAILED_JOBS');
  return failed ? JSON.parse(failed) : [];
}

/**
 * Save the failed jobs list
 * @param {Array<Object>} failedJobs - Failed jobs array
 */
function saveFailedJobs(failedJobs) {
  PropertiesService.getScriptProperties().setProperty(
    'FAILED_JOBS',
    JSON.stringify(failedJobs)
  );
}

/**
 * Add a job to the failed jobs list
 * 
 * @param {Object} failedJob - Failed job details
 * @param {string} failedJob.jobId - Job ID that failed
 * @param {string} failedJob.type - Job type
 * @param {string} failedJob.handler - Handler function name
 * @param {Object} failedJob.data - Job data
 * @param {string} failedJob.error - Error message
 * @param {string} failedJob.timestamp - ISO timestamp of failure
 */
function addFailedJob(failedJob) {
  const failedJobs = getFailedJobs();
  failedJobs.push(failedJob);
  saveFailedJobs(failedJobs);
  console.log(`Job ${failedJob.jobId} added to failed jobs list`);
}

/**
 * List all failed jobs with details
 * @returns {Array<Object>} Array of failed job details
 * 
 * @example
 * const failed = listFailedJobs();
 * failed.forEach(job => {
 *   console.log(`Job ${job.jobId} failed at ${job.timestamp}`);
 *   console.log(`Error: ${job.error}`);
 * });
 */
function listFailedJobs() {
  const failedJobs = getFailedJobs();
  
  if (failedJobs.length === 0) {
    console.log('No failed jobs');
    return [];
  }
  
  console.log(`=== FAILED JOBS (${failedJobs.length}) ===`);
  failedJobs.forEach((job, index) => {
    console.log(`\n${index + 1}. Job ID: ${job.jobId}`);
    console.log(`   Type: ${job.type}`);
    console.log(`   Handler: ${job.handler}`);
    console.log(`   Failed At: ${job.timestamp}`);
    console.log(`   Error: ${job.error}`);
    if (job.data && Object.keys(job.data).length > 0) {
      console.log(`   Data: ${JSON.stringify(job.data, null, 2)}`);
    }
  });
  
  return failedJobs;
}

/**
 * Clear all failed jobs from the list
 */
function clearFailedJobs() {
  saveFailedJobs([]);
  console.log('Failed jobs list cleared');
}

/**
 * Remove a specific failed job by job ID
 * @param {string} jobId - Job ID to remove
 * @returns {boolean} True if job was found and removed
 */
function removeFailedJob(jobId) {
  const failedJobs = getFailedJobs();
  const initialLength = failedJobs.length;
  const updatedJobs = failedJobs.filter(job => job.jobId !== jobId);
  
  if (updatedJobs.length < initialLength) {
    saveFailedJobs(updatedJobs);
    console.log(`Failed job ${jobId} removed`);
    return true;
  }
  
  console.log(`Failed job ${jobId} not found`);
  return false;
}
