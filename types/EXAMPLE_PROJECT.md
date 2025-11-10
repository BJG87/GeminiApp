# Example: Using GeminiApp Type Definitions in Your Project

This example shows how to set up a clasp project with full IntelliSense support for GeminiApp.

## Project Structure

```
my-stvpsai-project/
├── types/
│   └── geminiapp.d.ts          ← Copy from GeminiApp library
├── src/
│   ├── Code.js               ← Your main code
│   └── Config.js             ← Configuration
├── .clasp.json
├── .claspignore
└── tsconfig.json
```

## Setup Steps

### 1. Initialize Clasp Project

```bash
mkdir my-stvpsai-project
cd my-stvpsai-project
clasp create --type standalone --title "My GeminiApp Project"
```

### 2. Create Directory Structure

```bash
mkdir types
mkdir src
```

### 3. Copy Type Definitions

Copy `geminiapp.d.ts` from the GeminiApp library into your `types/` folder.

### 4. Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "lib": ["ES2019"],
    "experimentalDecorators": true,
    "checkJs": true,
    "allowJs": true,
    "noEmit": true,
    "strict": false,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ]
}
```

### 5. Create .claspignore

```
types/
tsconfig.json
.git/
.gitignore
README.md
node_modules/
```

### 6. Write Your Code with IntelliSense

Create `src/Code.js`:

```javascript
// @ts-check
/// <reference path="../types/geminiapp.d.ts" />

/**
 * Initialize the AI instance
 */
function getAi() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in Script Properties');
  }
  return newGeminiAppInstance(apiKey);
}

/**
 * Example 1: Simple text prompt
 */
function exampleSimplePrompt() {
  const ai = getAi();
  const response = ai.prompt("What is the capital of France?");
  console.log(response);
}

/**
 * Example 2: Structured output
 */
function exampleStructuredOutput() {
  const ai = getAi();
  
  /** @type {GeminiApp.Schema} */
  const schema = {
    type: 'object',
    properties: {
      capital: { type: 'string' },
      population: { type: 'number' },
      facts: { type: 'array', items: { type: 'string' } }
    }
  };
  
  const response = ai.prompt(
    "Tell me about Paris",
    { schema }
  );
  
  console.log(response.capital);
  console.log(response.population);
  console.log(response.facts);
}

/**
 * Example 3: Image analysis
 */
function exampleImageAnalysis() {
  const ai = getAi();
  
  // Using a Drive file ID (easiest - no mimeType needed)
  const driveImageId = "1abc...xyz";
  const response = ai.promptWithImage(
    "Describe this image in detail",
    driveImageId
  );
  
  console.log(response);
}

/**
 * Example 4: PDF analysis
 */
function examplePdfAnalysis() {
  const ai = getAi();
  
  const drivePdfId = "1def...xyz";
  
  /** @type {GeminiApp.Schema} */
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      keyPoints: { type: 'array', items: { type: 'string' } },
      pageCount: { type: 'number' }
    }
  };
  
  const analysis = ai.promptWithFile(
    "Analyze this document and provide key information",
    drivePdfId,
    { schema }
  );
  
  console.log(`Title: ${analysis.title}`);
  console.log(`Summary: ${analysis.summary}`);
  console.log(`Pages: ${analysis.pageCount}`);
  console.log('Key Points:', analysis.keyPoints);
}

/**
 * Example 5: Audio transcription
 */
function exampleAudioTranscription() {
  const ai = getAi();
  
  const driveAudioId = "1ghi...xyz";
  
  const transcript = ai.promptWithFile(
    "Transcribe this audio file accurately",
    driveAudioId
  );
  
  console.log(transcript);
}

/**
 * Example 6: Chat conversation
 */
function exampleChat() {
  const ai = getAi();
  
  const chat = ai.startChat();
  
  const r1 = chat.sendMessage("I'm learning about machine learning");
  console.log("AI:", r1);
  
  const r2 = chat.sendMessage("What are the key concepts I should know?");
  console.log("AI:", r2);
  
  const r3 = chat.sendMessage("Can you explain neural networks simply?");
  console.log("AI:", r3);
  
  // Get full conversation history
  const history = chat.getHistory();
  console.log(`Total messages: ${history.length}`);
}

/**
 * Example 7: File upload for reuse
 */
function exampleFileReuse() {
  const ai = getAi();
  
  // Upload once
  const driveFileId = "1jkl...xyz";
  const uploaded = ai.uploadFile(driveFileId);
  
  console.log(`Uploaded: ${uploaded.name}`);
  console.log(`URI: ${uploaded.uri}`);
  console.log(`Type: ${uploaded.mimeType}`);
  
  // Reuse multiple times
  const response1 = ai.promptWithFile(
    "Summarize this document",
    { uri: uploaded.uri, mimeType: uploaded.mimeType }
  );
  
  const response2 = ai.promptWithFile(
    "What are the main conclusions?",
    { uri: uploaded.uri, mimeType: uploaded.mimeType }
  );
  
  const response3 = ai.promptWithFile(
    "Extract key statistics",
    { uri: uploaded.uri, mimeType: uploaded.mimeType }
  );
  
  console.log("Summary:", response1);
  console.log("Conclusions:", response2);
  console.log("Statistics:", response3);
  
  // Clean up
  ai.deleteFile(uploaded.name);
  console.log("File deleted");
}

/**
 * Example 8: Multi-image comparison
 */
function exampleMultiImage() {
  const ai = getAi();
  
  const imageIds = [
    "1image1...xyz",
    "1image2...xyz",
    "1image3...xyz"
  ];
  
  /** @type {GeminiApp.Schema} */
  const schema = {
    type: 'object',
    properties: {
      similarities: { type: 'array', items: { type: 'string' } },
      differences: { type: 'array', items: { type: 'string' } },
      recommendation: { type: 'string' }
    }
  };
  
  const comparison = ai.promptWithImages(
    "Compare these images and identify similarities and differences",
    imageIds,
    { schema }
  );
  
  console.log("Similarities:", comparison.similarities);
  console.log("Differences:", comparison.differences);
  console.log("Recommendation:", comparison.recommendation);
}

/**
 * Example 10: Chat with image context
 */
function exampleChatWithImage() {
  const ai = getAi();
  
  const chat = ai.startChat();
  
  // First message with image
  const driveImageId = "1image...xyz";
  const r1 = chat.sendMessageWithImage(
    "What objects do you see in this image?",
    driveImageId
  );
  console.log("AI:", r1);
  
  // Follow-up questions about the same image
  const r2 = chat.sendMessage("What colors are most prominent?");
  console.log("AI:", r2);
  
  const r3 = chat.sendMessage("What mood does this convey?");
  console.log("AI:", r3);
}

/**
 * Example 11: Error handling
 */
function exampleErrorHandling() {
  const ai = getAi();
  
  try {
    // This will fail - invalid file ID
    const response = ai.promptWithFile(
      "Analyze this",
      "invalid-file-id"
    );
  } catch (error) {
    console.error("Error occurred:", error.message);
    // Handle the error appropriately
  }
  
  try {
    // This will fail - URL without mimeType
    const response = ai.promptWithFile(
      "Analyze this",
      "https://example.com/file.pdf"
      // Missing mimeType!
    );
  } catch (error) {
    console.error("Validation error:", error.message);
  }
}

/**
 * Utility: Clean up all uploaded files
 */
function cleanupUploadedFiles() {
  const ai = getAi();
  const { files } = ai.listFiles(100);
  
  console.log(`Found ${files.length} uploaded files`);
  
  if (files.length > 0) {
    ai.deleteAllFiles();
    console.log("All files deleted");
  }
}
```

### 7. Push to Apps Script

```bash
clasp push
```

### 8. Set API Key

```bash
clasp open
```

Then in Apps Script:
- Project Settings → Script Properties
- Add property: `GEMINI_API_KEY` = your API key

### 9. Run Functions

```bash
# Run from command line
clasp run exampleSimplePrompt

# Or open in browser and run
clasp open
```

## Benefits You Get

When you type in VS Code:

```javascript
const ai = getAi();
ai. // ← IntelliSense shows all methods!
```

You'll see autocomplete for:
- `prompt()`
- `promptWithImage()`
- `promptWithImages()`
- `promptWithFile()`
- `promptWithFiles()`
- `startChat()`
- `uploadFile()`
- `deleteFile()`
- etc.

And when you hover over any method, you'll see full documentation!

## Development Workflow

1. **Write code locally** with full IntelliSense in VS Code
2. **Test locally** if needed
3. **Push to Apps Script**: `clasp push`
4. **Run/test**: `clasp open` or `clasp run functionName`
5. **Iterate**: Make changes locally and push again

## Notes

- Type definitions **only work locally** with clasp/VS Code
- They **don't work** in the web-based Apps Script editor
- They **don't affect** your deployed code
- They're purely a **development tool** for better DX

---

Happy coding with full IntelliSense! 🚀
