# StvpsAi - Simplified Gemini API Library

A streamlined Google Apps Script library for working with Google's Gemini AI API.

## Features

- ✨ Simple text and structured JSON prompts
- 🖼️ Image support (single or multiple)
- 📄 File support: PDFs, audio, video (single or multiple)
- 💬 Chat mode with context
- ⬆️ File upload API for large files
- 🔄 Automatic retry with exponential backoff
- ⚠️ Clear, descriptive error messages

## Quick Start

```javascript
// Get API key from Script Properties
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// Create AI instance
const ai = StvpsAi.newInstance(API_KEY); // Uses gemini-2.5-flash by default

// Or specify a different model
const ai = StvpsAi.newInstance(API_KEY, 'gemini-2.0-flash-exp');
```

## Basic Usage

### Simple Text Prompt

```javascript
const response = ai.prompt('Explain quantum computing in simple terms');
console.log(response);
```

### Structured JSON Output

Provide a JSON schema to get structured data back:

```javascript
const schema = {
  type: 'object',
  properties: {
    colors: { 
      type: 'array', 
      items: { type: 'string' } 
    }
  },
  required: ['colors']
};

const result = ai.prompt('List 5 primary and secondary colors', { schema });
console.log(result.colors); // ['red', 'blue', 'yellow', 'green', 'orange']
```

## Working with Images

### Single Image

```javascript
// From Drive file
const file = DriveApp.getFileById('FILE_ID');
const response = ai.promptWithImage('What is in this image?', file);

// From Blob
const blob = UrlFetchApp.fetch('https://example.com/image.jpg').getBlob();
const response = ai.promptWithImage('Describe this image', blob);

// From URL (automatically uploads to Files API)
const response = ai.promptWithImage(
  'What do you see?', 
  'https://example.com/image.jpg',
  { mimeType: 'image/jpeg' }
);
```

### Multiple Images

**YES, arrays are now supported!**

```javascript
// Compare multiple images
const response = ai.promptWithImage(
  'Compare these two images and describe the differences',
  [imageBlob1, imageBlob2]
);

// With URLs - provide array of mimeTypes
const response = ai.promptWithImage(
  'Which of these images shows a sunset?',
  [
    'https://example.com/photo1.jpg',
    'https://example.com/photo2.jpg'
  ],
  { mimeType: ['image/jpeg', 'image/jpeg'] }
);

// Mix of Blobs and URLs
const response = ai.promptWithImage(
  'Analyze all these images',
  [blob1, 'https://example.com/image.jpg', blob2],
  { mimeType: [null, 'image/jpeg', null] } // null for blobs (auto-detected)
);
```

## Working with Files (PDF, Audio, Video)

### Single File

```javascript
// Transcribe audio
const audioFile = DriveApp.getFileById('AUDIO_FILE_ID');
const transcription = ai.promptWithFile(
  'Transcribe this audio recording',
  audioFile,
  { mimeType: 'audio/mpeg' }
);

// Analyze PDF with structured output
const pdfFile = DriveApp.getFileById('PDF_FILE_ID');
const summary = ai.promptWithFile(
  'Summarize this document',
  pdfFile,
  {
    mimeType: 'application/pdf',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        keyPoints: { type: 'array', items: { type: 'string' } }
      },
      required: ['summary', 'keyPoints']
    }
  }
);

// From URL
const response = ai.promptWithFile(
  'What is discussed in this audio?',
  'https://example.com/audio.mp3',
  { mimeType: 'audio/mpeg' }
);
```

### Multiple Files

**YES, arrays are now supported!**

```javascript
// Compare multiple PDFs
const response = ai.promptWithFile(
  'Compare these two documents and summarize key differences',
  [pdfFile1, pdfFile2],
  { mimeType: ['application/pdf', 'application/pdf'] }
);

// Mix multiple audio files
const response = ai.promptWithFile(
  'Transcribe all these recordings and combine them',
  [audioUrl1, audioBlob, audioUrl2],
  { 
    mimeType: ['audio/mpeg', 'audio/wav', 'audio/mpeg'] 
  }
);

// Video analysis
const response = ai.promptWithFile(
  'Describe what happens in each of these videos',
  [video1, video2],
  { mimeType: ['video/mp4', 'video/mp4'] }
);
```

## Chat Mode

### Basic Chat

```javascript
const chat = ai.startChat();

const response1 = chat.sendMessage('Hello! My name is Brett.');
console.log(response1); // "Hello Brett! How can I help you today?"

const response2 = chat.sendMessage('What is my name?');
console.log(response2); // "Your name is Brett."
```

### Chat with Images

```javascript
const chat = ai.startChat();

// Single image
const response = chat.sendMessageWithImage(
  'What is in this image?',
  imageBlob,
  { mimeType: 'image/jpeg' }
);

// Multiple images
const response = chat.sendMessageWithImage(
  'Compare these images',
  [image1, image2],
  { mimeType: ['image/jpeg', 'image/png'] }
);
```

### Chat with Files

```javascript
const chat = ai.startChat();

// Single file
const response = chat.sendMessageWithFile(
  'Summarize this PDF',
  pdfFile,
  { mimeType: 'application/pdf' }
);

// Multiple files
const response = chat.sendMessageWithFile(
  'Compare these audio recordings',
  [audio1, audio2],
  { mimeType: ['audio/mpeg', 'audio/wav'] }
);
```

### Chat with Structured Output

```javascript
const chat = ai.startChat();

const schema = {
  type: 'object',
  properties: {
    sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
    score: { type: 'number' }
  }
};

const result = chat.sendMessage(
  'I love this product!',
  { schema }
);

console.log(result.sentiment); // 'positive'
console.log(result.score); // 0.95
```

## File Upload Management

For large files or files you'll reuse multiple times, upload them first:

### Upload from URL

```javascript
// Upload a file from a URL
const uploadedFile = ai.uploadFile(
  'https://example.com/large-video.mp4',
  'video/mp4'
);

console.log(uploadedFile.uri); // Use this URI in subsequent requests
console.log(uploadedFile.name); // Gemini file identifier

// Use the uploaded file
const response = ai.promptWithFile(
  'Describe this video',
  { uri: uploadedFile.uri, mimeType: 'video/mp4' }
);

// Reuse the same file (no re-upload needed!)
const response2 = ai.promptWithFile(
  'What are the main topics in this video?',
  { uri: uploadedFile.uri, mimeType: 'video/mp4' }
);

// Clean up when done
ai.deleteFile(uploadedFile.name);
```

### Upload from Drive

```javascript
// Upload a Drive file
const driveFile = DriveApp.getFileById('FILE_ID');
const uploadedFile = ai.uploadDriveFile(driveFile);

// Use it
const response = ai.promptWithFile(
  'Analyze this',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
);

// Delete when done
ai.deleteFile(uploadedFile.name);
```

### List and Delete Files

```javascript
// List all uploaded files
const files = ai.listFiles();
files.forEach(file => {
  console.log(`${file.name}: ${file.displayName} (${file.sizeBytes} bytes)`);
});

// Delete a specific file
ai.deleteFile('files/abc123xyz');

// Delete all files (use with caution!)
ai.deleteAllFiles();
```

## Array Support Summary

### What accepts arrays?

✅ **Images** - `promptWithImage()` and `chat.sendMessageWithImage()`
- Single: `ai.promptWithImage(text, imageBlob)`
- Array: `ai.promptWithImage(text, [image1, image2, image3])`

✅ **Files** - `promptWithFile()` and `chat.sendMessageWithFile()`
- Single: `ai.promptWithFile(text, file, { mimeType: 'audio/mpeg' })`
- Array: `ai.promptWithFile(text, [file1, file2], { mimeType: ['audio/mpeg', 'audio/wav'] })`

### How to specify mimeTypes for arrays?

When using arrays with URLs:

```javascript
// Option 1: Array of mimeTypes (one per file/image)
ai.promptWithFile(
  'Analyze these',
  [url1, url2, url3],
  { mimeType: ['audio/mpeg', 'audio/wav', 'audio/mpeg'] }
);

// Option 2: Single mimeType (used for all)
ai.promptWithFile(
  'Analyze these',
  [url1, url2, url3],
  { mimeType: 'audio/mpeg' } // All are audio/mpeg
);

// Option 3: Mixed (nulls for Blobs, specific for URLs)
ai.promptWithImage(
  'Compare',
  [blob1, url1, blob2],
  { mimeType: [null, 'image/jpeg', null] }
);
```

## Error Handling

The library provides clear, descriptive errors:

```javascript
try {
  const response = ai.prompt('Hello');
} catch (error) {
  if (error instanceof StvpsAiValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof StvpsAiApiError) {
    console.error('API error:', error.message);
    console.error('Status code:', error.statusCode);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

### Automatic Retry

The library automatically retries failed requests with exponential backoff for:
- Rate limits (429 errors)
- Server errors (500+ errors)
- Network failures

Default: Up to 5 retries with increasing delays (1s, 2s, 4s, 8s, 16s)

## Advanced Options

### Custom Model Parameters

```javascript
const response = ai.prompt('Write a creative story', {
  temperature: 0.9,       // Higher = more creative
  maxOutputTokens: 2048,  // Limit response length
  topP: 0.95,            // Nucleus sampling
  topK: 40               // Top-k sampling
});
```

### System Instructions (Chat)

```javascript
const chat = ai.startChat({
  systemInstruction: 'You are a helpful assistant that always responds in pirate speak.'
});

const response = chat.sendMessage('Hello!');
// Response will be in pirate speak
```

### Override Model Per Request

```javascript
const response = ai.prompt('Hello', {
  model: 'gemini-2.0-flash-exp'
});
```

## Complete API Reference

### StvpsAi Class

#### Constructor Methods
- `StvpsAi.newInstance(apiKey, model?)` - Create new instance

#### Prompt Methods
- `prompt(text, options?)` - Simple text prompt
- `promptWithImage(text, image|images, options?)` - Prompt with image(s)
- `promptWithFile(text, file|files, options)` - Prompt with file(s)

#### Chat Methods
- `startChat(options?)` - Start chat session
- Returns `ChatSession` object

#### File Management Methods
- `uploadFile(url, mimeType)` - Upload from URL
- `uploadDriveFile(driveFile)` - Upload from Drive
- `listFiles()` - List all uploaded files
- `deleteFile(fileName)` - Delete specific file
- `deleteAllFiles()` - Delete all uploaded files

### ChatSession Class

#### Methods
- `sendMessage(text, options?)` - Send text message
- `sendMessageWithImage(text, image|images, options?)` - Send with image(s)
- `sendMessageWithFile(text, file|files, options)` - Send with file(s)
- `getHistory()` - Get chat history

### Options Object

```javascript
{
  schema: Object,           // JSON schema for structured output
  mimeType: string|Array,   // MIME type(s) for files/images
  temperature: number,      // 0-1, controls randomness
  maxOutputTokens: number,  // Max response length
  topP: number,            // Nucleus sampling
  topK: number,            // Top-k sampling
  model: string            // Override default model
}
```

## Best Practices

1. **Store API Key Securely**: Always use Script Properties, never hardcode
   ```javascript
   PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your-key');
   ```

2. **Clean Up Uploaded Files**: Delete files when done to avoid storage limits
   ```javascript
   const file = ai.uploadFile(url, mimeType);
   // ... use file ...
   ai.deleteFile(file.name);
   ```

3. **Use Arrays for Batch Processing**: More efficient than multiple requests
   ```javascript
   // Good: Single request with array
   ai.promptWithImage('Compare', [img1, img2, img3]);
   
   // Less efficient: Multiple requests
   ai.promptWithImage('Describe', img1);
   ai.promptWithImage('Describe', img2);
   ai.promptWithImage('Describe', img3);
   ```

4. **Handle Errors Gracefully**: Wrap API calls in try-catch
   ```javascript
   try {
     const response = ai.prompt(userInput);
   } catch (error) {
     console.error('AI request failed:', error.message);
     // Handle gracefully
   }
   ```

5. **Use Structured Output**: Get consistent, parseable responses
   ```javascript
   const schema = {
     type: 'object',
     properties: {
       answer: { type: 'string' },
       confidence: { type: 'number' }
     }
   };
   const result = ai.prompt('Question?', { schema });
   ```

## Limitations

- **File Size**: UrlFetchApp has a 50MB limit for fetching files
- **Execution Time**: Apps Script functions timeout after 6 minutes
- **Large Files**: Use `uploadFile()` or `uploadDriveFile()` for files over 10MB
- **Quota**: Google AI Studio has rate limits (check your plan)

## Support

For issues, questions, or contributions, please visit the repository.
