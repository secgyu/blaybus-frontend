import React from 'react';

import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/next';

import { QueryProvider } from '@/components/providers/query-provider';
import { ViewportScaleProvider } from '@/components/providers/viewport-scale-provider';

import './globals.css';
import { MSWProvider } from './msw-provider';

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
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={`font-sans antialiased`}>
        <MSWProvider>
          <QueryProvider>
            <ViewportScaleProvider>{children}</ViewportScaleProvider>
          </QueryProvider>
          <Analytics />
        </MSWProvider>
      </body>
    </html>
  );
}
