import { NextRequest, NextResponse } from 'next/server';
import { requireUser, AuthError } from '@/lib/supabase/require-user';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * Permanently deletes the signed-in user's account: their storage files,
 * database rows, and their Supabase auth identity. Requires the caller to
 * be signed in (identity independently verified server-side — the request
 * body is never trusted for "which user to delete").
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));

    if (body.confirm !== 'DELETE') {
      return NextResponse.json(
        { error: 'Deletion not confirmed.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Remove stored CV/document files for this user.
    const { data: files } = await admin.storage.from('user-documents').list(user.id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`);
      await admin.storage.from('user-documents').remove(paths);
    }

    // Remove database rows (generated_items, usage_log, profiles cascade
    // via FK ON DELETE CASCADE — see supabase/schema.sql).
    await admin.from('generated_items').delete().eq('user_id', user.id);
    await admin.from('usage_log').delete().eq('user_id', user.id);
    await admin.from('profiles').delete().eq('id', user.id);

    // Finally remove the auth user itself.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Account deletion error:', err);
    return NextResponse.json({ error: 'Could not delete your account. Please try again.' }, { status: 500 });
  }
}
