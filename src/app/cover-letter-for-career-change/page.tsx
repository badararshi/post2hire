import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free Cover Letter Generator for Career Changers',
  description:
    'Switching careers and worried your experience doesn\'t match the job description? Get a free, honest cover letter that frames your real, transferable experience — without pretending you meet requirements you don\'t.',
};

const faqs = [
  {
    q: 'I don’t have direct experience in this field — can it still write a strong letter?',
    a: 'Yes. It’s built specifically to handle this honestly: where the job asks for something your background doesn’t directly show, it looks for genuinely transferable experience in your real CV and frames that connection — without ever claiming you meet a requirement you don’t.',
  },
  {
    q: 'Will it exaggerate to make my career change look more natural?',
    a: 'No. Every claim in the letter is checked against your uploaded CV. It won’t invent direct experience in the new field — it will honestly connect what you’ve actually done to what the role needs.',
  },
  {
    q: 'What do I need to provide?',
    a: 'Your current CV (from your existing field) as a DOCX or PDF, and the job description for the role you’re changing into.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, no credit card required. You can generate a tailored resume alongside the cover letter in the same step.',
  },
];

export default async function CareerChangeCoverLetterPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tool"
      h1="Cover Letter Generator for Career Changers"
      intro="Changing careers means every job description highlights the experience you don't have yet. Get a free, honest cover letter that makes the strongest real case for your transferable experience — without overclaiming."
      quickAnswer="Upload your current-field CV and the job description for the role you're switching into, and Post2Hire writes a cover letter that honestly connects your real, transferable experience to what the new role needs — without claiming direct experience you don't have."
      lastUpdated="July 2026"
      hubHref="/ai-job-search-tools"
      hubLabel="All free AI job search tools"
      ctaHref={ctaHref}
      ctaLabel="Write my career-change letter free"
      faqs={faqs}
      relatedLinks={[
        { href: '/free-ai-cover-letter-generator', label: 'Free AI Cover Letter Generator' },
        { href: '/free-ats-resume-builder', label: 'Free ATS-Friendly Resume Builder' },
      ]}
    >
      <h2>The career-change cover letter has a specific problem</h2>
      <p>
        When you&apos;re applying within your existing field, a cover letter mostly needs to
        connect dots that are already close together. Changing careers is different: the job
        description is written for someone with direct experience you don&apos;t have, and the
        honest, effective version of your letter has to work harder to show why your actual
        background still makes you a genuine fit — without resorting to vague enthusiasm or
        overstated claims that won&apos;t hold up in an interview.
      </p>

      <h2>How it builds the case honestly</h2>
      <ol>
        <li>Upload your current CV and paste the job description for the role you&apos;re moving into.</li>
        <li>
          It identifies real, transferable experience from your actual background — skills,
          projects, achievements — and explains specifically why they apply to the new role,
          rather than listing generic soft skills.
        </li>
        <li>
          Where a stated requirement genuinely isn&apos;t met, it won&apos;t claim otherwise —
          it either omits it or honestly frames the closest real transferable experience.
        </li>
        <li>Download the letter as a Word document or PDF.</li>
      </ol>

      <h2>Why this matters more for a career change, not less</h2>
      <p>
        A hiring manager reading a career-changer&apos;s letter is actively looking for signal
        that you understand what&apos;s actually different about the new role — an overclaimed,
        generic letter reads as evasive precisely in the place where specificity would build the
        most trust.
      </p>
    </LandingShell>
  );
}
