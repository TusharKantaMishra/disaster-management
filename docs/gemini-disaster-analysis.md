# Implementing Advanced Disaster Analysis with Gemini AI

This guide explains how to integrate Google's Gemini AI model into the disaster management application to perform detailed disaster analysis, prediction, and recommendation generation.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Implementation Steps](#implementation-steps)
5. [API Integration](#api-integration)
6. [Frontend Implementation](#frontend-implementation)
7. [Example Prompts](#example-prompts)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)

## Overview

The disaster management application can leverage Gemini's powerful multi-modal AI capabilities to:

- Analyze disaster risk patterns based on historical data
- Generate predictive impact assessments for specific regions
- Recommend resource allocation strategies
- Create evacuation plans and timelines
- Process and analyze disaster-related imagery
- Generate natural language explanations and reports

This implementation extends the existing AI analysis page to connect with Gemini's API and generate sophisticated disaster management insights.

## Prerequisites

- Google API Key with access to Gemini models
- Node.js environment for backend processing
- Understanding of the disaster management application codebase
- Basic knowledge of prompt engineering
- Access to disaster-related data for analysis

## Architecture

The integration follows this architecture:

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ React Frontend│      │ Next.js API   │      │  Gemini API   │
│ (AI Analysis  │──────│ (Middleware/  │──────│ (Google AI    │
│  Page)        │      │  Handler)     │      │  Services)    │
└───────────────┘      └───────────────┘      └───────────────┘
        │                      │                      │
        │                      │                      │
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ State/Region  │      │Disaster Data  │      │  Response     │
│ Selection     │      │Processing and │      │  Processing & │
│ Component     │      │Context Building│      │  Rendering    │
└───────────────┘      └───────────────┘      └───────────────┘
```

## Implementation Steps

### 1. Set Up Gemini API Access

First, create an API key from Google AI Studio:

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Navigate to "API Keys" in the settings
4. Create a new API key
5. Store this key securely in your environment variables

### 2. Install Required Packages

```bash
npm install @google/generative-ai dotenv
```

### 3. Create a Gemini Client Module

Create a new file `backend/gemini-client.ts`:

```typescript
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

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

// Interface for disaster analysis parameters
export interface DisasterAnalysisParams {
  state: string;
  disasterType: string;
  customQuery?: string;
  historicalData?: boolean;
  detailedResponse?: boolean;
}

/**
 * Generate a disaster analysis report using Gemini
 * @param params Analysis parameters
 * @returns The generated analysis text
 */
export async function generateDisasterAnalysis(params: DisasterAnalysisParams): Promise<string> {
  try {
    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings,
    });

    // Construct the prompt with detailed context
    const prompt = constructAnalysisPrompt(params);
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating disaster analysis:', error);
    throw error;
  }
}

/**
 * Construct a detailed prompt for disaster analysis
 */
function constructAnalysisPrompt(params: DisasterAnalysisParams): string {
  const { state, disasterType, customQuery, historicalData, detailedResponse } = params;
  
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
  
  prompt += `
  Format your response in Markdown with clear headings, bullet points, and sections.
  `;
  
  return prompt;
}

/**
 * Generate a visual report with maps and charts (for future implementation)
 */
export async function generateVisualReport(params: DisasterAnalysisParams): Promise<string> {
  // Placeholder for future implementation
  // This would use Gemini's multimodal capabilities
  return "Visual report generation coming soon";
}

export default {
  generateDisasterAnalysis,
  generateVisualReport,
};
```

### 4. Create an API Route for Gemini

Create a new file `app/api/ai-analysis/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateDisasterAnalysis, DisasterAnalysisParams } from '@/backend/gemini-client';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const params: DisasterAnalysisParams = {
      state: body.state || '',
      disasterType: body.disasterType || '',
      customQuery: body.customQuery || '',
      historicalData: body.historicalData || false,
      detailedResponse: body.detailedResponse || false,
    };

    // Validate required parameters
    if (!params.state || !params.disasterType) {
      return NextResponse.json(
        { error: 'State and disaster type are required' },
        { status: 400 }
      );
    }

    // Generate the analysis
    const analysis = await generateDisasterAnalysis(params);

    // Return the analysis
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error in AI analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
```

## 5. Update the Frontend

Modify the AI Analysis page to integrate with the Gemini API:

```typescript
// Enhance the states collection with additional properties for the AI analysis
interface EnhancedState {
  name: string;
  population?: number;
  area?: number;
  disasterProne?: {
    flood: boolean;
    earthquake: boolean;
    cyclone: boolean;
    drought: boolean;
    landslide: boolean;
  };
  historicalEvents?: string[];
}

// Define disaster types
const DISASTER_TYPES = [
  { value: 'flood', label: 'Flood' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'cyclone', label: 'Cyclone' },
  { value: 'drought', label: 'Drought' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'heatwave', label: 'Heatwave' },
  { value: 'wildfire', label: 'Wildfire' },
];

// Update the component state
const [loading, setLoading] = useState(false);
const [selectedState, setSelectedState] = useState('');
const [selectedDisaster, setSelectedDisaster] = useState('');
const [query, setQuery] = useState('');
const [analysisResult, setAnalysisResult] = useState<string | null>(null);
const [useHistoricalData, setUseHistoricalData] = useState(true);
const [detailedResponse, setDetailedResponse] = useState(true);

// Update the generateAnalysis function
const generateAnalysis = async () => {
  if (!selectedState || !selectedDisaster) {
    toast({
      title: "Missing information",
      description: "Please select both a state and disaster type",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  
  try {
    const response = await fetch('/api/ai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: selectedState,
        disasterType: selectedDisaster,
        customQuery: query,
        historicalData: useHistoricalData,
        detailedResponse: detailedResponse,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate analysis');
    }

    setAnalysisResult(data.analysis);
  } catch (error) {
    console.error('Error generating analysis:', error);
    toast({
      title: "Analysis failed",
      description: "Failed to generate disaster analysis. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

## API Integration

### Setting Up Environment Variables

Create or update your `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### API Usage and Quota Management

- Gemini API has usage quotas and rate limits
- Monitor your usage in the Google AI Studio dashboard
- Consider implementing caching for common analysis requests
- Add retry logic for potential service interruptions

## Example Prompts

### Basic Disaster Analysis Prompt

```
You are an expert disaster management AI assistant. Generate a detailed analysis for a potential flood in Kerala, India.

Your analysis should include:
1. Predicted impact areas with risk levels (high/medium/low)
2. Resource allocation recommendations (medical supplies, shelters, food, water)
3. Timeline projections for preparation, response, and recovery
4. Key vulnerability factors specific to this region
5. Historical pattern analysis if relevant

Format your response in Markdown with clear headings, bullet points, and sections.
```

### Specialized Query Prompt

```
You are an expert disaster management AI assistant. Generate a detailed analysis for a potential earthquake in Gujarat, India.

Focus specifically on:
- Early warning systems that could be implemented
- Critical infrastructure vulnerability assessment
- Post-disaster reconstruction planning
- Economic impact projection
- Communication strategy recommendations

Include references to the 2001 Bhuj earthquake where relevant as a historical case study.

Format your response in Markdown with clear headings, bullet points, and sections.
```

## Advanced Features

### Multi-modal Analysis

For future implementation, Gemini can analyze disaster imagery:

```typescript
async function analyzeDisasterImagery(imageFile: File, params: DisasterAnalysisParams) {
  const imageBytes = await fileToGenerativePart(imageFile);
  
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  const prompt = `Analyze this disaster imagery from ${params.state} showing impact from ${params.disasterType}. 
  Identify damage levels, affected infrastructure, and prioritize response actions.`;
  
  const result = await model.generateContent([prompt, imageBytes]);
  const response = await result.response;
  return response.text();
}

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}
```

### Interactive Disaster Scenarios

Enable users to explore different scenarios:

```typescript
interface ScenarioParams extends DisasterAnalysisParams {
  severity: 'mild' | 'moderate' | 'severe';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  responseCapacity: 'limited' | 'adequate' | 'extensive';
}

async function generateScenarioAnalysis(params: ScenarioParams): Promise<string> {
  // Implementation details
}
```

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify the GEMINI_API_KEY is correctly set in your environment variables
   - Check API key permissions and quotas in Google AI Studio

2. **Model Responses**
   - If responses are too generic, improve prompt specificity
   - For cutoff responses, check the token limits and adjust prompts

3. **Rate Limiting**
   - Implement exponential backoff for retries
   - Add request queuing for high-traffic scenarios

4. **Response Format Issues**
   - Explicitly request markdown formatting in prompts
   - Post-process responses to ensure consistent formatting

### Performance Optimization

- Cache common analysis results
- Implement server-side rendering for analysis results
- Use streaming responses for long-form analysis
- Batch related queries where possible

## Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Disaster Management Best Practices](https://www.undrr.org/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Markdown Rendering Libraries](https://github.com/remarkjs/react-markdown)

---

*This implementation guide was prepared for the Disaster Management application. For additional assistance or feature requests, please contact the development team.*
