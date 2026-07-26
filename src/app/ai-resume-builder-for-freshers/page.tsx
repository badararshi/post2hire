import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free AI Resume Builder for Freshers & Students — First Job, Done Right',
  description:
    'Building your first resume with little or no work experience? Upload what you have — internships, projects, coursework — paste the job description, and get back a tailored, ATS-safe resume in under a minute. Free.',
};

const faqs = [
  {
    q: 'I don’t have much work experience yet — will this still help?',
    a: 'Yes — that’s exactly the situation it’s built for. It works from whatever real background you upload: internships, class projects, part-time work, volunteering, coursework. It reorganizes and emphasizes what you genuinely have, rather than requiring years of experience to be useful.',
  },
  {
    q: 'What should I upload if I don’t have a "real" CV yet?',
    a: 'Any draft works — a simple document listing your education, any internships or part-time jobs, relevant coursework or projects, and skills is enough as a starting point. Upload it as a DOCX or PDF and paste the job description you’re applying to.',
  },
  {
    q: 'Will it make up experience to make me look more qualified?',
    a: 'No. It only reorganizes and rephrases what’s genuinely in your uploaded CV — it won’t invent internships, skills, or achievements you don’t have. Where the job asks for something you don’t yet demonstrate, it flags that honestly rather than papering over it.',
  },
  {
    q: 'Is it free for students?',
    a: 'Yes — free for everyone, no credit card, no student verification needed.',
  },
];

export default async function FreshersResumeBuilderPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tool"
      h1="AI Resume Builder for Freshers & Students"
      intro="Writing your first resume with little or no work experience is its own specific problem. Upload what you actually have, paste the job description, and get back a tailored, ATS-safe resume built around your real background — free."
      ctaHref={ctaHref}
      ctaLabel="Build my first resume free"
      faqs={faqs}
    >
      <h2>The first-resume problem is different from the experienced-hire problem</h2>
      <p>
        Most resume advice assumes you already have several jobs to choose highlights from. If
        you&apos;re a student, recent graduate, or making your first serious job application, the
        real question is different: how do you present internships, class projects, part-time
        work, and coursework as genuinely relevant to a role that lists &quot;2+ years
        experience&quot; in the requirements — honestly, without pretending to have something you
        don&apos;t.
      </p>

      <h2>How it works from a thin starting CV</h2>
      <ol>
        <li>
          Upload whatever you have — even a simple first draft listing education, any internships
          or part-time work, projects, and skills.
        </li>
        <li>Paste the job description you&apos;re applying to.</li>
        <li>
          It reorganizes and sharpens what&apos;s genuinely there, aligning your real experience
          — projects, coursework, internships — with what the role actually asks for.
        </li>
        <li>
          It flags, honestly, any requirement your background doesn&apos;t yet demonstrate — so
          you know exactly where you stand rather than guessing.
        </li>
        <li>Download the result as a Word document or PDF.</li>
      </ol>

      <h2>Why honesty matters more at this stage, not less</h2>
      <p>
        Early in a career, the temptation to embellish is highest — and the risk of it unraveling
        in an interview is also highest, since you have less real experience to fall back on if
        asked to elaborate. This tool is deliberately built to work with what&apos;s real, not to
        paper over gaps with invented claims.
      </p>
    </LandingShell>
  );
}
