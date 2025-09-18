import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { AuthToken } from '@/types';

export function withAuth(handler: (request: NextRequest, authToken: AuthToken) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authorization token required' },
          { status: 401 }
        );
      }

      const authToken = verifyToken(token);
      if (!authToken) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      return handler(request, authToken);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function withAdminAuth(handler: (request: NextRequest, authToken: AuthToken) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, authToken: AuthToken) => {
    if (authToken.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(request, authToken);
  });
}