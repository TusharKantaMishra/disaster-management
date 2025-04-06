/**
 * API configuration with direct key storage
 * For development/testing only
 */

// Direct API key config (for development only)
// In production, always use secure environment variables
export const apiConfig = {
  // A common issue with API keys is they need to be properly formatted
  // Some API keys need the "AIza" prefix intact, while others might need additional formatting
  // Try these alternatives if your current key isn't working
  
  // Original key (as is from .env.local)
  geminiApiKey: 'AIzaSyB00fdoWvedIpJzhsfthtv1ot_9CeKYmI4',
  
  // Key alternatives for testing (uncomment to test)
  // geminiApiKey: 'AIzaSyB00fdoWvedIpJzhsfthtv1ot_9CeKYmI4', // Original
  // geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '', // From env var directly
  
  // API model and endpoint configuration
  model: 'gemini-pro',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro',
  apiVersion: 'v1beta',
  
  // Mock mode disabled - using real API calls to Gemini
  useMockMode: false,
};

// Mock response for testing without API calls
export const mockResponse = `This is a mock response from the Gemini API. The real API is not being called.`;

export default apiConfig;
