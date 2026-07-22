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
    const container = containerRef.current;
    container.innerHTML = '';
    try {
      // Ad snippets are <script> tags (inline config + an external loader,
      // or a single async loader), sometimes with a plain <div> alongside.
      // Scripts inserted via innerHTML are never executed by the browser,
      // so each one is recreated as a real <script> element and appended,
      // which does execute. Snippets that are ONLY <script> tags with no
      // other content get parsed into doc.head, not doc.body, by the
      // browser's HTML parser — so both must be checked.
      const doc = new DOMParser().parseFromString(snippet, 'text/html');
      const nodes = [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)];
      nodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const oldScript = node as HTMLScriptElement;
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.text = oldScript.text;
          container.appendChild(newScript);
        } else {
          container.appendChild(node.cloneNode(true));
        }
      });
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
