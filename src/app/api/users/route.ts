import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAdminAuth } from '@/middleware/auth';
import { ApiResponse, AuthToken } from '@/types';
import { corsResponse, handleOptions } from '@/lib/cors';

interface UserListItem {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// GET /api/users - Get all users in the admin's tenant
export const GET = withAdminAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    // Only admins can view users
    if (authToken.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied: Admin privileges required' },
        { status: 403 }
      );
    }

    // Fetch all users in the same tenant
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, created_at')
      .eq('tenant_id', authToken.tenantId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const response: ApiResponse<UserListItem[]> = {
      success: true,
      data: users || [],
      message: 'Users retrieved successfully'
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return handleOptions();
}