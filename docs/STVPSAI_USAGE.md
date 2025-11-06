# StvpsAi Usage Guide

## Return Types

All StvpsAi methods return one of two types depending on whether a schema is provided:

| Schema Provided? | Return Type | Example |
|-----------------|-------------|---------|
| ❌ No | `string` | Plain text response from the AI |
| ✅ Yes | `Object` | Parsed JSON object matching your schema |

This applies to **ALL** prompt and chat methods:
- `prompt()` / `sendMessage()`
- `promptWithImage()` / `sendMessageWithImage()`
- `promptWithFile()` / `sendMessageWithFile()`

## Schema Parameter Placement

**CRITICAL:** The `schema` must be in the **options** parameter (the last parameter):

### ✅ CORRECT Examples

```javascript
// Simple prompt
const result = ai.prompt('List 3 colors', { schema });

// With image
const result = ai.promptWithImage('Describe image', imageBlob, { schema });

// With file
const result = ai.promptWithFile('Summarize PDF', pdfBlob, { schema });

// Chat with file
const result = chat.sendMessageWithFile('Transcribe audio', audioFile, { schema });

// With uploaded file
const uploadedFile = ai.uploadFile(myBlob, 'audio/mpeg');
const result = chat.sendMessageWithFile(
  'Transcribe this',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType },
  { schema }  // Schema in third parameter!
);
```

### ❌ INCORRECT Examples

```javascript
// DON'T put schema in the file parameter!
const result = ai.promptWithFile('Transcribe', { file: audioFile, schema }); // ✗

// DON'T mix file properties with schema!
const result = chat.sendMessageWithFile(
  'Transcribe',
  { uri: file.uri, mimeType: file.mimeType, schema }  // ✗
);
```

## Complete Chat with Structured Output Example

```javascript
// Initialize AI
const ai = StvpsAi.newInstance(apiKey);

// Upload a file (e.g., audio)
const audioBlob = DriveApp.getFileById('FILE_ID').getBlob();
const uploadedFile = ai.uploadFile(audioBlob, 'audio/mpeg');

// Define your schema
const schema = {
  type: 'object',
  properties: {
    transcription: { 
      type: 'string',
      description: 'Exact transcription of the audio'
    },
    wordCount: { 
      type: 'number',
      description: 'Total number of words spoken'
    }
  },
  required: ['transcription', 'wordCount']
};

// Start a chat
const chat = ai.startChat('You are a transcription assistant');

// Send message with file AND schema
const result = chat.sendMessageWithFile(
  'Please transcribe this audio file exactly as spoken',
  { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType },
  { schema }  // Schema goes here in options!
);

// Result is now a parsed object (not a string)
console.log(result.transcription);  // Access the transcription
console.log(result.wordCount);      // Access the word count

// Clean up
ai.deleteFile(uploadedFile.name);
```

## Quick Reference: Method Signatures

```javascript
// Simple prompts
ai.prompt(text, options?)
ai.promptWithImage(text, image, options?)
ai.promptWithFile(text, file, options?)

// Chat methods
chat.sendMessage(text, options?)
chat.sendMessageWithImage(text, image, options?)
chat.sendMessageWithFile(text, file, options?)

// Options object can include:
options = {
  schema: {},           // JSON schema for structured output
  mimeType: string,     // Required for URLs/file IDs
  temperature: number,  // 0-1
  maxOutputTokens: number,
  topP: number,
  topK: number
}
```

## File Input Formats

All file/image methods accept:
- **Blob**: `DriveApp.getFileById(id).getBlob()`
- **URL**: Any public URL (must provide `mimeType` option)
- **File ID**: Google Drive file ID (must provide `mimeType` option)
- **URI Object**: `{ uri: 'file_uri', mimeType: 'audio/mpeg' }` from `uploadFile()`
- **Arrays**: Any combination of the above in an array

## Common Mistakes

1. ❌ Putting schema in the wrong parameter
2. ❌ Forgetting mimeType when using URLs or file IDs
3. ❌ Trying to access properties on a string response (no schema provided)
4. ❌ Expecting a string when schema was provided (returns object)
