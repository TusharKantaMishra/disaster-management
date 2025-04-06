/**
 * Environment variable configuration
 * This ensures consistent access to environment variables throughout the application
 */

// Server-side environment variables
export const serverEnv = {
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Public environment variables accessible in browser
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

/**
 * Validates that all required environment variables are set
 * @returns Object containing any missing variables
 */
export function validateEnv() {
  const missing: Record<string, boolean> = {};
  
  if (!serverEnv.geminiApiKey) missing.NEXT_PUBLIC_GEMINI_API_KEY = true;
  if (!serverEnv.supabaseUrl) missing.NEXT_PUBLIC_SUPABASE_URL = true;
  if (!serverEnv.supabaseAnonKey) missing.NEXT_PUBLIC_SUPABASE_ANON_KEY = true;
  
  return { missing, valid: Object.keys(missing).length === 0 };
}

export default { serverEnv, publicEnv, validateEnv };
