# GeminiApp Library Usage Guide

A Google Apps Script library for working with Google's Gemini AI models. This library provides simple, well-documented methods for making AI calls with text, images, and other file types.

## Installation

1. In your Google Apps Script project, go to **Resources** > **Libraries**
2. Add the library using the Script ID: `[YOUR_SCRIPT_ID_HERE]`
3. Select the latest version
4. Set the identifier to `GeminiApp`

## Quick Start

### Basic Text Prompt

```javascript
function simpleTextPrompt() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt("Explain quantum computing in simple terms");
  Logger.log(response);
}
```

### Using a Specific Model

```javascript
function promptWithModel() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");

  const response = genAI.prompt("Write a haiku about coding");
  Logger.log(response);
}
```

### Prompt with an Image

```javascript
function promptWithImage() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  // From Google Drive
  const file = DriveApp.getFileById("YOUR_FILE_ID");
  const response = genAI.promptWithImage(
    "What do you see in this image?",
    file
  );
  Logger.log(response);
}
```

### Prompt with a PDF

```javascript
function promptWithPDF() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const pdfFile = DriveApp.getFileById("YOUR_PDF_ID");
  const response = genAI.promptWithFile(
    "Summarize the key points from this document",
    pdfFile
  );
  Logger.log(response);
}
```

### Using Context Caching (for faster responses with large files)

```javascript
function useContextCaching() {
  const apiKey = "YOUR_API_KEY";

  // Step 1: Create a cache manager
  const cacheManager = GeminiApp.newCacheManager(apiKey);

  // Step 2: Create a cache with your content
  const pdfFile = DriveApp.getFileById("YOUR_PDF_ID");
  const cache = cacheManager.createCache({
    model: "gemini-1.5-pro",
    displayName: "My PDF Cache",
    fileUri: "gs://your-bucket/document.pdf", // Your Cloud Storage URI
    ttlSeconds: 3600, // Cache for 1 hour
  });

  // Step 3: Use the cached content for faster queries
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModelFromCache(cache);

  // Now all queries use the cache - much faster!
  const response1 = model.prompt("Summarize page 5");
  const response2 = model.prompt("What are the main conclusions?");

  Logger.log(response1);
  Logger.log(response2);
}
```

### Using JSON Schemas for Structured Responses

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
      hobbies: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["name", "age"],
  };

  const response = genAI.prompt(
    "Generate information about a fictional person",
    {
      responseSchema: schema,
      responseMimeType: "application/json",
    }
  );

  // Response is automatically parsed as JSON
  Logger.log("Name: " + response.name);
  Logger.log("Age: " + response.age);
  Logger.log("Hobbies: " + response.hobbies.join(", "));
}
```

## Advanced Usage

### Chat Sessions

```javascript
function chatConversation() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat({
    history: [],
  });

  // First message
  let response = chat.sendMessage("Hello! What is the capital of France?");
  Logger.log(response.response.text());

  // Follow-up message (maintains context)
  response = chat.sendMessage("What is its population?");
  Logger.log(response.response.text());

  // Get full history
  Logger.log(chat.getHistory());
}
```

### Chat with Images

```javascript
function chatWithImage() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  // Send message with image using helper method
  const imageFile = DriveApp.getFileById("YOUR_IMAGE_ID");
  const response = chat.sendMessageWithImage(
    "What objects do you see in this image?",
    imageFile
  );

  Logger.log(response.response.text());

  // Follow-up without image (context maintained)
  const response2 = chat.sendMessage("What colors are most prominent?");
  Logger.log(response2.response.text());
}
```

### Chat with PDFs and Other Files

```javascript
function chatWithPDF() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // Send message with PDF
  const pdfFile = DriveApp.getFileById("YOUR_PDF_ID");
  const response = chat.sendMessageWithFile(
    "What is the main topic of this document?",
    pdfFile
  );

  Logger.log(response.response.text());

  // Ask follow-up questions about the PDF
  const response2 = chat.sendMessage("Summarize the key findings");
  Logger.log(response2.response.text());
}
```

### Function Calling

```javascript
function getCurrentWeather(location) {
  // Your implementation
  return `Weather in ${location}: Sunny, 72°F`;
}

function useFunctionCalling() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // Define a function the model can call
  const weatherFunction = chat
    .newFunction()
    .setName("getCurrentWeather")
    .setDescription("Get the current weather for a location")
    .addParameter("location", "string", "The city name", false);

  chat.addFunction(weatherFunction);

  const response = chat.sendMessage("What is the weather in Paris?");
  Logger.log(response.response.text());
}
```

### Custom Configuration

```javascript
function advancedConfiguration() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const model = genAI.getModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: GeminiApp.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const response = model.generateContent("Write a creative story");
  Logger.log(response.response.text());
}
```

### Vertex AI (Service Account)

```javascript
function useVertexAI() {
  const genAI = GeminiApp.newInstance({
    region: "us-central1",
    project_id: "your-project-id",
    type: "service_account",
    private_key: "YOUR_PRIVATE_KEY",
    client_email: "YOUR_SERVICE_ACCOUNT_EMAIL",
  });

  const response = genAI.prompt("Hello from Vertex AI!");
  Logger.log(response);
}
```

## Working with JSON Schemas

Schemas allow you to enforce structured responses from the AI, making it easy to parse and use the data in your applications.

### Basic Schema Example

```javascript
function basicSchema() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      colors: {
        type: "array",
        items: { type: "string" },
      },
      count: { type: "integer" },
    },
  };

  const response = genAI.prompt("List 5 colors", {
    responseSchema: schema,
  });

  // Automatically parsed as JSON
  Logger.log(response.colors); // Array of colors
  Logger.log(response.count); // Number
}
```

### Schema with Images

```javascript
function schemaWithImage() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      objects: { type: "array", items: { type: "string" } },
      description: { type: "string" },
      mood: { type: "string", enum: ["happy", "sad", "neutral", "energetic"] },
    },
  };

  const file = DriveApp.getFileById("IMAGE_ID");
  const response = genAI.promptWithImage("Analyze this image", file, {
    responseSchema: schema,
  });

  Logger.log("Objects: " + response.objects.join(", "));
  Logger.log("Mood: " + response.mood);
}
```

### Schema with PDFs

```javascript
function schemaWithPDF() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      keyPoints: { type: "array", items: { type: "string" } },
      sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
    },
  };

  const pdf = DriveApp.getFileById("PDF_ID");
  const response = genAI.promptWithFile("Analyze this document", pdf, {
    responseSchema: schema,
  });

  Logger.log("Title: " + response.title);
  response.keyPoints.forEach((point) => Logger.log("- " + point));
}
```

### Schema Helper Method

```javascript
function useSchemaHelper() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  // Use createSchema helper for easier schema creation
  const schema = genAI.createSchema(
    {
      name: { type: "string", description: "Person's name" },
      age: { type: "integer", description: "Person's age" },
      email: { type: "string", description: "Email address" },
    },
    ["name", "age"], // required fields
    "Person information schema"
  );

  const response = genAI.prompt("Generate a fictional person", {
    responseSchema: schema,
  });

  Logger.log(response.name);
  Logger.log(response.age);
}
```

### Schemas in Chat Sessions

```javascript
function schemaInChat() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");
  const chat = model.startChat();

  const schema = {
    type: "object",
    properties: {
      answer: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
  };

  const response = chat.sendMessage("What is the capital of France?", {
    responseSchema: schema,
    responseMimeType: "application/json",
  });

  const data = JSON.parse(response.response.text());
  Logger.log("Answer: " + data.answer);
  Logger.log("Confidence: " + data.confidence * 100 + "%");
}
```

### Complex Nested Schemas

```javascript
function complexSchema() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      company: { type: "string" },
      employees: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
          },
          required: ["name", "role"],
        },
      },
    },
  };

  const response = genAI.prompt(
    "Create a fictional tech company with 3 employees",
    { responseSchema: schema }
  );

  Logger.log("Company: " + response.company);
  response.employees.forEach((emp) => {
    Logger.log(`${emp.name} - ${emp.role}`);
    Logger.log("Skills: " + emp.skills.join(", "));
  });
}
```

## API Reference

### Main Classes

#### `GeminiApp.newInstance(options, defaultModel?)`

Creates a new Gemini AI instance.

**Parameters:**

- `options` (string | object): API key string or configuration object
  - If string: Your Google AI API key
  - If object:
    - `apiKey` (string): Your API key
    - `region` (string): Vertex AI region
    - `project_id` (string): Vertex AI project ID
    - `type` (string): Authentication type ('service_account')
    - `private_key` (string): Service account private key
    - `client_email` (string): Service account email
- `defaultModel` (string, optional): Default model name (e.g., 'gemini-1.5-pro')

**Returns:** GoogleGenerativeAI instance

#### `GeminiApp.newCacheManager(options)`

Creates a cache manager for context caching.

**Parameters:**

- `options` (string | object): API key or configuration object (same as newInstance)

**Returns:** GoogleAICacheManager instance

### Instance Methods

#### `.prompt(text, options?)`

Simple text prompt.

**Parameters:**

- `text` (string): Your prompt text
- `options` (object, optional): Request options
  - `model` (string): Override default model
  - `generationConfig` (object): Generation configuration
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type (e.g., 'application/json')
  - `requestOptions` (object): Additional request options

**Returns:** string | object - The model's response (automatically parsed if schema is provided)

**Example:**

```javascript
// Simple text response
const response = genAI.prompt("Explain AI");

// With schema for structured response
const response = genAI.prompt("List 3 colors", {
  responseSchema: {
    type: "object",
    properties: {
      colors: { type: "array", items: { type: "string" } },
    },
  },
});
```

#### `.promptWithImage(text, imageFile, options?)`

Prompt with an image file.

**Parameters:**

- `text` (string): Your prompt text
- `imageFile` (GoogleAppsScript.Drive.File): Drive file object
- `options` (object, optional): Request options
  - `model` (string): Override default model
  - `generationConfig` (object): Generation configuration
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type
  - `requestOptions` (object): Additional request options

**Returns:** string | object - The model's response (automatically parsed if schema is provided)

- `options` (object, optional): Request options

**Returns:** string - The model's response

#### `.promptWithFile(text, file, options?)`

Prompt with any file type (PDF, audio, video, etc.).

**Parameters:**

- `text` (string): Your prompt text
- `file` (GoogleAppsScript.Drive.File): Drive file object
- `options` (object, optional): Request options
  - `model` (string): Override default model
  - `generationConfig` (object): Generation configuration
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type
  - `requestOptions` (object): Additional request options

**Returns:** string | object - The model's response (automatically parsed if schema is provided)

#### `.getModel(modelParams)`

Get a generative model instance for advanced usage.

**Parameters:**

- `modelParams` (string | object): Model name or configuration object

**Returns:** GenerativeModel instance

#### `.createSchema(properties, required?, description?)`

Helper method to create a JSON schema for structured responses.

**Parameters:**

- `properties` (object): Schema properties definition (key-value pairs)
- `required` (array, optional): Array of required field names
- `description` (string, optional): Schema description

**Returns:** object - A properly formatted JSON schema

**Example:**

```javascript
const schema = genAI.createSchema(
  {
    name: { type: "string" },
    age: { type: "integer" },
  },
  ["name"], // required fields
  "Person schema"
);
```

#### `.getModelFromCache(cachedContent, modelParams?, requestOptions?)`

Create a model from cached content.

**Parameters:**

- `cachedContent` (object): Cached content object
- `modelParams` (object, optional): Additional model parameters
- `requestOptions` (object, optional): Request options

**Returns:** GenerativeModel instance

### ChatSession Methods

These methods are available on the chat session object returned by `model.startChat()`.

#### `.sendMessage(text, requestOptions?)`

Send a message in the chat session.

**Parameters:**

- `text` (string): Your message text
- `requestOptions` (object, optional): Request options
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type
  - Other model configuration options

**Returns:** object - Response object with `text()` method

**Example:**

```javascript
const chat = model.startChat();
const response = chat.sendMessage("Hello!");
Logger.log(response.text());
```

#### `.sendMessageWithImage(text, imageFile, requestOptions?)`

Send a message with an image file in the chat session.

**Parameters:**

- `text` (string): Your message text
- `imageFile` (GoogleAppsScript.Drive.File | GoogleAppsScript.Base.Blob): Drive file or blob
- `requestOptions` (object, optional): Request options
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type
  - Other model configuration options

**Returns:** object - Response object with `text()` method

**Example:**

```javascript
const chat = model.startChat();
const file = DriveApp.getFileById("FILE_ID");
const response = chat.sendMessageWithImage("What's in this image?", file);
Logger.log(response.text());
```

#### `.sendMessageWithFile(text, file, requestOptions?)`

Send a message with any file type (PDF, audio, video, etc.) in the chat session.

**Parameters:**

- `text` (string): Your message text
- `file` (GoogleAppsScript.Drive.File | GoogleAppsScript.Base.Blob): Drive file or blob
- `requestOptions` (object, optional): Request options
  - `responseSchema` (object): JSON schema to enforce response format
  - `responseMimeType` (string): Response MIME type
  - Other model configuration options

**Returns:** object - Response object with `text()` method

**Example:**

```javascript
const chat = model.startChat();
const pdf = DriveApp.getFileById("PDF_FILE_ID");
const response = chat.sendMessageWithFile("Summarize this document", pdf);
Logger.log(response.text());
```

#### `.getHistory()`

Get the full conversation history.

**Returns:** array - Array of message objects with `role` and `parts` properties

**Example:**

```javascript
const history = chat.getHistory();
history.forEach((msg) => {
  Logger.log(`${msg.role}: ${JSON.stringify(msg.parts)}`);
});
```

### Cache Manager Methods

#### `.createCache(options)`

Create a new content cache.

**Parameters:**

- `options` (object):
  - `model` (string): Model name
  - `contents` (array): Content to cache
  - `ttlSeconds` (number): Time to live in seconds
  - `displayName` (string, optional): Cache display name

**Returns:** Cache object

#### `.listCaches(options?)`

List all caches.

**Parameters:**

- `options` (object, optional):
  - `pageSize` (number): Number of results
  - `pageToken` (string): Pagination token

**Returns:** Array of cache objects

#### `.getCache(name)`

Get a specific cache.

**Parameters:**

- `name` (string): Cache name

**Returns:** Cache object

#### `.updateCache(name, updateParams)`

Update a cache.

**Parameters:**

- `name` (string): Cache name
- `updateParams` (object): Update parameters

**Returns:** Updated cache object

#### `.deleteCache(name)`

Delete a cache.

**Parameters:**

- `name` (string): Cache name

## Constants

### Available Models

- `gemini-1.5-pro` - Most capable model
- `gemini-1.5-flash` - Faster, lower cost
- `gemini-1.0-pro` - Legacy model

### Enums

- `GeminiApp.HarmCategory` - Content harm categories
- `GeminiApp.HarmBlockThreshold` - Safety thresholds
- `GeminiApp.HarmProbability` - Harm probability levels
- `GeminiApp.SchemaType` - Schema data types
- `GeminiApp.BlockReason` - Block reasons
- `GeminiApp.FinishReason` - Completion reasons

## Error Handling

```javascript
function handleErrors() {
  const apiKey = "YOUR_API_KEY";
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const response = genAI.prompt("Your prompt here");
    Logger.log(response);
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      Logger.log("AI Error: " + error.message);
    } else if (error.name === "GoogleGenerativeAIFetchError") {
      Logger.log("Network Error: " + error.status + " - " + error.statusText);
    } else {
      Logger.log("Unexpected Error: " + error.message);
    }
  }
}
```

## Best Practices

1. **Store API Keys Securely**: Use Script Properties instead of hardcoding

   ```javascript
   PropertiesService.getScriptProperties().setProperty(
     "GEMINI_API_KEY",
     "your_key"
   );
   const apiKey =
     PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
   ```

2. **Use Context Caching**: For large files you query multiple times, caching can reduce costs by 90%

3. **Choose the Right Model**:

   - Use `gemini-1.5-flash` for quick, simple tasks
   - Use `gemini-1.5-pro` for complex reasoning

4. **Handle Rate Limits**: The library includes automatic retry logic for rate limits

5. **Validate Responses**: Always check for errors and handle safety blocks appropriately

## Support & Resources

- [Google AI Documentation](https://ai.google.dev/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [GitHub Repository](https://github.com/BJG87/GeminiApp)

## License

Apache License 2.0
