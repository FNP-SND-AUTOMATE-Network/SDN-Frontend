/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@fortawesome/react-fontawesome'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,
  
  // Optimize images
  images: {
    unoptimized: true, // Disable image optimization for faster dev builds
  },
  
  // Emotion SSR configuration
  transpilePackages: ['@mui/material', '@emotion/react', '@emotion/styled'],
}

module.exports = nextConfig
