/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Aggressive Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  // Enable React strict mode for development to catch issues
  reactStrictMode: true,
  // Optimize CSS-in-JS
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production' && {
      exclude: ['error', 'warn'],
    },
  },
  // SWR caching for API calls
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Optimize packages
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'leaflet',
    ],
  },
  // HTTP headers for caching and performance
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Single source of truth for framing (vercel.json no longer sets it).
            // Allows Pi's sandbox/browser to embed the app; blocks everyone else.
            key: 'Content-Security-Policy',
            value:
              "object-src 'none'; base-uri 'self'; frame-ancestors 'self' https://sandbox.minepi.com https://*.minepi.com https://*.pinet.com",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Always HTTPS, even for first-time visitors on a downgraded link.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          // Do not leak full URLs (they can contain ids) to other sites.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The app uses the camera, microphone and location itself (tours, QR scan, voice, map), never third-party frames.
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(), bluetooth=(), serial=()' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // Report-only: blocks nothing. Browsers report what the site loads to /api/csp-report so a strict policy can be built from facts.
          {
            key: 'Content-Security-Policy-Report-Only',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.minepi.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; media-src 'self' blob: https:; frame-src 'self' https:; worker-src 'self' blob:; report-uri /api/csp-report",
          },
        ],
      },
      {
        // The admin panel and its API must never be indexed or cached.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // UI libraries
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](@radix-ui|shadcn)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // React and core
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Icons and charts
          viz: {
            name: 'viz',
            test: /[\\/]node_modules[\\/](lucide-react|recharts)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Common shared
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },
}

export default nextConfig
