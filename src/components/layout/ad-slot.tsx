'use client';

import { useEffect, useRef, useState } from 'react';

interface AdSlotProps {
  label: string;
  width: number;
  height: number;
  snippet?: string;
  className?: string;
}

/**
 * Renders a labeled, visually-separated advertising slot. If a snippet is
 * configured (from the admin panel) and cookie consent has been given, it
 * injects the ad script; otherwise it collapses to a quiet placeholder so
 * the tools never look broken with ads off. If the injected script
 * throws or fails to render anything, the slot silently stays empty
 * rather than surfacing an error to the user.
 */
export function AdSlot({ label, width, height, snippet, className = '' }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setHasConsent(localStorage.getItem('p2h-cookie-consent') === 'accepted');
    const handler = () => setHasConsent(localStorage.getItem('p2h-cookie-consent') === 'accepted');
    window.addEventListener('p2h-consent-changed', handler);
    return () => window.removeEventListener('p2h-consent-changed', handler);
  }, []);

  useEffect(() => {
    if (!hasConsent || !snippet || !containerRef.current) return;
    try {
      containerRef.current.innerHTML = snippet;
    } catch {
      setFailed(true);
    }
  }, [hasConsent, snippet]);

  if (!snippet || failed) {
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
      <div ref={containerRef} style={{ minHeight: hasConsent ? undefined : height }} />
    </div>
  );
}
