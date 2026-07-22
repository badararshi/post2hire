import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdSettings } from '@/lib/supabase/site-settings';
import { CvGenerator } from '@/components/cv/cv-generator';
import { AdSlot } from '@/components/layout/ad-slot';

export const metadata = { title: 'CV & Cover Letter Generator' };

export default async function CvToolPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/tools/cv');
  if (!user.email_confirmed_at) redirect('/check-email');

  const ads = await getAdSettings();

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
        CV & Cover Letter Generator
      </h1>
      <p className="mt-2 text-muted">
        Upload your CV, paste the job description, and get a tailored, ATS-safe CV and a
        factual cover letter — grounded only in your real experience.
      </p>
      <div className="mt-8">
        <CvGenerator />
      </div>
      <div className="mt-12">
        <AdSlot
          label="Advertisement"
          width={300}
          height={250}
          snippet={ads.adsEnabled ? ads.mid : undefined}
        />
      </div>
    </div>
  );
}
