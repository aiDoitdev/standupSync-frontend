import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import MotionProvider from './MotionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

const BASE_URL = 'https://standupsync.ai';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'StandupSync — AI-Powered Daily Standups for Remote Teams',
    template: '%s | StandupSync',
  },
  description:
    'Replace your daily standup meetings with AI. StandupSync sends 3 smart questions every morning, auto-detects blockers with Blocker Intelligence, tracks tasks with AI Task Radar, and delivers a crisp summary — no meeting needed.',
  keywords: [
    'daily standup tool',
    'async standup',
    'remote team standup',
    'AI standup',
    'standup without meetings',
    'team check-in software',
    'blocker detection AI',
    'AI task radar',
    'remote team productivity',
    'async team communication',
    'daily check-in app',
    'standup replacement',
  ],
  authors: [{ name: 'StandupSync', url: BASE_URL }],
  creator: 'StandupSync',
  publisher: 'StandupSync',
  category: 'productivity',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'StandupSync',
    title: 'StandupSync — AI-Powered Daily Standups for Remote Teams',
    description:
      'Skip the meeting. StandupSync AI collects your team\'s updates in 30 seconds, detects blockers automatically, and delivers a smart daily summary.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StandupSync — AI Daily Standups for Remote Teams',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StandupSync — AI-Powered Daily Standups for Remote Teams',
    description:
      'Replace boring standups with AI. 30-second check-ins, automatic blocker detection, smart summaries. Zero meetings required.',
    images: ['/og-image.png'],
    creator: '@standupsync',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#6d28d9" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'StandupSync',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description:
                'AI-powered async daily standup tool for remote teams. Auto-detects blockers, tracks tasks with AI Task Radar, and delivers smart daily summaries without meetings.',
              url: BASE_URL,
              offers: [
                {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  description: 'Free plan — 1 team, up to 3 members',
                },
                {
                  '@type': 'Offer',
                  price: '19',
                  priceCurrency: 'USD',
                  description: 'Starter plan — unlimited teams, up to 15 members',
                },
              ],
              featureList: [
                'AI Task Radar',
                'Blocker Intelligence',
                '30-second email check-ins',
                'AI-written daily summaries',
                'Live team dashboard',
                'Smart auto-reminders',
                'Async timezone-friendly',
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} ${jakarta.variable}`}>
        <MotionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

