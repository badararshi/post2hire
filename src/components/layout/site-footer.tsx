import Link from 'next/link';
import { getAdSettings } from '@/lib/supabase/site-settings';
import { AdSlot } from './ad-slot';

export async function SiteFooter() {
  const ads = await getAdSettings();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-wide px-4 py-8 sm:px-6">
        <AdSlot
          label="Advertisement"
          width={468}
          height={60}
          className="mb-8"
          zone={ads.adsEnabled && ads.footer ? 'footer' : undefined}
        />
        <nav className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-sm text-muted sm:justify-start sm:text-left">
          <Link href="/free-ats-resume-builder" className="hover:text-azure">Free ATS Resume Builder</Link>
          <Link href="/free-ai-cover-letter-generator" className="hover:text-azure">Free Cover Letter Generator</Link>
          <Link href="/free-linkedin-post-generator" className="hover:text-azure">Free LinkedIn Post Generator</Link>
          <Link href="/ai-resume-builder-for-freshers" className="hover:text-azure">Resume Builder for Freshers</Link>
          <Link href="/cover-letter-for-career-change" className="hover:text-azure">Cover Letter for Career Change</Link>
        </nav>
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-muted">© {new Date().getFullYear()} Post2Hire. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="/privacy" className="hover:text-azure">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-azure">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-azure">Cookie Policy</Link>
            <Link href="/disclaimer" className="hover:text-azure">Disclaimer</Link>
            <Link href="/contact" className="hover:text-azure">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
