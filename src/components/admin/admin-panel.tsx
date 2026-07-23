'use client';

import { useState } from 'react';

interface Settings {
  daily_generation_limit: number;
  ads_enabled: boolean;
  ad_snippet_header: string;
  ad_snippet_mid: string;
  ad_snippet_footer: string;
  ad_snippet_native: string;
  file_retention_days: number;
}

interface UserRow {
  id: string;
  email: string;
  role: string;
  is_disabled: boolean;
  created_at: string;
}

interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export function AdminPanel({
  initialSettings,
  initialUsers,
  initialMessages,
  failedCount,
}: {
  initialSettings: Settings;
  initialUsers: UserRow[];
  initialMessages: MessageRow[];
  failedCount: number;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyStatus, setReplyStatus] = useState<Record<string, 'sending' | 'sent' | 'error'>>({});

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  async function sendReply(messageId: string) {
    const replyText = (replyDrafts[messageId] || '').trim();
    if (!replyText) return;
    setReplyStatus((prev) => ({ ...prev, [messageId]: 'sending' }));
    const res = await fetch('/api/admin/contact/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, replyText }),
    });
    setReplyStatus((prev) => ({ ...prev, [messageId]: res.ok ? 'sent' : 'error' }));
  }

  async function toggleUser(userId: string, currentlyDisabled: boolean) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, is_disabled: !currentlyDisabled }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_disabled: !currentlyDisabled } : u))
      );
    }
  }

  return (
    <div className="space-y-8">
      <section className="card space-y-4">
        <h2 className="font-display font-bold text-ink">Site settings</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Daily generation limit</label>
            <input
              type="number"
              className="input-field"
              value={settings.daily_generation_limit}
              onChange={(e) => setSettings({ ...settings, daily_generation_limit: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">File retention (days)</label>
            <input
              type="number"
              className="input-field"
              value={settings.file_retention_days}
              onChange={(e) => setSettings({ ...settings, file_retention_days: Number(e.target.value) })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={settings.ads_enabled}
            onChange={(e) => setSettings({ ...settings, ads_enabled: e.target.checked })}
            className="h-4 w-4 rounded border-line text-azure"
          />
          Ads enabled site-wide
        </label>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">Ad snippets (HTML/JS from Adsterra)</h3>
          {(
            [
              ['ad_snippet_header', 'Header banner (728×90)'],
              ['ad_snippet_mid', 'Mid-content (300×250)'],
              ['ad_snippet_footer', 'Footer banner (468×60)'],
              ['ad_snippet_native', 'Native banner'],
            ] as [keyof Settings, string][]
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
              <textarea
                rows={3}
                className="input-field font-mono text-xs"
                value={settings[key] as string}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveSettings} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          {saved && <span className="text-sm text-success">Saved.</span>}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display font-bold text-ink">Users ({users.length})</h2>
        <div className="mt-4 max-h-96 overflow-y-auto rounded-card border border-line">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink">{u.email}</p>
                <p className="text-xs text-muted">
                  {u.role} · joined {new Date(u.created_at).toLocaleDateString()}
                  {u.is_disabled && <span className="ml-2 font-semibold text-danger">Disabled</span>}
                </p>
              </div>
              <button
                onClick={() => toggleUser(u.id, u.is_disabled)}
                className={u.is_disabled ? 'btn-secondary text-xs' : 'btn-ghost text-xs text-danger'}
              >
                {u.is_disabled ? 'Enable' : 'Disable'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display font-bold text-ink">Contact messages</h2>
        <div className="mt-4 max-h-96 overflow-y-auto rounded-card border border-line">
          {initialMessages.length === 0 && <p className="px-4 py-3 text-sm text-muted">No messages yet.</p>}
          {initialMessages.map((m) => (
            <div key={m.id} className="border-b border-line px-4 py-3 last:border-0">
              <p className="text-sm font-medium text-ink">
                {m.subject} — <span className="text-muted">{m.name} ({m.email})</span>
              </p>
              <p className="mt-1 text-sm text-muted">{m.message}</p>
              <p className="mt-1 text-xs text-muted">{new Date(m.created_at).toLocaleString()}</p>

              <div className="mt-2.5 space-y-1.5">
                <textarea
                  rows={2}
                  placeholder="Type a reply…"
                  className="input-field text-xs"
                  value={replyDrafts[m.id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                />
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => sendReply(m.id)}
                    disabled={!replyDrafts[m.id]?.trim() || replyStatus[m.id] === 'sending'}
                    className="btn-secondary text-xs"
                  >
                    {replyStatus[m.id] === 'sending' ? 'Sending…' : 'Send reply'}
                  </button>
                  {replyStatus[m.id] === 'sent' && (
                    <span className="text-xs text-success">Sent.</span>
                  )}
                  {replyStatus[m.id] === 'error' && (
                    <span className="text-xs text-danger">Could not send. Check email configuration.</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display font-bold text-ink">Failed generations</h2>
        <p className="mt-2 text-sm text-muted">{failedCount} logged failures.</p>
      </section>
    </div>
  );
}
