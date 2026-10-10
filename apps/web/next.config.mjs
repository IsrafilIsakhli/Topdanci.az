import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** NEXT_PUBLIC_CDN_BASE_URL (S3/CloudFront və s.) verildikdə host-u next/image üçün avtomatik icazəli edir. */
function cdnRemotePatterns() {
  const baseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL;
  if (!baseUrl) return [];

  try {
    const url = new URL(baseUrl);
    return [{ protocol: url.protocol.replace(':', ''), hostname: url.hostname }];
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['*.ngrok-free.dev'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  async redirects() {
    return [
      { source: '/categories', destination: '/products', permanent: true },
      { source: '/categories/:slug', destination: '/products?category=:slug', permanent: true },
    ];
  },

  images: {
    // Yalnız allowlist-də olan host-lardan şəkil optimallaşdırılır.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      ...cdnRemotePatterns(),
    ],
  },
};

export default nextConfig;
