import type { Metadata, Viewport } from 'next';
import { getSiteUrl } from '../lib/site-url';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'TopdanBazar | B2B Topdansatış Platforması',
    template: '%s | TopdanBazar',
  },
  description: 'Topdansatıcı mağazaları, məhsulları və birbaşa əlaqə imkanlarını bir yerdə kəşf edin.',
  applicationName: 'TopdanBazar',
  alternates: { canonical: '/' },
  keywords: ['topdansatış', 'B2B', 'mağaza', 'məhsul kataloqu', 'Azərbaycan'],
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    siteName: 'TopdanBazar',
    title: 'TopdanBazar | B2B Topdansatış Platforması',
    description: 'Topdansatıcı mağazaları və məhsulları bir yerdə kəşf edin.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopdanBazar | B2B Topdansatış Platforması',
    description: 'Topdansatıcı mağazaları və məhsulları bir yerdə kəşf edin.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
