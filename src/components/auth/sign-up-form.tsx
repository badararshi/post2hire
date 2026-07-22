'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Turnstile } from '@/components/ui/turnstile';

export function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please accept the Terms of Use and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push('/check-email');
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
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-muted">
        <input
          type="checkbox"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-azure focus:ring-azure/30"
        />
        <span>
          I agree to the{' '}
          <Link href="/terms" className="font-medium text-azure hover:underline" target="_blank">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="font-medium text-azure hover:underline" target="_blank">
            Privacy Policy
          </Link>
          . By submitting this form and providing my email address, I expressly consent to
          receiving promotional and marketing communications (including newsletters, emails,
          special offers, and product updates) from Post2Hire (P2H). I may withdraw my consent
          at any time by clicking the unsubscribe link at the bottom of any email or by
          contacting postgethired@gmail.com.
        </span>
      </label>

      <Turnstile onToken={setTurnstileToken} />

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-azure hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
