import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix the lockfile warning by specifying the root directory
  outputFileTracingRoot: process.cwd(),
  
  // Optimize for production builds
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
  },
  
  // Ensure proper TypeScript checking
  typescript: {
    // Only ignore TypeScript errors in development, not production
    ignoreBuildErrors: false,
  },
  
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
