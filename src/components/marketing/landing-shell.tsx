import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

export function LandingShell({
  eyebrow,
  h1,
  intro,
  ctaHref,
  ctaLabel,
  children,
  faqs,
}: {
  eyebrow: string;
  h1: string;
  intro: string;
  ctaHref: string;
  ctaLabel: string;
  children: React.ReactNode;
  faqs: FAQItem[];
}) {
  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-wide text-azure">{eyebrow}</p>
      <h1 className="mt-2 text-balance font-display text-3xl font-bold text-ink sm:text-4xl">{h1}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{intro}</p>
      <Link href={ctaHref} className="btn-primary mt-6 inline-flex">
        {ctaLabel}
      </Link>

      <div className="prose prose-sm mt-12 max-w-none text-ink prose-headings:font-display prose-headings:font-bold prose-a:text-azure">
        {children}
      </div>

      {faqs.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink">Frequently asked questions</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card">
                <p className="font-semibold text-ink">{f.q}</p>
                <p className="mt-1.5 text-sm text-muted">{f.a}</p>
              </div>
            ))}
          </div>
          <script
            type="application/ld+json"
            // Static, developer-authored FAQ copy — not user input, safe to inline.
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }),
            }}
          />
        </div>
      )}

      <div className="mt-12 rounded-card border border-line bg-azure-tint p-6 text-center">
        <p className="font-display font-bold text-ink">Ready to try it yourself?</p>
        <Link href={ctaHref} className="btn-primary mt-3 inline-flex">
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
