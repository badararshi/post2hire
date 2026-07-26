import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LandingShell } from '@/components/marketing/landing-shell';

export const metadata: Metadata = {
  title: 'Free AI LinkedIn Post Generator — Ready to Post in Under a Minute',
  description:
    'Type a subject, get back a polished LinkedIn post with a real hook, proper structure, and correct bold formatting — ready to copy and paste. Free, no LinkedIn login required.',
};

const faqs = [
  {
    q: 'How is this different from asking a general AI chatbot for a LinkedIn post?',
    a: 'A general chatbot doesn’t know LinkedIn’s actual constraints — the character limit, how bold text is rendered (LinkedIn has no native rich text; bold uses specific Unicode characters), or what structure keeps posts from reading like generic AI filler. This tool builds the post to LinkedIn’s real format from the start: a strong hook, a concrete problem and solution, step-by-step guidance, one genuine engagement question, and 3–5 relevant hashtags — under the character budget with correctly rendered bold text.',
  },
  {
    q: 'Does it post to my LinkedIn automatically?',
    a: 'No — deliberately not. It generates the post text; you copy it or download it and post it yourself. Nothing is ever published on your behalf.',
  },
  {
    q: 'Do I need to connect my LinkedIn account?',
    a: 'No login or OAuth connection to LinkedIn is required at all.',
  },
  {
    q: 'Is it free?',
    a: 'Yes, no credit card and no paywall.',
  },
  {
    q: 'Can I ask it to revise the post?',
    a: 'Yes — Regenerate, Improve, or Shorten the post after the first draft, all included.',
  },
];

export default async function LinkedInPostGeneratorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ctaHref = user ? '/tools/post' : '/sign-up';

  return (
    <LandingShell
      eyebrow="Free tool"
      h1="Free AI LinkedIn Post Generator"
      intro="Type a subject, get back a polished, properly-formatted LinkedIn post — ready to copy and paste in under a minute."
      ctaHref={ctaHref}
      ctaLabel="Write my post free"
      faqs={faqs}
    >
      <h2>Why most AI-written LinkedIn posts read the same</h2>
      <p>
        Ask a general-purpose chatbot for a LinkedIn post and you tend to get the same shape back:
        a vague motivational opener, generic advice, and a throwaway &quot;Thoughts?&quot; at the
        end. It also won&apos;t know that LinkedIn has no native bold text — real bold on LinkedIn
        uses specific Unicode characters, not markdown asterisks, which is exactly the kind of
        detail generic tools miss.
      </p>

      <h2>What this tool builds instead</h2>
      <ul>
        <li>A specific opening hook, not a generic scene-setter.</li>
        <li>A real problem and a practical, concrete solution — explained simply, not vaguely.</li>
        <li>Clear, numbered steps the reader can act on immediately.</li>
        <li>Exactly one genuine engagement question, not a throwaway line.</li>
        <li>3–5 relevant hashtags, and real Unicode bold text that actually renders on LinkedIn.</li>
        <li>Kept under LinkedIn&apos;s character limit, with bold text kept to a reasonable share of the post.</li>
      </ul>

      <h2>You stay in control</h2>
      <p>
        The generated post is never published automatically. Copy it directly, or download it as
        a Word document or plain text file, and post it yourself whenever you&apos;re ready.
      </p>
    </LandingShell>
  );
}
