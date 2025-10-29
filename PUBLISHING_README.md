# GeminiApp - Google Apps Script Library for Gemini AI

A comprehensive Google Apps Script library that provides simple, well-documented methods for working with Google's Gemini AI models. Perfect for quickly integrating AI capabilities into your Apps Script projects without boilerplate code.

## Features

✨ **Simple Interface** - Easy-to-use methods for common AI tasks  
📝 **Text Prompts** - Quick text-based AI interactions  
🖼️ **Image Analysis** - Analyze images from Google Drive  
📄 **File Processing** - Work with PDFs, audio, video, and more  
💬 **Chat Sessions** - Maintain conversational context  
⚡ **Context Caching** - Speed up responses and reduce costs for large files  
🔧 **Function Calling** - Enable the AI to call your custom functions  
🔐 **Multiple Auth Methods** - API key or Vertex AI service accounts  
🛡️ **Type Safe** - Full JSDoc documentation for autocomplete

## Installation

### As a Library (Recommended)

1. Open your Google Apps Script project
2. Click on **Resources** > **Libraries** (or **+** next to Libraries in new editor)
3. Enter the Script ID: `YOUR_SCRIPT_ID_HERE`
4. Select the latest version
5. Set the identifier to `GeminiApp`
6. Click **Add**

### Getting an API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Store it securely in Script Properties:
   ```javascript
   PropertiesService.getScriptProperties().setProperty(
     "GEMINI_API_KEY",
     "your-key-here"
   );
   ```

## Quick Start

### Simple Text Prompt

```javascript
function quickStart() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt("Explain quantum computing in simple terms");
  Logger.log(response);
}
```

### Analyze an Image

```javascript
function analyzeImage() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const imageFile = DriveApp.getFileById("YOUR_FILE_ID");
  const response = genAI.promptWithImage(
    "What do you see in this image?",
    imageFile
  );

  Logger.log(response);
}
```

### Chat with Context

```javascript
function chatExample() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  let response = chat.sendMessage("What is the capital of France?");
  Logger.log(response.response.text());

  response = chat.sendMessage("What is its population?");
  Logger.log(response.response.text());
}
```

## Available Models

- **`gemini-1.5-pro`** - Most capable model, best for complex tasks
- **`gemini-1.5-flash`** - Fast and efficient, great for most tasks (default)
- **`gemini-1.0-pro`** - Legacy model

## Common Use Cases

### Summarize a PDF Document

```javascript
function summarizePDF() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");

  const pdfFile = DriveApp.getFileById("PDF_FILE_ID");
  const response = genAI.promptWithFile(
    "Provide a comprehensive summary with key points",
    pdfFile
  );

  Logger.log(response);
}
```

### Process Google Sheet Data

```javascript
function analyzeSentiment() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getRange("A2:A").getValues();

  data.forEach((row, index) => {
    if (row[0]) {
      const sentiment = genAI.prompt(
        `Analyze sentiment (positive/negative/neutral): "${row[0]}"`
      );
      sheet.getRange(index + 2, 2).setValue(sentiment);
    }
  });
}
```

### Context Caching for Large Files

```javascript
function useCaching() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  // Create cache manager
  const cacheManager = GeminiApp.newCacheManager(apiKey);

  // Create a cache (must use Cloud Storage URI for large files)
  const cache = cacheManager.create({
    model: "gemini-1.5-pro",
    contents: [
      {
        parts: [
          {
            fileData: {
              fileUri: "gs://your-bucket/large-document.pdf",
              mimeType: "application/pdf",
            },
          },
        ],
      },
    ],
    ttlSeconds: 3600,
    displayName: "Document Cache",
  });

  // Use the cache for faster queries
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModelFromCache(cache);

  const response = model.generateContent("Summarize the document");
  Logger.log(response.response.text());
}
```

## API Reference

### Main Methods

#### `GeminiApp.newInstance(apiKey, model?)`

Creates a new instance of the library.

**Parameters:**

- `apiKey` (string | object): Your API key or config object
- `model` (string, optional): Default model name

**Returns:** GoogleGenerativeAI instance

#### `.prompt(text, options?)`

Simple text prompt.

**Parameters:**

- `text` (string): Your prompt
- `options` (object, optional):
  - `model` (string): Override default model
  - `generationConfig` (object): Generation settings

**Returns:** string

#### `.promptWithImage(text, imageFile, options?)`

Prompt with an image.

**Parameters:**

- `text` (string): Your prompt
- `imageFile` (File | Blob): Image from Drive
- `options` (object, optional): Request options

**Returns:** string

#### `.promptWithFile(text, file, options?)`

Prompt with any file type (PDF, audio, etc.).

**Parameters:**

- `text` (string): Your prompt
- `file` (File | Blob): File from Drive
- `options` (object, optional): Request options

**Returns:** string

#### `.getModel(modelName)`

Get a model for advanced usage.

**Parameters:**

- `modelName` (string): Model name

**Returns:** GenerativeModel instance

### Advanced Configuration

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7, // 0.0-2.0, controls randomness
    topK: 40, // Top-k sampling
    topP: 0.95, // Nucleus sampling
    maxOutputTokens: 1024, // Max response length
  },
  safetySettings: [
    {
      category: GeminiApp.HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});
```

## Error Handling

```javascript
try {
  const response = genAI.prompt("Your prompt here");
  Logger.log(response);
} catch (error) {
  Logger.log("Error: " + error.message);
  // Handle the error appropriately
}
```

## Best Practices

1. **Store API Keys Securely**: Always use Script Properties
2. **Choose the Right Model**: Use `flash` for speed, `pro` for quality
3. **Use Context Caching**: For repeated queries on large files
4. **Handle Rate Limits**: The library includes automatic retries
5. **Monitor Quotas**: Check your usage in Google AI Studio

## Examples

See the `samples/simple-library-usage/` folder for comprehensive examples including:

- Basic prompts
- Image analysis
- PDF processing
- Chat conversations
- Function calling
- Batch processing
- Google Sheets integration

## Documentation

For complete documentation, see [LIBRARY_USAGE.md](LIBRARY_USAGE.md)

## Authentication Options

### API Key (Recommended for most users)

```javascript
const genAI = GeminiApp.newInstance("YOUR_API_KEY");
```

### Vertex AI with Service Account

```javascript
const genAI = GeminiApp.newInstance({
  region: "us-central1",
  project_id: "your-project-id",
  type: "service_account",
  private_key: "YOUR_PRIVATE_KEY",
  client_email: "YOUR_SERVICE_ACCOUNT_EMAIL",
});
```

## Supported File Types

- **Images**: PNG, JPG, WEBP, HEIC, HEIF
- **Documents**: PDF, TXT
- **Audio**: WAV, MP3, AIFF, AAC, OGG, FLAC
- **Video**: MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GPP

## Pricing

Gemini API pricing varies by model:

- **gemini-1.5-flash**: Most cost-effective
- **gemini-1.5-pro**: Higher cost, better quality
- **Context Caching**: Reduces costs by ~90% for cached tokens

Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)

## Support

- [Google AI Documentation](https://ai.google.dev/docs)
- [GitHub Repository](https://github.com/BJG87/GeminiApp)
- [Report Issues](https://github.com/BJG87/GeminiApp/issues)

## License

Apache License 2.0

## Credits

This library includes components derived from:

- [Google AI JavaScript SDK](https://github.com/google/generative-ai-js/)
- [ChatGPTApp](https://github.com/scriptit-fr/ChatGPTApp)

---

Made with ❤️ for the Google Apps Script community
