import { corsResponse, handleOptions } from '@/lib/cors';

export async function GET() {
  return corsResponse({ status: 'ok' });
}

export async function OPTIONS() {
  return handleOptions();
}