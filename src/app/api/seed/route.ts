import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { corsResponse, handleOptions } from '@/lib/cors';

// POST /api/seed - Seed the database with test accounts (Development only)
export async function POST() {
  try {
    // Only allow seeding in development or if explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SEEDING !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Seeding not allowed in production' },
        { status: 403 }
      );
    }

    const hashedPassword = await hashPassword('password');

    // First, ensure tenants exist
    const { data: existingTenants } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .in('slug', ['acme', 'globex']);

    let acmeTenant, globexTenant;

    if (!existingTenants || existingTenants.length === 0) {
      // Create tenants
      const { data: newTenants, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert([
          { name: 'Acme Corporation', slug: 'acme', subscription_plan: 'free' },
          { name: 'Globex Corporation', slug: 'globex', subscription_plan: 'free' }
        ])
        .select();

      if (tenantError) {
        console.error('Error creating tenants:', tenantError);
        return NextResponse.json(
          { success: false, error: 'Failed to create tenants' },
          { status: 500 }
        );
      }

      acmeTenant = newTenants.find(t => t.slug === 'acme');
      globexTenant = newTenants.find(t => t.slug === 'globex');
    } else {
      acmeTenant = existingTenants.find(t => t.slug === 'acme');
      globexTenant = existingTenants.find(t => t.slug === 'globex');
    }

    // Check if users already exist
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('email')
      .in('email', ['admin@acme.test', 'user@acme.test', 'admin@globex.test', 'user@globex.test']);

    const existingEmails = existingUsers?.map(u => u.email) || [];

    // Prepare users to insert
    const usersToInsert = [];

    if (!existingEmails.includes('admin@acme.test')) {
      usersToInsert.push({
        email: 'admin@acme.test',
        password_hash: hashedPassword,
        role: 'admin',
        tenant_id: acmeTenant.id
      });
    }

    if (!existingEmails.includes('user@acme.test')) {
      usersToInsert.push({
        email: 'user@acme.test',
        password_hash: hashedPassword,
        role: 'member',
        tenant_id: acmeTenant.id
      });
    }

    if (!existingEmails.includes('admin@globex.test')) {
      usersToInsert.push({
        email: 'admin@globex.test',
        password_hash: hashedPassword,
        role: 'admin',
        tenant_id: globexTenant.id
      });
    }

    if (!existingEmails.includes('user@globex.test')) {
      usersToInsert.push({
        email: 'user@globex.test',
        password_hash: hashedPassword,
        role: 'member',
        tenant_id: globexTenant.id
      });
    }

    if (usersToInsert.length > 0) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert(usersToInsert);

      if (userError) {
        console.error('Error creating users:', userError);
        return NextResponse.json(
          { success: false, error: 'Failed to create users' },
          { status: 500 }
        );
      }
    }

    const response: ApiResponse = {
      success: true,
      message: `Database seeded successfully. Created ${usersToInsert.length} new users.`,
      data: {
        tenants: [acmeTenant, globexTenant],
        newUsersCreated: usersToInsert.length,
        existingUsers: existingEmails.length
      }
    };

    return corsResponse(response, 200);

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return handleOptions();
}