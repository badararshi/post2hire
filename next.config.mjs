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
            // CSP allows Adsterra + Turnstile + Supabase + Gemini call-outs happen server-side only.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://adsterra.com https://*.adsterra.com https://highperformanceformat.com https://*.highperformanceformat.com https://valuationappeared.com https://*.valuationappeared.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://adsterra.com https://*.adsterra.com https://valuationappeared.com https://*.valuationappeared.com",
              "font-src 'self' data:",
              "frame-src https://challenges.cloudflare.com https://adsterra.com https://*.adsterra.com https://highperformanceformat.com https://*.highperformanceformat.com https://valuationappeared.com https://*.valuationappeared.com",
              "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://adsterra.com https://*.adsterra.com https://highperformanceformat.com https://*.highperformanceformat.com https://valuationappeared.com https://*.valuationappeared.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
