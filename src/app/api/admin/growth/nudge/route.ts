import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdmin, AuthError } from '@/lib/supabase/require-user';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const admin_user = await requireAdmin();
    const body = await req.json();
    const targetUserId: string = (body.userId || '').toString();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing user.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('email').eq('id', targetUserId).single();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Post2Hire <onboarding@resend.dev>';
    if (!resendKey) {
      return NextResponse.json({ error: 'Email sending is not configured yet.' }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: profile.email,
      subject: 'A quick favor? — Post2Hire',
      text: `Hi,\n\nWe noticed you've been getting good use out of Post2Hire — glad it's helping!\n\nPost2Hire is free and stays that way through word of mouth. If it's helped you, a quick share with someone else job hunting (or on LinkedIn) would genuinely help us keep it free for everyone.\n\nThanks either way,\nThe Post2Hire Team`,
    });

    if (sendError) {
      console.error('Admin growth nudge: send failed:', sendError);
      return NextResponse.json(
        { error: 'Could not send the email. Check the Resend domain/API key configuration.' },
        { status: 502 }
      );
    }

    await admin.from('growth_events').insert({ user_id: targetUserId, event_type: 'nudge_sent' });
    await admin.from('audit_log').insert({
      admin_id: admin_user.id,
      action: 'growth_nudge_sent',
      details: { userId: targetUserId, email: profile.email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin growth nudge error:', err);
    return NextResponse.json({ error: 'Could not send the request.' }, { status: 500 });
  }
}
