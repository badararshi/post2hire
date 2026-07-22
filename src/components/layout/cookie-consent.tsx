'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('p2h-cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  function decide(accepted: boolean) {
    localStorage.setItem('p2h-cookie-consent', accepted ? 'accepted' : 'rejected');
    window.dispatchEvent(new Event('p2h-consent-changed'));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur px-4 py-4 shadow-[0_-4px_16px_rgba(30,42,90,0.08)]"
    >
      <div className="mx-auto flex max-w-wide flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use cookies for essential site function and, with your consent, to show
          advertising that supports Post2Hire. See our{' '}
          <Link href="/cookies" className="font-medium text-azure hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button className="btn-secondary" onClick={() => decide(false)}>
            Reject
          </button>
          <button className="btn-primary" onClick={() => decide(true)}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
