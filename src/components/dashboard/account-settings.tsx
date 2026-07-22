'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AccountSettings() {
  const router = useRouter();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage('');
    if (newPassword.length < 8) {
      setPwMessage('Password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    setPwMessage(error ? error.message : 'Password updated.');
    if (!error) setNewPassword('');
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    if (confirmText !== 'DELETE') {
      setDeleteError('Type DELETE to confirm.');
      return;
    }
    setDeleting(true);
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE' }),
    });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.error || 'Could not delete account.');
      return;
    }
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="card space-y-3">
        <h2 className="font-display font-bold text-ink">Change password</h2>
        {pwMessage && <p className="text-sm text-muted">{pwMessage}</p>}
        <input
          type="password"
          placeholder="New password"
          minLength={8}
          className="input-field"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit" disabled={pwLoading} className="btn-primary">
          {pwLoading ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <div className="card space-y-3 border-red-200">
        <h2 className="font-display font-bold text-danger">Delete account</h2>
        <p className="text-sm text-muted">
          This permanently deletes your account, all saved files, and uploaded documents.
          This cannot be undone.
        </p>
        {deleteError && <p className="text-sm text-danger">{deleteError}</p>}
        <input
          className="input-field"
          placeholder='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <button
          onClick={handleDeleteAccount}
          disabled={deleting || confirmText !== 'DELETE'}
          className="btn-primary bg-danger hover:bg-red-700"
        >
          {deleting ? 'Deleting…' : 'Permanently delete my account'}
        </button>
      </div>
    </div>
  );
}
