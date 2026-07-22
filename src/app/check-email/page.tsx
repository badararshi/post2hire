import Link from 'next/link';
import { Wordmark } from '@/components/layout/wordmark';

export const metadata = { title: 'Check your email' };

export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12 text-center">
      <Wordmark size="md" />
      <div className="card mt-8">
        <h1 className="font-display text-xl font-bold text-ink">Check your inbox</h1>
        <p className="mt-3 text-sm text-muted">
          We've sent a verification link to your email address. Click it to activate your
          account — you'll need to verify before using either tool.
        </p>
        <Link href="/sign-in" className="btn-primary mt-6 w-full">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
