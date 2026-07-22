import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Uses only the public anon key — safe to
 * ship to the client. Row Level Security on every table is what actually
 * protects data; this client can never bypass it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
