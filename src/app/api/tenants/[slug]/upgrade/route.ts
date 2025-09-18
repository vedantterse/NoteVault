import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAdminAuth } from '@/middleware/auth';
import { handleOptions } from '@/lib/cors';
import { ApiResponse, Tenant, AuthToken } from '@/types';

// POST /api/tenants/[slug]/upgrade - Upgrade tenant subscription to Pro
export const POST = withAdminAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 2]; // Get slug from URL

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Tenant slug is required' },
        { status: 400 }
      );
    }

    // Verify that the admin belongs to this tenant
    if (authToken.tenantSlug !== slug) {
      return NextResponse.json(
        { success: false, error: 'Access denied: You can only upgrade your own tenant' },
        { status: 403 }
      );
    }

    // Check if tenant exists and get current plan
    const { data: tenant, error: fetchError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (tenant.subscription_plan === 'pro') {
      return NextResponse.json(
        { success: false, error: 'Tenant is already on Pro plan' },
        { status: 400 }
      );
    }

    // Upgrade to Pro plan
    const { data: updatedTenant, error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({ subscription_plan: 'pro' })
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) {
      console.error('Error upgrading tenant:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to upgrade subscription' },
        { status: 500 }
      );
    }

    const response: ApiResponse<Tenant> = {
      success: true,
      data: updatedTenant,
      message: 'Subscription upgraded to Pro successfully'
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Tenant upgrade error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return handleOptions();
}