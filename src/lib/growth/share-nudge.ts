const COUNT_KEY = 'p2h-download-count';
const SESSION_KEY = 'p2h-share-nudge-shown-session';
const OPT_OUT_KEY = 'p2h-share-nudge-optout';

/**
 * Call once per successful download. Returns true if the share nudge should
 * be shown for this download. Shows on the very first download ever, then
 * roughly every 8th download after that — but never more than once per
 * browser session, and never again if the user has opted out.
 */
export function recordDownloadAndShouldPromptShare(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(OPT_OUT_KEY) === '1') return false;
  if (sessionStorage.getItem(SESSION_KEY) === '1') return false;

  const prevCount = Number(localStorage.getItem(COUNT_KEY) || '0');
  const count = prevCount + 1;
  localStorage.setItem(COUNT_KEY, String(count));

  const shouldShow = count === 1 || count % 8 === 0;
  if (shouldShow) {
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  return shouldShow;
}

export function optOutOfShareNudge(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPT_OUT_KEY, '1');
}
