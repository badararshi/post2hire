import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free vs. Paid AI Resume Tools — What You\'re Actually Paying For',
  description:
    'Most AI resume builders charge a monthly subscription or gate PDF export behind a paywall. Here\'s what that money typically buys, and where a free, grounded alternative like Post2Hire fits.',
};

const faqs = [
  {
    q: 'Why do most AI resume tools charge money?',
    a: 'Running AI generation has a real per-use cost, and most resume tools are built as standalone subscription businesses — so that cost gets passed to you directly, usually as a monthly plan or a one-time unlock fee for exporting your finished document.',
  },
  {
    q: 'What do you typically get for paying?',
    a: 'Commonly: unlimited generations, PDF/Word export (often gated behind payment even after a free draft), more design/template options, and sometimes a "resume score" or ATS-check feature. Feature sets vary a lot by product, so it\'s worth checking the specific tool\'s current pricing page rather than trusting summaries — including this one.',
  },
  {
    q: 'How is Post2Hire able to be free?',
    a: 'It\'s supported by ads rather than subscriptions, so there\'s no paywall on generation or export.',
  },
  {
    q: 'Is free automatically worse than paid?',
    a: 'Not necessarily — it depends what you actually need. If you want unlimited custom templates and design control, a paid tool with more visual options may fit better. If what you need is a fast, honest, ATS-safe tailored resume and cover letter without a subscription, that\'s exactly what a free, grounded tool is built for.',
  },
];

export default async function FreeVsPaidPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Comparison"
      h1="Free vs. Paid AI Resume Tools"
      intro="Most AI resume builders gate PDF export or unlimited generations behind a monthly subscription. Here's what that typically buys, honestly, and where a free tool fits."
      quickAnswer="Paid AI resume tools typically charge for unlimited generations, export formats, or extra templates. Post2Hire is free because it's ad-supported rather than subscription-funded — there's no paywall on generating or downloading your tailored resume and cover letter."
      lastUpdated="July 2026"
      hubHref="/ai-job-search-tools"
      hubLabel="All free AI job search tools"
      ctaHref={ctaHref}
      ctaLabel="Try the free version"
      faqs={faqs}
      relatedLinks={[
        { href: '/post2hire-vs-chatgpt-resume', label: 'Post2Hire vs. Just Asking ChatGPT' },
        { href: '/free-ats-resume-builder', label: 'Free ATS-Friendly Resume Builder' },
      ]}
    >
      <h2>What a subscription typically buys you</h2>
      <p>
        Feature sets vary a lot between tools, but the pattern across most paid resume builders is
        similar: a free tier that lets you generate a draft, then a paywall on the parts that
        actually matter — exporting as a usable PDF or Word file, generating more than a handful
        of times, or accessing additional design templates. Some also include an ATS &quot;score&quot;
        or checklist feature.
      </p>

      <h2>Why this pattern exists</h2>
      <p>
        AI generation has a real cost per use, and a resume-builder-as-a-product business needs a
        revenue model to cover it. Subscriptions are the straightforward way to do that. There&apos;s
        nothing wrong with that model — it&apos;s just worth knowing upfront what&apos;s actually
        free versus what unlocks after you&apos;ve already invested time writing your resume inside
        the tool.
      </p>

      <h2>Where Post2Hire is different</h2>
      <p>
        Post2Hire is supported by ads rather than subscriptions, so generation and export (Word or
        PDF) are free with no unlock step. The tradeoff is fewer visual template options than a
        dedicated paid design tool — the focus is specifically on ATS-safe formatting and factual
        accuracy, not visual customization.
      </p>
    </LandingShell>
  );
}
