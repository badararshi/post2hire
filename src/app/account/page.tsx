import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountSettings } from '@/components/dashboard/account-settings';

export const metadata = { title: 'Account settings' };

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in?next=/account');

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Account settings</h1>
      <p className="mt-2 text-muted">{user.email}</p>
      <div className="mt-8">
        <AccountSettings />
      </div>
    </div>
  );
}
