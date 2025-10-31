/**
 * Chat with Files and Images Examples
 *
 * These examples show how to use the simplified chat methods
 * for sending messages with files and images.
 */

// Store your API key in Script Properties
// PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your_key_here');

/**
 * Example 1: Simple chat with an image
 */
function example1_ChatWithImage() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  // Get image from Drive
  const imageFile = DriveApp.getFileById("YOUR_IMAGE_FILE_ID");

  // Send message with image using the helper method
  const response = chat.sendMessageWithImage(
    "What objects do you see in this image?",
    imageFile
  );

  Logger.log(response.response.text());
}

/**
 * Example 2: Multi-turn conversation with images
 */
function example2_MultiTurnWithImages() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // First message with first image
  const image1 = DriveApp.getFileById("IMAGE1_ID");
  const response1 = chat.sendMessageWithImage("Describe this image", image1);
  Logger.log("First image: " + response1.response.text());

  // Follow-up question (no image, context maintained)
  const response2 = chat.sendMessage("What colors are most prominent?");
  Logger.log("Colors: " + response2.response.text());

  // Another image for comparison
  const image2 = DriveApp.getFileById("IMAGE2_ID");
  const response3 = chat.sendMessageWithImage(
    "Compare this image to the previous one",
    image2
  );
  Logger.log("Comparison: " + response3.response.text());
}

/**
 * Example 3: Chat with PDF document
 */
function example3_ChatWithPDF() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // Get PDF from Drive
  const pdfFile = DriveApp.getFileById("YOUR_PDF_FILE_ID");

  // First question about the PDF
  const response1 = chat.sendMessageWithFile(
    "What is the main topic of this document?",
    pdfFile
  );
  Logger.log("Topic: " + response1.response.text());

  // Follow-up questions (PDF context maintained)
  const response2 = chat.sendMessage("What are the key conclusions?");
  Logger.log("Conclusions: " + response2.response.text());

  const response3 = chat.sendMessage("Summarize the methodology section");
  Logger.log("Methodology: " + response3.response.text());
}

/**
 * Example 4: Chat with image and JSON schema
 */
function example4_ChatImageWithSchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  // Define schema for structured response
  const schema = {
    type: "object",
    properties: {
      objects: { type: "array", items: { type: "string" } },
      colors: { type: "array", items: { type: "string" } },
      scene_type: { type: "string" },
      mood: {
        type: "string",
        enum: ["happy", "sad", "neutral", "energetic", "calm"],
      },
    },
  };

  const imageFile = DriveApp.getFileById("YOUR_IMAGE_FILE_ID");

  const response = chat.sendMessageWithImage(
    "Analyze this image and provide structured information",
    imageFile,
    {
      responseSchema: schema,
      responseMimeType: "application/json",
    }
  );

  const data = JSON.parse(response.response.text());
  Logger.log("Objects: " + data.objects.join(", "));
  Logger.log("Colors: " + data.colors.join(", "));
  Logger.log("Scene: " + data.scene_type);
  Logger.log("Mood: " + data.mood);
}

/**
 * Example 5: Chat with PDF and structured extraction
 */
function example5_ChatPDFWithSchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      authors: { type: "array", items: { type: "string" } },
      year: { type: "integer" },
      abstract: { type: "string" },
      key_findings: { type: "array", items: { type: "string" } },
    },
  };

  const pdfFile = DriveApp.getFileById("YOUR_PDF_FILE_ID");

  const response = chat.sendMessageWithFile(
    "Extract the key metadata and findings from this research paper",
    pdfFile,
    {
      responseSchema: schema,
      responseMimeType: "application/json",
    }
  );

  const data = JSON.parse(response.response.text());
  Logger.log("Title: " + data.title);
  Logger.log("Authors: " + data.authors.join(", "));
  Logger.log("Year: " + data.year);
  Logger.log("\nAbstract: " + data.abstract);
  Logger.log("\nKey Findings:");
  data.key_findings.forEach((finding, i) => {
    Logger.log(`${i + 1}. ${finding}`);
  });
}

/**
 * Example 6: Mixed content chat - text, images, and files
 */
function example6_MixedContentChat() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // Start with text
  chat.sendMessage("I need help analyzing some documents and images");

  // Send an image
  const screenshot = DriveApp.getFileById("SCREENSHOT_ID");
  const response1 = chat.sendMessageWithImage(
    "This is a screenshot from our app. What UI improvements do you suggest?",
    screenshot
  );
  Logger.log("UI Feedback: " + response1.response.text());

  // Send a PDF
  const report = DriveApp.getFileById("REPORT_ID");
  const response2 = chat.sendMessageWithFile(
    "Based on the UI feedback, does this report address those concerns?",
    report
  );
  Logger.log("Report Analysis: " + response2.response.text());

  // Follow-up text
  const response3 = chat.sendMessage(
    "Create an action plan based on both analyses"
  );
  Logger.log("Action Plan: " + response3.response.text());
}

/**
 * Example 7: Chat with multiple images for comparison
 */
function example7_CompareMultipleImages() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  const before = DriveApp.getFileById("BEFORE_IMAGE_ID");
  const after = DriveApp.getFileById("AFTER_IMAGE_ID");

  // Send first image
  chat.sendMessageWithImage('This is the "before" state', before);

  // Send second image and ask for comparison
  const response = chat.sendMessageWithImage(
    'This is the "after" state. What changed between the two images?',
    after
  );

  Logger.log("Changes detected: " + response.response.text());
}

/**
 * Example 8: Batch process images in a folder
 */
function example8_BatchProcessImages() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  // Get all images from a folder
  const folder = DriveApp.getFolderById("YOUR_FOLDER_ID");
  const files = folder.getFilesByType(MimeType.JPEG);

  const results = [];

  while (files.hasNext()) {
    const file = files.next();
    const chat = model.startChat(); // New chat for each image

    const response = chat.sendMessageWithImage(
      "Describe this image in one sentence",
      file
    );

    results.push({
      filename: file.getName(),
      description: response.response.text(),
    });
  }

  // Log all results
  results.forEach((result) => {
    Logger.log(`${result.filename}: ${result.description}`);
  });
}

/**
 * Example 9: Chat with audio file
 */
function example9_ChatWithAudio() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  const audioFile = DriveApp.getFileById("YOUR_AUDIO_FILE_ID");

  // Transcribe and analyze
  const response1 = chat.sendMessageWithFile(
    "Transcribe this audio and identify the main topics discussed",
    audioFile
  );
  Logger.log("Transcription: " + response1.response.text());

  // Follow-up analysis
  const response2 = chat.sendMessage("What was the speaker's tone?");
  Logger.log("Tone: " + response2.response.text());
}

/**
 * Example 10: Error handling with files
 */
function example10_ErrorHandling() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat();

  try {
    const file = DriveApp.getFileById("YOUR_FILE_ID");

    const response = chat.sendMessageWithFile("Analyze this document", file);

    Logger.log("Success: " + response.response.text());
  } catch (error) {
    Logger.log("Error: " + error.message);

    // Handle specific error cases
    if (error.message.includes("File not found")) {
      Logger.log("The file ID is invalid or you don't have access");
    } else if (error.message.includes("403")) {
      Logger.log("Check your API key and permissions");
    }
  }
}
