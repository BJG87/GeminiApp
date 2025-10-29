/**
 * Integration Tests for GeminiApp Library
 *
 * These tests verify that all major functionality works correctly.
 * Run these before publishing a new version.
 *
 * Setup:
 * 1. Set your API key in Script Properties: GEMINI_API_KEY
 * 2. Run each test function individually
 */

/**
 * Test 1: Basic initialization
 */
function test1_Initialization() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  if (!apiKey) {
    Logger.log("❌ FAILED: No API key found in Script Properties");
    return;
  }

  try {
    const genAI = GeminiApp.newInstance(apiKey);
    Logger.log("✅ PASSED: Library initialized successfully");
    return true;
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 2: Simple text prompt
 */
function test2_SimplePrompt() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const response = genAI.prompt("Say hello in one word");

    if (response && typeof response === "string" && response.length > 0) {
      Logger.log("✅ PASSED: Text prompt works");
      Logger.log("Response: " + response);
      return true;
    } else {
      Logger.log("❌ FAILED: Invalid response format");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 3: Model selection
 */
function test3_ModelSelection() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  try {
    // Test with default model
    const genAI1 = GeminiApp.newInstance(apiKey);
    const response1 = genAI1.prompt("Say hi", { model: "gemini-1.5-flash" });

    // Test with pro model
    const genAI2 = GeminiApp.newInstance(apiKey, "gemini-1.5-pro");
    const response2 = genAI2.prompt("Say hi");

    if (response1 && response2) {
      Logger.log("✅ PASSED: Multiple models work");
      return true;
    } else {
      Logger.log("❌ FAILED: Model selection issue");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 4: Chat session
 */
function test4_ChatSession() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const model = genAI.getModel("gemini-1.5-flash");
    const chat = model.startChat();

    const response1 = chat.sendMessage("My name is Test");
    const response2 = chat.sendMessage("What is my name?");

    const history = chat.getHistory();

    if (
      history.length >= 4 &&
      response2.response.text().toLowerCase().includes("test")
    ) {
      Logger.log("✅ PASSED: Chat session maintains context");
      Logger.log("History length: " + history.length);
      return true;
    } else {
      Logger.log("❌ FAILED: Chat context not maintained");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 5: Generation config
 */
function test5_GenerationConfig() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const response = genAI.prompt("Count to 3", {
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50,
      },
    });

    if (response) {
      Logger.log("✅ PASSED: Generation config works");
      Logger.log("Response: " + response);
      return true;
    } else {
      Logger.log("❌ FAILED: No response received");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 6: Error handling
 */
function test6_ErrorHandling() {
  try {
    // Try to create instance with invalid API key
    const genAI = GeminiApp.newInstance("invalid_key");
    const response = genAI.prompt("Hello");

    Logger.log("❌ FAILED: Should have thrown an error with invalid key");
    return false;
  } catch (error) {
    Logger.log("✅ PASSED: Error handling works");
    Logger.log("Error caught: " + error.message);
    return true;
  }
}

/**
 * Test 7: Factory methods
 */
function test7_FactoryMethods() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  try {
    // Test newInstance
    const genAI = GeminiApp.newInstance(apiKey);

    // Test newCacheManager
    const cacheManager = GeminiApp.newCacheManager(apiKey);

    if (genAI && cacheManager) {
      Logger.log("✅ PASSED: Factory methods work");
      return true;
    } else {
      Logger.log("❌ FAILED: Factory methods returned null");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 8: Enums exported correctly
 */
function test8_Enums() {
  try {
    const harmCategory = GeminiApp.HarmCategory.HARM_CATEGORY_HARASSMENT;
    const threshold = GeminiApp.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
    const schemaType = GeminiApp.SchemaType.STRING;

    if (harmCategory && threshold && schemaType) {
      Logger.log("✅ PASSED: Enums are accessible");
      return true;
    } else {
      Logger.log("❌ FAILED: Some enums are undefined");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 9: Advanced model access
 */
function test9_AdvancedModel() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
      },
    });

    const result = model.generateContent("Say hello");
    const text = result.response.text();

    if (text) {
      Logger.log("✅ PASSED: Advanced model access works");
      return true;
    } else {
      Logger.log("❌ FAILED: No response from advanced model");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Test 10: Function object creation
 */
function test10_FunctionObject() {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  const genAI = GeminiApp.newInstance(apiKey);

  try {
    const model = genAI.getModel("gemini-1.5-flash");
    const chat = model.startChat();

    const func = chat
      .newFunction()
      .setName("testFunction")
      .setDescription("A test function")
      .addParameter("param1", "string", "Test parameter");

    const json = func.toJSON();

    if (json.name === "testFunction" && json.parameters) {
      Logger.log("✅ PASSED: Function object creation works");
      return true;
    } else {
      Logger.log("❌ FAILED: Function object not created correctly");
      return false;
    }
  } catch (error) {
    Logger.log("❌ FAILED: " + error.message);
    return false;
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  Logger.log("=== Running GeminiApp Library Tests ===\n");

  const tests = [
    { name: "Initialization", func: test1_Initialization },
    { name: "Simple Prompt", func: test2_SimplePrompt },
    { name: "Model Selection", func: test3_ModelSelection },
    { name: "Chat Session", func: test4_ChatSession },
    { name: "Generation Config", func: test5_GenerationConfig },
    { name: "Error Handling", func: test6_ErrorHandling },
    { name: "Factory Methods", func: test7_FactoryMethods },
    { name: "Enums", func: test8_Enums },
    { name: "Advanced Model", func: test9_AdvancedModel },
    { name: "Function Object", func: test10_FunctionObject },
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

    Utilities.sleep(1000); // Small delay between tests
  });

  Logger.log("\n=== Test Results ===");
  Logger.log(`Total: ${tests.length}`);
  Logger.log(`Passed: ${passed} ✅`);
  Logger.log(`Failed: ${failed} ❌`);
  Logger.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
}

/**
 * Quick smoke test - runs the most critical tests
 */
function quickSmokeTest() {
  Logger.log("=== Quick Smoke Test ===\n");

  const apiKey =
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

  if (!apiKey) {
    Logger.log("❌ No API key found. Set GEMINI_API_KEY in Script Properties.");
    return;
  }

  try {
    // Test 1: Initialization
    const genAI = GeminiApp.newInstance(apiKey);
    Logger.log("✅ Initialization works");

    // Test 2: Simple prompt
    const response = genAI.prompt("Say hello in one word");
    Logger.log("✅ Simple prompt works: " + response);

    // Test 3: Chat
    const model = genAI.getModel("gemini-1.5-flash");
    const chat = model.startChat();
    chat.sendMessage("Hi");
    Logger.log("✅ Chat session works");

    Logger.log("\n🎉 All critical functions working!");
  } catch (error) {
    Logger.log("❌ Smoke test failed: " + error.message);
  }
}
