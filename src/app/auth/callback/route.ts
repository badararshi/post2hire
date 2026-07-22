import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase redirects here after a user clicks an email verification or
 * password-reset link. Exchanges the auth code for a session, then sends
 * the user on to their destination.
 */
// Only allow same-origin relative paths — anything else (protocol-relative
// "//evil.com", absolute URLs, or "@evil.com" userinfo tricks that would be
// mis-parsed once concatenated onto origin) falls back to the dashboard.
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/dashboard';
  }
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
