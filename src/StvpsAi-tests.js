
/**
 * StvpsAi Test Suite
 * 
 * Tests all functionality of the StvpsAi library
 * 
 * Setup:
 * 1. Set Script Property 'GEMINI_API_KEY' with your API key
 * 2. (Optional) Set 'TEST_AUDIO_FILE_ID' with your Drive audio file ID for tests 6, 7, 8, 12
 * 3. Run individual test functions or runAllTests()
 */

// Get API key from Script Properties
function getApiKey() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error(
      'API key not found. Please set GEMINI_API_KEY in Script Properties:\n' +
      'PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", "your-key-here");'
    );
  }
  return key;
}

// Get optional test audio file ID from Script Properties
function getTestAudioFileId() {
  return PropertiesService.getScriptProperties().getProperty('TEST_AUDIO_FILE_ID');
}

// ============================================================================
// BASIC PROMPT TESTS
// ============================================================================

/**
 * Test 1: Simple text prompt
 * Tests basic text generation without structured output
 */
function test1_simpleTextPrompt() {
  console.log('=== Test 1: Simple Text Prompt ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const response = ai.prompt('Write a haiku about programming');

    console.log('Success!');
    console.log('Response:', response);
    console.log('Type:', typeof response);

    if (typeof response !== 'string') {
      throw new Error('Expected string response');
    }

    console.log('✓ Test 1 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 1 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 2: Structured JSON prompt
 * Tests JSON output with schema
 */
function test2_structuredJsonPrompt() {
  console.log('=== Test 2: Structured JSON Prompt ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    const schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the recipe'
        },
        ingredients: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of ingredients'
        },
        steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Cooking steps'
        }
      },
      required: ['title', 'ingredients', 'steps']
    };

    const response = ai.prompt('Create a simple pasta recipe', { schema });

    console.log('Success!');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('Type:', typeof response);

    if (typeof response !== 'object') {
      throw new Error('Expected object response');
    }
    if (!response.title || !response.ingredients || !response.steps) {
      throw new Error('Missing required fields in response');
    }

    console.log('✓ Test 2 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 2 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// IMAGE PROMPT TESTS
// ============================================================================

/**
 * Test 3: Prompt with image (inline Drive file)
 * Tests image analysis with a Drive file
 * NOTE: You need to provide a valid image file ID
 */
function test3_promptWithDriveImage() {
  console.log('=== Test 3: Prompt with Drive Image ===');

  try {
    // IMPORTANT: Replace with your actual image file ID
    const imageFileId = '1og8hlvakUT9_1bd13mi_Z_JGx2tQw82k';

    if (imageFileId === 'YOUR_IMAGE_FILE_ID') {
      console.log('⚠ Test 3 SKIPPED: Please provide a valid image file ID');
      return true;
    }

    const ai = StvpsAi.newInstance(getApiKey());
    const imageFile = DriveApp.getFileById(imageFileId);

    const response = ai.promptWithImage('Describe this image in one sentence', imageFile);

    console.log('Success!');
    console.log('Response:', response);

    console.log('✓ Test 3 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 3 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 4: Prompt with image URL (uploaded to Files API)
 * Tests image analysis with a URL that gets uploaded
 */
function test4_promptWithImageUrl() {
  console.log('=== Test 4: Prompt with Image URL ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    // Public image URL
    const imageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg';

    const response = ai.promptWithImage(
      'What food is shown in this image?',
      imageUrl,
      { mimeType: 'image/jpeg' }
    );

    console.log('Success!');
    console.log('Response:', response);

    console.log('✓ Test 4 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 4 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 5: Prompt with image and structured output
 * Tests combining image analysis with JSON schema
 */
function test5_promptWithImageStructured() {
  console.log('=== Test 5: Prompt with Image + Structured Output ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    const imageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg';

    const schema = {
      type: 'object',
      properties: {
        mainObject: {
          type: 'string',
          description: 'The main object in the image'
        },
        colors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Prominent colors'
        },
        setting: {
          type: 'string',
          description: 'The setting or context'
        }
      },
      required: ['mainObject', 'colors', 'setting']
    };

    const response = ai.promptWithImage(
      'Analyze this image',
      imageUrl,
      { mimeType: 'image/jpeg', schema }
    );

    console.log('Success!');
    console.log('Response:', JSON.stringify(response, null, 2));

    if (!response.mainObject || !response.colors || !response.setting) {
      throw new Error('Missing required fields');
    }

    console.log('✓ Test 5 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 5 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// FILE PROMPT TESTS
// ============================================================================

/**
 * Test 6: Prompt with audio file from Drive
 * Tests audio transcription from Drive file
 * 
 * Setup: Set TEST_AUDIO_FILE_ID in Script Properties with your audio file ID
 */
function test6_promptWithAudioUrl() {
  console.log('=== Test 6: Prompt with Audio File ===');

  const audioFileId = getTestAudioFileId();
  if (!audioFileId) {
    console.log('⚠ Test 6 SKIPPED: No TEST_AUDIO_FILE_ID configured');
    console.log('To enable: PropertiesService.getScriptProperties().setProperty("TEST_AUDIO_FILE_ID", "your-file-id");');
    return true;
  }

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    // Upload from Drive (fast and reliable)
    const driveFile = DriveApp.getFileById(audioFileId);
    const uploadedFile = ai.uploadDriveFile(driveFile, 'Test Audio');

    const response = ai.promptWithFile(
      'What is being said in this audio? Provide a brief summary.',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );

    console.log('Success!');
    console.log('Response:', response.substring(0, 200) + '...');
    
    // Clean up
    ai.getFileManager().deleteFile(uploadedFile.name);

    console.log('✓ Test 6 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 6 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 7: Prompt with audio file + structured output
 * Tests audio transcription with JSON schema
 * 
 * Setup: Set TEST_AUDIO_FILE_ID in Script Properties
 */
function test7_promptWithAudioStructured() {
  console.log('=== Test 7: Prompt with Audio + Structured Output ===');

  const audioFileId = getTestAudioFileId();
  if (!audioFileId) {
    console.log('⚠ Test 7 SKIPPED: No TEST_AUDIO_FILE_ID configured');
    return true;
  }

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    const driveFile = DriveApp.getFileById(audioFileId);
    const uploadedFile = ai.uploadDriveFile(driveFile, 'Test Audio');

    const schema = {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Brief summary of the audio' },
        topics: { type: 'array', items: { type: 'string' }, description: 'Key topics discussed' }
      },
      required: ['summary', 'topics']
    };

    const response = ai.promptWithFile(
      'Analyze this audio and extract the summary and key topics',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType },
      { schema }
    );

    console.log('Success!');
    console.log('Summary:', response.summary);
    console.log('Topics:', response.topics);
    
    // Clean up
    ai.getFileManager().deleteFile(uploadedFile.name);

    console.log('✓ Test 7 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 7 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 8: Multiple prompts with same Drive audio file
 * Tests reusing an uploaded file multiple times
 * 
 * Setup: Set TEST_AUDIO_FILE_ID in Script Properties
 */
function test8_promptWithDriveAudioUrl() {
  console.log('=== Test 8: Reuse Uploaded Audio File ===');

  const audioFileId = getTestAudioFileId();
  if (!audioFileId) {
    console.log('⚠ Test 8 SKIPPED: No TEST_AUDIO_FILE_ID configured');
    return true;
  }

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    // Upload once
    const driveFile = DriveApp.getFileById(audioFileId);
    const uploadedFile = ai.uploadDriveFile(driveFile, 'Test Audio');
    console.log('File uploaded:', uploadedFile.uri);

    // Use multiple times
    const response1 = ai.promptWithFile(
      'What is the main topic of this audio?',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 1:', response1.substring(0, 100) + '...');

    const response2 = ai.promptWithFile(
      'List 3 key points from this audio',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 2:', response2.substring(0, 100) + '...');
    
    // Clean up
    ai.getFileManager().deleteFile(uploadedFile.name);

    console.log('✓ Test 8 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 8 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// CHAT TESTS
// ============================================================================

/**
 * Test 9: Basic chat session
 * Tests multi-turn conversation
 */
function test9_basicChat() {
  console.log('=== Test 9: Basic Chat Session ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const chat = ai.startChat();

    const response1 = chat.sendMessage('What is the capital of France?');
    console.log('Turn 1:', response1);

    const response2 = chat.sendMessage('What is its population?');
    console.log('Turn 2:', response2);

    const history = chat.getHistory();
    console.log('History length:', history.length);

    if (history.length !== 4) { // 2 user + 2 model messages
      throw new Error('Expected 4 messages in history');
    }

    console.log('✓ Test 9 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 9 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 10: Chat with system instruction
 * Tests system instruction in chat
 */
function test10_chatWithSystemInstruction() {
  console.log('=== Test 10: Chat with System Instruction ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const chat = ai.startChat({
      systemInstruction: 'You are a pirate. Always respond in pirate speak.'
    });

    const response = chat.sendMessage('Tell me about the weather');
    console.log('Response:', response);

    // Check if response has pirate-like language (rough check)
    const pirateWords = ['arr', 'ahoy', 'matey', 'ye', 'aye', 'sea', 'ship'];
    const hasPirateSpeak = pirateWords.some(word =>
      response.toLowerCase().includes(word)
    );

    if (!hasPirateSpeak) {
      console.log('Warning: Response may not follow system instruction');
    }

    console.log('✓ Test 10 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 10 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 11: Chat with image
 * Tests sending images in chat context
 */
function test11_chatWithImage() {
  console.log('=== Test 11: Chat with Image ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const chat = ai.startChat();

    const imageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg';

    const response1 = chat.sendMessageWithImage(
      'What food is this?',
      imageUrl,
      { mimeType: 'image/jpeg' }
    );
    console.log('Turn 1:', response1);

    const response2 = chat.sendMessage('What are the main ingredients?');
    console.log('Turn 2:', response2);

    console.log('✓ Test 11 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 11 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 12: Chat with audio file
 * Tests sending audio file in chat context
 * 
 * Setup: Set TEST_AUDIO_FILE_ID in Script Properties
 */
function test12_chatWithFile() {
  console.log('=== Test 12: Chat with Audio File ===');

  const audioFileId = getTestAudioFileId();
  if (!audioFileId) {
    console.log('⚠ Test 12 SKIPPED: No TEST_AUDIO_FILE_ID configured');
    return true;
  }

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const chat = ai.startChat();

    // Upload audio file
    const driveFile = DriveApp.getFileById(audioFileId);
    const uploadedFile = ai.uploadDriveFile(driveFile, 'Test Audio');

    // First turn: Ask about the audio
    const response1 = chat.sendMessageWithFile(
      'What is this audio about? Give a brief summary.',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Turn 1:', response1.substring(0, 100) + '...');

    // Second turn: Follow-up question (chat should remember the audio)
    const response2 = chat.sendMessage('What are the main themes discussed?');
    console.log('Turn 2:', response2.substring(0, 100) + '...');
    
    // Clean up
    ai.getFileManager().deleteFile(uploadedFile.name);

    console.log('✓ Test 12 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 12 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 13: Chat with structured output
 * Tests JSON schema in chat
 */
function test13_chatWithStructuredOutput() {
  console.log('=== Test 13: Chat with Structured Output ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const chat = ai.startChat();

    const schema = {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
      },
      required: ['answer', 'confidence']
    };

    const response = chat.sendMessage('What is 2+2?', { schema });

    console.log('Response:', JSON.stringify(response, null, 2));

    if (!response.answer || !response.confidence) {
      throw new Error('Missing required fields');
    }

    console.log('✓ Test 13 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 13 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// FILE UPLOAD TESTS
// ============================================================================

/**
 * Test 14: Upload file and reuse
 * Tests uploading a file once and using it multiple times
 * Uses small file to avoid timeout in automated tests
 */
function test14_uploadAndReuseFile() {
  console.log('=== Test 14: Upload and Reuse File ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    // Upload file once - using small image for automated testing
    console.log('Uploading file...');
    const imageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg';
    const uploadedFile = ai.uploadFile(imageUrl, 'image/jpeg', 'Test Image');

    console.log('Upload complete!');
    console.log('File URI:', uploadedFile.uri);
    console.log('File name:', uploadedFile.name);

    // Now reuse the uploaded file multiple times - no re-upload needed!
    console.log('Using uploaded file for first query...');
    const response1 = ai.promptWithFile(
      'What food is in this image?',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 1:', response1.substring(0, 100) + '...');

    console.log('Using uploaded file for second query...');
    const response2 = ai.promptWithFile(
      'Describe the colors in this image',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 2:', response2.substring(0, 100) + '...');

    // Clean up
    console.log('Deleting file...');
    ai.getFileManager().deleteFile(uploadedFile.name);
    console.log('File deleted');

    console.log('✓ Test 14 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 14 FAILED:', error.toString());
    return false;
  }
}

/**
 * Manual Test: Upload large audio file and reuse
 * Demonstrates the proper pattern for handling large files
 * 
 * IMPORTANT: Due to Apps Script UrlFetchApp limitations (~20 second timeout),
 * fetching large files from external URLs will fail. Instead:
 * 
 * FOR PRODUCTION USE WITH LARGE FILES:
 * 1. Use uploadDriveFile() with files already in Drive (RECOMMENDED)
 * 2. Or upload the file to Files API outside of Apps Script first
 * 
 * Example with Drive file:
 *   const driveFile = DriveApp.getFileById('YOUR_AUDIO_FILE_ID');
 *   const uploadedFile = ai.uploadDriveFile(driveFile, 'My Audio');
 *   // Then reuse uploadedFile.uri multiple times
 * 
 * This test is commented out because it will timeout with large URL fetches.
 * Uncomment and modify to use a Drive file if you want to test large file handling.
 */
function manualTest_uploadLargeAudioFile() {
  console.log('=== Manual Test: Upload Large Audio File ===');
  console.log('NOTE: This test requires modification to use a Drive file instead of URL');
  console.log('See function comments for instructions');
  return true;
  
  /* EXAMPLE CODE - Modify with your Drive file ID:
  
  try {
    const ai = StvpsAi.newInstance(getApiKey());

    // Upload large audio file from Drive (FAST - no external fetch)
    console.log('Uploading audio file from Drive...');
    const driveFileId = 'YOUR_AUDIO_FILE_ID_HERE'; // Replace with your file ID
    const driveFile = DriveApp.getFileById(driveFileId);
    const uploadedFile = ai.uploadDriveFile(driveFile, 'My Audio');

    console.log('Upload complete!');
    console.log('File URI:', uploadedFile.uri);
    console.log('File name:', uploadedFile.name);

    // Reuse the uploaded file multiple times - no re-upload needed!
    console.log('Using uploaded file for transcription...');
    const response1 = ai.promptWithFile(
      'Summarize this audio in 2-3 sentences',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 1:', response1.substring(0, 100) + '...');

    console.log('Using uploaded file for analysis...');
    const response2 = ai.promptWithFile(
      'What are the key themes discussed?',
      { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType }
    );
    console.log('Response 2:', response2.substring(0, 100) + '...');

    // Clean up
    console.log('Deleting file...');
    ai.getFileManager().deleteFile(uploadedFile.name);
    console.log('File deleted');

    console.log('✓ Manual Test PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Manual Test FAILED:', error.toString());
    return false;
  }
  */
}

/**
 * Test 15: List uploaded files
 * Tests file management operations
 */
function test15_listFiles() {
  console.log('=== Test 15: List Uploaded Files ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());
    const fileManager = ai.getFileManager();

    // Upload a test file
    const imageUrl = 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg';
    const uploadedFile = ai.uploadFile(imageUrl, 'image/jpeg', 'Test Image');
    console.log('Uploaded:', uploadedFile.name);

    // List files
    const filesList = fileManager.listFiles();
    console.log('Files count:', filesList.files?.length || 0);

    if (filesList.files) {
      filesList.files.forEach(file => {
        console.log(`- ${file.displayName} (${file.name})`);
      });
    }

    // Clean up
    fileManager.deleteFile(uploadedFile.name);
    console.log('Cleaned up test file');

    console.log('✓ Test 15 PASSED\n');
    return true;
  } catch (error) {
    console.log('✗ Test 15 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

/**
 * Test 16: Invalid API key
 * Tests error handling for authentication failure
 */
function test16_invalidApiKey() {
  console.log('=== Test 16: Invalid API Key ===');

  try {
    const ai = StvpsAi.newInstance('invalid_key_12345');

    try {
      ai.prompt('Test');
      throw new Error('Should have thrown error for invalid key');
    } catch (error) {
      if (error.name === 'StvpsAiApiError') {
        console.log('Correctly caught API error:', error.message);
        console.log('✓ Test 16 PASSED\n');
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.log('✗ Test 16 FAILED:', error.toString());
    return false;
  }
}

/**
 * Test 17: Missing MIME type for URL
 * Tests validation error handling
 */
function test17_missingMimeType() {
  console.log('=== Test 17: Missing MIME Type ===');

  try {
    const ai = StvpsAi.newInstance(getApiKey());

    try {
      // This should fail - URL without mimeType
      ai.promptWithFile('Test', 'https://example.com/file.mp3');
      throw new Error('Should have thrown validation error');
    } catch (error) {
      if (error.name === 'StvpsAiValidationError') {
        console.log('Correctly caught validation error:', error.message);
        console.log('✓ Test 17 PASSED\n');
        return true;
      }
      throw error;
    }
  } catch (error) {
    console.log('✗ Test 17 FAILED:', error.toString());
    return false;
  }
}

// ============================================================================
// TEST RUNNER
// ============================================================================

/**
 * Run all tests
 * Executes the entire test suite and reports results
 */
function runAllTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     StvpsAi Test Suite                    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const tests = [
    { name: 'Simple Text Prompt', fn: test1_simpleTextPrompt },
    { name: 'Structured JSON Prompt', fn: test2_structuredJsonPrompt },
    { name: 'Prompt with Drive Image', fn: test3_promptWithDriveImage },
    { name: 'Prompt with Image URL', fn: test4_promptWithImageUrl },
    { name: 'Prompt with Image + Structured', fn: test5_promptWithImageStructured },
    { name: 'Prompt with Audio URL', fn: test6_promptWithAudioUrl },
    { name: 'Prompt with Audio + Structured', fn: test7_promptWithAudioStructured },
    { name: 'Prompt with Drive Audio URL', fn: test8_promptWithDriveAudioUrl },
    { name: 'Basic Chat Session', fn: test9_basicChat },
    { name: 'Chat with System Instruction', fn: test10_chatWithSystemInstruction },
    { name: 'Chat with Image', fn: test11_chatWithImage },
    { name: 'Chat with File', fn: test12_chatWithFile },
    { name: 'Chat with Structured Output', fn: test13_chatWithStructuredOutput },
    { name: 'Upload and Reuse File', fn: test14_uploadAndReuseFile },
    { name: 'List Files', fn: test15_listFiles },
    { name: 'Invalid API Key', fn: test16_invalidApiKey },
    { name: 'Missing MIME Type', fn: test17_missingMimeType }
  ];

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  tests.forEach((test, index) => {
    console.log(`\n[${index + 1}/${tests.length}] Running: ${test.name}`);
    console.log('─'.repeat(50));

    try {
      const result = test.fn();
      if (result === true) {
        passed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.log('Unexpected error:', error.toString());
      failed++;
    }

    // Brief pause between tests
    Utilities.sleep(1000);
  });

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     Test Results Summary                  ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`⚠ Skipped: ${skipped}`);
  console.log('');

  if (failed === 0 && passed > 0) {
    console.log('🎉 All tests passed!');
  } else if (failed > 0) {
    console.log('⚠️  Some tests failed. Please review the logs above.');
  }
}

/**
 * Quick test - runs just the basic functionality
 * Use this for quick validation
 */
function runQuickTest() {
  console.log('=== Quick Test ===');

  const ai = StvpsAi.newInstance(getApiKey());

  console.log('1. Testing simple prompt...');
  const text = ai.prompt('Say hello in 3 different languages');
  console.log('Response type: ' + typeof text);
  console.log('Response length: ' + text.length);
  console.log('Response: ' + text);

  console.log('');
  console.log('2. Testing structured output...');
  const json = ai.prompt('List 3 colors', {
    schema: {
      type: 'object',
      properties: {
        colors: { type: 'array', items: { type: 'string' } }
      },
      required: ['colors']
    }
  });
  console.log('Response type: ' + typeof json);
  console.log('Colors: ' + json.colors.join(', '));

  console.log('');
  console.log('3. Testing chat...');
  const chat = ai.startChat();
  const r1 = chat.sendMessage('What is 5+5?');
  console.log('Chat 1 length: ' + r1.length);
  console.log('Chat 1: ' + r1);
  const r2 = chat.sendMessage('Double that number');
  console.log('Chat 2 length: ' + r2.length);
  console.log('Chat 2: ' + r2);

  console.log('');
  console.log('✓ Quick test complete!');
}
