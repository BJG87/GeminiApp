/**
 * Examples demonstrating how to use file URLs with GeminiApp
 * 
 * These examples show how to pass files via URL instead of uploading them as inline data.
 * This is useful for:
 * - Large files hosted on cloud storage
 * - Publicly accessible images, videos, PDFs, etc.
 * - Avoiding base64 encoding overhead
 */

/**
 * Get API key from Script Properties
 */
function getApiKeyForExamples_() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

/**
 * Example 1: Simple image analysis with URL
 */
function exampleImageWithUrl() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  // Pass image as URL object with url and mimeType
  const response = genAI.promptWithImage(
    'Describe what you see in this image',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );
  
  Logger.log(response);
}

/**
 * Example 2: PDF analysis with URL
 */
function examplePdfWithUrl() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  // Pass PDF as URL object
  const response = genAI.promptWithFile(
    'Summarize the key points in this document',
    {
      url: 'https://example.com/document.pdf',
      mimeType: 'application/pdf'
    }
  );
  
  Logger.log(response);
}

/**
 * Example 3: Chat session with URL image
 */
function exampleChatWithUrlImage() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  const model = genAI.getModel('gemini-1.5-flash');
  const chat = model.startChat();
  
  // Send message with URL image
  const response = chat.sendMessageWithImage(
    'What colors are prominent in this image?',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );
  
  Logger.log(response.response.text());
  
  // Follow-up question
  const response2 = chat.sendMessage('Can you suggest similar color palettes?');
  Logger.log(response2.response.text());
}

/**
 * Example 4: Structured output with URL file
 */
function exampleStructuredOutputWithUrl() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  const schema = genAI.createSchema({
    objects: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of objects visible in the image'
    },
    colors: {
      type: 'array',
      items: { type: 'string' },
      description: 'Main colors in the image'
    }
  }, ['objects', 'colors']);
  
  const response = genAI.promptWithImage(
    'Analyze this image and list the objects and colors you see',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    },
    {
      responseSchema: schema
    }
  );
  
  Logger.log(JSON.stringify(response, null, 2));
}

/**
 * Example 5: Video analysis with URL
 */
function exampleVideoWithUrl() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_(), 'gemini-1.5-pro');
  
  const response = genAI.promptWithFile(
    'Describe what happens in this video',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/videos/sample.mp4',
      mimeType: 'video/mp4'
    }
  );
  
  Logger.log(response);
}

/**
 * Example 6: Audio transcription with URL
 */
function exampleAudioTranscription() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  const response = genAI.promptWithFile(
    'Please transcribe the audio in this file.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/data/State_of_the_Union_Address_30_January_1961.mp3',
      mimeType: 'audio/mp3'
    }
  );
  
  Logger.log(response);
}

/**
 * Example 7: Audio transcription with structured output
 */
function exampleAudioTranscriptionWithSchema() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  const schema = genAI.createSchema({
    transcription: {
      type: 'string',
      description: 'The complete transcription of the audio'
    },
    summary: {
      type: 'string',
      description: 'A brief summary of the main points'
    },
    keyTopics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Main topics discussed'
    }
  }, ['transcription', 'summary', 'keyTopics']);
  
  const response = genAI.promptWithFile(
    'Transcribe this audio and provide a summary with key topics.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/data/State_of_the_Union_Address_30_January_1961.mp3',
      mimeType: 'audio/mp3'
    },
    {
      responseSchema: schema,
      model: 'gemini-1.5-pro'
    }
  );
  
  Logger.log(JSON.stringify(response, null, 2));
}

/**
 * Example 8: Comparison - Drive file vs URL
 * Shows both methods work with the same API
 */
function exampleDriveVsUrl() {
  const genAI = GeminiApp.newInstance(getApiKeyForExamples_());
  
  // Method 1: Using Google Drive file (existing behavior)
  const driveFile = DriveApp.getFileById('YOUR_FILE_ID');
  const response1 = genAI.promptWithImage('What is in this image?', driveFile);
  Logger.log('Drive response:', response1);
  
  // Method 2: Using URL (new feature)
  const response2 = genAI.promptWithImage(
    'What is in this image?',
    {
      url: 'https://example.com/image.jpg',
      mimeType: 'image/jpeg'
    }
  );
  Logger.log('URL response:', response2);
}
