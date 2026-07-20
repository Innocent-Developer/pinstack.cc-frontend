import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import PageTransition from '../components/PageTransition';
import { siteConfig } from '../config/site';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Pinstack Discover and Launch SaaS Tools, AI Products & APIs',
    template: '%s | Pinstack',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
    shortcut: '/icon.png',
  },
  openGraph: {
    siteName: siteConfig.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary',
    images: ['/icon.png'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-white text-body antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
