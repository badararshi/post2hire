import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdmin, AuthError } from '@/lib/supabase/require-user';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const admin_user = await requireAdmin();
    const body = await req.json();
    const messageId: string = (body.messageId || '').toString();
    const replyText: string = (body.replyText || '').toString().trim();

    if (!messageId || !replyText) {
      return NextResponse.json({ error: 'Missing message or reply text.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: original } = await admin
      .from('contact_messages')
      .select('name, email, subject')
      .eq('id', messageId)
      .single();

    if (!original) {
      return NextResponse.json({ error: 'Original message not found.' }, { status: 404 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Post2Hire <onboarding@resend.dev>';
    if (!resendKey) {
      return NextResponse.json({ error: 'Email sending is not configured yet.' }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: original.email,
      subject: `Re: ${original.subject}`,
      text: `Hi ${original.name},\n\n${replyText}\n\n— The Post2Hire Team`,
    });

    if (sendError) {
      console.error('Admin contact reply: send failed:', sendError);
      return NextResponse.json(
        { error: 'Could not send the reply. Check the Resend domain/API key configuration.' },
        { status: 502 }
      );
    }

    await admin.from('audit_log').insert({
      admin_id: admin_user.id,
      action: 'contact_reply',
      details: { messageId, to: original.email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin contact reply error:', err);
    return NextResponse.json({ error: 'Could not send the reply.' }, { status: 500 });
  }
}
