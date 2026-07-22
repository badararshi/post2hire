'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignInForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(
        signInError.message.includes('Email not confirmed')
          ? 'Please verify your email before signing in — check your inbox for the link.'
          : 'Incorrect email or password.'
      );
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && (
        <p role="alert" className="rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-azure hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-muted">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-line text-azure focus:ring-azure/30"
        />
        Keep me signed in
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-muted">
        New to Post2Hire?{' '}
        <Link href="/sign-up" className="font-medium text-azure hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
