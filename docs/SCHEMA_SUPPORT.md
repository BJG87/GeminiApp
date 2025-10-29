# JSON Schema Support in GeminiApp

## Overview

The GeminiApp library now supports **JSON schemas** to enforce structured responses from the Gemini API. This makes it easy to get consistently formatted data that you can parse and use directly in your applications.

## What's Been Added

### 1. Schema Support in All Prompt Methods

All convenience methods now accept `responseSchema` and `responseMimeType` options:

- ✅ `.prompt(text, options)` - Simple text prompts
- ✅ `.promptWithImage(text, file, options)` - Image analysis
- ✅ `.promptWithFile(text, file, options)` - PDF/audio/video processing

### 2. Schema Support in Chat Sessions

Chat sessions can now use schemas on a per-message basis:

```javascript
const response = chat.sendMessage("Your question", {
  responseSchema: schema,
  responseMimeType: "application/json",
});
```

### 3. Schema Helper Method

New convenience method to create schemas easily:

```javascript
const schema = genAI.createSchema(
  { name: { type: "string" }, age: { type: "integer" } },
  ["name"], // required fields
  "Person schema" // description
);
```

### 4. Automatic JSON Parsing

When you provide a schema, responses are automatically parsed as JSON objects, so you can use them directly without calling `JSON.parse()`.

## How It Works

### Basic Usage

```javascript
const genAI = GeminiApp.newInstance(apiKey);

const schema = {
  type: "object",
  properties: {
    colors: { type: "array", items: { type: "string" } },
  },
};

const response = genAI.prompt("List 3 primary colors", {
  responseSchema: schema,
});

// Response is automatically parsed
Logger.log(response.colors); // ["red", "blue", "yellow"]
```

### With Images

```javascript
const schema = {
  type: "object",
  properties: {
    objects: { type: "array", items: { type: "string" } },
    mood: { type: "string" },
  },
};

const file = DriveApp.getFileById("IMAGE_ID");
const response = genAI.promptWithImage("Analyze this image", file, {
  responseSchema: schema,
});

Logger.log("Objects:", response.objects);
Logger.log("Mood:", response.mood);
```

### With PDFs

```javascript
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
  },
};

const pdf = DriveApp.getFileById("PDF_ID");
const response = genAI.promptWithFile("Extract info from this PDF", pdf, {
  responseSchema: schema,
});

Logger.log("Title:", response.title);
response.keyPoints.forEach((point) => Logger.log("•", point));
```

### In Chat Sessions

```javascript
const model = genAI.getModel("gemini-1.5-pro");
const chat = model.startChat();

const schema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    confidence: { type: "number" },
  },
};

const response = chat.sendMessage("What is 2+2?", {
  responseSchema: schema,
  responseMimeType: "application/json",
});

const data = JSON.parse(response.response.text());
Logger.log("Answer:", data.answer);
Logger.log("Confidence:", data.confidence);
```

## Schema Types

### Simple Types

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
    score: { type: 'number' },
    active: { type: 'boolean' }
  }
}
```

### Arrays

```javascript
{
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' }
    }
  }
}
```

### Nested Objects

```javascript
{
  type: 'object',
  properties: {
    person: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' }
          }
        }
      }
    }
  }
}
```

### Enums (Restricted Values)

```javascript
{
  type: 'object',
  properties: {
    sentiment: {
      type: 'string',
      enum: ['positive', 'negative', 'neutral']
    },
    priority: {
      type: 'string',
      enum: ['high', 'medium', 'low']
    }
  }
}
```

### Required Fields

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['name'] // email is optional
}
```

## Use Cases

### 1. Data Extraction from Documents

Extract structured information from PDFs:

```javascript
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    author: { type: "string" },
    date: { type: "string" },
    summary: { type: "string" },
  },
};
```

### 2. Sentiment Analysis

Get consistent sentiment data:

```javascript
const schema = {
  type: "object",
  properties: {
    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    keywords: { type: "array", items: { type: "string" } },
  },
};
```

### 3. Image Analysis

Get structured image descriptions:

```javascript
const schema = {
  type: "object",
  properties: {
    description: { type: "string" },
    objects: { type: "array", items: { type: "string" } },
    colors: { type: "array", items: { type: "string" } },
    mood: { type: "string" },
  },
};
```

### 4. Content Generation

Generate structured content:

```javascript
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  },
};
```

### 5. Google Sheets Integration

Process and categorize sheet data:

```javascript
const schema = {
  type: "object",
  properties: {
    category: { type: "string" },
    priority: { type: "string", enum: ["high", "medium", "low"] },
    tags: { type: "array", items: { type: "string" } },
  },
};

// Use this to categorize each row in your sheet
```

## Examples

See these files for complete examples:

- **`samples/schema-examples/Code.js`** - 12 comprehensive schema examples
- **`tests/schema-tests.js`** - Test suite for schema functionality

## Benefits

### ✅ Consistent Format

Get data in the exact format you need every time

### ✅ Type Safety

Ensure fields have the correct types (string, number, boolean, etc.)

### ✅ Easier Parsing

No need to manually parse and validate responses

### ✅ Better Integration

Directly use response data in your code without transformation

### ✅ Enum Validation

Restrict responses to specific allowed values

### ✅ Required Fields

Ensure critical fields are always present

## Notes

1. **Automatic Parsing**: When you use `responseSchema`, the library automatically parses the JSON response for you.

2. **MIME Type**: If you provide a `responseSchema`, the library automatically sets `responseMimeType` to `'application/json'` unless you specify otherwise.

3. **Fallback**: If JSON parsing fails, the library returns the raw text instead of throwing an error.

4. **Chat Sessions**: In chat sessions, you need to manually parse the response:

   ```javascript
   const data = JSON.parse(response.response.text());
   ```

5. **Model Compatibility**: Schemas work best with `gemini-1.5-pro` and `gemini-1.5-flash` models.

## Documentation

For more details, see:

- **LIBRARY_USAGE.md** - Complete API reference
- **GETTING_STARTED.md** - Quick start guide
- **samples/schema-examples/Code.js** - Example code

---

With schema support, you can now build more robust integrations that reliably extract and process structured data from the Gemini API! 🎉
