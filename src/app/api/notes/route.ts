import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAuth } from '@/middleware/auth';
import { CreateNoteRequest, ApiResponse, Note, AuthToken } from '@/types';
import { corsResponse, handleOptions } from '@/lib/cors';

// GET /api/notes - List all notes for the current tenant
export const GET = withAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const { data: notes, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('tenant_id', authToken.tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes || []
    };

    return corsResponse(response, 200);

  } catch (error) {
    console.error('Notes GET error:', error);
    return corsResponse(
      { success: false, error: 'Internal server error' },
      500
    );
  }
});

// POST /api/notes - Create a new note
export const POST = withAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const body: CreateNoteRequest = await request.json();
    const { title, content } = body;

    if (!title) {
      return corsResponse(
        { success: false, error: 'Title is required' },
        400
      );
    }

    // Check subscription limits for free plans
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('subscription_plan')
      .eq('id', authToken.tenantId)
      .single();

    if (tenantError) {
      return corsResponse(
        { success: false, error: 'Failed to verify tenant' },
        500
      );
    }

    if (tenant.subscription_plan === 'free') {
      // Check current note count
      const { count, error: countError } = await supabaseAdmin
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', authToken.tenantId);

      if (countError) {
        return corsResponse(
          { success: false, error: 'Failed to check note limit' },
          500
        );
      }

      if (count && count >= 3) {
        return corsResponse(
          { 
            success: false, 
            error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.',
            code: 'SUBSCRIPTION_LIMIT'
          },
          403
        );
      }
    }

    // Create the note
    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .insert({
        title,
        content: content || '',
        user_id: authToken.userId,
        tenant_id: authToken.tenantId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return corsResponse(
        { success: false, error: 'Failed to create note' },
        500
      );
    }

    const response: ApiResponse<Note> = {
      success: true,
      data: note
    };

    return corsResponse(response, 201);

  } catch (error) {
    console.error('Notes POST error:', error);
    return corsResponse(
      { success: false, error: 'Internal server error' },
      500
    );
  }
});

export async function OPTIONS() {
  return handleOptions();
}