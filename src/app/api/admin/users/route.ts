import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/supabase/require-user';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const admin_user = await requireAdmin();
    const body = await req.json();
    const { userId, is_disabled } = body;

    if (!userId || typeof is_disabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('profiles').update({ is_disabled }).eq('id', userId);
    if (error) throw error;

    await admin.from('audit_log').insert({
      admin_id: admin_user.id,
      action: is_disabled ? 'disable_user' : 'enable_user',
      details: { userId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin user update error:', err);
    return NextResponse.json({ error: 'Could not update user.' }, { status: 500 });
  }
}
