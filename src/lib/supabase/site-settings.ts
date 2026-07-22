import { createClient } from '@/lib/supabase/server';

export interface AdSettings {
  adsEnabled: boolean;
  header: string;
  mid: string;
  footer: string;
  native: string;
}

const EMPTY_ADS: AdSettings = { adsEnabled: false, header: '', mid: '', footer: '', native: '' };

/**
 * Reads the admin-configured ad snippets (public.site_settings, readable by
 * anyone per its RLS policy). Used by every page that renders an <AdSlot> so
 * the admin panel's "Ads enabled site-wide" toggle and snippet fields
 * actually take effect.
 */
export async function getAdSettings(): Promise<AdSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('ads_enabled, ad_snippet_header, ad_snippet_mid, ad_snippet_footer, ad_snippet_native')
    .eq('id', 1)
    .single();

  if (!data) return EMPTY_ADS;

  return {
    adsEnabled: data.ads_enabled,
    header: data.ad_snippet_header || '',
    mid: data.ad_snippet_mid || '',
    footer: data.ad_snippet_footer || '',
    native: data.ad_snippet_native || '',
  };
}
