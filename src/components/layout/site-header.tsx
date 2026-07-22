import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Wordmark } from './wordmark';
import { SignOutButton } from './sign-out-button';

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-wide items-center justify-between px-4 py-4 sm:px-6">
        <Wordmark size="sm" />
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
