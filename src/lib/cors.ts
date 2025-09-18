import { NextResponse } from 'next/server';

// CORS configuration for API endpoints
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Helper function to add CORS headers to any response
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper function to create CORS-enabled JSON response
export function corsResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

// Standard OPTIONS handler for preflight requests
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}