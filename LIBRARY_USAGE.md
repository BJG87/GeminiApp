# Using StvpsAi as an Apps Script Library

## Installation

1. **Add the Library to Your Project**
   - In your Apps Script project, click the `+` next to "Libraries"
   - Enter the Script ID: `[YOUR_SCRIPT_ID_HERE]`
   - Select the latest version
   - The identifier will be `StvpsAi`

2. **Enable IntelliSense/Autocomplete** (Recommended)
   - Copy the entire contents of `types/StvpsAi-stub.js` from this repository
   - In your Apps Script project, create a new file called `StvpsAi-autocomplete`
   - Paste the stub code
   - **Important**: This file is only for autocomplete - don't call functions from it!

## Basic Usage

### Setup

```javascript
// Get API key from Script Properties
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// Create an AI instance
const ai = StvpsAi.newInstance(API_KEY);

// Or specify a model
const ai = StvpsAi.newInstance(API_KEY, 'gemini-2.5-pro');
```

### Simple Text Prompts

```javascript
// Text response
const response = ai.prompt('Tell me a joke');
console.log(response);

// Structured JSON response
const schema = {
  joke: 'string',
  category: 'string'
};
const json = ai.prompt('Tell me a joke', { schema });
console.log(json.joke);
```

### Prompts with Images

```javascript
// Single image from URL
const response = ai.promptWithImage(
  'What is in this image?',
  'https://example.com/image.jpg',
  { mimeType: 'image/jpeg' }
);

// Single image from Drive
const fileId = '1abc...';
const response = ai.promptWithImage(
  'Describe this image',
  fileId
);

// Multiple images
const images = [
  'https://example.com/img1.jpg',
  'https://example.com/img2.jpg'
];
const response = ai.promptWithImage(
  'Compare these images',
  images,
  { mimeType: ['image/jpeg', 'image/jpeg'] }
);
```

### Prompts with Files (PDFs, Audio, Video)

```javascript
// PDF from URL
const response = ai.promptWithFile(
  'Summarize this document',
  'https://example.com/doc.pdf',
  { mimeType: 'application/pdf' }
);

// Audio from Drive
const response = ai.promptWithFile(
  'Transcribe this audio',
  'DRIVE_FILE_ID_HERE'
);

// Multiple files
const files = [
  { uri: 'files/abc123', mimeType: 'application/pdf' },
  { uri: 'files/def456', mimeType: 'audio/mpeg' }
];
const response = ai.promptWithFile(
  'Analyze these files',
  files
);
```

### Chat Sessions

```javascript
// Start a chat
const chat = ai.startChat();

// Send messages
const response1 = chat.sendMessage('Hello!');
console.log(response1);

const response2 = chat.sendMessage('What did I just say?');
console.log(response2); // AI remembers context

// Chat with images
const response3 = chat.sendMessageWithImage(
  'What is in this image?',
  'IMAGE_URL',
  { mimeType: 'image/jpeg' }
);

// Chat with files
const response4 = chat.sendMessageWithFile(
  'Analyze this document',
  'DRIVE_FILE_ID'
);

// View history
console.log(chat.history);
```

### File Upload & Reuse

```javascript
// Upload a file
const uploadedFile = ai.uploadFile(
  DriveApp.getFileById('DRIVE_ID'),
  'My Document'
);

// Reuse the uploaded file multiple times
const response1 = ai.promptWithFile(
  'Summarize page 1',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
);

const response2 = ai.promptWithFile(
  'Summarize page 2',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
);

// Delete when done
ai.deleteFile(uploadedFile.name);
```

### File Management

```javascript
// List all uploaded files
const files = ai.listFiles();
files.forEach(file => {
  console.log(`${file.name} - ${file.mimeType} - ${file.sizeBytes} bytes`);
});

// Delete specific files
ai.deleteFiles(['files/abc123', 'files/def456']);

// Delete all files
ai.deleteAllFiles();
```

## Error Handling

The library includes automatic retry with exponential backoff for:
- Rate limit errors (429)
- Server errors (500, 503)
- Temporary network issues

```javascript
try {
  const response = ai.prompt('Hello');
  console.log(response);
} catch (error) {
  if (error.name === 'StvpsAiApiError') {
    console.error('API Error:', error.message);
  } else if (error.name === 'StvpsAiValidationError') {
    console.error('Validation Error:', error.message);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

## Structured Output Schemas

When providing a schema, the AI will return a parsed JSON object:

```javascript
const schema = {
  title: 'string',
  summary: 'string',
  keyPoints: ['string'],
  sentiment: 'string'
};

const result = ai.prompt('Analyze this text...', { schema });
// result is an object with the structure above
console.log(result.title);
console.log(result.keyPoints[0]);
```

## Google Workspace Files

The library automatically handles Google Workspace files (Docs, Sheets, Slides):

```javascript
// Using URL
const response = ai.promptWithFile(
  'Summarize this document',
  'https://docs.google.com/document/d/YOUR_DOC_ID/edit'
);

// Using file ID
const response = ai.promptWithFile(
  'Analyze this spreadsheet',
  'YOUR_SHEETS_FILE_ID'
);

// Files must be accessible to the script (public or shared with service account)
```

## Best Practices

1. **Store API Key Securely**: Use Script Properties, not hardcoded strings
2. **Cleanup Uploaded Files**: Delete files when done to avoid hitting quotas
3. **Use Appropriate Models**: `gemini-2.5-flash` for speed, `gemini-2.5-pro` for quality
4. **Handle Errors**: Wrap API calls in try-catch blocks
5. **Monitor Queue**: Check stats regularly if using background processing
6. **Limit File Sizes**: Large files may timeout - use uploaded files for reuse

## Support

For issues or questions, please file an issue on the GitHub repository.
