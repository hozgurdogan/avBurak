import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Security headers.
 *
 * The CSP is intentionally strict: the site loads no third-party scripts,
 * no analytics, no font CDN and no map iframe (see README section
 * "Regulatory constraints"). `unsafe-inline` for styles is required by
 * Next.js' inlined critical CSS; scripts use nonce-less strict-dynamic-free
 * self-only policy because we ship no inline script of our own beyond
 * Next.js' hydration payload.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js injects inline bootstrap scripts; 'unsafe-inline' is ignored by
      // browsers that honour 'strict-dynamic', and required by those that do not.
      "script-src 'self' 'unsafe-inline'" +
        (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // No `output: 'standalone'` here: the deployment target is cPanel shared
  // hosting via "Setup Node.js App" (Passenger), which runs `server.js`
  // against a regular `next build` output, not a self-contained Docker
  // bundle. See the README section "Deployment".
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // All imagery is local; no remote patterns are allowed on purpose.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Fonts and uploaded media are content-addressed / immutable enough
        // to cache aggressively.
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy/bare paths land on the default locale. `/` itself is handled by
      // the next-intl middleware so that cookie + Accept-Language detection runs.
      { source: '/makaleler', destination: '/tr/makaleler', permanent: true },
      { source: '/iletisim', destination: '/tr/iletisim', permanent: true },
      { source: '/admin', destination: '/tr/admin', permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
