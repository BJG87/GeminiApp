# StvpsAi TypeScript Definitions

This directory contains TypeScript type definitions for the StvpsAi library. These definitions provide **full IntelliSense and autocomplete** support when using the library in your clasp projects.

## ⚠️ Important: Apps Script Editor vs Clasp

- **Apps Script Editor**: Type definitions **DO NOT** work in the web-based Apps Script editor
- **Clasp/Local Development**: Type definitions **ONLY** work when developing locally with clasp and VS Code (or other TypeScript-aware IDEs)

## Setup Instructions

### 1. Install Clasp (if not already installed)

```bash
npm install -g @google/clasp
clasp login
```

### 2. Create or Clone Your Apps Script Project

```bash
# Create a new project
clasp create --type standalone --title "My Project"

# OR clone an existing project
clasp clone <scriptId>
```

### 3. Copy Type Definitions to Your Project

Copy the `stvpsai.d.ts` file to a `types/` folder in your project:

```
your-project/
├── types/
│   └── stvpsai.d.ts
├── src/
│   └── Code.js
├── .clasp.json
└── tsconfig.json (optional but recommended)
```

### 4. Configure TypeScript (Recommended)

Create a `tsconfig.json` in your project root:

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

### 5. Enable Type Checking in Your Files

Add these lines at the top of your `.js` or `.gs` files:

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

// Now you get full autocomplete!
const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
const ai = StvpsAi.newInstance(apiKey);

// IntelliSense will show all available methods
const response = ai.prompt("Hello!"); // ✓ Autocomplete works!
```

## Usage Examples with IntelliSense

### Example 1: Simple Prompt

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

function example1() {
  const ai = StvpsAi.newInstance('your-api-key');
  
  // Type 'ai.' and IntelliSense will show all methods:
  // - prompt()
  // - promptWithImage()
  // - promptWithImages()
  // - promptWithFile()
  // - promptWithFiles()
  // - startChat()
  // - uploadFile()
  // - etc.
  
  const response = ai.prompt("Tell me a joke");
  console.log(response);
}
```

### Example 2: Structured Output with Schema

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

function example2() {
  const ai = StvpsAi.newInstance('your-api-key');
  
  /** @type {StvpsAiSchema} */
  const schema = {
    type: 'object',
    properties: {
      colors: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  };
  
  // IntelliSense knows this returns string | object
  const response = ai.prompt("List 3 colors", { schema });
  console.log(response.colors); // If schema provided, it's an object
}
```

### Example 3: Image Analysis

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

function example3() {
  const ai = StvpsAi.newInstance('your-api-key');
  
  const imageUrl = "https://example.com/image.jpg";
  
  // IntelliSense will show required parameters and options
  const response = ai.promptWithImage(
    "What's in this image?",
    imageUrl,
    { mimeType: "image/jpeg" } // Options autocomplete too!
  );
  
  console.log(response);
}
```

### Example 4: Chat Session

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

function example4() {
  const ai = StvpsAi.newInstance('your-api-key');
  
  // IntelliSense shows ChatSession type and its methods
  const chat = ai.startChat();
  
  // Type 'chat.' for autocomplete:
  // - sendMessage()
  // - sendMessageWithImage()
  // - sendMessageWithImages()
  // - sendMessageWithFile()
  // - sendMessageWithFiles()
  // - getHistory()
  // - clearHistory()
  
  const response1 = chat.sendMessage("What's 2+2?");
  const response2 = chat.sendMessage("Now multiply that by 3");
  
  console.log(response1);
  console.log(response2);
}
```

### Example 5: File Upload and Reuse

```javascript
// @ts-check
/// <reference path="../types/stvpsai.d.ts" />

function example5() {
  const ai = StvpsAi.newInstance('your-api-key');
  
  const driveFileId = "1abc...xyz";
  
  // IntelliSense shows UploadedFile return type
  const uploaded = ai.uploadFile(driveFileId);
  
  // IntelliSense knows uploaded.uri and uploaded.mimeType exist
  const response = ai.promptWithFile(
    "Summarize this document",
    { uri: uploaded.uri, mimeType: uploaded.mimeType }
  );
  
  console.log(response);
  
  // Don't forget to clean up
  ai.deleteFile(uploaded.name);
}
```

## What You Get with IntelliSense

1. **Method Autocomplete**: Type `ai.` and see all available methods
2. **Parameter Hints**: See what parameters each method expects
3. **Type Information**: Know what type each method returns
4. **Documentation**: Hover over methods to see JSDoc comments
5. **Error Detection**: Red squiggly lines for type mismatches
6. **Schema Definitions**: Autocomplete for schema properties

## Common Workflows

### Workflow 1: Developing Locally with Clasp

```bash
# 1. Edit your code locally with full IntelliSense
code src/Code.js

# 2. Push to Apps Script when ready
clasp push

# 3. Test in Apps Script
clasp open
```

### Workflow 2: Quick Testing

```bash
# Run a function directly from command line
clasp run functionName
```

## Troubleshooting

### IntelliSense Not Working?

1. **Check file path**: Make sure the reference path is correct
   ```javascript
   /// <reference path="../types/stvpsai.d.ts" />
   ```

2. **Enable type checking**: Add `// @ts-check` at the top of your file

3. **Reload VS Code**: Sometimes you need to reload the window
   - Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
   - Type "Reload Window"

4. **Check tsconfig.json**: Make sure types folder is included

### Types Not Available in Apps Script Editor?

This is expected. Type definitions only work in local development with clasp, not in the web-based Apps Script editor.

## File Structure Reference

```
your-clasp-project/
├── types/
│   ├── stvpsai.d.ts          ← Type definitions
│   └── README.md             ← This file
├── src/
│   ├── Code.js               ← Your code with type hints
│   └── OtherFile.js
├── .clasp.json               ← Clasp configuration
├── .claspignore              ← Files to ignore when pushing
├── tsconfig.json             ← TypeScript configuration
└── package.json              ← (optional) npm dependencies
```

## Benefits of Using Type Definitions

✅ **Faster Development**: No need to remember exact method names  
✅ **Fewer Errors**: Catch type mistakes before running  
✅ **Better Documentation**: Inline docs right in your editor  
✅ **Easier Maintenance**: Know what each function expects  
✅ **Professional Workflow**: Modern IDE experience for Apps Script

## Learn More

- [Clasp Documentation](https://github.com/google/clasp)
- [TypeScript in Apps Script](https://developers.google.com/apps-script/guides/typescript)
- [VS Code with Clasp](https://yagisanatode.com/2019/04/01/working-with-google-apps-script-in-visual-studio-code-using-clasp/)

---

**Note**: Remember that type definitions are a development-time tool. They don't affect your deployed Apps Script code, but they make writing that code much easier and less error-prone!
