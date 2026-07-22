import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostCreator } from '@/components/post/post-creator';
import { AdSlot } from '@/components/layout/ad-slot';

export const metadata = { title: 'LinkedIn Post Creator' };

export default async function PostToolPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/tools/post');
  if (!user.email_confirmed_at) redirect('/check-email');

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">LinkedIn Post Creator</h1>
      <p className="mt-2 text-muted">
        Enter a subject and get a polished, ready-to-post LinkedIn article — problem, solution,
        and step-by-step advice included.
      </p>
      <div className="mt-8">
        <PostCreator />
      </div>
      <div className="mt-12">
        <AdSlot label="Advertisement" width={300} height={250} />
      </div>
    </div>
  );
}
