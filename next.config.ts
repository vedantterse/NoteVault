import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove outputFileTracingRoot for Vercel - let it handle automatically
  
  // Optimize for production builds and Vercel deployment
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
  
  // Ensure proper TypeScript checking in production
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Optimize for serverless environments (Vercel)
  output: 'standalone',
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
