import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export class QuotaError extends Error {
  status = 429;
}

const DEFAULT_DAILY_LIMIT = 20;

/**
 * Checks the caller's generations in the last 24 hours against the site's
 * configured daily limit (site_settings.daily_generation_limit, editable
 * from the admin panel). Throws QuotaError if the limit is already reached.
 * Does NOT record usage itself — call recordUsage() separately, and only
 * after the generation actually succeeds, so failed AI calls (bad API key,
 * model errors, network issues) don't silently burn the user's quota.
 */
export async function checkQuota(userId: string): Promise<void> {
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
}

/** Records one successful generation. Call only after generation succeeds. */
export async function recordUsage(userId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from('usage_log').insert({ user_id: userId });
}
