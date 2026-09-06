import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['*.ngrok-free.dev'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  async redirects() {
    return [
      { source: '/categories', destination: '/products', permanent: true },
      { source: '/categories/:slug', destination: '/products?category=:slug', permanent: true },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
