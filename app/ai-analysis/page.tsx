'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, ArrowRight, BarChart3, ClipboardList, AlertTriangle, CloudLightning, Loader2, Info, Download, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { DISASTER_TYPES, DEFAULT_ANALYSIS_OPTIONS } from "./analysis-types";
import { markdownToHtml, extractRecommendations, extractTimeline } from "./markdown-utils";
import { generatePdfFromHtml, generatePdfFromText } from "@/lib/pdf-utils";

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function AIAnalysisPage() {
  // UI state
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Analysis parameters
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [analysisResult, setAnalysisResult] = useState<null | string>(null);
  
  // Analysis options
  const [useHistoricalData, setUseHistoricalData] = useState(DEFAULT_ANALYSIS_OPTIONS.useHistoricalData);
  const [detailedResponse, setDetailedResponse] = useState(DEFAULT_ANALYSIS_OPTIONS.detailedResponse);
  const [confidenceScores, setConfidenceScores] = useState(DEFAULT_ANALYSIS_OPTIONS.confidenceScores);
  const [suggestPreventiveMeasures, setSuggestPreventiveMeasures] = useState(DEFAULT_ANALYSIS_OPTIONS.suggestPreventiveMeasures);
  
  // Extracted sections for tabs
  const [recommendations, setRecommendations] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    try {
      if (!analysisResult) {
        console.error('No analysis result to download');
        return;
      }
      
      setPdfLoading(true);
      
      // Generate a filename based on the selected parameters
      const formattedDate = new Date().toISOString().slice(0, 10);
      const sanitizedDisaster = selectedDisaster.replace(/\s+/g, '-').toLowerCase();
      const sanitizedState = selectedState ? selectedState.replace(/\s+/g, '-').toLowerCase() : 'all-india';
      const filename = `${sanitizedDisaster}-analysis-${sanitizedState}-${formattedDate}.pdf`;
      
      // Choose the PDF generation method based on the current content
      if (resultsRef.current) {
        // If we have HTML content, use the HTML-to-PDF method
        await generatePdfFromHtml(resultsRef.current, filename);
      } else {
        // Fallback to plain text method
        const title = `${selectedDisaster} Analysis for ${selectedState || 'All India'}`;
        generatePdfFromText(analysisResult, title, filename);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Extract key information from analysis results to use in different tabs
  useEffect(() => {
    if (analysisResult) {
      const extractedRecommendations = extractRecommendations(analysisResult);
      const extractedTimeline = extractTimeline(analysisResult);
      
      setRecommendations(extractedRecommendations);
      setTimeline(extractedTimeline);
    }
  }, [analysisResult]);
  
  // Generate disaster analysis report by calling the API
  const generateAnalysis = async () => {
    if (!selectedDisaster) {
      alert('Please select a disaster type');
      return;
    }
    
    try {
      setLoading(true);
      setAnalysisResult(null);
      setRecommendations('');
      setTimeline('');
      
      // Build request body
      const requestBody = {
        state: selectedState,
        disasterType: selectedDisaster,
        customQuery: query.trim(),
        options: {
          historicalData: useHistoricalData,
          detailedResponse: detailedResponse,
          confidenceScores: confidenceScores,
          preventiveMeasures: suggestPreventiveMeasures
        }
      };
      
      // Make API request
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        // Try to extract error details from the response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || `API error: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.analysis) {
        throw new Error('No analysis data returned from API');
      }
      
      setAnalysisResult(data.analysis);
      
      // Auto-switch to results tab when analysis is complete
      setActiveTab('results');
    } catch (error: any) {
      // Improved error logging with full details
      console.error('Error generating analysis:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        toString: error?.toString()
      });
      
      // Check if it's an API key related error
      const isAuthError = error?.message?.includes('API key') || 
                        error?.message?.includes('credentials') || 
                        error?.message?.includes('auth') || 
                        error?.message?.includes('NEXT_PUBLIC_GEMINI_API_KEY');
                        
      if (isAuthError) {
        setAnalysisResult(`# Authentication Error

There was a problem authenticating with the Gemini AI service. Please check the API key configuration.

## Error Details
${error?.message || 'Unknown error'}

## Troubleshooting Steps
1. Verify the NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file
2. Make sure the API key is valid and not expired
3. Check for any restrictions on your Google AI Studio account
4. Restart the development server after changing environment variables`);
      } else {
        setAnalysisResult(`# Analysis Error

Sorry, an error occurred while generating the analysis. Please try again later.

## Error Details
${error?.message || 'Unknown error'}

## What to try
- Check your internet connection
- Try a different disaster type or state
- Simplify your custom query if you provided one
- Check server logs for more details`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="text-primary h-6 w-6" />
            <span className="text-foreground font-bold text-xl">AI Disaster Analysis</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <Link href="/weather" className="text-muted-foreground hover:text-primary">Weather</Link>
            <Link href="/inventory" className="text-muted-foreground hover:text-primary">Resources</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Page Body */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">AI Disaster Analysis</h1>
        <p className="text-muted-foreground mb-12 text-lg max-w-3xl">
          Leverage the power of artificial intelligence to analyze disaster data, predict resource needs, and optimize emergency response plans.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Parameters</CardTitle>
                <CardDescription>Configure your disaster analysis query</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">State/Region</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state or territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES_AND_UTS.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Disaster Type</label>
                  <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISASTER_TYPES.map(disaster => (
                        <SelectItem key={disaster.value} value={disaster.value}>
                          {disaster.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Custom Query</label>
                  <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Add specific details or conditions (optional)"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium mb-1 block">Analysis Options</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        <Label htmlFor="historical-data" className="text-sm">Include Historical Data</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Enriches analysis with past disaster data for the selected region</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="historical-data"
                        checked={useHistoricalData}
                        onCheckedChange={setUseHistoricalData}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        <Label htmlFor="detailed-response" className="text-sm">Detailed Response</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Provides comprehensive analysis with detailed sections and recommendations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="detailed-response"
                        checked={detailedResponse}
                        onCheckedChange={setDetailedResponse}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        <Label htmlFor="confidence-scores" className="text-sm">Include Confidence Scores</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Adds AI confidence levels to predictions and recommendations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="confidence-scores"
                        checked={confidenceScores}
                        onCheckedChange={setConfidenceScores}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 items-center">
                        <Label htmlFor="preventive-measures" className="text-sm">Suggest Preventive Measures</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Includes long-term preventive strategies and infrastructure recommendations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        id="preventive-measures"
                        checked={suggestPreventiveMeasures}
                        onCheckedChange={setSuggestPreventiveMeasures}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={generateAnalysis} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Generate Analysis'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <BarChart3 className="text-blue-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Predictive Impact Analysis</h4>
                    <p className="text-muted-foreground text-sm">Forecast potential impact zones</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-green-100 rounded-md">
                    <ClipboardList className="text-green-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Resource Optimization</h4>
                    <p className="text-muted-foreground text-sm">Recommend efficient resource allocation</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-yellow-100 rounded-md">
                    <AlertTriangle className="text-yellow-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Early Warning System</h4>
                    <p className="text-muted-foreground text-sm">Preemptive alerts based on risk indicators</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <CloudLightning className="text-purple-600 h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Weather Pattern Analysis</h4>
                    <p className="text-muted-foreground text-sm">Pattern detection for proactive planning</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Analysis Results</CardTitle>
                  {analysisResult && (
                    <Button
                      onClick={handleDownloadPdf}
                      variant="outline"
                      size="sm"
                      disabled={pdfLoading}
                      className="flex items-center gap-1"
                    >
                      {pdfLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="results">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="results" className="min-h-[500px]">
                    {analysisResult ? (
                      <div 
                        ref={resultsRef}
                        className="prose prose-sm dark:prose-invert max-w-none" 
                        dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Brain className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-2">No Analysis Generated Yet</h3>
                        <p className="text-muted-foreground">Select your parameters and click "Generate Analysis" to begin.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="visualizations" className="min-h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-2">Visualizations Coming Soon</h3>
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="min-h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <ClipboardList className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                      <h3 className="text-lg font-medium mb-2">Recommendations Coming Soon</h3>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
