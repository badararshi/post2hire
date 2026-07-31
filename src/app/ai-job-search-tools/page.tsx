import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free AI Job Search Tools — Resume, Cover Letter & LinkedIn Post Generator',
  description:
    'Every free AI tool Post2Hire offers for job seekers: an ATS-safe resume builder, a factual cover letter generator, and a LinkedIn post generator — all grounded in your real experience, all free.',
};

const faqs = [
  {
    q: 'What is Post2Hire?',
    a: 'A free set of AI tools for job seekers: a resume/CV tailoring tool, a cover letter generator, and a LinkedIn post generator. Every document tool is grounded in your real, uploaded CV — it reorganizes and sharpens what you actually have rather than inventing experience to match a job description.',
  },
  {
    q: 'Do I need to pay for anything?',
    a: 'No. All three tools are free, with no credit card required.',
  },
  {
    q: 'Will any of these tools exaggerate or invent my experience?',
    a: 'No — this is a deliberate design constraint across every document tool. Claims are checked against your source CV, and anything unsupported gets flagged rather than silently included.',
  },
  {
    q: 'Do I need to connect my LinkedIn account?',
    a: 'No. Nothing in Post2Hire posts on your behalf or requires a LinkedIn/social login — you copy or download everything and post it yourself.',
  },
];

const tools = [
  {
    href: '/free-ats-resume-builder',
    label: 'Free ATS-Friendly Resume Builder',
    description:
      'Upload your CV, paste a job description, get back a tailored, ATS-safe resume that parses cleanly through Applicant Tracking Systems.',
  },
  {
    href: '/ai-resume-builder-for-freshers',
    label: 'Resume Builder for Freshers & Students',
    description:
      'For a first resume with little or no work experience — built around internships, projects, and coursework.',
  },
  {
    href: '/free-ai-cover-letter-generator',
    label: 'Free AI Cover Letter Generator',
    description:
      'A specific, factual cover letter for the exact job you\'re applying to — not a generic template with your name swapped in.',
  },
  {
    href: '/cover-letter-for-career-change',
    label: 'Cover Letter for Career Changers',
    description:
      'For when your experience doesn\'t directly match the role — honestly frames real transferable experience instead of overclaiming.',
  },
  {
    href: '/free-linkedin-post-generator',
    label: 'Free AI LinkedIn Post Generator',
    description:
      'Turn a subject into a polished, properly-formatted LinkedIn post — real hook, real structure, correct bold text.',
  },
];

export default async function AiJobSearchToolsHub() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/dashboard' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tools"
      h1="Free AI Job Search Tools"
      intro="Every free AI tool Post2Hire offers, in one place — an ATS-safe resume builder, a factual cover letter generator, and a LinkedIn post generator, all grounded in your real experience."
      quickAnswer="Post2Hire is a free set of AI tools that tailor your resume and cover letter to a specific job description, and generate polished LinkedIn posts — all without inventing experience you don't have, and without any subscription or credit card."
      ctaHref={ctaHref}
      ctaLabel="Get started free"
      faqs={faqs}
    >
      <h2>The two problems job seekers spend the most time on</h2>
      <p>
        Job hunting has two recurring, time-consuming problems: rewriting your resume and cover
        letter for every single application, and building a presence on LinkedIn while you search.
        Both are the kind of tasks AI can genuinely help with — but most AI tools either produce
        generic filler or quietly invent experience you don&apos;t have to sound more impressive.
        Post2Hire is built around the opposite constraint: real output, grounded only in what&apos;s
        actually true.
      </p>

      <h2>Every tool</h2>
      <ul>
        {tools.map((t) => (
          <li key={t.href}>
            <Link href={t.href}>{t.label}</Link> — {t.description}
          </li>
        ))}
      </ul>

      <h2>How AI can help your job search without lying on your resume</h2>
      <p>
        The risk with AI-assisted job applications isn&apos;t the AI part — it&apos;s tools that
        quietly fabricate a certification, a metric, or a skill to make an application look
        stronger, which falls apart the moment an interviewer asks a follow-up question. Post2Hire&apos;s
        document tools run a second, independent check against your source CV specifically to
        catch this, and flag anything unsupported rather than including it silently. The goal
        isn&apos;t to make you look like someone else — it&apos;s to make the strongest honest
        case for who you actually are, faster than doing it by hand.
      </p>
    </LandingShell>
  );
}
