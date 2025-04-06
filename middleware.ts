import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/api/env-debug(.*)',
  '/api/gemini-test(.*)',
  '/weather(.*)',
  '/ai-analysis(.*)',
  '/dashboard(.*)', // Add dashboard to public routes for persistent sign-in
];

const isPublicRoute = createRouteMatcher(publicRoutes)

export default clerkMiddleware((auth, req) => {
  // For public routes, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // For any other routes, check authentication
  try {
    // This will throw if not authenticated
    auth.protect();
    return NextResponse.next();
  } catch (error) {
    // If not authenticated, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
