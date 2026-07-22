import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export class QuotaError extends Error {
  status = 429;
}

const DEFAULT_DAILY_LIMIT = 20;

/**
 * Checks the caller's generations in the last 24 hours against the site's
 * configured daily limit (site_settings.daily_generation_limit, editable
 * from the admin panel) and records this call if allowed. Uses the admin
 * client because it needs to read/write usage_log regardless of RLS, but
 * the caller's identity (userId) has already been verified upstream by
 * requireVerifiedUser() — this function never trusts a client-supplied id.
 */
export async function checkAndIncrementQuota(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('daily_generation_limit')
    .eq('id', 1)
    .single();

  const limit = settings?.daily_generation_limit ?? DEFAULT_DAILY_LIMIT;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if ((count ?? 0) >= limit) {
    throw new QuotaError(
      `You've reached today's limit of ${limit} generations. Please try again tomorrow.`
    );
  }

  await supabase.from('usage_log').insert({ user_id: userId });
}
