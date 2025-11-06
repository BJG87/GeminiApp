# StvpsAi - Simplified Gemini API Library

A streamlined Google Apps Script library for working with Google's Gemini AI API.

## Features

- ✅ Simple text and structured JSON prompts
- ✅ Single and multiple image support
- ✅ File support (PDF, audio, video) - single or multiple
- ✅ Google Workspace file support (Docs, Sheets, Slides)
- ✅ Private and public file access
- ✅ Chat mode with context
- ✅ File upload API for large files
- ✅ Automatic retry with exponential backoff
- ✅ Job queue with concurrency control
- ✅ Clear, descriptive error messages

## Quick Start

### 1. Get an API Key
Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Add to Your Project
```javascript
// Store API key in Script Properties
PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your-api-key');

// Create an instance
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const ai = StvpsAi.newInstance(API_KEY);
```

### 3. Basic Usage

```javascript
// Simple text prompt
const response = ai.prompt('Hello, how are you?');
console.log(response); // Returns: string

// Structured JSON output
const schema = {
  type: 'object',
  properties: {
    colors: { 
      type: 'array',
      items: { type: 'string' }
    }
  }
};
const data = ai.prompt('List 3 primary colors', { schema });
console.log(data.colors); // Returns: object with colors array
```

## Return Types

**IMPORTANT:** All prompt and chat methods return:
- **String** when NO schema is provided
- **Object** when schema is provided (parsed JSON)

This applies to:
- `prompt()` / `sendMessage()`
- `promptWithImage()` / `sendMessageWithImage()`
- `promptWithFile()` / `sendMessageWithFile()`

## Working with Images

```javascript
// Single image (URL or Blob)
const response = ai.promptWithImage(
  'What is in this image?',
  'https://example.com/image.jpg',
  { mimeType: 'image/jpeg' }
);

// Multiple images
const response = ai.promptWithImage(
  'Compare these images',
  [
    { url: 'https://example.com/image1.jpg', mimeType: 'image/jpeg' },
    { url: 'https://example.com/image2.jpg', mimeType: 'image/jpeg' }
  ]
);

// From Drive blob
const blob = DriveApp.getFileById('FILE_ID').getBlob();
const response = ai.promptWithImage('Describe this', blob);
```

## Working with Files

```javascript
// Single file (PDF, audio, video)
const response = ai.promptWithFile(
  'Summarize this PDF',
  'https://example.com/document.pdf',
  { mimeType: 'application/pdf' }
);

// Multiple files
const response = ai.promptWithFile(
  'Analyze these documents',
  [
    { url: 'https://example.com/doc1.pdf', mimeType: 'application/pdf' },
    { url: 'https://example.com/audio.mp3', mimeType: 'audio/mpeg' }
  ]
);

// Audio transcription
const response = ai.promptWithFile(
  'Transcribe this audio',
  'https://example.com/recording.mp3',
  { mimeType: 'audio/mpeg' }
);

// Private Google Doc (you must have access)
const response = ai.promptWithFile(
  'Summarize this document',
  'https://docs.google.com/document/d/YOUR_DOC_ID/edit',
  { mimeType: 'application/pdf' } // Automatically converted to PDF
);

// Using Drive file ID directly
const response = ai.promptWithFile(
  'Analyze this',
  'YOUR_DRIVE_FILE_ID',
  { mimeType: 'audio/mpeg' }
);
```

## Google Workspace Files

StvpsAi automatically handles Google Docs, Sheets, and Slides:

```javascript
// These all work and are automatically exported as PDF
const docResponse = ai.promptWithFile(
  'Summarize',
  'https://docs.google.com/document/d/DOC_ID/edit',
  { mimeType: 'application/pdf' }
);

const sheetResponse = ai.promptWithFile(
  'Analyze data',
  'https://docs.google.com/spreadsheets/d/SHEET_ID/edit',
  { mimeType: 'application/pdf' }
);

const slideResponse = ai.promptWithFile(
  'Describe presentation',
  'https://docs.google.com/presentation/d/SLIDE_ID/edit',
  { mimeType: 'application/pdf' }
);
```

**Note:** For Workspace files, the user running the script must have access to the file.

## Chat Mode

```javascript
// Start a chat
const chat = ai.startChat();

// Send messages
const response1 = chat.sendMessage('What is 5 + 5?');
console.log(response1); // "5 + 5 = 10"

const response2 = chat.sendMessage('Now double it');
console.log(response2); // "Double 10 is 20"

// Chat with images
const imageResponse = chat.sendMessageWithImage(
  'What is in this image?',
  imageBlob
);

// Chat with files
const fileResponse = chat.sendMessageWithFile(
  'Transcribe this audio',
  { uri: uploadedFile.uri, mimeType: 'audio/mpeg' }
);

// Chat with structured output
const schema = { /* your schema */ };
const structuredResponse = chat.sendMessage('Extract data', { schema });
```

## Uploading Large Files

For large files (>10MB), upload them first to avoid timeout issues:

```javascript
// Upload from URL (for smaller files)
const uploadedFile = ai.uploadFile(
  'https://example.com/largefile.mp4',
  'video/mp4'
);

// Upload from Drive (RECOMMENDED for large files)
const driveFile = DriveApp.getFileById('YOUR_FILE_ID');
const uploadedFile = ai.uploadDriveFile(driveFile);

// Use the uploaded file (can reuse multiple times!)
const response1 = ai.promptWithFile(
  'What is in this video?',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
);

const response2 = ai.promptWithFile(
  'Describe the audio',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
);

// Delete when done
ai.deleteFile(uploadedFile.name);
```

## Job Queue

Process multiple AI requests sequentially with concurrency control.

### Required Setup

**IMPORTANT:** To use the job queue, you MUST add this helper function to your project:

```javascript
/**
 * Required helper function for job queue
 * This allows the library to work with your project's trigger system
 */
function processJobs() {
  StvpsAi.JobQueue.processJobs();
}
```

### Usage

```javascript
// Add a single job
StvpsAi.JobQueue.addJob({
  method: 'prompt',
  params: ['Analyze this text'],
  callbackFunctionName: 'handleResult'
});

// Add multiple jobs at once
StvpsAi.JobQueue.addJobs([
  {
    method: 'prompt',
    params: ['First task'],
    callbackFunctionName: 'handleResult1'
  },
  {
    method: 'promptWithImage',
    params: ['Describe image', imageUrl, { mimeType: 'image/jpeg' }],
    callbackFunctionName: 'handleResult2'
  }
]);

// Callback function receives the result
function handleResult(result) {
  if (result.success) {
    console.log('Job completed:', result.data);
  } else {
    console.log('Job failed:', result.error);
  }
}

// Set how many jobs run simultaneously (default is 1)
StvpsAi.JobQueue.setConcurrentJobs(3);

// Check queue status
const stats = StvpsAi.JobQueue.getQueueStats();
console.log('Pending:', stats.pending);
console.log('In Progress:', stats.inProgress);
console.log('Completed:', stats.completed);
console.log('Failed:', stats.failed);

// View failed jobs
const failedJobs = StvpsAi.JobQueue.getFailedJobs();
failedJobs.forEach(job => {
  console.log('Failed:', job.error, 'at', job.failedAt);
});

// Clear completed jobs
StvpsAi.JobQueue.clearCompletedJobs();

// Stop processing (removes the trigger)
StvpsAi.JobQueue.stopProcessingJobs();
```

### How the Job Queue Works

1. Jobs are added to a queue stored in Script Properties
2. A 1-minute trigger is created automatically
3. Every minute, the `processJobs()` function runs
4. It processes up to N jobs concurrently (based on your setting)
5. When jobs complete, your callback function is called with the result
6. When the queue is empty, the trigger is automatically removed
7. Failed jobs are tracked separately and can be reviewed

## File Management

```javascript
// List uploaded files
const files = ai.listFiles();
files.forEach(file => {
  console.log(`${file.displayName} (${file.name})`);
  console.log(`  Size: ${file.sizeBytes} bytes`);
  console.log(`  Type: ${file.mimeType}`);
});

// Delete a file
ai.deleteFile('files/abc123');

// Note: Gemini API automatically deletes files after 48 hours
```

## Error Handling

```javascript
try {
  const response = ai.prompt('Hello');
  console.log(response);
} catch (error) {
  if (error.name === 'StvpsAiApiError') {
    console.log('API Error:', error.message);
    console.log('Status:', error.statusCode);
  } else if (error.name === 'StvpsAiValidationError') {
    console.log('Validation Error:', error.message);
  } else {
    console.log('Unknown Error:', error.message);
  }
}
```

## Advanced Options

```javascript
const response = ai.prompt('Write a story', {
  temperature: 0.7,      // Creativity (0-1)
  maxOutputTokens: 1000, // Max response length
  topP: 0.9,            // Nucleus sampling
  topK: 40              // Top-k sampling
});
```

## Important Notes

### Schema Parameter Placement
When using methods with multiple parameters, the schema ALWAYS goes in the OPTIONS parameter (last):

```javascript
// ✓ CORRECT
ai.promptWithFile(text, file, { schema })
chat.sendMessageWithFile(text, file, { schema })

// ✗ INCORRECT
ai.promptWithFile(text, { file, schema })
chat.sendMessageWithFile(text, { file, schema })
```

### MIME Types
Always provide MIME types when using URLs or file IDs:

```javascript
// Required for URLs
ai.promptWithImage('Describe', url, { mimeType: 'image/jpeg' })

// Required for file IDs
ai.promptWithFile('Transcribe', fileId, { mimeType: 'audio/mpeg' })

// Not required for Blobs (automatically detected)
ai.promptWithImage('Describe', blob)

// Not required for uploaded files (already have mimeType)
ai.promptWithFile('Analyze', { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType })
```

### File Size Limits
- Apps Script `UrlFetchApp` has ~50MB limit and ~20 second timeout
- For files >10MB, use `uploadDriveFile()` instead of `uploadFile()`
- Uploaded files are automatically deleted by Gemini after 48 hours

### Array vs Single Values
All image and file methods support BOTH single values and arrays:

```javascript
// Single image
ai.promptWithImage('Describe', imageBlob)

// Multiple images
ai.promptWithImage('Compare', [image1, image2, image3])

// Single file
ai.promptWithFile('Summarize', pdfUrl, { mimeType: 'application/pdf' })

// Multiple files
ai.promptWithFile('Analyze', [
  { url: pdf1, mimeType: 'application/pdf' },
  { url: audio1, mimeType: 'audio/mpeg' }
])
```

## API Reference

### Main Methods
- `newInstance(apiKey, model?)` - Create new AI instance
- `prompt(text, options?)` - Simple text/structured prompt
- `promptWithImage(text, image, options?)` - Prompt with single/multiple images
- `promptWithFile(text, file, options?)` - Prompt with single/multiple files
- `startChat(history?)` - Start chat session

### Chat Methods
- `sendMessage(text, options?)` - Send chat message
- `sendMessageWithImage(text, image, options?)` - Send with images
- `sendMessageWithFile(text, file, options?)` - Send with files

### File Methods
- `uploadFile(url, mimeType, displayName?)` - Upload file from URL
- `uploadDriveFile(driveFile)` - Upload from Drive (recommended for large files)
- `deleteFile(fileName)` - Delete uploaded file
- `listFiles()` - List all uploaded files

### Job Queue Methods (Static)
- `JobQueue.addJob(job)` - Add single job
- `JobQueue.addJobs(jobs)` - Add multiple jobs
- `JobQueue.setConcurrentJobs(count)` - Set concurrency
- `JobQueue.getQueueStats()` - Get queue statistics
- `JobQueue.getFailedJobs()` - View failed jobs
- `JobQueue.clearCompletedJobs()` - Clear completed
- `JobQueue.stopProcessingJobs()` - Stop processing

## License

MIT
