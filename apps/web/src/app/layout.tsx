import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TopdanBazar | B2B Topdansatış Platforması',
    template: '%s | TopdanBazar',
  },
  description:
    'Topdansatıcı mağazaları, məhsulları və birbaşa əlaqə imkanlarını bir yerdə kəşf edin.',
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
