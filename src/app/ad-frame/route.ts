import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type Zone = 'header' | 'mid' | 'footer' | 'native';
const ZONES: Zone[] = ['header', 'mid', 'footer', 'native'];

/**
 * Renders a single ad snippet as its own standalone HTML document, served
 * only to be loaded inside an <iframe> (see AdSlot). Ad networks like
 * Adsterra chain their loader script into further scripts/XHR calls on
 * other, effectively unpredictable domains (confirmed: valuationappeared.com
 * alone pulls in protrafficinspector.com, spendsdetachment.com,
 * workdeadlinededicate.com, and likely more on future rotations) — trying
 * to keep the main site's CSP allowlist in sync with that is a losing
 * game. Isolating ad content in its own document with its own, deliberately
 * permissive headers (see next.config.mjs's separate /ad-frame block) keeps
 * the main app's strict CSP intact regardless of what Adsterra does.
 */
export async function GET(req: NextRequest) {
  const zoneParam = req.nextUrl.searchParams.get('zone');
  const zone = ZONES.includes(zoneParam as Zone) ? (zoneParam as Zone) : null;

  if (!zone) {
    return new Response('', { status: 400 });
  }

  const supabase = createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('ads_enabled, ad_snippet_header, ad_snippet_mid, ad_snippet_footer, ad_snippet_native')
    .eq('id', 1)
    .single();

  const snippetByZone: Record<Zone, string> = {
    header: data?.ad_snippet_header || '',
    mid: data?.ad_snippet_mid || '',
    footer: data?.ad_snippet_footer || '',
    native: data?.ad_snippet_native || '',
  };

  const snippet = data?.ads_enabled ? snippetByZone[zone] : '';

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;overflow:hidden;}</style></head>
<body>${snippet}</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
