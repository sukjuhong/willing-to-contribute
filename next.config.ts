import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/*.png',
      },
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Uncomment for Docker deployment
  // output: 'standalone',
};

export default nextConfig;
