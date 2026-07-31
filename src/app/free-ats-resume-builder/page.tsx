import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free ATS-Friendly Resume Builder — Tailored to Any Job Description',
  description:
    'Upload your CV, paste a job description, and get a free, ATS-safe tailored resume in under a minute. No credit card, no invented experience — just your real background, reformatted and refocused for the job.',
};

const faqs = [
  {
    q: 'What actually makes a resume "ATS-friendly"?',
    a: 'Applicant Tracking Systems parse resumes as plain text before a human ever sees them. Tables, columns, text boxes, headers/footers, and unusual fonts often get mangled or dropped entirely during parsing. An ATS-friendly resume uses standard section headings (Work Experience, Education, Skills), consistent bullet points, plain text structure, and no graphical elements — which is exactly the format Post2Hire outputs.',
  },
  {
    q: 'Will it invent experience I don’t have to match the job description?',
    a: 'No. Every version is grounded only in the CV you upload — Post2Hire will reorder, rephrase, and emphasize your real experience to fit the role, but it won’t add employers, titles, skills, or achievements that aren’t already in your source CV. A second automated pass checks the output against your original CV and flags anything that looks unsupported.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. There’s no credit card required and no paywall on either tool. The site is supported by ads rather than subscriptions.',
  },
  {
    q: 'What file formats does it accept and export?',
    a: 'Upload your existing CV as a DOCX or PDF file (up to 5MB). The tailored result downloads as a Word document or PDF, ready to submit.',
  },
  {
    q: 'Does it work if I’m a student, fresher, or changing careers?',
    a: 'Yes — it works from whatever real background is in your uploaded CV, however early-stage. For a career change specifically, it will honestly emphasize transferable experience rather than pretend you meet requirements you don’t.',
  },
];

export default async function AtsResumeBuilderPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tool"
      h1="Free ATS-Friendly Resume Builder"
      intro="Upload your CV, paste the job description you're applying to, and get back a tailored, ATS-safe resume in under a minute — grounded only in your real experience, free to use."
      quickAnswer="Upload your CV, paste a job description, and Post2Hire returns a resume formatted with standard, ATS-parseable section headings and language aligned to the role — built only from what's genuinely in your CV, with no invented experience."
      lastUpdated="July 2026"
      hubHref="/ai-job-search-tools"
      hubLabel="All free AI job search tools"
      ctaHref={ctaHref}
      ctaLabel="Tailor my resume free"
      faqs={faqs}
      relatedLinks={[
        { href: '/ai-resume-builder-for-freshers', label: 'Resume Builder for Freshers & Students' },
        { href: '/free-ai-cover-letter-generator', label: 'Free AI Cover Letter Generator' },
      ]}
    >
      <h2>Why most resumes never reach a human</h2>
      <p>
        Most mid-size and large employers run every application through an Applicant Tracking
        System before a recruiter ever opens it. These systems parse your resume into plain text
        to search for keywords and structure — and a resume built with tables, multi-column
        layouts, header/footer text, or decorative graphics frequently gets parsed incorrectly or
        drops content entirely. A resume can be strong on paper and still get filtered out purely
        on formatting.
      </p>

      <h2>How Post2Hire tailors your resume</h2>
      <ol>
        <li>Upload your existing CV (DOCX or PDF).</li>
        <li>Paste the job description you&apos;re applying to.</li>
        <li>
          Get back a tailored resume with standard, ATS-parseable section headings, consistent
          bullet points, and language aligned to the role — plus a short list of any job
          requirements your background doesn&apos;t yet demonstrate, so you know where you stand.
        </li>
        <li>Download it as a Word document or PDF, ready to submit.</li>
      </ol>

      <h2>What makes this different from a generic AI resume writer</h2>
      <p>
        Generic AI writing tools will happily invent a certification or a metric to make your
        resume sound stronger. Post2Hire is built around the opposite constraint: it will
        reorganize and sharpen what&apos;s genuinely in your CV, but a second, independent pass
        checks the tailored output against your original CV and flags anything that isn&apos;t
        actually supported — because a fabricated claim that falls apart in an interview is worse
        than no resume at all.
      </p>
    </LandingShell>
  );
}
