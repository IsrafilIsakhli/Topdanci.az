import type { Metadata, Viewport } from 'next';
import { getSiteUrl } from '../lib/site-url';
// Qlobal stillər məntiqi hissələrə bölünüb; sıra (order) CSS kaskadını təyin edir —
// dəyişdirilərkən ardıcıllıq qorunmalıdır. Detallar: src/styles/globals/README.md
import '../styles/globals/01-tokens-and-base.css';
import '../styles/globals/02-public-marketplace.css';
import '../styles/globals/03-seller-panel-and-dashboard.css';
import '../styles/globals/04-marketplace-refinements.css';
import '../styles/globals/05-auth-contact-login.css';
import '../styles/globals/06-mobile-surfaces.css';
import '../styles/globals/07-admin-responsive.css';
import '../styles/globals/08-theme-and-dark-layers.css';
import '../styles/globals/09-homepage-final-passes.css';
import '../styles/globals/10-seller-dashboard-and-forms.css';
import '../styles/globals/11-performance-guard.css';
import './marketplace-mobile.css';
import '../styles/globals/12-review-refinements.css';
import '../styles/globals/13-tickets.css';

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
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1218' },
  ],
};

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem('topdanbazar-theme');
      const theme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        {/* Şəkil CDN-lərinə əvvəlcədən bağlantı: ilk şəkillər daha tez görünür. */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
