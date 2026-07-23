'use client';

import { useEffect, useState } from 'react';

type Zone = 'header' | 'mid' | 'footer' | 'native';

interface AdSlotProps {
  label: string;
  width: number;
  height: number;
  zone?: Zone;
  className?: string;
}

/**
 * Renders a labeled, visually-separated advertising slot as a sandboxed
 * iframe pointing at /ad-frame, which renders the admin-configured snippet
 * in its own isolated document (see next.config.mjs and
 * src/app/ad-frame/route.ts) — kept separate from the main app so the
 * site's strict CSP never has to track Adsterra's rotating third-party
 * domains. Collapses to a quiet placeholder if no zone is configured
 * (ads off / no snippet) or cookie consent hasn't been given yet.
 */
export function AdSlot({ label, width, height, zone, className = '' }: AdSlotProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(localStorage.getItem('p2h-cookie-consent') === 'accepted');
    const handler = () => setHasConsent(localStorage.getItem('p2h-cookie-consent') === 'accepted');
    window.addEventListener('p2h-consent-changed', handler);
    return () => window.removeEventListener('p2h-consent-changed', handler);
  }, []);

  if (!zone || !hasConsent) {
    return (
      <div
        className={`ad-slot ${className}`}
        style={{ width: '100%', maxWidth: width, height, margin: '0 auto' }}
        aria-hidden="true"
      >
        Advertisement
      </div>
    );
  }

  return (
    <div className={`mx-auto ${className}`} style={{ maxWidth: width }}>
      <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <iframe
        src={`/ad-frame?zone=${zone}`}
        title={label}
        width={width}
        height={height}
        style={{ border: 0, maxWidth: '100%' }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
      />
    </div>
  );
}
