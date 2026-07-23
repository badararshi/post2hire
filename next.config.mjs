/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', '@react-pdf/renderer', 'docx'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Deliberately does NOT allow arbitrary ad-network domains —
            // ad content is isolated in its own document at /ad-frame
            // (separate, permissive headers below), loaded only inside a
            // sandboxed <iframe>, so the main app's CSP never has to chase
            // Adsterra's rotating third-party domains.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "frame-src https://challenges.cloudflare.com 'self'",
              "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      {
        // Ad content only — isolated from the rest of the app. Permissive
        // by design since third-party ad networks load from unpredictable,
        // rotating domains; the sandboxed <iframe> embedding this route
        // (see AdSlot) is the actual security boundary, not this CSP.
        source: '/ad-frame',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
