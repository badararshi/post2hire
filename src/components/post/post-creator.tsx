'use client';

import { useState, useMemo } from 'react';
import { countWords } from '@/lib/text/unicode';

interface GenerateResponse {
  post: string;
  charCount: number;
  boldPercent: number;
  emojiCount: number;
  warnings: string[];
  maxChars: number;
  error?: string;
}

export function PostCreator() {
  const [subject, setSubject] = useState('');
  const [wantImage, setWantImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [post, setPost] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [boldPercent, setBoldPercent] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const wordCount = useMemo(() => countWords(subject), [subject]);
  const overWordLimit = wordCount > 32;

  async function callGenerate(mode: 'generate' | 'regenerate' | 'improve' | 'shorten') {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          mode,
          currentPost: post || undefined,
        }),
      });
      const data: GenerateResponse = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      setPost(data.post);
      setCharCount(data.charCount);
      setBoldPercent(data.boldPercent);
      setWarnings(data.warnings || []);

      if (wantImage && mode !== 'improve' && mode !== 'shorten') {
        generateImage();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
    setImageLoading(true);
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(`data:${data.mimeType};base64,${data.imageBase64}`);
        setImageAlt(data.altText);
      }
    } catch {
      // Non-fatal — post still stands without an image.
    } finally {
      setImageLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overWordLimit || !subject.trim()) return;
    callGenerate('generate');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(kind: 'post-txt' | 'post-docx') {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, content: post }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = kind === 'post-txt' ? 'LinkedIn_Post.txt' : 'LinkedIn_Post.docx';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadImage() {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'Post2Hire_Post_Image.png';
    a.click();
  }

  function handleClear() {
    setSubject('');
    setPost('');
    setCharCount(0);
    setBoldPercent(0);
    setWarnings([]);
    setImageUrl('');
    setError('');
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">
            What would you like to write about?
          </label>
          <input
            id="subject"
            className="input-field text-base"
            placeholder="e.g. Why most SMEs run out of cash despite being profitable"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={400}
          />
          <p className={`mt-1.5 text-xs ${overWordLimit ? 'font-semibold text-danger' : 'text-muted'}`}>
            {wordCount} / 32 words
          </p>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={wantImage}
            onChange={(e) => setWantImage(e.target.checked)}
            className="h-4 w-4 rounded border-line text-azure focus:ring-azure/30"
          />
          Create a professional image for this post
        </label>

        {error && (
          <p role="alert" className="rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || overWordLimit || !subject.trim()}
          className="btn-primary w-full"
        >
          {loading ? 'Writing your post…' : 'Generate post'}
        </button>
      </form>

      {post && (
        <div className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display font-bold text-ink">Your post</h2>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span className={charCount > 3000 ? 'font-semibold text-danger' : ''}>
                {charCount} / 3000 characters
              </span>
              <span className={boldPercent >= 20 ? 'font-semibold text-danger' : ''}>
                {boldPercent}% bold
              </span>
            </div>
          </div>

          <textarea
            className="input-field min-h-[320px] font-mono text-sm leading-relaxed"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />

          {warnings.length > 0 && (
            <ul className="space-y-1 rounded-card bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} className="btn-primary">
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => callGenerate('regenerate')} disabled={loading} className="btn-secondary">
              Regenerate
            </button>
            <button onClick={() => callGenerate('improve')} disabled={loading} className="btn-secondary">
              Improve
            </button>
            <button onClick={() => callGenerate('shorten')} disabled={loading} className="btn-secondary">
              Shorten
            </button>
            <button onClick={() => handleDownload('post-txt')} className="btn-secondary">
              Download .txt
            </button>
            <button onClick={() => handleDownload('post-docx')} className="btn-secondary">
              Download Word
            </button>
            <button onClick={handleClear} className="btn-ghost">
              Clear
            </button>
          </div>

          <p className="text-xs text-muted">
            Post manually on LinkedIn by pasting the copied text, or attach the downloaded file.
            LinkedIn publishing from Post2Hire isn't available — copy/download keeps your posting
            fully in your control.
          </p>
        </div>
      )}

      {wantImage && (imageLoading || imageUrl) && (
        <div className="card space-y-3">
          <h2 className="font-display font-bold text-ink">Post image</h2>
          {imageLoading ? (
            <div className="flex h-64 items-center justify-center rounded-card bg-surface text-sm text-muted">
              Generating image…
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={imageAlt} className="w-full rounded-card border border-line" />
              <p className="text-xs text-muted">Alt text: {imageAlt}</p>
              <button onClick={handleDownloadImage} className="btn-secondary">
                Download image
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
