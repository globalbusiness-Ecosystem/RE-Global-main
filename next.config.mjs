/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
  swcMinify: true,
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
    // Enable React Server Components optimizations
    reactRoot: true,
  },
  // HTTP headers for caching and performance
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
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
