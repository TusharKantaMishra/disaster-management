/**
 * Utilities for processing markdown content in the AI Analysis page
 */

/**
 * Convert markdown text to simple HTML
 * This is a basic implementation for rendering markdown without external libraries
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    // Headers
    .replace(/^#\s(.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
    .replace(/^##\s(.+)$/gm, '<h2 class="text-xl font-bold my-3 text-primary">$1</h2>')
    .replace(/^###\s(.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
    
    // Bold and italic text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Lists
    .replace(/\n-\s([^\n]+)/g, '\n<li class="ml-4">$1</li>')
    .replace(/\n(\d+)\.\s([^\n]+)/g, '\n<li class="ml-4"><span class="font-bold">$1.</span> $2</li>')
    
    // Paragraphs and line breaks
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n(?!<)/g, '<br/>');
}

/**
 * Extract specific sections from the markdown analysis
 * Useful for showing recommendations, impact areas, etc. in separate tabs
 */
export function extractSection(markdown: string, sectionTitle: string): string {
  if (!markdown) return '';
  
  const regex = new RegExp(`##\\s${sectionTitle}([\\s\\S]*?)(?=##\\s|$)`, 'i');
  const match = markdown.match(regex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return '';
}

/**
 * Get a summary of the analysis (first section or intro)
 */
export function getAnalysisSummary(markdown: string): string {
  if (!markdown) return '';
  
  // Get the content after the title but before the first section
  const match = markdown.match(/^#\s(.+)$([\s\S]*?)(?=##\s|$)/m);
  
  if (match && match[2]) {
    return match[2].trim();
  }
  
  return '';
}

/**
 * Extract recommendations from the analysis
 */
export function extractRecommendations(markdown: string): string {
  return extractSection(markdown, 'Resource Allocation Recommendations') || 
         extractSection(markdown, 'Recommendations') || 
         extractSection(markdown, 'Resource Allocation');
}

/**
 * Extract timeline projections from the analysis
 */
export function extractTimeline(markdown: string): string {
  return extractSection(markdown, 'Timeline Projections') || 
         extractSection(markdown, 'Timeline') || 
         extractSection(markdown, 'Projected Timeline');
}
