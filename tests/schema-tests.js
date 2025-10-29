/**
 * Schema Feature Tests
 *
 * Tests to verify JSON schema functionality works correctly
 * across all prompt methods.
 */

/**
 * Test schema with simple prompt
 */
function testSchema_SimplePrompt() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const schema = {
      type: "object",
      properties: {
        colors: {
          type: "array",
          items: { type: "string" },
        },
      },
    };

    const response = genAI.prompt("List 3 primary colors", {
      responseSchema: schema,
    });

    // Check if response is parsed JSON
    if (typeof response === "object" && Array.isArray(response.colors)) {
      Logger.log("✅ PASSED: Schema with prompt works");
      Logger.log("Colors: " + response.colors.join(", "));
      return true;
    } else {
      Logger.log("❌ FAILED: Response not parsed correctly");
      Logger.log("Response: " + JSON.stringify(response));
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test schema helper method
 */
function testSchema_HelperMethod() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const schema = genAI.createSchema(
      {
        name: { type: "string" },
        age: { type: "integer" },
      },
      ["name"]
    );

    // Verify schema structure
    if (
      schema.type === "object" &&
      schema.properties &&
      schema.required &&
      schema.required.includes("name")
    ) {
      Logger.log("✅ PASSED: Schema helper creates valid schema");
      return true;
    } else {
      Logger.log("❌ FAILED: Schema helper created invalid schema");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test schema with complex nested structure
 */
function testSchema_NestedStructure() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
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
            },
          },
        },
      },
    };

    const response = genAI.prompt("Create a small company with 2 employees", {
      responseSchema: schema,
      model: "gemini-1.5-flash",
    });

    if (
      typeof response === "object" &&
      response.company &&
      Array.isArray(response.employees) &&
      response.employees.length > 0
    ) {
      Logger.log("✅ PASSED: Nested schema works");
      Logger.log("Company: " + response.company);
      Logger.log("Employees: " + response.employees.length);
      return true;
    } else {
      Logger.log("❌ FAILED: Nested schema response invalid");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test schema with enum validation
 */
function testSchema_EnumValidation() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const schema = {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "negative", "neutral"],
        },
      },
    };

    const response = genAI.prompt('What is the sentiment of: "I love this!"', {
      responseSchema: schema,
    });

    const validValues = ["positive", "negative", "neutral"];
    if (
      typeof response === "object" &&
      validValues.includes(response.sentiment)
    ) {
      Logger.log("✅ PASSED: Enum validation works");
      Logger.log("Sentiment: " + response.sentiment);
      return true;
    } else {
      Logger.log("❌ FAILED: Enum validation failed");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test schema in chat session
 */
function testSchema_ChatSession() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const model = genAI.getModel("gemini-1.5-flash");
    const chat = model.startChat();

    const schema = {
      type: "object",
      properties: {
        city: { type: "string" },
        country: { type: "string" },
      },
    };

    const response = chat.sendMessage("What is the capital of Japan?", {
      responseSchema: schema,
      responseMimeType: "application/json",
    });

    const text = response.response.text();
    const data = JSON.parse(text);

    if (data.city && data.country) {
      Logger.log("✅ PASSED: Schema in chat session works");
      Logger.log("City: " + data.city);
      Logger.log("Country: " + data.country);
      return true;
    } else {
      Logger.log("❌ FAILED: Chat schema response invalid");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test responseMimeType alone (without schema)
 */
function testSchema_MimeTypeOnly() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const response = genAI.prompt(
      'Return JSON with keys "status" and "message"',
      {
        responseMimeType: "application/json",
      }
    );

    // Should be parsed as JSON
    if (typeof response === "object") {
      Logger.log("✅ PASSED: Response MIME type parsing works");
      Logger.log("Response: " + JSON.stringify(response));
      return true;
    } else {
      Logger.log("❌ FAILED: Response not parsed as JSON");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Run all schema tests
 */
function runAllSchemaTests() {
  Logger.log("=== Running Schema Feature Tests ===\n");

  const tests = [
    { name: "Simple Prompt with Schema", func: testSchema_SimplePrompt },
    { name: "Schema Helper Method", func: testSchema_HelperMethod },
    { name: "Nested Structure", func: testSchema_NestedStructure },
    { name: "Enum Validation", func: testSchema_EnumValidation },
    { name: "Chat Session", func: testSchema_ChatSession },
    { name: "MIME Type Only", func: testSchema_MimeTypeOnly },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    Logger.log(`\nTest ${index + 1}: ${test.name}`);
    Logger.log("-----------------------------------");

    try {
      const result = test.func();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      Logger.log("❌ FAILED: " + error.message);
      failed++;
    }

    Utilities.sleep(2000); // Delay between API calls
  });

  Logger.log("\n=== Schema Test Results ===");
  Logger.log(`Total: ${tests.length}`);
  Logger.log(`Passed: ${passed} ✅`);
  Logger.log(`Failed: ${failed} ❌`);
  Logger.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
}
