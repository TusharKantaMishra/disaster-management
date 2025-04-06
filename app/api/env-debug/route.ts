import { NextRequest, NextResponse } from 'next/server';

// This route helps debug environment variable access issues
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envVars = {
      hasGeminiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      geminiKeyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('GEMINI') || 
        key.includes('SUPABASE')
      ),
      nodeEnv: process.env.NODE_ENV,
    };

    // Return environment variable diagnostic info
    return NextResponse.json({ 
      message: "Environment variable debug information", 
      env: envVars 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error accessing environment variables",
      message: error?.message 
    }, { status: 500 });
  }
}
