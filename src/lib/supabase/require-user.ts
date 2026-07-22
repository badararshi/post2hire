import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Every generation/export/account API route calls this FIRST. It is the
 * single enforcement point for "must be signed in" and "must be
 * email-verified" — the two gates the spec requires before any AI
 * generation is allowed to run. Never trust a client-side check alone.
 */
export async function requireVerifiedUser(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('You must be signed in to do that.', 401);
  }

  if (!user.email_confirmed_at) {
    throw new AuthError(
      'Please verify your email address before using this tool. Check your inbox for the verification link.',
      403
    );
  }

  await ensureNotDisabled(user.id);

  return user;
}

async function ensureNotDisabled(userId: string): Promise<void> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_disabled')
    .eq('id', userId)
    .single();

  if (profile?.is_disabled) {
    throw new AuthError('This account has been disabled. Contact support if you believe this is an error.', 403);
  }
}

/**
 * Looser check for routes that only need "signed in" (e.g. account
 * deletion) but not necessarily email-verified.
 */
export async function requireUser(): Promise<User> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('You must be signed in to do that.', 401);
  }

  return user;
}

/**
 * Admin-only routes. Checks the profiles.role column via the privileged
 * client (RLS-safe because we independently verify the session user first).
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new AuthError('Admin access required.', 403);
  }

  return user;
}
