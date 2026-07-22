import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/supabase/require-user';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const admin_user = await requireAdmin();
    const body = await req.json();
    const admin = createAdminClient();

    const allowed = [
      'daily_generation_limit',
      'ads_enabled',
      'ad_snippet_header',
      'ad_snippet_mid',
      'ad_snippet_footer',
      'ad_snippet_native',
      'file_retention_days',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    updates.updated_at = new Date().toISOString();

    const { error } = await admin.from('site_settings').update(updates).eq('id', 1);
    if (error) throw error;

    await admin.from('audit_log').insert({
      admin_id: admin_user.id,
      action: 'update_settings',
      details: updates,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin settings error:', err);
    return NextResponse.json({ error: 'Could not update settings.' }, { status: 500 });
  }
}
