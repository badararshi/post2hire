import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free AI Cover Letter Generator — Honest, Job-Specific Letters',
  description:
    'Paste your CV and a job description, get back a factual, persuasive cover letter in under a minute. No invented achievements, no generic template filler. Free to use.',
};

const faqs = [
  {
    q: 'Does it write a different letter for every job, or reuse a template?',
    a: 'A different letter each time. It reads the specific job description you paste in and pulls two or three of your most relevant real examples from your CV to connect directly to what that employer is asking for — it doesn’t fill in a fixed template.',
  },
  {
    q: 'Will it exaggerate my experience to sound more impressive?',
    a: 'No — that’s a deliberate design constraint. The letter only uses facts, employers, and achievements present in your uploaded CV. Where your background doesn’t fully match a stated requirement, it honestly frames genuinely transferable experience instead of claiming you meet something you don’t.',
  },
  {
    q: 'Can I control how long the letter is?',
    a: 'Yes — choose "Standard" (roughly 500–800 words) or "Short" (roughly 250–350 words) before generating.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, no credit card and no paywall. You can also generate a tailored CV in the same step if you want both.',
  },
  {
    q: 'What do I need to provide?',
    a: 'Your existing CV as a DOCX or PDF file, and the job description you\'re applying to (pasted as text). That\'s the only information it uses.',
  },
];

export default async function CoverLetterGeneratorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tool"
      h1="Free AI Cover Letter Generator"
      intro="Paste your CV and the job description, get back a specific, factual cover letter in under a minute — not a generic template with your name swapped in."
      ctaHref={ctaHref}
      ctaLabel="Write my cover letter free"
      faqs={faqs}
    >
      <h2>Why generic cover letters get ignored</h2>
      <p>
        A cover letter that could be sent to any company for any role reads exactly like what it
        is — filler between the greeting and the sign-off. Hiring managers notice immediately when
        a letter doesn&apos;t engage with anything specific about the job or the company, and a
        weak generic letter can undercut a genuinely strong resume sitting right behind it.
      </p>

      <h2>How it builds a specific letter</h2>
      <ol>
        <li>Upload your CV and paste the job description.</li>
        <li>
          It identifies two or three concrete examples from your real background that connect
          directly to what the employer is asking for, and addresses the hiring manager by name if
          one is mentioned in the posting.
        </li>
        <li>
          A second pass checks the letter against your source CV and flags any claim that isn&apos;t
          actually supported by it.
        </li>
        <li>Download the letter as a Word document or PDF.</li>
      </ol>

      <h2>What it won&apos;t do</h2>
      <p>
        It won&apos;t claim you&apos;re &quot;the perfect candidate,&quot; invent enthusiasm for a
        company it knows nothing about beyond the job posting, or manufacture achievements that
        aren&apos;t in your CV. The goal is a letter that sounds like a real, specific person made
        a real case for themselves — because that&apos;s what actually reads as credible.
      </p>
    </LandingShell>
  );
}
