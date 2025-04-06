// Simple script to test environment variable loading
require('dotenv').config({ path: './.env.local' });

console.log('Environment variable test:');
console.log('--------------------------');
console.log('NEXT_PUBLIC_GEMINI_API_KEY present:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
console.log('NEXT_PUBLIC_GEMINI_API_KEY length:', process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length || 0);
console.log('NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// List all environment variables with "GEMINI" in their name
const geminiVars = Object.keys(process.env).filter(key => key.includes('GEMINI'));
console.log('\nAll GEMINI environment variables:', geminiVars);

// Check for API key without NEXT_PUBLIC prefix
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
