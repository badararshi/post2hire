import { LegalShell } from '@/components/legal/legal-shell';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="22 July 2026">
      <p>
        This Privacy Policy explains how Post2Hire ("we," "us," "P2H") collects, uses, and
        protects information when you use our website and tools. This is a general policy
        drafted for a small SaaS product and is not a substitute for legal advice; please have
        it reviewed by a qualified professional in your jurisdiction before launch.
      </p>

      <h2>Information we collect</h2>
      <p>
        We collect the email address and password you provide at registration, the content you
        enter into our tools (post subjects, uploaded CVs, pasted job descriptions), and basic
        technical data such as IP address and browser type for security and rate-limiting
        purposes. Contact form submissions (name, email, subject, message) are stored so we can
        respond to you.
      </p>

      <h2>Why we collect it</h2>
      <p>
        We use this information to operate your account, generate the documents you request,
        enforce fair-use limits, respond to support requests, and improve reliability and
        security. We do not sell your personal information.
      </p>

      <h2>How your content is processed</h2>
      <p>
        To generate LinkedIn posts, images, tailored CVs, and cover letters, the text you enter
        (and text extracted from uploaded CVs) is sent to a third-party AI provider (Google
        Gemini or Anthropic, depending on our current configuration) strictly to produce your
        requested output. <strong>We do not use your uploaded CVs or generated content to train
        any AI model</strong>, ours or the provider's, without your explicit separate consent.
      </p>

      <h2>Data retention</h2>
      <p>
        Uploaded CVs and generated documents are stored privately and are retained for the
        period configured in our system (default 90 days, adjustable by us), after which they
        are automatically deleted. Temporary files created during processing are deleted
        immediately after generation completes. You can delete individual files, all your
        files, or your entire account at any time from your Dashboard or Account Settings.
      </p>

      <h2>How we protect your data</h2>
      <p>
        All traffic is encrypted (HTTPS). Passwords are hashed by our authentication provider
        and are never visible to us in plain text. Uploaded and generated files are stored
        privately with access restricted to you; we use short-lived signed URLs rather than
        public file links, and enforce access control at the database level (Row Level
        Security) so other users' data is never visible to you and vice versa.
      </p>

      <h2>Advertising and cookies</h2>
      <p>
        We display a limited set of banner and native advertisements (via Adsterra and
        potentially other reputable ad networks) to support the free operation of Post2Hire.
        Advertising scripts are loaded only after you accept cookies via our consent banner,
        and are never given access to your uploaded documents, generated content, or
        authentication tokens. See our{' '}
        <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>Your responsibility</h2>
      <p>
        Post2Hire uses AI to generate content. You are responsible for reviewing all generated
        posts, CVs, and cover letters for accuracy before using or publishing them — see our{' '}
        <a href="/disclaimer">AI Content Disclaimer</a>.
      </p>

      <h2>Your rights</h2>
      <p>
        You may access, correct, export, or delete your personal data at any time. To delete
        your account and all associated data, use the "Delete account" option in Account
        Settings, or email us at{' '}
        <a href="mailto:postgethired@gmail.com">postgethired@gmail.com</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{' '}
        <a href="mailto:postgethired@gmail.com">postgethired@gmail.com</a>.
      </p>
    </LegalShell>
  );
}
