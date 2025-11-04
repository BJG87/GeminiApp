/**
 * @license
 * Copyright 2025 Martin Hawksey
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test suite for file URL functionality
 * 
 * These tests verify that the library correctly handles files provided via URL
 * using the fileData format instead of inline base64 encoding.
 */

/**
 * Get API key from Script Properties
 */
function getApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

/**
 * Test: Basic image URL with promptWithImage
 * Tests that promptWithImage accepts URL objects
 */
function testImageUrl() {
  console.log('Testing promptWithImage with URL...');

  const genAI = new GoogleGenerativeAI(getApiKey_());

  const response = genAI.promptWithImage(
    'Describe what you see in this image in one sentence.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );

  console.log('Response:', response);
  console.assert(response && response.length > 0, 'Response should not be empty');
}

/**
 * Test: File URL with promptWithFile
 * Tests that promptWithFile accepts URL objects
 */
function testFileUrl() {
  console.log('Testing promptWithFile with URL...');

  const genAI = new GoogleGenerativeAI(getApiKey_());

  const response = genAI.promptWithFile(
    'What is shown in this image?',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );

  console.log('Response:', response);
  console.assert(response && response.length > 0, 'Response should not be empty');
}

/**
 * Test: Chat with image URL
 * Tests that chat sessions work with URL objects
 */
function testChatWithImageUrl() {
  console.log('Testing chat.sendMessageWithImage with URL...');

  const genAI = new GoogleGenerativeAI(getApiKey_());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();

  const result = chat.sendMessageWithImage(
    'What colors are visible in this image?',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );

  const responseText = result.response.text();
  console.log('Response:', responseText);
  console.assert(responseText && responseText.length > 0, 'Response should not be empty');

  // Follow-up message
  const result2 = chat.sendMessage('What are common uses for those colors?');
  console.log('Follow-up response:', result2.response.text());
}

/**
 * Test: Chat with file URL
 * Tests that chat.sendMessageWithFile works with URL objects
 */
function testChatWithFileUrl() {
  console.log('Testing chat.sendMessageWithFile with URL...');

  const genAI = new GoogleGenerativeAI(getApiKey_());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();

  const result = chat.sendMessageWithFile(
    'Describe this image briefly.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    }
  );

  const responseText = result.response.text();
  console.log('Response:', responseText);
  console.assert(responseText && responseText.length > 0, 'Response should not be empty');
}

/**
 * Test: URL with JSON schema
 * Tests that URL files work with structured output
 */
function testUrlWithSchema() {
  console.log('Testing URL with JSON schema...');

  const genAI = new GoogleGenerativeAI(getApiKey_());

  const schema = genAI.createSchema({
    description: {
      type: 'string',
      description: 'Brief description of the image'
    },
    objects: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of main objects in the image'
    }
  }, ['description', 'objects']);

  const response = genAI.promptWithImage(
    'Analyze this image and list the objects you see',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
      mimeType: 'image/jpeg'
    },
    {
      responseSchema: schema
    }
  );

  console.log('Structured response:', JSON.stringify(response, null, 2));
  console.assert(typeof response === 'object', 'Response should be parsed JSON object');
  console.assert(response.description, 'Response should have description field');
  console.assert(Array.isArray(response.objects), 'Response should have objects array');
}

/**
 * Test: Audio transcription with URL
 * Tests that audio files can be transcribed using URL
 */
function testAudioTranscription() {
  console.log('Testing audio transcription with URL...');
  
  const genAI = new GoogleGenerativeAI(getApiKey_());
  
  const response = genAI.promptWithFile(
    'Transcribe the audio in this file. Provide the complete transcription.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/data/State_of_the_Union_Address_30_January_1961.mp3',
      mimeType: 'audio/mp3'
    }
  );
  
  console.log('Transcription:', response);
  console.assert(response && response.length > 0, 'Transcription should not be empty');
  console.assert(typeof response === 'string', 'Transcription should be a string');
}

/**
 * Test: Audio transcription with structured output
 * Tests that audio transcription works with JSON schema
 */
function testAudioTranscriptionWithSchema() {
  console.log('Testing audio transcription with schema...');
  
  const genAI = new GoogleGenerativeAI(getApiKey_());
  
  const schema = genAI.createSchema({
    transcription: {
      type: 'string',
      description: 'The complete transcription of the audio'
    },
    summary: {
      type: 'string',
      description: 'A brief summary of the audio content'
    },
    keyTopics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Main topics discussed in the audio'
    }
  }, ['transcription', 'summary', 'keyTopics']);
  
  const response = genAI.promptWithFile(
    'Transcribe this audio file and provide a summary with key topics.',
    {
      url: 'https://storage.googleapis.com/generativeai-downloads/data/State_of_the_Union_Address_30_January_1961.mp3',
      mimeType: 'audio/mp3'
    },
    {
      responseSchema: schema,
      model: 'gemini-1.5-pro'
    }
  );
  
  console.log('Structured response:', JSON.stringify(response, null, 2));
  console.assert(typeof response === 'object', 'Response should be parsed JSON object');
  console.assert(response.transcription, 'Response should have transcription field');
  console.assert(response.summary, 'Response should have summary field');
  console.assert(Array.isArray(response.keyTopics), 'Response should have keyTopics array');
}

/**
 * Test: Backward compatibility with Drive files
 * Tests that the old method still works (requires a real Drive file)
 * This test is commented out as it requires actual Drive access
 */
function testBackwardCompatibilityWithDrive() {
  console.log('Testing backward compatibility with Drive files...');

  // Uncomment and provide a real file ID to test

  const genAI = new GoogleGenerativeAI(getApiKey_());
  const driveFile = DriveApp.getFileById('1DrnwWmoNPfo4TKgacPwn1qEbY5nlzFec');

  const response = genAI.promptWithImage(
    'What is in this image?',
    driveFile
  );

  console.log('Response:', response);
  console.assert(response && response.length > 0, 'Response should not be empty');


  console.log('Test skipped - requires Drive file ID');
}

/**
 * Run all URL file tests
 */
function runAllUrlFileTests() {
  console.log('=== Starting URL File Tests ===\n');

  try {
    testImageUrl();
    console.log('✓ testImageUrl passed\n');
  } catch (e) {
    console.error('✗ testImageUrl failed:', e);
  }

  try {
    testFileUrl();
    console.log('✓ testFileUrl passed\n');
  } catch (e) {
    console.error('✗ testFileUrl failed:', e);
  }

  try {
    testChatWithImageUrl();
    console.log('✓ testChatWithImageUrl passed\n');
  } catch (e) {
    console.error('✗ testChatWithImageUrl failed:', e);
  }

  try {
    testChatWithFileUrl();
    console.log('✓ testChatWithFileUrl passed\n');
  } catch (e) {
    console.error('✗ testChatWithFileUrl failed:', e);
  }

  try {
    testUrlWithSchema();
    console.log('✓ testUrlWithSchema passed\n');
  } catch (e) {
    console.error('✗ testUrlWithSchema failed:', e);
  }

  try {
    testAudioTranscription();
    console.log('✓ testAudioTranscription passed\n');
  } catch (e) {
    console.error('✗ testAudioTranscription failed:', e);
  }

  try {
    testAudioTranscriptionWithSchema();
    console.log('✓ testAudioTranscriptionWithSchema passed\n');
  } catch (e) {
    console.error('✗ testAudioTranscriptionWithSchema failed:', e);
  }

  try {
    testBackwardCompatibilityWithDrive();
    console.log('✓ testBackwardCompatibilityWithDrive passed\n');
  } catch (e) {
    console.error('✗ testBackwardCompatibilityWithDrive failed:', e);
  }

  console.log('=== URL File Tests Complete ===');
}
