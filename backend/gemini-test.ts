/**
 * Simple test for Gemini API connectivity
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// The API key to use for testing
const API_KEY = 'AIzaSyB00fdoWvedIpJzhsfthtv1ot_9CeKYmI4';

/**
 * Test the Gemini API connection with a simple prompt
 * @returns Test result message
 */
export async function testGeminiConnection(): Promise<string> {
  try {
    // Initialize the API with the key
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('Initialized GoogleGenerativeAI client');

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('Got generative model');

    // Execute a simple prompt
    const prompt = "Hello! Can you give me a one sentence response?";
    console.log('Sending prompt to Gemini API:', prompt);
    
    // Generate content
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    
    // Get the response text
    const response = await result.response;
    const text = response.text();
    
    return `Successfully connected to Gemini API. Response: "${text}"`;
  } catch (error: any) {
    console.error('Gemini API test error:', error);
    
    // Extract more useful information from the error
    const errorMessage = error?.message || 'Unknown error';
    const errorDetails = extractErrorDetails(error);
    
    return `Failed to connect to Gemini API: ${errorMessage}\n\nDetails: ${errorDetails}`;
  }
}

/**
 * Extract useful details from error objects
 */
function extractErrorDetails(error: any): string {
  if (!error) return 'No error details available';
  
  // Try to extract network error details
  if (error.cause) {
    return `Cause: ${error.cause?.message || JSON.stringify(error.cause)}`;
  }
  
  // For other errors
  if (error.stack) {
    const stackLines = error.stack.split('\n').slice(0, 3).join('\n');
    return `Stack: ${stackLines}`;
  }
  
  return JSON.stringify(error);
}
