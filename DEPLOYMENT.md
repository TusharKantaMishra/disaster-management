# Disaster Management Application Deployment Guide

This guide provides step-by-step instructions for deploying the Disaster Management application to both Vercel and Render platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying to Render](#deploying-to-render)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account with the project repository
2. Access to your Supabase project dashboard
3. Clerk account and API keys (if using authentication)
4. Appropriate environment variables ready

## Environment Variables

The following environment variables need to be configured in your deployment platform:

```
# Next.js
NEXT_PUBLIC_SITE_URL=https://your-deployment-url.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Deploying to Vercel

Vercel is the recommended platform for Next.js applications, offering seamless integration and optimized performance.

### Steps for Vercel Deployment

1. **Sign up or log in to Vercel**
   - Go to [Vercel's website](https://vercel.com) and sign up or log in
   - Connect your GitHub account if you haven't already

2. **Import your repository**
   - Click "Add New..." → "Project"
   - Select the Disaster Management repository from the list
   - If you don't see it, you may need to configure Vercel's GitHub integration

3. **Configure project settings**
   - Keep the default framework preset (Next.js)
   - Set the root directory to `/disaster-management` if your project is in a subdirectory
   - Set the build command to `npm run build` (this should be detected automatically)
   - Set the output directory to `.next` (this should be detected automatically)

4. **Environment Variables**
   - Scroll down to the "Environment Variables" section
   - Add all the necessary environment variables from the list above
   - Make sure to properly set "Production", "Preview", and "Development" toggles as needed

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Once complete, you'll receive a URL for your deployed application

6. **Connect Custom Domain (Optional)**
   - Go to your project dashboard
   - Click on "Domains"
   - Follow the instructions to add and verify your custom domain

## Deploying to Render

Render provides a robust platform for web applications with a generous free tier.

### Steps for Render Deployment

1. **Sign up or log in to Render**
   - Go to [Render's website](https://render.com) and sign up or log in
   - Connect your GitHub account

2. **Create a new Web Service**
   - From your dashboard, click "New" → "Web Service"
   - Connect your GitHub repository
   - Give your service a name (e.g., "disaster-management-app")

3. **Configure the service**
   - Set the following configuration:
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Choose appropriate plan (Free tier is suitable for testing)

4. **Environment Variables**
   - Scroll down to the "Environment" section
   - Add all the necessary environment variables from the list above
   - Add `NODE_ENV=production`

5. **Advanced Options (optional)**
   - Configure auto-deploy settings
   - Set up health check paths (e.g., `/api/health`)
   - Configure resource limits if needed

6. **Deploy the service**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Once complete, you'll receive a URL for your deployed application

7. **Connect Custom Domain (Optional)**
   - Go to your web service dashboard
   - Click on "Settings" → "Custom Domains"
   - Follow the instructions to add and verify your custom domain

## Post-Deployment Configuration

After deploying to either platform, perform these additional steps:

1. **Verify Environment Variables**
   - Check that all environment variables are correctly set in the production environment
   - Test authentication flows to ensure Clerk keys are working properly

2. **Update CORS Settings in Supabase**
   - Log in to your Supabase dashboard
   - Go to Project Settings → API
   - Add your deployed URL to the list of allowed origins for CORS

3. **Test Core Functionality**
   - Test the disaster map functionality
   - Verify that data is correctly fetched from Supabase
   - Test user authentication if implemented

## Troubleshooting

### Common Issues on Vercel

1. **Build Failures**
   - Check build logs for specific errors
   - Ensure all dependencies are listed in package.json
   - Verify that your Node.js version is compatible (set in vercel.json if needed)

2. **API Routes Not Working**
   - Make sure your API routes are in the correct location (/app/api/*)
   - Check environment variables related to API services

3. **Environment Variable Issues**
   - Double-check that all required environment variables are set
   - Ensure you've added the variables to the correct project

### Common Issues on Render

1. **Application Crashes on Startup**
   - Check logs for error messages
   - Verify the start command is correct
   - Ensure all dependencies are properly installed

2. **Performance Issues**
   - Consider upgrading from the free tier for production use
   - Enable automatic scaling if available on your plan

3. **Connection to Supabase Failing**
   - Verify Supabase environment variables
   - Check if IP restrictions are enabled in Supabase

---

If you encounter any issues not covered in this guide, refer to the [Vercel documentation](https://vercel.com/docs) or [Render documentation](https://render.com/docs) for platform-specific guidance.
