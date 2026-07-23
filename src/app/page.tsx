import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAdSettings } from '@/lib/supabase/site-settings';
import { Wordmark } from '@/components/layout/wordmark';
import { AdSlot } from '@/components/layout/ad-slot';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ads = await getAdSettings();

  return (
    <div className="flex flex-col items-center px-4 py-16 sm:py-24">
      <div className="text-center">
        <Wordmark size="xl" />
        <p className="mx-auto mt-4 max-w-md text-balance text-base text-muted sm:text-lg">
          Create. Tailor. Get Hired.
        </p>
      </div>

      <div className="mt-14 grid w-full max-w-wide gap-6 sm:mt-16 sm:grid-cols-2">
        <Link
          href={user ? '/tools/post' : '/sign-up'}
          className="card group flex flex-col justify-between transition-shadow hover:shadow-lg"
        >
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-card bg-azure-tint text-azure">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 4h16v16H4V4Zm3 5v7m0-9v.01M11 16v-4a2 2 0 0 1 4 0v4m-4 0h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-ink">LinkedIn Post Creator</h2>
            <p className="mt-2 text-sm text-muted">
              Type a subject, get a polished, engagement-ready LinkedIn post — problem,
              solution, and step-by-step advice included.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-sm font-semibold text-azure">
            Create a post
            <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>

        <Link
          href={user ? '/tools/cv' : '/sign-up'}
          className="card group flex flex-col justify-between transition-shadow hover:shadow-lg"
        >
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-card bg-azure-tint text-azure">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 3h7l4 4v14H7V3Zm7 0v4h4M9 12h6M9 16h6M9 8h2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-ink">CV & Cover Letter Generator</h2>
            <p className="mt-2 text-sm text-muted">
              Upload your CV, paste a job description, and get a tailored, ATS-safe CV and a
              factual cover letter — ready to download as Word or PDF.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-sm font-semibold text-azure">
            Tailor my CV
            <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="mt-16 w-full">
        <AdSlot
          label="Advertisement"
          width={728}
          height={90}
          zone={ads.adsEnabled && ads.header ? 'header' : undefined}
        />
      </div>
    </div>
  );
}
