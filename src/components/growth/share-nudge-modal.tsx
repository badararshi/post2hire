'use client';

import { useState } from 'react';
import { optOutOfShareNudge } from '@/lib/growth/share-nudge';
import { trackEvent } from '@/lib/growth/track';

interface ShareNudgeModalProps {
  open: boolean;
  onClose: () => void;
  /** Full caption, shown visibly and copied for LinkedIn (no length limit there). */
  shareText: string;
  /** Same caption, pre-truncated to fit X's 280-char limit with the URL. */
  tweetText: string;
}

/**
 * Non-blocking, dismissible ask shown after a successful download (never
 * gating the download itself — that would punish users applying to jobs
 * under time pressure). LinkedIn's share dialog no longer accepts
 * pre-filled post text via URL (only a URL to build a preview card from),
 * so the caption is shown directly in the modal — both auto-copied to the
 * clipboard and visible/selectable as a reliable fallback, since silent
 * clipboard writes can go unnoticed or fail outright. X's intent URL does
 * support pre-filled text natively.
 */
export function ShareNudgeModal({ open, onClose, shareText, tweetText }: ShareNudgeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const siteUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://post2hire.vercel.app';

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable — the visible textarea is the fallback.
    }
  }

  async function shareLinkedIn() {
    await copyCaption();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
    trackEvent('share_click', 'linkedin');
  }

  function shareX() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
    trackEvent('share_click', 'x');
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
      <div className="card w-full max-w-md space-y-4">
        <div>
          <h2 id="share-nudge-title" className="font-display font-bold text-ink">
            Enjoying Post2Hire?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Post2Hire is 100% free and stays that way with your help. A quick share
            helps others looking for the same thing find it too.
          </p>
        </div>

        <div>
          <label htmlFor="share-caption" className="mb-1 block text-xs font-medium text-muted">
            Suggested caption
          </label>
          <textarea
            id="share-caption"
            readOnly
            rows={4}
            value={shareText}
            onClick={(e) => e.currentTarget.select()}
            className="input-field text-xs leading-relaxed"
          />
          <button onClick={copyCaption} className="btn-ghost mt-1.5 text-xs">
            {copied ? 'Copied!' : 'Copy caption'}
          </button>
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
            Caption copied — paste it into LinkedIn&apos;s post box (it opens with just a link
            preview, since LinkedIn doesn&apos;t allow pre-filled text).
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
