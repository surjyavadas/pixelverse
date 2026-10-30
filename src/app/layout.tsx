import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { LoadingScreen } from '@/components/LoadingScreen';

export const viewport: Viewport = {
  themeColor: '#06070b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pixelverse.local'),
  title: {
    default: 'Pixelverse — Instant Free Online Games Portal',
    template: '%s | Pixelverse',
  },
  description: 'Play thousands of free online games instantly. No downloads, no login required. Discover high-performance HTML5, WebGL, and retro arcade titles.',
  manifest: '/manifest.json',
  keywords: ['online games', 'free games', 'browser games', 'instant play', 'html5 games', 'poki alternative', 'arcade'],
  authors: [{ name: 'Deepayan', url: 'https://github.com/deepayanpaik2' }],
  creator: 'Deepayan',
  publisher: 'Deepayan',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelverse.local',
    siteName: 'Pixelverse',
    title: 'Pixelverse — Instant Free Online Games Portal',
    description: 'Instant-play browser games with zero downloads. Silky smooth 60 FPS Canvas and WebGL games.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixelverse — Instant Free Online Games Portal',
    description: 'Play free online games instantly on any device. Zero downloads, no account needed.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Zero-flicker loader prevention for repeat visits & reduced motion */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = window.location.search;
                var isForce = s.indexOf('loader=') !== -1 || s.indexOf('preview_loader=') !== -1;
                if (!isForce && (sessionStorage.getItem('pixelverse_loader_shown') === 'true' || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches))) {
                  document.documentElement.classList.add('pv-loader-seen');
                }
              } catch(e) {}
            `,
          }}
        />
        {/* Outfit (punchy gaming display) + Plus Jakarta Sans + Figtree (smooth body) + Noto for Hindi and Bengali */}
        <link rel="preconnect" href="https://img.gamepix.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://play.gamepix.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
        />
      </head>
      <body className="antialiased font-sans">
        <LoadingScreen />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
