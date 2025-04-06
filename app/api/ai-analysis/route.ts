import { NextRequest, NextResponse } from 'next/server';
import { generateDisasterAnalysis } from '@/backend/gemini-client';
import type { DisasterAnalysisParams, AnalysisOptions } from '@/backend/gemini-client';

export async function POST(request: NextRequest) {
  try {
    // Using direct API configuration, no environment variable validation needed
    // Parse the request body
    const body = await request.json();
    const params: DisasterAnalysisParams = {
      state: body.state || '',
      disasterType: body.disasterType || '',
      customQuery: body.customQuery || '',
      options: {
        historicalData: body.options?.historicalData || false,
        detailedResponse: body.options?.detailedResponse || false,
        confidenceScores: body.options?.confidenceScores || false,
        preventiveMeasures: body.options?.preventiveMeasures || false
      }
    };

    // Validate required parameters
    if (!params.state || !params.disasterType) {
      return NextResponse.json(
        { error: 'State and disaster type are required' },
        { status: 400 }
      );
    }

    // Generate the analysis using Gemini API
    const analysis = await generateDisasterAnalysis(params);

    // Return the analysis
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Error in AI analysis API:', error);
    
    // Provide more detailed error message to help with debugging
    const errorMessage = error?.message || 'Unknown error occurred';
    console.error('Detailed error:', errorMessage);
    
    // Check if this is an API key related error
    if (errorMessage.includes('API key') || errorMessage.includes('credential') || errorMessage.includes('auth')) {
      return NextResponse.json(
        { error: 'Authentication error with Gemini API. Please check your API key.', details: errorMessage },
        { status: 401 }
      );
    }
    
    // Return the error with details to help debug the issue
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: errorMessage },
      { status: 500 }
    );
  }
}
