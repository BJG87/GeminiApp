/**
 * Simple Examples for GeminiApp Library
 *
 * These examples show common use cases for the GeminiApp library
 * in Google Apps Script projects.
 */

// Store your API key in Script Properties for security
// PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your_key_here');

/**
 * Example 1: Simple text prompt
 */
function example1_SimplePrompt() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt("Explain quantum computing in one paragraph");
  Logger.log(response);
}

/**
 * Example 2: Using a specific model
 */
function example2_SpecificModel() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");

  const response = genAI.prompt("Write a creative haiku about coding");
  Logger.log(response);
}

/**
 * Example 3: Analyze an image from Google Drive
 */
function example3_AnalyzeImage() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  // Get an image from your Google Drive
  const imageFile = DriveApp.getFileById("YOUR_IMAGE_FILE_ID");

  const response = genAI.promptWithImage(
    "Describe what you see in this image in detail",
    imageFile
  );

  Logger.log(response);
}

/**
 * Example 4: Summarize a PDF document
 */
function example4_SummarizePDF() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");

  // Get a PDF from your Google Drive
  const pdfFile = DriveApp.getFileById("YOUR_PDF_FILE_ID");

  const response = genAI.promptWithFile(
    "Provide a comprehensive summary of this document, highlighting the key points",
    pdfFile
  );

  Logger.log(response);
}

/**
 * Example 5: Chat conversation with context
 */
function example5_ChatConversation() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-flash");

  const chat = model.startChat({
    history: [],
  });

  // First message
  let response = chat.sendMessage("What is the capital of France?");
  Logger.log("Q1: " + response.response.text());

  // Follow-up message (maintains context)
  response = chat.sendMessage("What is its approximate population?");
  Logger.log("Q2: " + response.response.text());

  // Another follow-up
  response = chat.sendMessage("What are its famous landmarks?");
  Logger.log("Q3: " + response.response.text());
}

/**
 * Example 6: Using generation config for creative output
 */
function example6_CreativeOutput() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt(
    "Write a short story about a robot learning to paint",
    {
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 1.0, // Higher temperature for more creativity
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    }
  );

  Logger.log(response);
}

/**
 * Example 7: Function calling for structured data
 */
function getCurrentWeather(location) {
  // This would typically call a weather API
  // For demo purposes, returning mock data
  return JSON.stringify({
    location: location,
    temperature: 72,
    conditions: "Sunny",
    humidity: 45,
  });
}

function example7_FunctionCalling() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // Define the function for the model to call
  const weatherFunction = chat
    .newFunction()
    .setName("getCurrentWeather")
    .setDescription("Get the current weather for a specific location")
    .addParameter(
      "location",
      "string",
      "The city and state, e.g. San Francisco, CA",
      false
    );

  chat.addFunction(weatherFunction);

  const response = chat.sendMessage(
    "What is the weather like in Paris, France?"
  );
  Logger.log(response.response.text());
}

/**
 * Example 8: Batch processing multiple prompts
 */
function example8_BatchProcessing() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-flash");

  const questions = [
    "What is photosynthesis?",
    "Explain the water cycle",
    "What causes seasons?",
    "How do magnets work?",
  ];

  const answers = questions.map((question) => {
    const response = genAI.prompt(question);
    return { question, answer: response };
  });

  answers.forEach((qa) => {
    Logger.log(`Q: ${qa.question}`);
    Logger.log(`A: ${qa.answer}\n`);
  });
}

/**
 * Example 9: Safety settings configuration
 */
function example9_SafetySettings() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: GeminiApp.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: GeminiApp.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = model.generateContent("Tell me a story");
  Logger.log(result.response.text());
}

/**
 * Example 10: Error handling
 */
function example10_ErrorHandling() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const response = genAI.prompt("Explain the theory of relativity");
    Logger.log(response);
  } catch (error) {
    if (error.message.includes("GoogleGenerativeAI")) {
      Logger.log("AI Error: " + error.message);
    } else {
      Logger.log("Unexpected Error: " + error.message);
    }
  }
}

/**
 * Example 11: Process Google Sheet data with AI
 */
function example11_ProcessSheetData() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey, "gemini-1.5-flash");

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet
    .getRange("A2:A")
    .getValues()
    .filter((row) => row[0] !== "");

  // Process each row with AI
  const results = data.map((row) => {
    const text = row[0];
    const prompt = `Analyze the sentiment of this text (positive, negative, or neutral): "${text}"`;
    return genAI.prompt(prompt);
  });

  // Write results back to sheet
  sheet.getRange(2, 2, results.length, 1).setValues(results.map((r) => [r]));
}

/**
 * Example 12: Using Vertex AI with service account
 */
function example12_VertexAI() {
  const genAI = GeminiApp.newInstance({
    region: "us-central1",
    project_id: "your-gcp-project-id",
    type: "service_account",
    private_key:
      PropertiesService.getScriptProperties().getProperty("GCP_PRIVATE_KEY"),
    client_email:
      PropertiesService.getScriptProperties().getProperty("GCP_CLIENT_EMAIL"),
  });

  const response = genAI.prompt("Hello from Vertex AI!");
  Logger.log(response);
}
