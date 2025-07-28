/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove any static export configuration
  // This app requires SSR for authentication and API routes
  
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  
  // Environment variables for build
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  
  // Image optimization for production
  images: {
    unoptimized: false, // Keep optimized for better performance
  },
};

export default nextConfig;
