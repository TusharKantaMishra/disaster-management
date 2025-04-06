/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Images configuration for optimization
  images: {
    domains: ['detidpcvwegdscfibprm.supabase.co'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  
  // Experimental features
  experimental: {
    // Disable static export for pages that require client-side functionality
    appDir: true,
  },

  // Configure static exports carefully
  output: 'standalone',
  
  // Explicitly set which pages should not be statically generated
  // This is needed for pages like disaster-map that use browser APIs
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove the disaster-map page from static export pathmap
    delete defaultPathMap['/disaster-map'];
    
    return defaultPathMap;
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/disaster-map',
        has: [
          {
            type: 'header',
            key: 'Accept',
            value: 'text/html',
          },
        ],
        permanent: false,
        destination: '/disaster-map',
      },
    ];
  },
  
  // Configure transpilation for dependencies
  transpilePackages: ['react-leaflet', 'leaflet'],
};

module.exports = nextConfig;
