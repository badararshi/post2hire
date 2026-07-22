export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
      <div className="prose prose-sm mt-8 max-w-none text-ink prose-headings:font-display prose-headings:font-bold prose-a:text-azure">
        {children}
      </div>
    </div>
  );
}
