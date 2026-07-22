import { LegalShell } from '@/components/legal/legal-shell';

export const metadata = { title: 'Cookie Policy' };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="22 July 2026">
      <p>
        Post2Hire uses a small number of cookies to keep the site working and, with your
        consent, to display advertising that supports the free operation of the service.
      </p>

      <h2>Essential cookies</h2>
      <p>
        These are required for sign-in and security (session/authentication cookies from
        Supabase, and CAPTCHA verification cookies from Cloudflare Turnstile). They cannot be
        disabled without breaking core functionality.
      </p>

      <h2>Advertising cookies</h2>
      <p>
        If you accept cookies via our consent banner, advertising cookies from our ad partner
        (Adsterra, and potentially other reputable networks in future) may be set to display
        banner and native advertisements. If you decline, these scripts are not loaded and no
        advertising cookies are set — the site and both tools remain fully functional either
        way.
      </p>

      <h2>Managing your choice</h2>
      <p>
        You can accept or reject non-essential cookies via the consent banner shown on your
        first visit. You can also clear cookies at any time through your browser settings.
      </p>

      <h2>Contact</h2>
      <p>
        Questions can be sent to <a href="mailto:postgethired@gmail.com">postgethired@gmail.com</a>.
      </p>
    </LegalShell>
  );
}
