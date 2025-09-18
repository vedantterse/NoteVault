import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withAuth } from '@/middleware/auth';
import { UpdateNoteRequest, ApiResponse, Note, AuthToken } from '@/types';
import { handleOptions } from '@/lib/cors';

// GET /api/notes/[id] - Get a specific note
export const GET = withAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', authToken.tenantId)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<Note> = {
      success: true,
      data: note
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
    console.error('Note GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/notes/[id] - Update a specific note
export const PUT = withAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateNoteRequest = await request.json();
    const { title, content } = body;

    if (!title && content === undefined) {
      return NextResponse.json(
        { success: false, error: 'At least title or content must be provided' },
        { status: 400 }
      );
    }

    // Check if note exists and belongs to user
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', authToken.userId)
      .eq('tenant_id', authToken.tenantId)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Partial<Note> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const { data: note, error } = await supabaseAdmin
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', authToken.userId)
      .eq('tenant_id', authToken.tenantId)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update note' },
        { status: 500 }
      );
    }

    const response: ApiResponse<Note> = {
      success: true,
      data: note
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Note PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/notes/[id] - Delete a specific note
export const DELETE = withAuth(async (request: NextRequest, authToken: AuthToken) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Note ID is required' },
        { status: 400 }
      );
    }

    // For admins: Check if note exists in their tenant (can delete any note)
    // For members: Check if note exists and belongs to them
    const query = supabaseAdmin
      .from('notes')
      .select('id, user_id')
      .eq('id', id)
      .eq('tenant_id', authToken.tenantId);

    // If not admin, also filter by user_id
    if (authToken.role !== 'admin') {
      query.eq('user_id', authToken.userId);
    }

    const { data: existingNote, error: fetchError } = await query.single();

    if (fetchError || !existingNote) {
      const errorMessage = authToken.role === 'admin' 
        ? 'Note not found in your organization' 
        : 'Note not found or access denied';
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 404 }
      );
    }

    // Delete the note (admins can delete any note in tenant, users only their own)
    const deleteQuery = supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('tenant_id', authToken.tenantId);

    // If not admin, also filter by user_id for extra security
    if (authToken.role !== 'admin') {
      deleteQuery.eq('user_id', authToken.userId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Note deleted successfully'
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Note DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return handleOptions();
}