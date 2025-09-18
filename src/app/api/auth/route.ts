import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { comparePassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { LoginRequest, ApiResponse, LoginResponse } from '@/types';
import { corsResponse, handleOptions } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('Auth attempt for:', email);

    if (!email || !password) {
      return corsResponse(
        { success: false, error: 'Email and password are required' },
        400
      );
    }

    // Find user with tenant information
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        password_hash,
        role,
        tenant_id,
        created_at,
        updated_at,
        tenants!inner (
          id,
          name,
          slug,
          subscription_plan,
          created_at,
          updated_at
        )
      `)
      .eq('email', email)
      .single();

    console.log('User query result:', { userData, userError });

    if (userError || !userData) {
      console.log('User not found or error:', userError);
      return corsResponse(
        { success: false, error: 'Invalid credentials' },
        401
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, userData.password_hash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return corsResponse(
        { success: false, error: 'Invalid credentials' },
        401
      );
    }

    // Extract tenant data (Supabase returns an array for joined tables)
    const tenantData = Array.isArray(userData.tenants) ? userData.tenants[0] : userData.tenants;
    console.log('Tenant data:', tenantData);

    // Generate JWT token
    const token = signToken({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      tenantId: userData.tenant_id,
      tenantSlug: tenantData.slug
    });

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        token,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          tenant_id: userData.tenant_id,
          created_at: userData.created_at,
          updated_at: userData.updated_at
        },
        tenant: {
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          subscription_plan: tenantData.subscription_plan,
          created_at: tenantData.created_at,
          updated_at: tenantData.updated_at
        }
      }
    };

    return corsResponse(response, 200);

  } catch (error) {
    console.error('Login error:', error);
    return corsResponse(
      { success: false, error: 'Internal server error' },
      500
    );
  }
}

export async function OPTIONS() {
  return handleOptions();
}