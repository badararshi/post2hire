'use client';

/**
 * Fire-and-forget usage tracking — never awaited meaningfully by callers,
 * never blocks or fails the download/share action it's attached to.
 */
export function trackEvent(eventType: 'download' | 'share_click', platform?: string): void {
  fetch('/api/growth/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, platform }),
  }).catch(() => {
    // Non-fatal — tracking failures should never surface to the user.
  });
}
