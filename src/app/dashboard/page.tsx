import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RecentFiles } from '@/components/dashboard/recent-files';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/dashboard');

  const { data: items } = await supabase
    .from('generated_items')
    .select('id, type, title, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-wide px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted">Welcome back, {user.email}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/tools/post" className="card transition-shadow hover:shadow-lg">
          <h2 className="font-display font-bold text-ink">Create LinkedIn Post</h2>
          <p className="mt-1 text-sm text-muted">Write a new post from a subject.</p>
        </Link>
        <Link href="/tools/cv" className="card transition-shadow hover:shadow-lg">
          <h2 className="font-display font-bold text-ink">Tailor CV</h2>
          <p className="mt-1 text-sm text-muted">Match your CV to a job description.</p>
        </Link>
        <Link href="/tools/cv" className="card transition-shadow hover:shadow-lg">
          <h2 className="font-display font-bold text-ink">Generate Cover Letter</h2>
          <p className="mt-1 text-sm text-muted">Write a factual, persuasive letter.</p>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">Recent files</h2>
        <div className="mt-4">
          <RecentFiles initialItems={items || []} />
        </div>
      </div>

      <div className="mt-10">
        <Link href="/account" className="btn-secondary">
          Account settings
        </Link>
      </div>
    </div>
  );
}
