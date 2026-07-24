'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Item {
  id: string;
  type: string;
  title: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  linkedin_post: 'LinkedIn Post',
  cv: 'Tailored CV',
  cover_letter: 'Cover Letter',
};

export function RecentFiles({ initialItems }: { initialItems: Item[] }) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems);

  async function handleDelete(id: string) {
    await supabase.from('generated_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleRename(id: string) {
    const current = items.find((i) => i.id === id);
    const newTitle = window.prompt('Rename item', current?.title || '');
    if (!newTitle) return;
    await supabase.from('generated_items').update({ title: newTitle }).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i)));
  }

  async function handleView(id: string) {
    const { data } = await supabase.from('generated_items').select('content').eq('id', id).single();
    if (data) {
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('Delete all saved files? This cannot be undone.')) return;
    const ids = items.map((i) => i.id);
    await supabase.from('generated_items').delete().in('id', ids);
    setItems([]);
  }

  if (items.length === 0) {
    return <p className="card text-sm text-muted">No files yet — create your first post or CV above.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-card border border-line">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-ink">{item.title || 'Untitled'}</p>
              <p className="text-xs text-muted">
                {typeLabels[item.type] || item.type} · {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleView(item.id)} className="btn-ghost text-xs">
                View / re-download
              </button>
              <button onClick={() => handleRename(item.id)} className="btn-ghost text-xs">
                Rename
              </button>
              <button onClick={() => handleDelete(item.id)} className="btn-ghost text-xs text-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleDeleteAll} className="btn-ghost text-xs text-danger">
        Delete all files
      </button>
    </div>
  );
}
