'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Wordmark } from '@/components/layout/wordmark';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/sign-in');
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Wordmark size="md" />
        <p className="mt-2 text-sm text-muted">Choose a new password</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <p role="alert" className="rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
