import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { apiConfig, mockResponse } from './api-config';

// Initialize the Gemini API client with direct configuration
const apiKey = apiConfig?.geminiApiKey || '';
const useMockMode = apiConfig?.useMockMode || false;

// Only initialize the real API client if not in mock mode and API key is valid
let genAI: GoogleGenerativeAI | null = null;

if (!useMockMode && apiKey && apiKey.length > 0) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Log API key status (without revealing the key) - server-side only
    if (typeof window === 'undefined') {
      console.log(`Using direct API config. Gemini API key is set (length: ${apiKey.length})`);
    }
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    genAI = null;
  }
} else if (typeof window === 'undefined') {
  // Log mock mode status - server-side only
  console.log(`⚠️ ${useMockMode ? 'MOCK MODE ENABLED' : 'INVALID API KEY'}: No actual API calls will be made to Gemini`);
}

// Define safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Interface for analysis options
export interface AnalysisOptions {
  historicalData: boolean;
  detailedResponse: boolean;
  confidenceScores: boolean;
  preventiveMeasures: boolean;
}

// Interface for disaster analysis parameters
export interface DisasterAnalysisParams {
  state: string;
  disasterType: string;
  customQuery?: string;
  options: AnalysisOptions;
}

/**
 * Generate a disaster analysis report using Gemini
 * @param params Analysis parameters
 * @returns The generated analysis text
 */
async function generateDisasterAnalysis(params: DisasterAnalysisParams): Promise<string> {
  try {
    // Validate input parameters
    if (!params?.state || !params?.disasterType) {
      throw new Error('Missing required parameters: state and disasterType must be provided');
    }

    if (!params.options) {
      throw new Error('Missing required parameters: options must be provided');
    }
    
    console.log('Starting disaster analysis generation with parameters:', {
      state: params.state,
      disasterType: params.disasterType,
      hasCustomQuery: !!params.customQuery,
      options: params.options
    });
    
    // Ensure Gemini API is initialized
    if (!genAI) {
      throw new Error('Gemini API client is not initialized. Please ensure your API key is valid.');
    }
    
    // Get the Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Construct the prompt with detailed context
    const prompt = constructAnalysisPrompt(params);
    console.log('Sending prompt to Gemini API. Prompt length:', prompt.length);
    
    try {
      // Generate content
      console.log('Attempting to generate content with Gemini 2.0 Flash model...');
      const result = await model.generateContent(prompt);
      console.log('Content generation successful, getting response...');
      const response = await result.response;
      console.log('Response received, extracting text...');
      const text = response.text();
      
      console.log('Successfully received response from Gemini API. Response length:', text.length);
      return text;
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError);
      
      // Provide more detailed error messages based on common issues
      if (apiError && apiError.message && typeof apiError.message === 'string') {
        if (apiError.message.includes('API key')) {
          throw new Error('Invalid or unauthorized Gemini API key. Please check your credentials.');
        } else if (apiError.message.includes('model')) {
          throw new Error('Error with Gemini model. Please ensure you are using the correct model name "gemini-2.0-flash".');
        } else if (apiError.message.includes('quota') || apiError.message.includes('limit')) {
          throw new Error('You have exceeded your Gemini API quota or rate limit. Please try again later.');
        } else if (apiError.message.includes('network') || apiError.message.includes('timeout')) {
          throw new Error('Network error or timeout when connecting to Gemini API. Please check your internet connection.');
        }
      }
      
      // Log the detailed error for debugging
      console.error('Detailed Gemini API error:', JSON.stringify(apiError, null, 2));
      throw new Error(`Gemini API error: ${apiError?.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating disaster analysis:', error);
    
    // Propagate the error rather than falling back to mock data
    throw error;
  }
}

/**
 * Generate a mock disaster analysis response for testing
 */
function generateMockDisasterAnalysis(params: DisasterAnalysisParams): string {
  // Ensure params are valid, use defaults if not
  const state = params?.state || 'All India';
  const disasterType = params?.disasterType || 'disaster';
  const options = params?.options || { historicalData: false, detailedResponse: false, confidenceScores: false, preventiveMeasures: false };
  const detailedMode = options?.detailedResponse;
  
  return `# Disaster Analysis Report for ${state || 'All India'}

## Overview
This is a **MOCK** analysis of potential ${disasterType} impact in ${state || 'the selected region'}. In production, this would be generated by Google's Gemini AI.

## Predicted Impact Areas
- **High Risk Zones**: Northern districts of ${state || 'the selected region'} are at 75% risk level
- **Medium Risk Zones**: Central areas show moderate vulnerability (45% risk)
- **Low Risk Zones**: Southern districts have minimal exposure (15% risk)

## Resource Allocation Recommendations
1. **Emergency Medical Supplies**: Deploy 30 medical teams to high-risk zones
2. **Temporary Shelters**: Establish 25 temporary shelters in vulnerable areas
3. **Food & Water**: Pre-position supplies for an estimated 10,000 affected people
${detailedMode ? `
4. **Communication Systems**: Ensure emergency communication networks have backup power
5. **Transportation**: Identify and maintain emergency evacuation routes` : ''}

## Timeline Projections
- **72 Hours Pre-Event**: Complete evacuation of highest risk areas
- **48 Hours Pre-Event**: Position all emergency response teams
- **24 Hours Pre-Event**: Activate all emergency protocols

${options?.confidenceScores ? `## Confidence Scores
This analysis has an overall confidence level of 87% based on historical patterns and current data.` : ''}

${options?.preventiveMeasures ? `## Long-term Preventive Measures
1. Develop improved early warning systems
2. Invest in resilient infrastructure
3. Conduct regular community disaster drills
4. Update building codes for disaster resistance` : ''}

> Note: This is simulated data for testing purposes. In a production environment, this would be generated by the Gemini AI model using real-time data and advanced analytics.`;
}

/**
 * Construct a detailed prompt for disaster analysis
 */
function constructAnalysisPrompt(params: DisasterAnalysisParams): string {
  // Handle potentially missing params safely
  const state = params?.state || 'All India';
  const disasterType = params?.disasterType || 'disaster';
  const customQuery = params?.customQuery;
  const options = params?.options || { historicalData: false, detailedResponse: false, confidenceScores: false, preventiveMeasures: false };
  const { historicalData, detailedResponse, confidenceScores, preventiveMeasures } = options;
  
  let prompt = `
  You are an expert disaster management AI assistant. Generate a detailed analysis for a potential ${disasterType} in ${state}, India.
  
  Your analysis should include:
  1. Predicted impact areas with risk levels (high/medium/low)
  2. Resource allocation recommendations (medical supplies, shelters, food, water)
  3. Timeline projections for preparation, response, and recovery
  4. Key vulnerability factors specific to this region
  5. Historical pattern analysis if relevant
  `;
  
  if (historicalData) {
    prompt += `
    Include analysis of historical ${disasterType} events in ${state} or similar regions, patterns identified, and how they inform current predictions.
    `;
  }
  
  if (customQuery) {
    prompt += `
    Additionally, address this specific query: ${customQuery}
    `;
  }
  
  if (detailedResponse) {
    prompt += `
    Provide detailed quantitative estimates where possible, including:
    - Specific percentages for risk levels
    - Estimated number of people potentially affected
    - Quantity of resources recommended
    - Specific timeframes for action items
    `;
  }
  
  if (confidenceScores) {
    prompt += `
    Include confidence scores for your predictions and recommendations, expressed as percentages.
    For example: "This recommendation has a 85% confidence level based on available data."
    `;
  }
  
  if (preventiveMeasures) {
    prompt += `
    Include a section on long-term preventive measures and infrastructure improvements that could 
    reduce the impact of future ${disasterType} events in ${state}.
    `;
  }
  
  prompt += `
  Format your response as plain text with clear sections. Use appropriate emojis throughout your response to enhance readability and engagement. For example:
  - Use 🚨 for warnings
  - Use 🏥 for medical resources
  - Use 🏠 for shelter information
  - Use 🌊 for flood related information
  - Use 🔥 for fire related information
  - Use 🌪️ for cyclone/storm related information
  - Use 📊 for statistics
  - Use 📅 for timeline information
  - Use ⚠️ for caution
  - Use other relevant emojis that match the disaster type and analysis sections
  `;
  
  return prompt;
}

/**
 * Generate a visual report with maps and charts using Gemini's multimodal capabilities
 * @param params Analysis parameters
 * @returns The generated analysis text with visualization descriptions
 */
async function generateVisualReport(params: DisasterAnalysisParams): Promise<string> {
  try {
    // Validate input parameters
    if (!params?.state || !params?.disasterType) {
      throw new Error('Missing required parameters: state and disasterType must be provided');
    }

    if (!params.options) {
      throw new Error('Missing required parameters: options must be provided');
    }
    
    console.log('Starting visual report generation with parameters:', {
      state: params.state,
      disasterType: params.disasterType,
      hasCustomQuery: !!params.customQuery
    });
    
    // Ensure Gemini API is initialized
    if (!genAI) {
      throw new Error('Gemini API client is not initialized. Please ensure your API key is valid.');
    }
    
    // Get the Gemini 2.0 Pro model with better support for structured content
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro",
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Construct the prompt for visual report generation
    const visualPrompt = `Generate a detailed visual report for ${params.disasterType} in ${params.state}.
    
    Please include:
    1. Descriptions of heat maps showing affected areas
    2. Detailed charts of resource allocation needed
    3. Timeline visualizations for disaster response
    4. Geographic data visualization recommendations
    5. Data visualization best practices for disaster management
    
    Format your response as plain text with clear sections. Use appropriate emojis throughout your response to enhance readability and engagement. For example:
    - Use 🗺️ for maps and geographic information
    - Use 📊 for charts and statistics
    - Use 📈 for trends and analysis
    - Use 🏥 for medical resources
    - Use 🏠 for shelter information
    - Use 🌊 for flood related information
    - Use 🔥 for fire related information
    - Use 🌪️ for cyclone/storm related information
    - Use 📅 for timeline information
    - Use ⚠️ for caution areas
    - Use other relevant emojis that match the disaster type and visualization sections`;
    
    console.log('Sending visual report prompt to Gemini API. Prompt length:', visualPrompt.length);
    
    // Generate content
    console.log('Attempting to generate visual report with Gemini 2.0 Pro model...');
    const result = await model.generateContent(visualPrompt);
    console.log('Content generation successful, getting response...');
    const response = await result.response;
    console.log('Response received, extracting text...');
    const text = response.text();
    
    console.log('Successfully received visual report from Gemini API. Response length:', text.length);
    return text;
  } catch (error) {
    console.error('Error generating visual disaster report:', error);
    throw error;
  }
}



// Use named exports for clarity and better type safety
export {
  generateDisasterAnalysis,
  generateVisualReport,
  generateMockDisasterAnalysis,
  constructAnalysisPrompt
};

// No need to re-export types already exported above

// Also provide a default export for backward compatibility
export default {
  generateDisasterAnalysis,
  generateVisualReport
};
