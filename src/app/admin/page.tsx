import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminPanel } from '@/components/admin/admin-panel';

export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/admin');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const [{ data: settings }, { data: users }, { data: messages }, { count: failedCount }] = await Promise.all([
    admin.from('site_settings').select('*').eq('id', 1).single(),
    admin.from('profiles').select('id, email, role, is_disabled, created_at').order('created_at', { ascending: false }).limit(100),
    admin.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('failed_generations').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div className="mx-auto max-w-wide px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Admin</h1>
      <div className="mt-8">
        <AdminPanel
          initialSettings={settings}
          initialUsers={users || []}
          initialMessages={messages || []}
          failedCount={failedCount || 0}
        />
      </div>
    </div>
  );
}
