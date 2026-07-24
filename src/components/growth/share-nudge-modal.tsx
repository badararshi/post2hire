'use client';

import { useState } from 'react';
import { optOutOfShareNudge } from '@/lib/growth/share-nudge';

interface ShareNudgeModalProps {
  open: boolean;
  onClose: () => void;
  shareText: string;
}

/**
 * Non-blocking, dismissible ask shown after a successful download (never
 * gating the download itself — that would punish users applying to jobs
 * under time pressure). LinkedIn's share dialog no longer accepts
 * pre-filled post text via URL (only a URL to build a preview card from),
 * so the caption is copied to the clipboard as the standard workaround;
 * X's intent URL does support pre-filled text natively.
 */
export function ShareNudgeModal({ open, onClose, shareText }: ShareNudgeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://post2hire.vercel.app';

  async function shareLinkedIn() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable — still open the share dialog.
    }
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function shareX() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
    onClose();
  }

  function dismissForever() {
    optOutOfShareNudge();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-nudge-title"
    >
      <div className="card w-full max-w-sm space-y-4">
        <div>
          <h2 id="share-nudge-title" className="font-display font-bold text-ink">
            Enjoying Post2Hire?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Post2Hire is 100% free and stays that way with your help. A quick share
            helps others looking for the same thing find it too.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={shareLinkedIn} className="btn-primary flex-1">
            Share on LinkedIn
          </button>
          <button onClick={shareX} className="btn-secondary flex-1">
            Share on X
          </button>
        </div>

        {copied && (
          <p className="text-xs text-success">
            Caption copied to your clipboard — paste it into LinkedIn&apos;s post box.
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <button onClick={onClose} className="text-muted hover:text-ink">
            Not now
          </button>
          <button onClick={dismissForever} className="text-muted underline hover:text-ink">
            Don&apos;t ask again
          </button>
        </div>
      </div>
    </div>
  );
}
