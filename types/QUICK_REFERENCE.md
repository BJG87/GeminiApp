# StvpsAi Quick Reference Guide

## Setup
```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const ai = newStvpsAiInstance(apiKey, 'gemini-2.0-flash-exp'); // model is optional
```

---

## 📝 Text Prompts

### Simple Text
```javascript
const response = ai.prompt("Tell me a joke");
```

### Structured JSON Output
```javascript
const schema = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'string' } }
  }
};
const response = ai.prompt("List 3 colors", { schema });
// Returns object: { items: ["red", "blue", "green"] }
```

---

## 🖼️ Image Prompts

### Single Image (URL)
```javascript
const response = ai.promptWithImage(
  "What's in this image?",
  "https://example.com/image.jpg",
  { mimeType: "image/jpeg" }
);
```

### Single Image (Drive ID)
```javascript
const response = ai.promptWithImage(
  "Describe this image",
  "1abc...xyz" // Drive file ID - no mimeType needed
);
```

### Multiple Images
```javascript
const response = ai.promptWithImages(
  "Compare these images",
  ["url1.jpg", "url2.jpg"],
  { mimeType: "image/jpeg" }
);
```

### Image with Structured Output
```javascript
const schema = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    objects: { type: 'array', items: { type: 'string' } }
  }
};
const response = ai.promptWithImage("Analyze", imageUrl, { 
  mimeType: "image/jpeg",
  schema 
});
```

---

## 📄 File Prompts (PDF, Audio, Video)

### Single File (URL)
```javascript
const response = ai.promptWithFile(
  "Transcribe this audio",
  "https://example.com/audio.mp3",
  { mimeType: "audio/mpeg" }
);
```

### Single File (Drive ID)
```javascript
const response = ai.promptWithFile(
  "Summarize this PDF",
  "1abc...xyz" // No mimeType needed for Drive files
);
```

### Single File (Drive URL)
```javascript
const response = ai.promptWithFile(
  "What's in this document?",
  "https://docs.google.com/document/d/1abc...xyz/edit"
  // No mimeType needed - auto-detected
);
```

### Multiple Files
```javascript
const response = ai.promptWithFiles(
  "Analyze these documents",
  ["driveId1", "driveId2", "driveId3"]
);
```

### File with Structured Output
```javascript
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } }
  }
};
const response = ai.promptWithFile("Analyze", pdfUrl, { 
  mimeType: "application/pdf",
  schema 
});
```

---

## 💬 Chat Sessions

### Basic Chat
```javascript
const chat = ai.startChat();
const r1 = chat.sendMessage("What's 2+2?");
const r2 = chat.sendMessage("Multiply that by 3");
// Chat remembers context!
```

### Chat with Images
```javascript
const chat = ai.startChat();
const r1 = chat.sendMessageWithImage(
  "What's in this image?",
  imageUrl,
  { mimeType: "image/jpeg" }
);
const r2 = chat.sendMessage("What color is it?");
// Remembers the image from previous message
```

### Chat with Files
```javascript
const chat = ai.startChat();
const r1 = chat.sendMessageWithFile(
  "Analyze this document",
  driveFileId
);
const r2 = chat.sendMessage("What was the main conclusion?");
```

### Chat with Structured Output
```javascript
const chat = ai.startChat();
const schema = {
  type: 'object',
  properties: {
    answer: { type: 'number' }
  }
};
const response = chat.sendMessage("What's 5+5?", { schema });
// Returns: { answer: 10 }
```

### Chat History
```javascript
const history = chat.getHistory();
chat.clearHistory(); // Start fresh
```

---

## 📤 File Upload & Reuse

### Upload File (for reuse)
```javascript
// Upload from Drive ID
const uploaded = ai.uploadFile("1abc...xyz");

// Upload from URL (requires mimeType)
const uploaded = ai.uploadFile("https://example.com/file.pdf", {
  mimeType: "application/pdf"
});

// Use uploaded file
const response = ai.promptWithFile(
  "Analyze this",
  { uri: uploaded.uri, mimeType: uploaded.mimeType }
);

// Reuse multiple times (no re-upload!)
const response2 = ai.promptWithFile(
  "Different question",
  { uri: uploaded.uri, mimeType: uploaded.mimeType }
);

// Clean up
ai.deleteFile(uploaded.name);
```

### File Management
```javascript
// List uploaded files
const { files, nextPageToken } = ai.listFiles(20); // 20 files per page
files.forEach(f => console.log(f.name, f.mimeType, f.sizeBytes));

// Get specific file info
const file = ai.getFile("files/abc123");

// Delete specific file
ai.deleteFile("files/abc123");

// Delete all files
ai.deleteAllFiles();
```

---

## 🔄 Job Queue System

### Setup (Required)
```javascript
// Must create this function in your project
function processJobs() {
  StvpsAi.JobQueue.processJobsInternal();
}
```

### Add Jobs
```javascript
// Set max concurrent jobs (default: 1)
StvpsAi.JobQueue.setMaxConcurrentJobs(3);

// Add single job
const jobId = StvpsAi.JobQueue.addJob({
  type: 'analyze',
  fileId: 'abc123'
});

// Add multiple jobs
const jobIds = StvpsAi.JobQueue.addJobs([
  { type: 'summarize', fileId: 'file1' },
  { type: 'analyze', fileId: 'file2' },
  { type: 'transcribe', fileId: 'file3' }
]);
```

### Monitor Queue
```javascript
// Get statistics
const stats = StvpsAi.JobQueue.getQueueStats();
console.log(stats.total);      // Total jobs
console.log(stats.pending);    // Waiting to run
console.log(stats.processing); // Currently running
console.log(stats.completed);  // Finished
console.log(stats.failed);     // Failed jobs

// Get specific job
const job = StvpsAi.JobQueue.getJob(jobId);

// Get jobs by status
const pending = StvpsAi.JobQueue.getJobsByStatus('pending');
const failed = StvpsAi.JobQueue.getJobsByStatus('failed');
```

### Manage Failed Jobs
```javascript
// Get failed jobs
const failedJobs = StvpsAi.JobQueue.getFailedJobs();
failedJobs.forEach(fj => {
  console.log(fj.job.id, fj.reason, fj.timestamp);
});

// Clear failed jobs
StvpsAi.JobQueue.clearFailedJobs();
```

### Clean Up
```javascript
// Clear completed jobs
StvpsAi.JobQueue.clearCompletedJobs();

// Clear all jobs
StvpsAi.JobQueue.clearAllJobs();

// Stop processing
StvpsAi.JobQueue.stopProcessingJobs();
```

---

## 📋 Schema Examples

### Simple List
```javascript
const schema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};
```

### Object with Multiple Properties
```javascript
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    count: { type: 'number' },
    active: { type: 'boolean' },
    tags: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'count']
};
```

### Nested Objects
```javascript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    },
    posts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          likes: { type: 'number' }
        }
      }
    }
  }
};
```

---

## 🎯 Common Use Cases

### Transcribe Audio
```javascript
const transcript = ai.promptWithFile(
  "Transcribe this audio exactly as spoken",
  audioFileId
);
```

### Analyze PDF
```javascript
const schema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    conclusion: { type: 'string' }
  }
};
const analysis = ai.promptWithFile(
  "Analyze this document",
  pdfFileId,
  { schema }
);
```

### Multi-Image Comparison
```javascript
const response = ai.promptWithImages(
  "What are the differences between these images?",
  [image1Url, image2Url],
  { mimeType: "image/jpeg" }
);
```

### Multi-Turn Conversation
```javascript
const chat = ai.startChat();
chat.sendMessage("I'm planning a trip to Paris");
chat.sendMessage("What should I see?");
chat.sendMessage("How many days do I need?");
const history = chat.getHistory(); // Full conversation
```

---

## 🚨 Error Handling

All methods throw errors if something goes wrong:

```javascript
try {
  const response = ai.prompt("Hello");
} catch (error) {
  console.error(error.message);
  // StvpsAiApiError: API request failed
  // StvpsAiValidationError: Invalid parameters
}
```

---

## 📊 Return Types

| Method | Without Schema | With Schema |
|--------|---------------|-------------|
| `prompt()` | `string` | `object` |
| `promptWithImage()` | `string` | `object` |
| `promptWithImages()` | `string` | `object` |
| `promptWithFile()` | `string` | `object` |
| `promptWithFiles()` | `string` | `object` |
| `chat.sendMessage()` | `string` | `object` |
| `chat.sendMessageWith*()` | `string` | `object` |

---

## 🔑 File Input Formats

All file methods accept:
- **URL string**: `"https://example.com/file.pdf"` (requires `mimeType`)
- **Drive ID**: `"1abc...xyz"` (auto-detects mimeType)
- **Drive URL**: `"https://docs.google.com/..."`
- **File object**: `{ uri: "...", mimeType: "..." }`
- **Uploaded file**: `{ uri: uploaded.uri, mimeType: uploaded.mimeType }`

---

## 💡 Pro Tips

1. **Reuse uploaded files** - Upload once, use many times
2. **Use schemas** - Get structured data instead of parsing text
3. **Drive files are easy** - Just pass the ID, no mimeType needed
4. **Chat remembers context** - Great for follow-up questions
5. **Queue long jobs** - Process multiple files without timeouts
6. **Clean up files** - Uploaded files expire after 48 hours anyway

---

For complete documentation, see the main README and type definitions file.
