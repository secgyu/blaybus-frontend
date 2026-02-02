import React from 'react';

import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';
import { MSWProvider } from './msw-provider';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIMVEX - 3D Engineering Learning Platform',
  description: '공학도를 위한 3D 기계 부품 시각화 학습 플랫폼',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <MSWProvider>
          {children}
          <Analytics />
        </MSWProvider>
      </body>
    </html>
  );
}
