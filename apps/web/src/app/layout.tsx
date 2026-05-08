import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TopdanBazar | B2B Topdansatis Platformasi',
    template: '%s | TopdanBazar',
  },
  description:
    'Topdansatici magazalari, mehsullari ve birbasa elaqe imkanlarini bir yerde kesf edin.',
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
