'use client';

import { useState, useRef } from 'react';
import { recordDownloadAndShouldPromptShare } from '@/lib/growth/share-nudge';
import { trackEvent } from '@/lib/growth/track';
import { buildShareTexts } from '@/lib/growth/share-text';
import { ShareNudgeModal } from '@/components/growth/share-nudge-modal';

type Step = 'upload' | 'details' | 'results';
type OutputChoice = 'cv' | 'letter' | 'both';

interface GenerateResult {
  cv?: string;
  coverLetter?: string;
  flags?: string[];
  groundingWarnings?: string[];
  error?: string;
}

export function CvGenerator() {
  const [step, setStep] = useState<Step>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState('');
  const [cvText, setCvText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [jobDescription, setJobDescription] = useState('');
  const [outputChoice, setOutputChoice] = useState<OutputChoice>('both');
  const [lengthMode, setLengthMode] = useState<'standard' | 'short'>('standard');

  const [candidateName, setCandidateName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [tailoredCv, setTailoredCv] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [flags, setFlags] = useState<string[]>([]);
  const [groundingWarnings, setGroundingWarnings] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/cv/extract', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || 'Could not read this file.');
        return;
      }
      setCvText(data.text);
      setFileName(data.filename);

      // Best-effort guess at candidate name from the first line of the CV.
      const firstLine = data.text.split('\n').find((l: string) => l.trim().length > 2);
      if (firstLine && firstLine.length < 60) setCandidateName(firstLine.trim());

      setStep('details');
    } catch {
      setUploadError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveFile() {
    setFileName('');
    setCvText('');
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGenerate() {
    setGenError('');
    if (jobDescription.trim().length < 30) {
      setGenError('Please paste a fuller job description (at least a couple of sentences).');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobDescription,
          wantCv: outputChoice === 'cv' || outputChoice === 'both',
          wantCoverLetter: outputChoice === 'letter' || outputChoice === 'both',
          lengthMode,
        }),
      });
      const data: GenerateResult = await res.json();
      if (!res.ok) {
        setGenError(data.error || 'Something went wrong.');
        return;
      }
      setTailoredCv(data.cv || '');
      setCoverLetter(data.coverLetter || '');
      setFlags(data.flags || []);
      setGroundingWarnings(data.groundingWarnings || []);
      setStep('results');
    } catch {
      setGenError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(kind: 'cv-docx' | 'cv-pdf' | 'letter-docx' | 'letter-pdf') {
    if (!confirmed) return;
    const content = kind.startsWith('cv') ? tailoredCv : coverLetter;
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, content, name: candidateName, role: roleTitle }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : 'document';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('download');

    if (recordDownloadAndShouldPromptShare()) {
      setShareOpen(true);
    }
  }

  const { full: shareCaption, tweetSafe: tweetCaption } = buildShareTexts(
    'Just used Post2Hire to tailor my CV',
    roleTitle ? ` for a ${roleTitle} role` : '',
    ` in under a minute — free AI tool, worth checking out if you're job hunting. #JobSearch #CareerTools #AI`
  );

  return (
    <div className="space-y-6">
      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="card">
          <h2 className="font-display font-bold text-ink">1. Upload your CV</h2>
          <p className="mt-1 text-sm text-muted">DOCX or PDF, up to 5 MB.</p>
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-card file:border-0 file:bg-azure-tint file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-azure hover:file:bg-azure/20"
            />
          </div>
          {uploading && <p className="mt-3 text-sm text-muted">Reading your CV…</p>}
          {uploadError && (
            <p role="alert" className="mt-3 rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Step: Details (job description + choices) */}
      {(step === 'details' || step === 'results') && cvText && (
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-ink">1. Your CV</h2>
            <div className="flex gap-2">
              <button onClick={handleRemoveFile} className="btn-ghost text-xs">
                Remove
              </button>
            </div>
          </div>
          <p className="rounded-card bg-azure-tint px-4 py-2.5 text-sm text-ink">📄 {fileName}</p>

          <div>
            <label htmlFor="jd" className="mb-1.5 block text-sm font-medium text-ink">
              2. Paste the job description
            </label>
            <textarea
              id="jd"
              rows={12}
              className="input-field font-sans"
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">{jobDescription.length} characters</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">3. What do you need?</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['cv', 'letter', 'both'] as OutputChoice[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOutputChoice(opt)}
                  className={`rounded-card border px-4 py-3 text-sm font-medium transition-colors ${
                    outputChoice === opt
                      ? 'border-azure bg-azure-tint text-azure'
                      : 'border-line text-ink hover:border-azure/50'
                  }`}
                >
                  {opt === 'cv' ? 'Tailor my CV' : opt === 'letter' ? 'Cover letter' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          {(outputChoice === 'letter' || outputChoice === 'both') && (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Cover letter length</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLengthMode('standard')}
                  className={`rounded-card border px-4 py-2 text-sm font-medium ${
                    lengthMode === 'standard' ? 'border-azure bg-azure-tint text-azure' : 'border-line text-ink'
                  }`}
                >
                  Standard (500–800 words)
                </button>
                <button
                  type="button"
                  onClick={() => setLengthMode('short')}
                  className={`rounded-card border px-4 py-2 text-sm font-medium ${
                    lengthMode === 'short' ? 'border-azure bg-azure-tint text-azure' : 'border-line text-ink'
                  }`}
                >
                  Short
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="candidateName" className="mb-1.5 block text-sm font-medium text-ink">
                Your name (for filenames)
              </label>
              <input
                id="candidateName"
                className="input-field"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="roleTitle" className="mb-1.5 block text-sm font-medium text-ink">
                Role title (for filenames)
              </label>
              <input
                id="roleTitle"
                className="input-field"
                placeholder="e.g. Finance Manager"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>
          </div>

          {genError && (
            <p role="alert" className="rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
              {genError}
            </p>
          )}

          <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <div className="space-y-6">
          {flags.length > 0 && (
            <div className="card border-amber-200 bg-amber-50">
              <h3 className="text-sm font-semibold text-amber-900">Flagged for your review</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {groundingWarnings.length > 0 && (
            <div className="card border-amber-200 bg-amber-50">
              <h3 className="text-sm font-semibold text-amber-900">Please double-check these claims</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {groundingWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {tailoredCv && (
            <DocumentPanel
              title="Tailored CV"
              text={tailoredCv}
              onChange={setTailoredCv}
              onDownloadDocx={() => handleDownload('cv-docx')}
              onDownloadPdf={() => handleDownload('cv-pdf')}
              confirmed={confirmed}
            />
          )}

          {coverLetter && (
            <DocumentPanel
              title="Cover Letter"
              text={coverLetter}
              onChange={setCoverLetter}
              onDownloadDocx={() => handleDownload('letter-docx')}
              onDownloadPdf={() => handleDownload('letter-pdf')}
              confirmed={confirmed}
            />
          )}

          <label className="card flex items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-azure focus:ring-azure/30"
            />
            I have reviewed the generated content and confirm that the information is accurate.
          </label>
        </div>
      )}

      <ShareNudgeModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareText={shareCaption}
        tweetText={tweetCaption}
      />
    </div>
  );
}

function DocumentPanel({
  title,
  text,
  onChange,
  onDownloadDocx,
  onDownloadPdf,
  confirmed,
}: {
  title: string;
  text: string;
  onChange: (v: string) => void;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  confirmed: boolean;
}) {
  return (
    <div className="card space-y-3">
      <h2 className="font-display font-bold text-ink">{title}</h2>
      <textarea
        className="input-field min-h-[360px] font-mono text-sm leading-relaxed"
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button onClick={onDownloadDocx} disabled={!confirmed} className="btn-primary">
          Download Word
        </button>
        <button onClick={onDownloadPdf} disabled={!confirmed} className="btn-secondary">
          Download PDF
        </button>
      </div>
      {!confirmed && (
        <p className="text-xs text-muted">Confirm accuracy below to enable downloads.</p>
      )}
    </div>
  );
}
