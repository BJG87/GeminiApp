/**
 * Schema Examples for GeminiApp Library
 *
 * These examples demonstrate how to use JSON schemas to enforce
 * structured responses from the Gemini API.
 *
 * Schemas ensure the AI returns data in a specific format,
 * making it easier to parse and use in your applications.
 */

// Store your API key in Script Properties
// PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'your_key_here');

/**
 * Example 1: Basic schema for structured data
 */
function example1_BasicSchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  // Define a schema for a person object
  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
      email: { type: "string" },
    },
    required: ["name", "age"],
  };

  const response = genAI.prompt(
    "Generate information about a fictional software engineer named Alice",
    {
      responseSchema: schema,
      responseMimeType: "application/json",
    }
  );

  // Response is automatically parsed as JSON
  Logger.log("Name: " + response.name);
  Logger.log("Age: " + response.age);
  Logger.log("Email: " + response.email);
  Logger.log("Full object: " + JSON.stringify(response, null, 2));
}

/**
 * Example 2: Array schema for lists
 */
function example2_ArraySchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      colors: {
        type: "array",
        items: { type: "string" },
      },
    },
  };

  const response = genAI.prompt("List 5 primary and secondary colors", {
    responseSchema: schema,
  });

  Logger.log("Colors: " + response.colors.join(", "));

  // Use the array directly
  response.colors.forEach((color, index) => {
    Logger.log(`${index + 1}. ${color}`);
  });
}

/**
 * Example 3: Nested schema for complex data
 */
function example3_NestedSchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
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
            skills: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  };

  const response = genAI.prompt(
    "Create a fictional tech startup with 3 employees",
    { responseSchema: schema }
  );

  Logger.log("Company: " + response.company);
  response.employees.forEach((emp) => {
    Logger.log(`\n${emp.name} - ${emp.role}`);
    Logger.log("Skills: " + emp.skills.join(", "));
  });
}

/**
 * Example 4: Schema with helper method
 */
function example4_SchemaHelper() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  // Use the helper method to create a schema
  const schema = genAI.createSchema(
    {
      title: { type: "string", description: "Article title" },
      summary: { type: "string", description: "Brief summary" },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Relevant tags",
      },
    },
    ["title", "summary"], // required fields
    "Article metadata"
  );

  const response = genAI.prompt(
    "Generate metadata for an article about quantum computing",
    { responseSchema: schema }
  );

  Logger.log("Title: " + response.title);
  Logger.log("Summary: " + response.summary);
  Logger.log("Tags: " + response.tags.join(", "));
}

/**
 * Example 5: Schema with image analysis
 */
function example5_SchemaWithImage() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      description: { type: "string" },
      objects: {
        type: "array",
        items: { type: "string" },
      },
      colors: {
        type: "array",
        items: { type: "string" },
      },
      mood: { type: "string" },
    },
  };

  const imageFile = DriveApp.getFileById("YOUR_IMAGE_FILE_ID");

  const response = genAI.promptWithImage(
    "Analyze this image and provide structured information",
    imageFile,
    { responseSchema: schema }
  );

  Logger.log("Description: " + response.description);
  Logger.log("Objects: " + response.objects.join(", "));
  Logger.log("Colors: " + response.colors.join(", "));
  Logger.log("Mood: " + response.mood);
}

/**
 * Example 6: Schema with PDF extraction
 */
function example6_SchemaWithPDF() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      mainTopics: {
        type: "array",
        items: { type: "string" },
      },
      keyFindings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            finding: { type: "string" },
            importance: { type: "string", enum: ["high", "medium", "low"] },
          },
        },
      },
    },
  };

  const pdfFile = DriveApp.getFileById("YOUR_PDF_FILE_ID");

  const response = genAI.promptWithFile(
    "Extract structured information from this document",
    pdfFile,
    { responseSchema: schema }
  );

  Logger.log("Title: " + response.title);
  Logger.log("Author: " + response.author);
  Logger.log("\nMain Topics:");
  response.mainTopics.forEach((topic) => Logger.log("- " + topic));

  Logger.log("\nKey Findings:");
  response.keyFindings.forEach((finding) => {
    Logger.log(`[${finding.importance.toUpperCase()}] ${finding.finding}`);
  });
}

/**
 * Example 7: Schema in chat sessions
 */
function example7_SchemaInChat() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);
  const model = genAI.getModel("gemini-1.5-pro");

  const chat = model.startChat();

  // First message with schema
  const schema1 = {
    type: "object",
    properties: {
      city: { type: "string" },
      country: { type: "string" },
      population: { type: "integer" },
    },
  };

  const response1 = chat.sendMessage("Tell me about Paris", {
    responseSchema: schema1,
    responseMimeType: "application/json",
  });

  const data1 = JSON.parse(response1.response.text());
  Logger.log("City: " + data1.city);
  Logger.log("Population: " + data1.population);

  // Follow-up message with different schema
  const schema2 = {
    type: "object",
    properties: {
      landmarks: {
        type: "array",
        items: { type: "string" },
      },
    },
  };

  const response2 = chat.sendMessage("What are the top 5 landmarks there?", {
    responseSchema: schema2,
  });

  const data2 = JSON.parse(response2.response.text());
  Logger.log("\nTop Landmarks:");
  data2.landmarks.forEach((landmark) => Logger.log("- " + landmark));
}

/**
 * Example 8: Sentiment analysis with schema
 */
function example8_SentimentAnalysis() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      sentiment: {
        type: "string",
        enum: ["positive", "negative", "neutral"],
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
      },
      keywords: {
        type: "array",
        items: { type: "string" },
      },
    },
  };

  const texts = [
    "I absolutely love this product! Best purchase ever!",
    "This is terrible. Waste of money.",
    "It works as expected. Nothing special.",
  ];

  texts.forEach((text) => {
    const response = genAI.prompt(`Analyze the sentiment of: "${text}"`, {
      responseSchema: schema,
    });

    Logger.log("\nText: " + text);
    Logger.log("Sentiment: " + response.sentiment);
    Logger.log("Confidence: " + (response.confidence * 100).toFixed(1) + "%");
    Logger.log("Keywords: " + response.keywords.join(", "));
  });
}

/**
 * Example 9: Data extraction from Google Sheets with schema
 */
function example9_SheetDataExtraction() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      category: { type: "string" },
      priority: {
        type: "string",
        enum: ["high", "medium", "low"],
      },
      estimated_hours: { type: "integer" },
    },
  };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getRange("A2:A10").getValues();

  // Process each task description
  data.forEach((row, index) => {
    if (row[0]) {
      const taskDescription = row[0];
      const response = genAI.prompt(
        `Categorize and estimate this task: "${taskDescription}"`,
        { responseSchema: schema }
      );

      // Write structured data back to sheet
      sheet.getRange(index + 2, 2).setValue(response.category);
      sheet.getRange(index + 2, 3).setValue(response.priority);
      sheet.getRange(index + 2, 4).setValue(response.estimated_hours);
    }
  });

  Logger.log("Sheet updated with structured data!");
}

/**
 * Example 10: Recipe schema
 */
function example10_RecipeSchema() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      servings: { type: "integer" },
      prep_time_minutes: { type: "integer" },
      cook_time_minutes: { type: "integer" },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            item: { type: "string" },
            amount: { type: "string" },
          },
        },
      },
      instructions: {
        type: "array",
        items: { type: "string" },
      },
      difficulty: {
        type: "string",
        enum: ["easy", "medium", "hard"],
      },
    },
  };

  const response = genAI.prompt("Create a recipe for chocolate chip cookies", {
    responseSchema: schema,
  });

  Logger.log("Recipe: " + response.name);
  Logger.log("Servings: " + response.servings);
  Logger.log(
    "Time: " +
      response.prep_time_minutes +
      " min prep, " +
      response.cook_time_minutes +
      " min cook"
  );
  Logger.log("Difficulty: " + response.difficulty);

  Logger.log("\nIngredients:");
  response.ingredients.forEach((ing) => {
    Logger.log(`- ${ing.amount} ${ing.item}`);
  });

  Logger.log("\nInstructions:");
  response.instructions.forEach((step, i) => {
    Logger.log(`${i + 1}. ${step}`);
  });
}

/**
 * Example 11: Enum validation
 */
function example11_EnumValidation() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  const schema = {
    type: "object",
    properties: {
      language: {
        type: "string",
        enum: ["javascript", "python", "java", "cpp", "go"],
      },
      difficulty: {
        type: "string",
        enum: ["beginner", "intermediate", "advanced"],
      },
      concepts: {
        type: "array",
        items: { type: "string" },
      },
    },
  };

  const response = genAI.prompt(
    'Categorize this tutorial: "Learn advanced async/await patterns in JavaScript"',
    { responseSchema: schema }
  );

  Logger.log("Language: " + response.language);
  Logger.log("Difficulty: " + response.difficulty);
  Logger.log("Concepts: " + response.concepts.join(", "));
}

/**
 * Example 12: Multiple schemas in sequence
 */
function example12_MultipleSchemas() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  // First: Get basic info
  const schema1 = {
    type: "object",
    properties: {
      topic: { type: "string" },
      relevance: { type: "string" },
    },
  };

  const step1 = genAI.prompt(
    'Analyze this article title: "The Future of Quantum Computing"',
    { responseSchema: schema1 }
  );

  Logger.log("Topic: " + step1.topic);
  Logger.log("Relevance: " + step1.relevance);

  // Second: Get detailed breakdown
  const schema2 = {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            content_hint: { type: "string" },
          },
        },
      },
    },
  };

  const step2 = genAI.prompt(
    `Create an outline for an article about ${step1.topic}`,
    { responseSchema: schema2 }
  );

  Logger.log("\nArticle Outline:");
  step2.sections.forEach((section, i) => {
    Logger.log(`\n${i + 1}. ${section.title}`);
    Logger.log(`   ${section.content_hint}`);
  });
}
