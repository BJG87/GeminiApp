# GeminiApp Library - Complete Overview

## What You Have Now

Your Apps Script library is ready to publish! Here's what has been created:

### Core Library Files (in `/src/`)

1. **GeminiApp.js** - Main library with enhanced convenience methods:

   - `.prompt()` - Simple text prompts
   - `.promptWithImage()` - Analyze images
   - `.promptWithFile()` - Process PDFs, audio, etc.
   - `.getModel()` - Advanced model access
   - `.getModelFromCache()` - Use cached content

2. **GoogleAICacheManager.js** - Content caching for faster responses:

   - `.createCache()` - Create caches
   - `.listCaches()` - List all caches
   - `.getCache()` - Get specific cache
   - `.updateTTL()` - Update cache lifetime
   - `.deleteCache()` - Remove cache

3. **appsscript.json** - Project configuration with required scopes

### Documentation Files

1. **PUBLISHING_README.md** - Main documentation for users
2. **LIBRARY_USAGE.md** - Detailed API reference and examples
3. **docs/PUBLISHING.md** - Guide for you to publish the library

### Example Code

1. **samples/simple-library-usage/Code.js** - 12 complete examples:
   - Simple prompts
   - Image analysis
   - PDF processing
   - Chat conversations
   - Function calling
   - Batch processing
   - Google Sheets integration
   - Error handling
   - And more!

## How to Use in Your Projects

### Method 1: Simple Text Prompts

```javascript
function example() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt("Explain AI in simple terms");
  Logger.log(response);
}
```

### Method 2: With Images

```javascript
function analyzeImage() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const file = DriveApp.getFileById("FILE_ID");
  const response = genAI.promptWithImage("Describe this image", file);

  Logger.log(response);
}
```

### Method 3: With PDFs

```javascript
function processPDF() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const pdf = DriveApp.getFileById("PDF_ID");
  const response = genAI.promptWithFile("Summarize this document", pdf);

  Logger.log(response);
}
```

### Method 4: Chat Sessions

```javascript
function chat() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  let response = chat.sendMessage("What is Paris?");
  Logger.log(response.response.text());

  response = chat.sendMessage("What is its population?");
  Logger.log(response.response.text());
}
```

### Method 5: Structured Responses with JSON Schemas

```javascript
function structuredResponse() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  // Define a schema to enforce response format
  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
      hobbies: { type: "array", items: { type: "string" } },
    },
  };

  const response = genAI.prompt("Generate info about a fictional person", {
    responseSchema: schema,
  });

  // Response is automatically parsed as JSON
  Logger.log("Name: " + response.name);
  Logger.log("Age: " + response.age);
  Logger.log("Hobbies: " + response.hobbies.join(", "));
}
```

## Publishing Steps

### 1. Open Your Apps Script Project

- Make sure both `GeminiApp.js` and `GoogleAICacheManager.js` are in your project

### 2. Enable Library Mode

- Go to **Project Settings**
- The project will automatically be available as a library

### 3. Deploy as Library

- Click **Deploy** > **New deployment**
- Choose type: **Library**
- Add description
- Click **Deploy**

### 4. Get Your Script ID

- Copy the Script ID from Project Settings
- Share this with users

### 5. Users Install Your Library

Users add it to their projects:

```
1. Click + next to Libraries
2. Enter your Script ID
3. Select latest version
4. Set identifier to: GeminiApp
5. Click Add
```

## Key Features

### ✅ Simple API

No complex setup - just provide an API key and start prompting.

### ✅ Multiple Input Types

- Plain text
- Images (PNG, JPG, WEBP, etc.)
- PDFs
- Audio files
- Video files

### ✅ JSON Schema Support

Enforce structured responses with JSON schemas:

```javascript
const schema = {
  type: "object",
  properties: {
    items: { type: "array", items: { type: "string" } },
  },
};
const response = genAI.prompt("List 5 colors", { responseSchema: schema });
```

### ✅ Model Selection

```javascript
// Use default (gemini-1.5-flash)
const genAI = GeminiApp.newInstance(apiKey);

// Specify model
const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");
```

### ✅ Context Caching

Speed up repeated queries on large files by up to 10x:

```javascript
const cacheManager = GeminiApp.newCacheManager(apiKey);
const cache = cacheManager.createCache({
  model: "gemini-1.5-pro",
  fileUri: "gs://bucket/file.pdf",
  ttlSeconds: 3600,
});
```

### ✅ Advanced Features

- Chat sessions with context
- Function calling
- Custom safety settings
- Generation config (temperature, topK, etc.)
- Vertex AI support with service accounts

### ✅ Error Handling

Built-in retry logic and clear error messages:

```javascript
try {
  const response = genAI.prompt("Your prompt");
} catch (error) {
  Logger.log("Error: " + error.message);
}
```

## Use Cases

### 1. Content Generation

Generate blog posts, emails, descriptions, etc.

### 2. Data Analysis

Analyze spreadsheet data, sentiment analysis, categorization

### 3. Document Processing

Summarize PDFs, extract information, answer questions about documents

### 4. Image Analysis

Describe images, extract text, identify objects

### 5. Customer Support

Build chatbots, FAQ systems, automated responses

### 6. Code Generation

Generate Apps Script code, formulas, automation scripts

## Performance Tips

1. **Choose the Right Model**

   - `gemini-1.5-flash` - Fast and cost-effective (default)
   - `gemini-1.5-pro` - More capable for complex tasks

2. **Use Context Caching**

   - Cache large files you query multiple times
   - Reduces cost by ~90% for cached content

3. **Batch Operations**

   - Process multiple items in sequence
   - Consider rate limits

4. **Store API Keys Securely**
   ```javascript
   PropertiesService.getScriptProperties().setProperty(
     "GEMINI_API_KEY",
     "your-key"
   );
   ```

## Pricing

Gemini API is free for moderate use:

- **gemini-1.5-flash**: 15 RPM, 1M TPM, 1500 RPD free
- **gemini-1.5-pro**: 2 RPM, 32K TPM, 50 RPD free

For higher limits, see [Google AI Pricing](https://ai.google.dev/pricing)

## Support

- **Documentation**: See LIBRARY_USAGE.md
- **Examples**: See samples/simple-library-usage/Code.js
- **Issues**: Create GitHub issues for bugs
- **Community**: Google Apps Script forums

## Enums and Constants

Available through the library:

```javascript
GeminiApp.HarmCategory.HARM_CATEGORY_HATE_SPEECH;
GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
GeminiApp.HarmProbability.LOW;
GeminiApp.SchemaType.STRING;
GeminiApp.BlockReason.SAFETY;
GeminiApp.FinishReason.STOP;
```

## Advanced Configuration Example

```javascript
const genAI = GeminiApp.newInstance(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: GeminiApp.HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

const result = model.generateContent("Your prompt");
Logger.log(result.response.text());
```

## Next Steps

1. ✅ **Test the library** - Try all example functions
2. ✅ **Get an API key** - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
3. ✅ **Deploy as library** - Follow docs/PUBLISHING.md
4. ✅ **Share your Script ID** - Let others use it
5. ✅ **Create your first project** - Build something awesome!

## Quick Reference

| Method                        | Purpose         | Example                                  |
| ----------------------------- | --------------- | ---------------------------------------- |
| `newInstance(apiKey)`         | Create instance | `GeminiApp.newInstance('key')`           |
| `prompt(text)`                | Simple prompt   | `genAI.prompt('Hello')`                  |
| `promptWithImage(text, file)` | Image analysis  | `genAI.promptWithImage('Describe', img)` |
| `promptWithFile(text, file)`  | File processing | `genAI.promptWithFile('Summarize', pdf)` |
| `getModel(name)`              | Get model       | `genAI.getModel('gemini-1.5-pro')`       |
| `newCacheManager(apiKey)`     | Cache manager   | `GeminiApp.newCacheManager('key')`       |

---

**You're ready to publish! 🚀**

Start by following the steps in `docs/PUBLISHING.md` to make your library available to the Apps Script community.
