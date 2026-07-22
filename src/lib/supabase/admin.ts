import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * PRIVILEGED client using the service-role key. Bypasses Row Level Security.
 *
 * `import 'server-only'` above makes any accidental client-side import of
 * this file a build-time error — this key must never reach the browser.
 *
 * Use ONLY for: account deletion, admin panel operations, and generation
 * quota checks that must read across a user's own data safely. Every route
 * that uses this client MUST independently verify the caller's identity and
 * authorization (see lib/supabase/require-user.ts) before acting — this
 * client will happily do anything asked of it.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Check your .env.local.'
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
