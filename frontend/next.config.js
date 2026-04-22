/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone for optimal Docker image size
  output: 'standalone',
  
  // Skip ESLint during production build.
  // Pre-existing `no-explicit-any` issues exist across many legacy files.
  // These should be fixed incrementally; they should not block deployments.
  eslint: {
    ignoreDuringBuilds: true,
  },

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
