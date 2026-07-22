import Link from 'next/link';

/**
 * The Post2Hire wordmark rendered in live type, matching the navy/azure
 * palette of the uploaded logo assets exactly, rather than embedding the
 * glossy banner PNG — keeps the header crisp at any size and matches the
 * clean, Google-like homepage brief.
 */
export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl sm:text-7xl',
  };

  return (
    <Link href="/" className={`font-display font-extrabold tracking-tight ${sizes[size]}`}>
      <span className="text-ink">Post</span>
      <span className="text-azure">2</span>
      <span className="text-ink">Hire</span>
    </Link>
  );
}
