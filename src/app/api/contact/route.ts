import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

// Very small in-memory rate limiter, per-IP, resets on cold start. Good
// enough for a low-traffic contact form on a serverless free tier; swap
// for a durable store (e.g. Upstash) if traffic grows.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not configured — skip in local dev.
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const name: string = (body.name || '').toString().slice(0, 200);
    const email: string = (body.email || '').toString().slice(0, 320);
    const subject: string = (body.subject || '').toString().slice(0, 300);
    const message: string = (body.message || '').toString().slice(0, 5000);
    const honeypot: string = (body.website || '').toString();
    const turnstileToken: string = (body.turnstileToken || '').toString();

    // Honeypot field — real users never fill this in; bots often do.
    if (honeypot) {
      return NextResponse.json({ ok: true }); // silently succeed to not tip off bots
    }

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      return NextResponse.json({ error: 'Please fill in all fields.' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Post2Hire <onboarding@resend.dev>';

    if (!resendKey || !toEmail) {
      console.error('Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL missing.');
      return NextResponse.json({ error: 'Contact form is not configured yet.' }, { status: 500 });
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[Post2Hire Contact] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your message — Post2Hire',
      text: `Hi ${name},\n\nThanks for reaching out to Post2Hire. We've received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\n— The Post2Hire Team`,
    });

    // Best-effort: also store a copy for the admin panel.
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('contact_messages').insert({ name, email, subject, message });
    } catch (e) {
      console.error('Could not store contact message copy:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 });
  }
}
