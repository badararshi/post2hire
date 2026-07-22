import { LegalShell } from '@/components/legal/legal-shell';

export const metadata = { title: 'AI Content Disclaimer' };

export default function DisclaimerPage() {
  return (
    <LegalShell title="AI-Generated Content Disclaimer" updated="22 July 2026">
      <p>
        Post2Hire uses artificial intelligence to generate LinkedIn posts, images, tailored
        CVs, and cover letters based on the information you provide.
      </p>

      <h2>Review before use</h2>
      <p>
        AI-generated content can occasionally contain errors, awkward phrasing, or
        misinterpretations of the source material, despite the safeguards we've built in
        (including rules against fabricating facts and an automated grounding check). You must
        carefully review every generated post, CV, and cover letter before publishing it or
        sending it to an employer. The final confirmation checkbox before download exists for
        exactly this reason.
      </p>

      <h2>No guarantee of outcomes</h2>
      <p>
        We do not guarantee that any generated LinkedIn post will achieve particular engagement,
        or that any generated CV or cover letter will result in an interview or job offer.
      </p>

      <h2>Your responsibility for accuracy</h2>
      <p>
        You are responsible for ensuring that any CV or cover letter you submit to an employer
        accurately reflects your real experience and qualifications. Post2Hire's CV tool is
        designed to work only from facts present in your uploaded CV and never to invent
        experience, but you remain the final check before anything is sent.
      </p>
    </LegalShell>
  );
}
