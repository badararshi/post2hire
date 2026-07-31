import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Post2Hire vs. ChatGPT for Your Resume and Cover Letter',
  description:
    'Thinking about just asking ChatGPT to write your resume? Here\'s the honest difference between a general-purpose chatbot and a tool built specifically for ATS-safe, fact-checked job applications.',
};

const faqs = [
  {
    q: 'Is ChatGPT bad for writing a resume?',
    a: 'Not bad — just not purpose-built for it. It can write fluent text, but it doesn\'t know Applicant Tracking System formatting rules by default, doesn\'t automatically check its output against your real CV for accuracy, and doesn\'t know LinkedIn\'s specific character/formatting constraints unless you supply all of that context yourself, every time.',
  },
  {
    q: 'Will ChatGPT invent experience I don\'t have?',
    a: 'It can, especially with a vague prompt — general-purpose chat models optimize for a fluent, confident-sounding answer, not for staying strictly grounded in a source document. Post2Hire runs a dedicated, independent check specifically for this: it compares the generated document against your uploaded CV and flags anything unsupported.',
  },
  {
    q: 'Isn\'t it more flexible to just use ChatGPT and write my own prompt?',
    a: 'For one-off experimentation, sure. Post2Hire trades that flexibility for consistency: the same ATS-safe formatting rules, the same fact-checking pass, and the same LinkedIn-specific formatting every time, without you having to re-explain the rules in every prompt.',
  },
  {
    q: 'Is Post2Hire free like the free version of ChatGPT?',
    a: 'Yes, no credit card required for either tool on Post2Hire.',
  },
];

export default async function VsChatGptPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/cv' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Comparison"
      h1="Post2Hire vs. Just Asking ChatGPT"
      intro="A lot of people's first instinct is to paste their CV into ChatGPT and ask for a rewrite. Here's what that actually gets you, honestly, versus a tool built specifically for this."
      quickAnswer="ChatGPT is a general-purpose chat model — it can write a resume if you ask carefully, but it doesn't automatically apply ATS formatting rules or check its own output against your real CV for accuracy. Post2Hire is built specifically to do both, every time, without you having to re-explain the rules."
      lastUpdated="July 2026"
      hubHref="/ai-job-search-tools"
      hubLabel="All free AI job search tools"
      ctaHref={ctaHref}
      ctaLabel="Try Post2Hire free"
      faqs={faqs}
      relatedLinks={[
        { href: '/free-ats-resume-builder', label: 'Free ATS-Friendly Resume Builder' },
        { href: '/free-vs-paid-ai-resume-tools', label: 'Free vs. Paid AI Resume Tools' },
      ]}
    >
      <h2>What ChatGPT actually does well here</h2>
      <p>
        ChatGPT is genuinely good at rephrasing and tightening prose, and with a careful, detailed
        prompt it can produce a reasonable draft. If you already know exactly what ATS-safe
        formatting requires and you&apos;re willing to write out that instruction (and LinkedIn&apos;s
        bold-text and length rules, separately, for a post) every single time, it&apos;s a capable
        general tool.
      </p>

      <h2>Where a general chatbot falls short for this specific task</h2>
      <ul>
        <li>
          <strong>No built-in ATS awareness.</strong> Unless you specify it, there&apos;s nothing
          stopping it from suggesting a table, a two-column layout, or other formatting that
          Applicant Tracking Systems parse incorrectly.
        </li>
        <li>
          <strong>No automatic fact-checking against your real CV.</strong> A general chat model
          optimizes for a fluent, confident answer — it has no built-in step that verifies every
          claim against your source document, so it can quietly round up a claim to sound
          stronger.
        </li>
        <li>
          <strong>No knowledge of LinkedIn&apos;s actual formatting quirks</strong> — like the fact
          that LinkedIn has no native bold text, and real bold requires specific Unicode
          characters, not markdown asterisks.
        </li>
        <li>
          <strong>You start from zero every time.</strong> Every new chat means re-explaining the
          rules, re-uploading context, and re-checking the output yourself.
        </li>
      </ul>

      <h2>What Post2Hire does instead</h2>
      <p>
        Post2Hire applies the same ATS-safe formatting rules and the same grounding check against
        your real CV every single time, with no prompt engineering required from you. For LinkedIn
        posts, it already knows the character limit, the bold-formatting quirks, and the structure
        that actually performs — because it&apos;s built for exactly this task, not adapted from a
        general-purpose tool.
      </p>
    </LandingShell>
  );
}
