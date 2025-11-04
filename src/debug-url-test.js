/**
 * Minimal test to debug URL file support
 */

function debugUrlTest() {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  Logger.log('=== Testing with image URL ===');
  try {
    const imageResponse = genAI.promptWithImage(
      'What do you see?',
      {
        url: 'https://storage.googleapis.com/generativeai-downloads/images/scones.jpg',
        mimeType: 'image/jpeg'
      }
    );
    Logger.log('Image test SUCCESS:', imageResponse);
  } catch (e) {
    Logger.log('Image test FAILED:', e.toString());
  }
  
  Logger.log('\n=== Testing with Google Drive audio URL ===');
  try {
    const audioResponse = genAI.promptWithFile(
      'Transcribe this audio.',
      {
        url: 'https://drive.google.com/uc?export=download&id=1PqLDLIz-ZNnl5lDZSssf0BbTylzrW8GC',
        mimeType: 'audio/mpeg'
      }
    );
    Logger.log('Audio test SUCCESS:', audioResponse);
  } catch (e) {
    Logger.log('Audio test FAILED:', e.toString());
    Logger.log('Full error:', JSON.stringify(e, null, 2));
  }
}
