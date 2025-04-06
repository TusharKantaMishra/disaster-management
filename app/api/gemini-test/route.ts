import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnection } from '@/backend/gemini-test';

/**
 * Simple API route to test Gemini API connectivity
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing Gemini API connection...');
    const testResult = await testGeminiConnection();
    console.log('Test result:', testResult);
    
    return NextResponse.json({ 
      success: !testResult.includes('Failed'),
      message: testResult 
    });
  } catch (error: any) {
    console.error('Error testing Gemini API:', error);
    
    return NextResponse.json({ 
      success: false,
      message: `Error testing Gemini connection: ${error?.message || 'Unknown error'}`,
      error: error?.toString()
    }, { status: 500 });
  }
}
